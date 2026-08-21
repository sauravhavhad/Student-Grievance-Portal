import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = [
  'Electrical', 'Plumbing', 'Internet/Wi-Fi', 'Classroom', 'Laboratory',
  'Hostel', 'Library', 'Cleanliness', 'Security', 'Other',
];

const MyGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      const res = await api.get('/grievances/my', { params });
      setGrievances(res.data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  }, [search, status, category]);

  useEffect(() => {
    const timeout = setTimeout(fetchGrievances, 300);
    return () => clearTimeout(timeout);
  }, [fetchGrievances]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Grievances</h1>
        <Link to="/grievances/new" className="btn btn-primary">Submit Grievance</Link>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by title or grievance ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading grievances..." />
      ) : grievances.length === 0 ? (
        <p className="empty-state">No grievances match your filters.</p>
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grievances.map((g) => (
                <tr key={g._id}>
                  <td>{g.grievanceId}</td>
                  <td>{g.title}</td>
                  <td>{g.category}</td>
                  <td><PriorityBadge priority={g.priority} /></td>
                  <td><StatusBadge status={g.status} /></td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/grievances/${g._id}`} className="link">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyGrievances;
