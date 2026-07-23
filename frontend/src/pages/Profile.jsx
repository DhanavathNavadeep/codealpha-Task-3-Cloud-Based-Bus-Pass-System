import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Phone, MapPin, Mail, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPass, setSubmittingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSubmittingProfile(true);

    try {
      const res = await API.put('/users/profile', profileData);
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordErr('New passwords do not match.');
      return;
    }

    setSubmittingPass(true);

    try {
      const res = await API.post('/users/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      setPasswordMsg(res.data.message);
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordErr(err.response?.data?.error || 'Password update failed.');
    } finally {
      setSubmittingPass(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h2>User Profile & Security Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and account credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Personal Info Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary-500)" /> Personal Information
          </h3>

          {profileMsg && (
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.65rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} /> {profileMsg}
            </div>
          )}

          {profileErr && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.65rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {profileErr}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Registered Email (Read-only)</label>
              <input type="text" className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                className="form-control"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submittingProfile}>
              <Save size={16} /> {submittingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary-500)" /> Security & Password
          </h3>

          {passwordMsg && (
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.65rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} /> {passwordMsg}
            </div>
          )}

          {passwordErr && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.65rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {passwordErr}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submittingPass}>
              {submittingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
