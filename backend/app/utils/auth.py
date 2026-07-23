from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User, AuditLog
from app.database import db

def admin_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Admin privilege required'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def log_audit(user_id, action, details=None):
    try:
        ip = request.remote_addr if request else '127.0.0.1'
        log = AuditLog(user_id=user_id, action=action, details=details, ip_address=ip)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Audit log failed: {e}")
