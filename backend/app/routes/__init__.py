from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.routes import routes_bp
from app.routes.passes import passes_bp
from app.routes.payments import payments_bp
from app.routes.admin import admin_bp
from app.routes.analytics import analytics_bp

__all__ = [
    'auth_bp',
    'users_bp',
    'routes_bp',
    'passes_bp',
    'payments_bp',
    'admin_bp',
    'analytics_bp'
]
