import React from 'react';
import { Download, RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import API from '../services/api';

const QRCard = ({ busPass, onRenew }) => {
  if (!busPass) return null;

  const handleDownloadPDF = async () => {
    try {
      const response = await API.get(`/passes/${busPass.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BusPass_${busPass.pass_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF pass. Please try again.');
    }
  };

  const getStatusBadge = () => {
    switch (busPass.status) {
      case 'approved':
        return <span className="badge badge-approved"><CheckCircle size={14} /> Approved & Active</span>;
      case 'pending':
        return <span className="badge badge-pending"><Clock size={14} /> Verification Pending</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><AlertTriangle size={14} /> Application Rejected</span>;
      default:
        return <span className="badge badge-rejected">Expired</span>;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      borderRadius: '20px',
      color: '#ffffff',
      padding: '1.75rem',
      boxShadow: '0 15px 35px rgba(30, 58, 138, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '520px',
      margin: '0 auto'
    }}>
      {/* Background Decorative Circles */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none'
      }} />

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <ShieldCheck size={16} /> Official Digital Bus Pass
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginTop: '0.2rem' }}>{busPass.route_name}</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Pass Content Body */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '14px', backdropFilter: 'blur(10px)' }}>
        {/* QR Code Container */}
        <div style={{ background: '#ffffff', padding: '0.6rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {busPass.qr_code_token ? (
            <img src={busPass.qr_code_token} alt="Pass QR Code" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '130px', height: '130px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
              Pending QR
            </div>
          )}
          <span style={{ fontSize: '0.68rem', color: '#1e293b', fontWeight: '700', marginTop: '0.2rem' }}>Scan to Verify</span>
        </div>

        {/* Details List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Pass Number</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#38bdf8' }}>{busPass.pass_number}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Passenger Name</span>
            <strong>{busPass.user_name}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Route Journey</span>
            <span style={{ color: '#e2e8f0' }}>{busPass.source} &rarr; {busPass.destination}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Duration</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>{busPass.pass_type}</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Expires On</span>
              <span style={{ color: '#f87171', fontWeight: '600' }}>{busPass.expiry_date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.25rem' }}>
        <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ flex: 1, fontSize: '0.88rem' }}>
          <Download size={16} /> Download PDF Pass
        </button>
        {onRenew && (
          <button onClick={() => onRenew(busPass)} className="btn btn-success" style={{ fontSize: '0.88rem' }}>
            <RefreshCw size={16} /> Renew Pass
          </button>
        )}
      </div>
    </div>
  );
};

export default QRCard;
