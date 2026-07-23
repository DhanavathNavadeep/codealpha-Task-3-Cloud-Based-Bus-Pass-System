import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  PlusCircle, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  MapPin, 
  Users, 
  BarChart3, 
  FileText 
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  if (!isOpen) return null;

  const userNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Passes', path: '/my-passes', icon: CreditCard },
    { label: 'Apply New Pass', path: '/apply', icon: PlusCircle },
    { label: 'Profile Settings', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Verify Passes', path: '/admin/passes', icon: ShieldAlert },
    { label: 'Manage Routes', path: '/admin/routes', icon: MapPin },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Analytics & Audit', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      boxShadow: 'var(--shadow-md)',
      flexShrink: 0
    }}>
      <div style={{ padding: '0 0.5rem 1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: '600' }}>
          {isAdmin ? 'Management Console' : 'Passenger Services'}
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {(isAdmin ? adminNavItems : userNavItems).map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(135deg, var(--primary-600), var(--primary-700))' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Switch mode view indicator */}
      {isAdmin && (
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#38bdf8',
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <span>&larr; Switch to User Mode</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
