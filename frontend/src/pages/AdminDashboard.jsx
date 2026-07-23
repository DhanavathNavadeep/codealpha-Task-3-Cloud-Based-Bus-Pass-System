import React, { useState, useEffect } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { Users, CreditCard, DollarSign, MapPin, ShieldAlert, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await API.get('/analytics/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed fetching admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const overview = metrics?.overview;

  return (
    <div className="page-wrapper">
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: '20px',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#60a5fa', fontWeight: '700' }}>
          Transit Systems Management Console
        </span>
        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.2rem' }}>
          Admin Overview & Control Hub
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Monitor real-time pass verifications, fare revenues, transit routes, and user audit logs.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading System Analytics...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Total Revenue"
              value={`₹${overview?.total_revenue.toLocaleString()}`}
              icon={DollarSign}
              badge="Total collected"
              color="var(--accent-green)"
            />
            <StatCard
              title="Pending Verification"
              value={overview?.pending_passes}
              icon={ShieldAlert}
              badge="Action required"
              color="#d97706"
            />
            <StatCard
              title="Active Digital Passes"
              value={overview?.active_passes}
              icon={CreditCard}
              badge={`Out of ${overview?.total_passes}`}
              color="var(--primary-500)"
            />
            <StatCard
              title="Registered Users"
              value={overview?.total_users}
              icon={Users}
              badge="Active passengers"
              color="#8b5cf6"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {/* Route Popularity Breakdown */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--primary-500)" /> Route Demand & Pass Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metrics?.route_popularity?.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <strong>{item.route_name}</strong>
                      <span style={{ color: 'var(--primary-600)', fontWeight: '600' }}>{item.count} Passes</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / (overview?.total_passes || 1)) * 100 * 3)}%`,
                        background: 'linear-gradient(90deg, var(--primary-500), var(--accent-green))',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--accent-green)" /> Quick Management Links
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/admin/passes" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldAlert size={18} color="#d97706" />
                    <span>Review Pending Pass Applications ({overview?.pending_passes})</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>

                <Link to="/admin/routes" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={18} color="var(--primary-500)" />
                    <span>Manage Routes & Fare Pricing ({overview?.total_routes} Routes)</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>

                <Link to="/admin/users" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Users size={18} color="#8b5cf6" />
                    <span>View & Manage Registered Users</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>

                <Link to="/admin/reports" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <BarChart3 size={18} color="var(--accent-green)" />
                    <span>Export Audit Logs & System Analytics</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
