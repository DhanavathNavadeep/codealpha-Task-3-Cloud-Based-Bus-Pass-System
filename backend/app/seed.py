from datetime import date, timedelta
from app.database import db
from app.models import User, Route, BusPass, Payment, AuditLog
from app.utils import generate_qr_code_base64

def seed_database():
    """Seed default routes, admin user, test user, and passes if missing."""
    # Check if admin already exists
    admin = User.query.filter_by(email='admin@buspass.com').first()
    if not admin:
        admin = User(
            full_name='System Administrator',
            email='admin@buspass.com',
            phone='+1 (555) 019-2831',
            role='admin',
            status='active',
            address='Transit HQ, Metro Station Complex'
        )
        admin.set_password('Admin@123')
        db.session.add(admin)

    # Check if default test user exists
    user = User.query.filter_by(email='user@buspass.com').first()
    if not user:
        user = User(
            full_name='Alex Morgan',
            email='user@buspass.com',
            phone='+1 (555) 012-9876',
            role='user',
            status='active',
            address='742 Evergreen Terrace, Sector 4'
        )
        user.set_password('User@123')
        db.session.add(user)

    db.session.commit()

    # Seed Routes
    if Route.query.count() == 0:
        routes_data = [
            {
                'route_name': 'Downtown Express Line',
                'route_code': 'EX-101',
                'source': 'Central Bus Station',
                'destination': 'Tech Park Terminal',
                'stops': 'Central, Financial District, Green Park, Tech Park',
                'distance_km': 14.5,
                'base_price': 600.0
            },
            {
                'route_name': 'Suburban Corridor',
                'route_code': 'SUB-202',
                'source': 'North Suburbs',
                'destination': 'City Center Interchange',
                'stops': 'North Suburbs, Lake Gardens, Civic Hospital, City Center',
                'distance_km': 22.0,
                'base_price': 850.0
            },
            {
                'route_name': 'University & Medical Feeder',
                'route_code': 'UNI-303',
                'source': 'Metro South Station',
                'destination': 'University Campus Gate 2',
                'stops': 'Metro South, Medical College, Student Square, University Gate',
                'distance_km': 8.5,
                'base_price': 400.0
            },
            {
                'route_name': 'Airport Shuttle Direct',
                'route_code': 'AIR-404',
                'source': 'Central Railway Terminal',
                'destination': 'International Airport T2',
                'stops': 'Central Railway, Expressway Toll, Terminal 1, Terminal 2',
                'distance_km': 35.0,
                'base_price': 1200.0
            }
        ]

        for r in routes_data:
            route_obj = Route(**r, status='active')
            db.session.add(route_obj)
        db.session.commit()

    # Seed sample bus pass if none exists
    if BusPass.query.count() == 0 and user:
        route = Route.query.filter_by(route_code='EX-101').first()
        if route:
            today = date.today()
            expiry = today + timedelta(days=30)
            pass_num = "BP-DEMO-2026-001"
            qr_token = generate_qr_code_base64(f"BUSPASS|{pass_num}|USER:{user.id}|ROUTE:{route.route_code}|VALID:{expiry}")

            demo_pass = BusPass(
                pass_number=pass_num,
                user_id=user.id,
                route_id=route.id,
                pass_type='Monthly',
                start_date=today,
                expiry_date=expiry,
                status='approved',
                total_fare=600.0,
                qr_code_token=qr_token,
                admin_remarks='Auto-approved demo pass.'
            )
            db.session.add(demo_pass)
            db.session.commit()

            demo_payment = Payment(
                transaction_id="TXN-DEMO-998877",
                pass_id=demo_pass.id,
                user_id=user.id,
                amount=600.0,
                payment_method='UPI',
                payment_status='SUCCESS',
                gateway_response='Demo payment completed.'
            )
            db.session.add(demo_payment)
            db.session.commit()
