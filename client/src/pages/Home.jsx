import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Campus Facilities</span>
        <h1>Report it. Track it. Get it fixed.</h1>
        <p>
          A single place for students to raise facility and grievance issues, and for admins to
          triage, assign, and resolve them without the back-and-forth.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Register as Student
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Login
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="hero-step">
          <span className="hero-step-index">Submit</span>
          <p>Log a grievance with category, location and priority in under a minute.</p>
        </div>
        <div className="hero-step">
          <span className="hero-step-index">Track</span>
          <p>Follow a clear status timeline from Pending to Resolved.</p>
        </div>
        <div className="hero-step">
          <span className="hero-step-index">Resolve</span>
          <p>Admins assign staff, update status, and close the loop with feedback.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
