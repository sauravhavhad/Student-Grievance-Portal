import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="status-page">
    <h1>403</h1>
    <p>You don't have permission to view this page.</p>
    <Link to="/" className="btn btn-primary">Go home</Link>
  </div>
);

export default Unauthorized;
