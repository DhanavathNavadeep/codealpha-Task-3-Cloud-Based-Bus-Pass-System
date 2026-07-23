import pytest
from app import create_app
from app.database import db

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_get_routes(client):
    response = client.get('/api/routes')
    assert response.status_code == 200
    data = response.get_json()
    assert 'routes' in data
