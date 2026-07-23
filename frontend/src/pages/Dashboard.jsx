import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import QRCard from '../components/QRCard';
import StatCard from '../components/StatCard';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, PlusCircle, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passesRes, routesRes] = await Promise.all([
          API.get('/passes/my-passes'),
          API.get('/routes')
        ]);
        setPasses(passesRes.data.passes || []);
        setRoutes(routesRes.data.routes || []);
      } catch (err) {
        console.error("Failed loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activePass = passes.find(p => p.status === 'approved' && p.is_active_valid) || passes[0];

  const handleRenewPass = (busPass) => {
    navigate('/apply', { state: { renewPass: busPass } });
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: '20px',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#93c5fd', fontWeight: '600' }}>
            Passenger Portal
          </span>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.2rem' }}>
            Hello, {user?.full_name}! 👋
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Manage your digital transit passes, check routes, and download valid QR passes.
          </p>
        </div>
        <Link to="/apply" className="btn btn-success" style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem' }}>
          <PlusCircle size={18} /> Apply New Bus Pass
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Passes"
          value={passes.length}
          icon={CreditCard}
          badge="Lifetime passes"
          color="var(--primary-500)"
        />
        <StatCard
          title="Active Pass"
          value={passes.filter(p => p.status === 'approved').length}
          icon={ShieldCheck}
          badge="Verified & Valid"
          color="var(--accent-green)"
        />
        <StatCard
          title="Pending Approval"
          value={passes.filter(p => p.status === 'pending').length}
          icon={Clock}
          badge="In Review"
          color="#d97706"
        />
        <StatCard
          title="Available Routes"
          value={routes.length}
          icon={MapPin}
          badge="Citywide network"
          color="#8b5cf6"
        />
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Active QR Pass Card Widget */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--primary-500)" /> Current Digital Pass
          </h3>

          {loading ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>Loading pass data...</div>
          ) : activePass ? (
            <QRCard busPass={activePass} onRenew={handleRenewPass} />
          ) : (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h4>No Active Pass Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
                You haven't applied for a bus pass yet or your current pass has expired.
              </p>
              <Link to="/apply" className="btn btn-primary">Apply Now</Link>
            </div>
          )}
        </div>

        {/* Popular Routes Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Available Transit Routes</h3>
            <Link to="/apply" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: '600' }}>
              View All &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {routes.slice(0, 4).map((route) => (
              <div key={route.id} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', fontWeight: '700', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {route.route_code}
                    </span>
                    <strong style={{ fontSize: '0.95rem' }}>{route.route_name}</strong>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    {route.source} &bull;&bull;&bull;&rarr; {route.destination} ({route.distance_km} km)
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                    ₹{route.base_price}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>/month</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
