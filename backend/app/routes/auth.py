from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app.database import db
from app.utils import log_audit

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    full_name = data.get('full_name', '').strip()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()

    if not email or not password or not full_name:
        return jsonify({'error': 'Full name, email, and password are required.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        address=address,
        role='user',
        status='active'
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    log_audit(user.id, 'USER_REGISTERED', f"New user registered: {email}")

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Registration successful.',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    if user.status != 'active':
        return jsonify({'error': 'Account is suspended. Please contact administrator.'}), 403

    access_token = create_access_token(identity=str(user.id))
    log_audit(user.id, 'USER_LOGIN', f"User logged in: {email}")

    return jsonify({
        'message': 'Login successful.',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Return success for security reasons to prevent user enumeration
        return jsonify({'message': 'If an account exists with this email, password reset instructions have been sent.'}), 200

    # In production: generate reset token and send email. Here we simulate success.
    log_audit(user.id, 'FORGOT_PASSWORD_REQUESTED', f"Password reset requested for {email}")
    return jsonify({'message': 'Password reset instructions sent to your email.'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 44
    return jsonify({'user': user.to_dict()}), 200
