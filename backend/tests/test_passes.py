import pytest
from app import create_app
from app.database import db
from app.models import Route

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_fare_calculation(client):
    with client.application.app_context():
        route = Route.query.filter_by(route_code='EX-101').first()
        route_id = route.id if route else 1
        expected_fare = round(route.base_price * 2.7, 2) if route else 1350.0

    response = client.post('/api/passes/calculate-fare', json={
        'route_id': route_id,
        'pass_type': 'Quarterly'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['total_fare'] == expected_fare
