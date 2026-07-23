import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { MapPin, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    route_code: '',
    source: '',
    destination: '',
    stops: '',
    distance_km: 10.0,
    base_price: 500.0
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/routes?status=all');
      setRoutes(res.data.routes || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setFormData({
      route_name: '',
      route_code: '',
      source: '',
      destination: '',
      stops: '',
      distance_km: 10.0,
      base_price: 500.0
    });
    setShowModal(true);
  };

  const openEditModal = (r) => {
    setEditingRoute(r);
    setFormData({
      route_name: r.route_name,
      route_code: r.route_code,
      source: r.source,
      destination: r.destination,
      stops: r.stops ? r.stops.join(', ') : '',
      distance_km: r.distance_km,
      base_price: r.base_price
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        stops: formData.stops.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingRoute) {
        await API.put(`/routes/${editingRoute.id}`, payload);
        setMsg(`Route ${formData.route_code} updated successfully.`);
      } else {
        await API.post('/routes', payload);
        setMsg(`Route ${formData.route_code} created successfully.`);
      }

      setShowModal(false);
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed saving route.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this route?")) return;
    try {
      await API.delete(`/routes/${id}`);
      setMsg("Route deactivated.");
      fetchRoutes();
    } catch (err) {
      alert("Failed deactivating route.");
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Manage Transit Routes & Fares</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure city bus lines, stops, distance metrics, and monthly base fares.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Route
        </button>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading routes...</div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Code</th>
                <th style={{ padding: '1rem' }}>Route Name</th>
                <th style={{ padding: '1rem' }}>Source ➔ Destination</th>
                <th style={{ padding: '1rem' }}>Distance</th>
                <th style={{ padding: '1rem' }}>Base Monthly Fare</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--primary-600)' }}>{r.route_code}</td>
                  <td style={{ padding: '1rem' }}><strong>{r.route_name}</strong></td>
                  <td style={{ padding: '1rem' }}>{r.source} &rarr; {r.destination}</td>
                  <td style={{ padding: '1rem' }}>{r.distance_km} km</td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--accent-green)' }}>₹{r.base_price}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEditModal(r)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem' }}>
                        <Edit size={14} />
                      </button>
                      {r.status === 'active' && (
                        <button onClick={() => handleDeactivate(r.id)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem', background: 'var(--bg-surface)' }}>
            <h3>{editingRoute ? 'Edit Transit Route' : 'Add New Transit Route'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Fill in the route code, stops, and base fare pricing.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Route Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EX-101"
                    value={formData.route_code}
                    onChange={(e) => setFormData({ ...formData, route_code: e.target.value })}
                    required
                    disabled={!!editingRoute}
                  />
                </div>
                <div className="form-group">
                  <label>Route Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Express Line"
                    value={formData.route_name}
                    onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Source Terminal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Destination Terminal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Intermediate Stops (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Stop A, Stop B, Stop C"
                  value={formData.stops}
                  onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Distance (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Base Monthly Fare (₹)</label>
                  <input
                    type="number"
                    step="10"
                    className="form-control"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;
