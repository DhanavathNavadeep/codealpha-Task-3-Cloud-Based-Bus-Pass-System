import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import config
from app.database import db, bcrypt, jwt
from app.routes import auth_bp, users_bp, routes_bp, passes_bp, payments_bp, admin_bp, analytics_bp

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(passes_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(analytics_bp)

    # Health check endpoints for load balancers & Docker healthchecks
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'cloud-bus-pass-api',
            'version': '1.0.0'
        }), 200

    @app.route('/ready', methods=['GET'])
    def ready_check():
        try:
            # Check DB connection
            db.session.execute(db.select(1))
            return jsonify({'status': 'ready', 'database': 'connected'}), 200
        except Exception as e:
            return jsonify({'status': 'unready', 'error': str(e)}), 500

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found.'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error occurred.'}), 500

    # Auto create tables and seed database on startup
    with app.app_context():
        db.create_all()
        try:
            from app.seed import seed_database
            seed_database()
        except Exception as e:
            print(f"Database seed note: {e}")

    return app
