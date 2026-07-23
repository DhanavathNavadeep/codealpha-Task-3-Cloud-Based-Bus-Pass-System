import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Search, UserCheck, UserX, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'active' ? 'suspended' : 'active';
    try {
      await API.put(`/admin/users/${userObj.id}/status`, { status: newStatus });
      setMsg(`User ${userObj.email} status changed to ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      alert("Failed updating user status.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Registered Passengers & Users</h2>
          <p style={{ color: 'var(--text-muted)' }}>View system user accounts, access roles, and status controls.</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading user directory...</div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>User ID</th>
                <th style={{ padding: '1rem' }}>Name & Email</th>
                <th style={{ padding: '1rem' }}>Phone</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Registered Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>#{u.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <strong>{u.full_name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${u.role === 'admin' ? 'approved' : 'active'}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${u.status}`}>{u.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`btn ${u.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {u.status === 'active' ? <UserX size={14} color="#dc2626" /> : <UserCheck size={14} />}
                        <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
