from flask import Blueprint, jsonify
from sqlalchemy import func
from app.models import BusPass, Route, User, Payment
from app.database import db
from app.utils import admin_required

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
@admin_required()
def get_dashboard_metrics():
    total_users = User.query.filter_by(role='user').count()
    total_routes = Route.query.filter_by(status='active').count()
    total_passes = BusPass.query.count()
    active_passes = BusPass.query.filter_by(status='approved').count()
    pending_passes = BusPass.query.filter_by(status='pending').count()
    rejected_passes = BusPass.query.filter_by(status='rejected').count()

    # Revenue sum from successful payments
    revenue = db.session.query(func.sum(Payment.amount)).filter(Payment.payment_status == 'SUCCESS').scalar() or 0.0

    # Route popularity (count passes per route)
    route_stats = db.session.query(
        Route.route_name,
        func.count(BusPass.id).label('pass_count')
    ).join(BusPass, Route.id == BusPass.route_id, isouter=True)\
     .group_by(Route.id)\
     .order_by(func.count(BusPass.id).desc())\
     .limit(5).all()

    route_popularity = [{'route_name': r[0], 'count': r[1]} for r in route_stats]

    # Pass type distribution
    type_stats = db.session.query(
        BusPass.pass_type,
        func.count(BusPass.id)
    ).group_by(BusPass.pass_type).all()

    pass_distribution = [{'type': t[0], 'count': t[1]} for t in type_stats]

    return jsonify({
        'overview': {
            'total_users': total_users,
            'total_routes': total_routes,
            'total_passes': total_passes,
            'active_passes': active_passes,
            'pending_passes': pending_passes,
            'rejected_passes': rejected_passes,
            'total_revenue': round(revenue, 2)
        },
        'route_popularity': route_popularity,
        'pass_distribution': pass_distribution
    }), 200
