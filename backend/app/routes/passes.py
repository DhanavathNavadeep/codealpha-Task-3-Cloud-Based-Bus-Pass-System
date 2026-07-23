import uuid
from datetime import datetime, timedelta, date
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import BusPass, Route, User
from app.database import db
from app.utils import generate_qr_code_base64, save_uploaded_file, generate_pass_pdf, log_audit

passes_bp = Blueprint('passes', __name__, url_prefix='/api/passes')

DURATION_MULTIPLIERS = {
    'Monthly': 1.0,
    'Quarterly': 2.7,      # 10% discount for 3 months
    'Half-Yearly': 5.1,   # 15% discount for 6 months
    'Annual': 9.6          # 20% discount for 12 months
}

DURATION_DAYS = {
    'Monthly': 30,
    'Quarterly': 90,
    'Half-Yearly': 180,
    'Annual': 365
}

@passes_bp.route('/calculate-fare', methods=['POST'])
def calculate_fare():
    data = request.get_json() or {}
    route_id = data.get('route_id')
    pass_type = data.get('pass_type', 'Monthly')

    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Invalid route selected.'}), 404

    multiplier = DURATION_MULTIPLIERS.get(pass_type, 1.0)
    total_fare = round(route.base_price * multiplier, 2)

    return jsonify({
        'route_name': route.route_name,
        'pass_type': pass_type,
        'base_price': route.base_price,
        'multiplier': multiplier,
        'total_fare': total_fare
    }), 200

@passes_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_pass():
    user_id = get_jwt_identity()

    # Form metadata or JSON
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    route_id = data.get('route_id')
    pass_type = data.get('pass_type', 'Monthly')
    start_date_str = data.get('start_date')

    if not route_id or not start_date_str:
        return jsonify({'error': 'Route and start date are required.'}), 400

    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found.'}), 404

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid start date format. Use YYYY-MM-DD.'}), 400

    days = DURATION_DAYS.get(pass_type, 30)
    expiry_date = start_date + timedelta(days=days)
    multiplier = DURATION_MULTIPLIERS.get(pass_type, 1.0)
    total_fare = round(route.base_price * multiplier, 2)

    # Document upload if file present
    doc_url = None
    if 'document' in request.files:
        doc_url = save_uploaded_file(request.files['document'])

    pass_number = f"BP-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    # Generate unique verification QR payload
    qr_payload = f"BUSPASS|{pass_number}|USER:{user_id}|ROUTE:{route.route_code}|VALID:{expiry_date}"
    qr_token = generate_qr_code_base64(qr_payload)

    bus_pass = BusPass(
        pass_number=pass_number,
        user_id=user_id,
        route_id=route_id,
        pass_type=pass_type,
        start_date=start_date,
        expiry_date=expiry_date,
        status='pending',  # Needs payment & admin verification
        total_fare=total_fare,
        qr_code_token=qr_token,
        identity_document_url=doc_url
    )

    db.session.add(bus_pass)
    db.session.commit()

    log_audit(user_id, 'PASS_APPLIED', f"Applied for pass {pass_number} on route {route.route_code}")

    return jsonify({
        'message': 'Bus pass application submitted successfully.',
        'bus_pass': bus_pass.to_dict()
    }), 201

@passes_bp.route('/my-passes', methods=['GET'])
@jwt_required()
def get_my_passes():
    user_id = get_jwt_identity()
    passes = BusPass.query.filter_by(user_id=user_id).order_by(BusPass.created_at.desc()).all()
    return jsonify({'passes': [p.to_dict() for p in passes]}), 200

@passes_bp.route('/<int:pass_id>', methods=['GET'])
@jwt_required()
def get_pass_details(pass_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    bus_pass = BusPass.query.get(pass_id)

    if not bus_pass:
        return jsonify({'error': 'Pass not found.'}), 404

    # Allow access if pass belongs to user or requestor is admin
    if str(bus_pass.user_id) != str(user_id) and user.role != 'admin':
        return jsonify({'error': 'Unauthorized access to pass.'}), 403

    return jsonify({'bus_pass': bus_pass.to_dict()}), 200

@passes_bp.route('/<int:pass_id>/renew', methods=['POST'])
@jwt_required()
def renew_pass(pass_id):
    user_id = get_jwt_identity()
    old_pass = BusPass.query.get(pass_id)

    if not old_pass or str(old_pass.user_id) != str(user_id):
        return jsonify({'error': 'Pass not found or unauthorized.'}), 404

    data = request.get_json() or {}
    pass_type = data.get('pass_type', old_pass.pass_type)
    
    # Start date is tomorrow or old expiry + 1 day
    today = date.today()
    start_date = max(today, old_pass.expiry_date + timedelta(days=1))
    days = DURATION_DAYS.get(pass_type, 30)
    expiry_date = start_date + timedelta(days=days)

    multiplier = DURATION_MULTIPLIERS.get(pass_type, 1.0)
    total_fare = round(old_pass.route.base_price * multiplier, 2)

    new_pass_number = f"BP-RNW-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    qr_payload = f"BUSPASS|{new_pass_number}|USER:{user_id}|ROUTE:{old_pass.route.route_code}|VALID:{expiry_date}"
    qr_token = generate_qr_code_base64(qr_payload)

    new_pass = BusPass(
        pass_number=new_pass_number,
        user_id=user_id,
        route_id=old_pass.route_id,
        pass_type=pass_type,
        start_date=start_date,
        expiry_date=expiry_date,
        status='pending',
        total_fare=total_fare,
        qr_code_token=qr_token,
        identity_document_url=old_pass.identity_document_url
    )

    db.session.add(new_pass)
    db.session.commit()

    log_audit(user_id, 'PASS_RENEWAL_SUBMITTED', f"Submitted renewal pass {new_pass_number}")

    return jsonify({
        'message': 'Pass renewal application created.',
        'bus_pass': new_pass.to_dict()
    }), 201

@passes_bp.route('/<int:pass_id>/pdf', methods=['GET'])
@jwt_required()
def download_pass_pdf(pass_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    bus_pass = BusPass.query.get(pass_id)

    if not bus_pass:
        return jsonify({'error': 'Pass not found.'}), 404

    if str(bus_pass.user_id) != str(user_id) and user.role != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    pdf_buffer = generate_pass_pdf(bus_pass.to_dict())
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"BusPass_{bus_pass.pass_number}.pdf",
        mimetype='application/pdf'
    )
