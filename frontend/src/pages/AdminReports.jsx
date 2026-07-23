import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart3, Download, ShieldCheck, Activity, Terminal } from 'lucide-react';

const AdminReports = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await API.get('/admin/audit-logs');
        setAuditLogs(res.data.audit_logs || []);
      } catch (err) {
        console.error("Failed loading audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;

    const headers = ["Log ID", "User ID", "User Name", "Action", "Details", "IP Address", "Timestamp"];
    const rows = auditLogs.map(l => [
      l.id,
      l.user_id || 'N/A',
      `"${l.user_name}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ip_address,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BusPass_AuditLogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Analytics & Audit Log Inspector</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time security trail, transaction auditing, and exportable system reports.</p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-success">
          <Download size={18} /> Export Audit CSV
        </button>
      </div>

      {/* System Health Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', padding: '0.8rem', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)' }}>Cloud Service Status: Healthy & Stateless</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Flask REST API &bull; Redis Cache Ready &bull; CloudWatch Logs Connected
            </span>
          </div>
        </div>

        <span className="badge badge-approved" style={{ fontSize: '0.88rem', padding: '0.4rem 1rem' }}>
          <ShieldCheck size={16} /> 100% Operational
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={20} color="var(--primary-500)" /> Security Audit Logs Queue
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading audit logs...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.8rem' }}>ID</th>
                  <th style={{ padding: '0.8rem' }}>Timestamp</th>
                  <th style={{ padding: '0.8rem' }}>User</th>
                  <th style={{ padding: '0.8rem' }}>Action Event</th>
                  <th style={{ padding: '0.8rem' }}>Audit Details</th>
                  <th style={{ padding: '0.8rem' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem', fontWeight: '600' }}>#{log.id}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.8rem', fontWeight: '600' }}>{log.user_name}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span className="badge badge-pending" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-main)' }}>{log.details}</td>
                    <td style={{ padding: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
