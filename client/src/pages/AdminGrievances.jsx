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
const PRIORITIES = ['Low', 'Medium', 'High'];

const AdminGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [deletingId, setDeletingId] = useState(null);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      const res = await api.get('/admin/grievances', { params });
      setGrievances(res.data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  }, [search, status, category, priority, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchGrievances, 300);
    return () => clearTimeout(timeout);
  }, [fetchGrievances]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grievance permanently? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/grievances/${id}`);
      setGrievances((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete grievance.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Grievances</h1>
      </div>

      <div className="filters-bar filters-bar-wide">
        <input
          type="text"
          placeholder="Search by ID, title, or student name..."
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
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority</option>
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
                <th>Student</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grievances.map((g) => (
                <tr key={g._id}>
                  <td>{g.grievanceId}</td>
                  <td>{g.student?.name || '—'}</td>
                  <td>{g.title}</td>
                  <td>{g.category}</td>
                  <td><PriorityBadge priority={g.priority} /></td>
                  <td><StatusBadge status={g.status} /></td>
                  <td>{g.assignedStaff?.name || 'Unassigned'}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <Link to={`/admin/grievances/${g._id}`} className="link">Manage</Link>
                    <button
                      className="link link-danger"
                      onClick={() => handleDelete(g._id)}
                      disabled={deletingId === g._id}
                    >
                      {deletingId === g._id ? 'Deleting...' : 'Delete'}
                    </button>
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

export default AdminGrievances;
