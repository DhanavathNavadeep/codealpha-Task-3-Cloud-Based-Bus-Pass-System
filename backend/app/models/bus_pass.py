from datetime import datetime, timedelta
from app.database import db

class BusPass(db.Model):
    __tablename__ = 'bus_passes'

    id = db.Column(db.Integer, primary_key=True)
    pass_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    pass_type = db.Column(db.String(20), nullable=False)  # 'Monthly', 'Quarterly', 'Half-Yearly', 'Annual'
    start_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'expired'
    total_fare = db.Column(db.Float, nullable=False)
    qr_code_token = db.Column(db.String(255), nullable=True)
    identity_document_url = db.Column(db.String(255), nullable=True)
    admin_remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship('Payment', backref='bus_pass', lazy=True)

    def is_valid(self):
        return self.status == 'approved' and self.expiry_date >= datetime.utcnow().date()

    def to_dict(self):
        return {
            'id': self.id,
            'pass_number': self.pass_number,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else 'N/A',
            'user_email': self.user.email if self.user else 'N/A',
            'route_id': self.route_id,
            'route_name': self.route.route_name if self.route else 'N/A',
            'route_code': self.route.route_code if self.route else 'N/A',
            'source': self.route.source if self.route else '',
            'destination': self.route.destination if self.route else '',
            'pass_type': self.pass_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'status': self.status,
            'total_fare': self.total_fare,
            'qr_code_token': self.qr_code_token,
            'identity_document_url': self.identity_document_url,
            'admin_remarks': self.admin_remarks or '',
            'is_active_valid': self.is_valid(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
