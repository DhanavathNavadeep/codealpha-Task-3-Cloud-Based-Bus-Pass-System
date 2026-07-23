from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app.database import db
from app.utils import log_audit

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    user.full_name = data.get('full_name', user.full_name).strip()
    user.phone = data.get('phone', user.phone).strip()
    user.address = data.get('address', user.address).strip()

    db.session.commit()
    log_audit(user.id, 'PROFILE_UPDATED', "User updated profile information")

    return jsonify({'message': 'Profile updated successfully.', 'user': user.to_dict()}), 200

@users_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required.'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password.'}), 400

    user.set_password(new_password)
    db.session.commit()
    log_audit(user.id, 'PASSWORD_CHANGED', "User changed password")

    return jsonify({'message': 'Password changed successfully.'}), 200
