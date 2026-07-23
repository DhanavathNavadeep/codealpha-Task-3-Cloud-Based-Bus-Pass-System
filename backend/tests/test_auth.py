import pytest
from app import create_app
from app.database import db
from app.models import User

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_user_registration(client):
    response = client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'test@example.com',
        'password': 'Password123',
        'phone': '1234567890'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == 'test@example.com'

def test_user_login(client):
    # First register user
    client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'login@example.com',
        'password': 'Password123'
    })

    # Now login
    response = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'Password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data

def test_invalid_login(client):
    response = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
