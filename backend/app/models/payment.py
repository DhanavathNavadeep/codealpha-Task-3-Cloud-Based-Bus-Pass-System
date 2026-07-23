from datetime import datetime
from app.database import db

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    pass_id = db.Column(db.Integer, db.ForeignKey('bus_passes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), default='UPI/Credit Card')  # 'UPI', 'Credit Card', 'Net Banking'
    payment_status = db.Column(db.String(20), default='SUCCESS')  # 'SUCCESS', 'FAILED', 'PENDING'
    gateway_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'pass_id': self.pass_id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else 'N/A',
            'amount': self.amount,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
