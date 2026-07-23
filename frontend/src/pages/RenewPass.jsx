import React, { useState } from 'react';
import API from '../services/api';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const RenewPass = ({ pass, onClose, onRenewed }) => {
  const [passType, setPassType] = useState(pass?.pass_type || 'Monthly');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await API.post(`/passes/${pass.id}/renew`, { pass_type: passType });
      onRenewed(res.data.bus_pass);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Renewal failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', background: 'var(--bg-surface)' }}>
        <h3>Renew Bus Pass</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Renewing Pass <strong>#{pass?.pass_number}</strong> for route {pass?.route_name}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRenewSubmit}>
          <div className="form-group">
            <label>Select Renewal Duration</label>
            <select className="form-control" value={passType} onChange={(e) => setPassType(e.target.value)}>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly (10% Discount)</option>
              <option value="Half-Yearly">Half-Yearly (15% Discount)</option>
              <option value="Annual">Annual (20% Discount)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Renewing...' : 'Confirm Renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewPass;
