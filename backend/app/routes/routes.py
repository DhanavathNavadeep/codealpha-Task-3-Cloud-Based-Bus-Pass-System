from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Route
from app.database import db
from app.utils import admin_required, log_audit

routes_bp = Blueprint('routes', __name__, url_prefix='/api/routes')

@routes_bp.route('', methods=['GET'])
def get_routes():
    # Public endpoint for listing available routes
    status_filter = request.args.get('status', 'active')
    if status_filter == 'all':
        routes = Route.query.all()
    else:
        routes = Route.query.filter_by(status=status_filter).all()
    return jsonify({'routes': [r.to_dict() for r in routes]}), 200

@routes_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found.'}), 404
    return jsonify({'route': route.to_dict()}), 200

@routes_bp.route('', methods=['POST'])
@admin_required()
def create_route():
    data = request.get_json() or {}
    route_name = data.get('route_name', '').strip()
    route_code = data.get('route_code', '').strip().upper()
    source = data.get('source', '').strip()
    destination = data.get('destination', '').strip()
    stops = data.get('stops', [])
    distance_km = float(data.get('distance_km', 10.0))
    base_price = float(data.get('base_price', 500.0))

    if not route_name or not route_code or not source or not destination:
        return jsonify({'error': 'Route name, code, source, and destination are required.'}), 400

    if Route.query.filter_by(route_code=route_code).first():
        return jsonify({'error': 'Route code already exists.'}), 409

    stops_str = ', '.join(stops) if isinstance(stops, list) else str(stops)

    route = Route(
        route_name=route_name,
        route_code=route_code,
        source=source,
        destination=destination,
        stops=stops_str,
        distance_km=distance_km,
        base_price=base_price,
        status='active'
    )

    db.session.add(route)
    db.session.commit()

    admin_user_id = get_jwt_identity()
    log_audit(admin_user_id, 'ROUTE_CREATED', f"Created route {route_code}: {route_name}")

    return jsonify({'message': 'Route created successfully.', 'route': route.to_dict()}), 201

@routes_bp.route('/<int:route_id>', methods=['PUT'])
@admin_required()
def update_route(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found.'}), 404

    data = request.get_json() or {}
    route.route_name = data.get('route_name', route.route_name).strip()
    route.source = data.get('source', route.source).strip()
    route.destination = data.get('destination', route.destination).strip()
    route.distance_km = float(data.get('distance_km', route.distance_km))
    route.base_price = float(data.get('base_price', route.base_price))
    route.status = data.get('status', route.status)

    if 'stops' in data:
        stops = data['stops']
        route.stops = ', '.join(stops) if isinstance(stops, list) else str(stops)

    db.session.commit()

    admin_user_id = get_jwt_identity()
    log_audit(admin_user_id, 'ROUTE_UPDATED', f"Updated route {route.route_code}")

    return jsonify({'message': 'Route updated successfully.', 'route': route.to_dict()}), 200

@routes_bp.route('/<int:route_id>', methods=['DELETE'])
@admin_required()
def delete_route(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found.'}), 404

    route.status = 'inactive'
    db.session.commit()

    admin_user_id = get_jwt_identity()
    log_audit(admin_user_id, 'ROUTE_DEACTIVATED', f"Deactivated route {route.route_code}")

    return jsonify({'message': 'Route set to inactive.'}), 200
