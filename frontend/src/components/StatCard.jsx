import React from 'react';

const StatCard = ({ title, value, icon: Icon, badge, color = 'var(--primary-500)' }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.8rem', marginTop: '0.4rem', color: 'var(--text-main)' }}>
          {value}
        </h3>
        {badge && (
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '600', display: 'inline-block', marginTop: '0.3rem' }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{
        background: `${color}15`,
        color: color,
        padding: '1rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {Icon && <Icon size={28} />}
      </div>
    </div>
  );
};

export default StatCard;
