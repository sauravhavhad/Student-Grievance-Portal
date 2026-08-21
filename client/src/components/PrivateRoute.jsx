import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Guards a route: requires login, and optionally a specific role
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
