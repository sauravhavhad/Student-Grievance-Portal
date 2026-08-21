import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeLink = user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/';

  return (
    <header className="navbar">
      <Link to={homeLink} className="navbar-brand">
        <span className="brand-mark">GP</span>
        <span className="brand-text">Grievance Portal</span>
      </Link>

      <nav className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">
              {user.name} <span className="role-chip">{user.role}</span>
            </span>
            <Link to={user.role === 'admin' ? '/admin/profile' : '/profile'} className="btn btn-ghost">
              Profile
            </Link>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
