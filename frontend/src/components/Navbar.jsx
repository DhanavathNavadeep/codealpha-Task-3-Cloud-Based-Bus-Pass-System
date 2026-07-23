import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bus, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '70px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleSidebar} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', display: 'flex' }}>
          <Menu size={20} />
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-900))',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bus size={22} />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
            Metro<span style={{ color: 'var(--primary-500)' }}>Pass</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Dark / Light Mode Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-outline"
          title="Toggle Dark/Light Theme"
          style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Link to="/profile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--text-main)',
              background: 'var(--primary-50)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <UserIcon size={16} color="var(--primary-500)" />
              <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{user.full_name}</span>
              <span className={`badge badge-${user.role === 'admin' ? 'approved' : 'active'}`} style={{ fontSize: '0.7rem' }}>
                {user.role}
              </span>
            </Link>

            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.45rem 0.75rem', color: '#dc2626' }}>
              <LogOut size={16} />
              <span style={{ fontSize: '0.85rem' }}>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-outline">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
