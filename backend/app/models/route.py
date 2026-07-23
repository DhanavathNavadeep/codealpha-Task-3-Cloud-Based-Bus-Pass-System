from datetime import datetime
from app.database import db

class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    route_name = db.Column(db.String(100), nullable=False)
    route_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    stops = db.Column(db.Text, nullable=True)  # Comma separated list of stops
    distance_km = db.Column(db.Float, nullable=False, default=10.0)
    base_price = db.Column(db.Float, nullable=False, default=500.0)  # Monthly base price
    status = db.Column(db.String(20), default='active')  # 'active', 'inactive'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    passes = db.relationship('BusPass', backref='route', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'route_name': self.route_name,
            'route_code': self.route_code,
            'source': self.source,
            'destination': self.destination,
            'stops': [s.strip() for s in self.stops.split(',')] if self.stops else [],
            'distance_km': self.distance_km,
            'base_price': self.base_price,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
