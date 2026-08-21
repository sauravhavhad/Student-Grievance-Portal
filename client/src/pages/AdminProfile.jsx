import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const AdminProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        setProfile(res.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Admin Profile</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {profile && (
        <div className="panel profile-card">
          <div className="profile-avatar">{profile.name?.charAt(0).toUpperCase()}</div>
          <div className="detail-grid">
            <div><span className="detail-label">Name</span><span>{profile.name}</span></div>
            <div><span className="detail-label">Email</span><span>{profile.email}</span></div>
            <div><span className="detail-label">Role</span><span>{profile.role}</span></div>
            <div><span className="detail-label">Department</span><span>{profile.department}</span></div>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
