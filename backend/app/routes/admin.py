from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import BusPass, User, AuditLog, Payment
from app.database import db
from app.utils import admin_required, log_audit

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/passes', methods=['GET'])
@admin_required()
def get_all_passes():
    status_filter = request.args.get('status', 'all')
    if status_filter != 'all':
        passes = BusPass.query.filter_by(status=status_filter).order_by(BusPass.created_at.desc()).all()
    else:
        passes = BusPass.query.order_by(BusPass.created_at.desc()).all()

    return jsonify({'passes': [p.to_dict() for p in passes]}), 200

@admin_bp.route('/passes/<int:pass_id>/verify', methods=['POST'])
@admin_required()
def verify_pass(pass_id):
    admin_id = get_jwt_identity()
    bus_pass = BusPass.query.get(pass_id)
    if not bus_pass:
        return jsonify({'error': 'Bus pass not found.'}), 404

    data = request.get_json() or {}
    action = data.get('action', 'approved').lower()  # 'approved' or 'rejected'
    remarks = data.get('remarks', '')

    if action not in ['approved', 'rejected']:
        return jsonify({'error': 'Invalid action. Must be approved or rejected.'}), 400

    bus_pass.status = action
    bus_pass.admin_remarks = remarks
    db.session.commit()

    log_audit(admin_id, f'PASS_{action.upper()}', f"Admin {action} pass {bus_pass.pass_number}. Remarks: {remarks}")

    return jsonify({
        'message': f"Pass status updated to {action}.",
        'bus_pass': bus_pass.to_dict()
    }), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required()
def update_user_status(user_id):
    admin_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    status = data.get('status', 'active')  # 'active', 'suspended'
    user.status = status
    db.session.commit()

    log_audit(admin_id, 'USER_STATUS_UPDATED', f"Updated status of user {user.email} to {status}")

    return jsonify({'message': f"User status changed to {status}.", 'user': user.to_dict()}), 200

@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required()
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify({'audit_logs': [l.to_dict() for l in logs]}), 200
