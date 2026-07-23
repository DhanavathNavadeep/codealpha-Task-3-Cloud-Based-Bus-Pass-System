import React, { useState, useEffect } from 'react';
import API from '../services/api';
import QRCard from '../components/QRCard';
import { CreditCard, PlusCircle, Calendar, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyPasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await API.get('/passes/my-passes');
        setPasses(res.data.passes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPasses();
  }, []);

  const handleRenew = (busPass) => {
    navigate('/apply', { state: { renewPass: busPass } });
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>My Digital Bus Passes</h2>
          <p style={{ color: 'var(--text-muted)' }}>View, print, download, or renew your active and historic transit passes.</p>
        </div>
        <Link to="/apply" className="btn btn-primary">
          <PlusCircle size={18} /> Apply New Pass
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading bus passes...</div>
      ) : passes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Passes Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            You haven't applied for any bus passes yet.
          </p>
          <Link to="/apply" className="btn btn-primary">Apply Now</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}>
          {passes.map((pass) => (
            <QRCard key={pass.id} busPass={pass} onRenew={handleRenew} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPasses;
