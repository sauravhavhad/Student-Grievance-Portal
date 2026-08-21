import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const { stats, recentGrievances, highPriorityGrievances, recentlyResolved } = data;

  const renderTable = (title, rows, emptyText) => (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Student</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g._id}>
                  <td>{g.grievanceId}</td>
                  <td>{g.student?.name || '—'}</td>
                  <td>{g.title}</td>
                  <td><PriorityBadge priority={g.priority} /></td>
                  <td><StatusBadge status={g.status} /></td>
                  <td><Link to={`/admin/grievances/${g._id}`} className="link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stat-grid stat-grid-6">
        <StatCard label="Total Grievances" value={stats.total} tone="default" />
        <StatCard label="Pending" value={stats.pending} tone="pending" />
        <StatCard label="In Progress" value={stats.inProgress} tone="inprogress" />
        <StatCard label="Resolved" value={stats.resolved} tone="resolved" />
        <StatCard label="Rejected" value={stats.rejected} tone="rejected" />
        <StatCard label="High Priority" value={stats.highPriority} tone="high" />
      </div>

      {renderTable('Recent Grievances', recentGrievances, 'No grievances yet.')}
      {renderTable('High Priority (Open)', highPriorityGrievances, 'No open high priority grievances.')}
      {renderTable('Recently Resolved', recentlyResolved, 'No resolved grievances yet.')}
    </div>
  );
};

export default AdminDashboard;
