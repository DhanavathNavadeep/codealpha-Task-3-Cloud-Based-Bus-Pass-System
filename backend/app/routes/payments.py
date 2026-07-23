import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import BusPass, Payment
from app.database import db
from app.utils import log_audit

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payments_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    pass_id = data.get('pass_id')
    payment_method = data.get('payment_method', 'UPI/Card')
    simulate_fail = data.get('simulate_failure', False)

    bus_pass = BusPass.query.get(pass_id)
    if not bus_pass or str(bus_pass.user_id) != str(user_id):
        return jsonify({'error': 'Bus pass not found or unauthorized.'}), 404

    txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

    if simulate_fail:
        payment = Payment(
            transaction_id=txn_id,
            pass_id=bus_pass.id,
            user_id=user_id,
            amount=bus_pass.total_fare,
            payment_method=payment_method,
            payment_status='FAILED',
            gateway_response='Bank transaction declined.'
        )
        db.session.add(payment)
        db.session.commit()

        log_audit(user_id, 'PAYMENT_FAILED', f"Failed payment for pass {bus_pass.pass_number}")
        return jsonify({
            'error': 'Payment transaction failed. Please try again.',
            'payment': payment.to_dict()
        }), 400

    # Payment success
    payment = Payment(
        transaction_id=txn_id,
        pass_id=bus_pass.id,
        user_id=user_id,
        amount=bus_pass.total_fare,
        payment_method=payment_method,
        payment_status='SUCCESS',
        gateway_response='Payment processed successfully.'
    )

    # Auto-approve pass on payment or mark ready for admin verification
    # If auto-approve is active, set status to approved
    bus_pass.status = 'approved'

    db.session.add(payment)
    db.session.commit()

    log_audit(user_id, 'PAYMENT_SUCCESSFUL', f"Processed ₹{bus_pass.total_fare} for pass {bus_pass.pass_number}")

    return jsonify({
        'message': 'Payment successful! Your bus pass is now active.',
        'payment': payment.to_dict(),
        'bus_pass': bus_pass.to_dict()
    }), 200

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    user_id = get_jwt_identity()
    payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
    return jsonify({'payments': [p.to_dict() for p in payments]}), 200
