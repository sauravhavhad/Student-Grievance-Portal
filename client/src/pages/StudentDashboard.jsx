import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/grievances/my');
        setGrievances(res.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load grievances.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  const total = grievances.length;
  const pending = grievances.filter((g) => g.status === 'Pending').length;
  const inProgress = grievances.filter((g) => g.status === 'In Progress').length;
  const resolved = grievances.filter((g) => g.status === 'Resolved').length;
  const rejected = grievances.filter((g) => g.status === 'Rejected').length;

  const recent = [...grievances]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p className="page-subtitle">Here's an overview of your grievances</p>
        </div>
        <div className="page-header-actions">
          <Link to="/grievances/new" className="btn btn-primary">Submit Grievance</Link>
          <Link to="/grievances" className="btn btn-outline">View All Grievances</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Total Complaints" value={total} tone="default" />
        <StatCard label="Pending" value={pending} tone="pending" />
        <StatCard label="In Progress" value={inProgress} tone="inprogress" />
        <StatCard label="Resolved" value={resolved} tone="resolved" />
        <StatCard label="Rejected" value={rejected} tone="rejected" />
      </div>

      <section className="panel">
        <h2>Recent Grievances</h2>
        {recent.length === 0 ? (
          <p className="empty-state">You haven't submitted any grievances yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Grievance ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((g) => (
                  <tr key={g._id}>
                    <td>{g.grievanceId}</td>
                    <td>{g.title}</td>
                    <td><PriorityBadge priority={g.priority} /></td>
                    <td><StatusBadge status={g.status} /></td>
                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/grievances/${g._id}`} className="link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
