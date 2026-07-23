import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';

const AdminPasses = () => {
  const [passes, setPasses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected pass for verification modal
  const [selectedPass, setSelectedPass] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/passes?status=${filter}`);
      setPasses(res.data.passes || []);
    } catch (err) {
      console.error("Error loading admin passes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [filter]);

  const handleVerifyAction = async (action) => {
    if (!selectedPass) return;
    setSubmitting(true);

    try {
      const res = await API.post(`/admin/passes/${selectedPass.id}/verify`, {
        action: action,
        remarks: remarks
      });

      setMsg(res.data.message);
      setSelectedPass(null);
      setRemarks('');
      fetchPasses();
    } catch (err) {
      alert("Verification update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Bus Pass Verification Queue</h2>
          <p style={{ color: 'var(--text-muted)' }}>Review document proofs and approve or reject user pass applications.</p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === st ? 'var(--primary-600)' : 'transparent',
                color: filter === st ? '#ffffff' : 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading applications...</div>
      ) : passes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No applications found for status "{filter}"</h3>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Pass Number</th>
                <th style={{ padding: '1rem' }}>Passenger Name</th>
                <th style={{ padding: '1rem' }}>Route</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Fare</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary-600)' }}>
                    {p.pass_number}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <strong>{p.user_name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user_email}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    [{p.route_code}] {p.route_name}
                  </td>
                  <td style={{ padding: '1rem' }}>{p.pass_type}</td>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>₹{p.total_fare}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => { setSelectedPass(p); setRemarks(p.admin_remarks || ''); }}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedPass && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2rem', background: 'var(--bg-surface)' }}>
            <h3>Verify Bus Pass Application</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Pass Number: <strong>{selectedPass.pass_number}</strong>
            </p>

            <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              <div><strong>Passenger:</strong> {selectedPass.user_name} ({selectedPass.user_email})</div>
              <div><strong>Route:</strong> {selectedPass.route_name} ({selectedPass.source} ➔ {selectedPass.destination})</div>
              <div><strong>Duration:</strong> {selectedPass.pass_type} ({selectedPass.start_date} to {selectedPass.expiry_date})</div>
              <div><strong>Amount Paid:</strong> ₹{selectedPass.total_fare}</div>
              {selectedPass.identity_document_url && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Document:</strong>{' '}
                  <a href={selectedPass.identity_document_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)', fontWeight: '600' }}>
                    View Attached Proof
                  </a>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Admin Remarks / Reason</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter remarks for passenger..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerifyAction('rejected')}
                className="btn btn-danger"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                type="button"
                onClick={() => handleVerifyAction('approved')}
                className="btn btn-success"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasses;
