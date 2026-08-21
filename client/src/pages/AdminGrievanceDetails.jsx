import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const AdminGrievanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchAll = async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        api.get(`/grievances/${id}`),
        api.get('/admin/staff'),
      ]);
      setGrievance(gRes.data.data);
      setStaffList(sRes.data.data);
      setSelectedStaff(gRes.data.data.assignedStaff?._id || '');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load grievance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      setActionError('Please select a staff member.');
      return;
    }
    setActionError('');
    setAssigning(true);
    try {
      const res = await api.patch(`/grievances/${id}/assign`, { staffId: selectedStaff });
      setGrievance((prev) => ({ ...prev, assignedStaff: res.data.data.assignedStaff }));
    } catch (err) {
      setActionError(err.message || 'Failed to assign staff.');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) {
      setActionError('Please select a status.');
      return;
    }
    setActionError('');
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/grievances/${id}/status`, { status: newStatus, note: statusNote });
      setGrievance(res.data.data);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this grievance permanently?')) return;
    try {
      await api.delete(`/admin/grievances/${id}`);
      navigate('/admin/grievances');
    } catch (err) {
      setActionError(err.message || 'Failed to delete grievance.');
    }
  };

  if (loading) return <Loader label="Loading grievance..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!grievance) return null;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1>{grievance.title}</h1>
          <p className="page-subtitle">{grievance.grievanceId}</p>
        </div>
        <Link to="/admin/grievances" className="btn btn-outline">Back</Link>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="panel detail-grid">
        <div><span className="detail-label">Student</span><span>{grievance.student.name} ({grievance.student.studentId})</span></div>
        <div><span className="detail-label">Category</span><span>{grievance.category}</span></div>
        <div><span className="detail-label">Priority</span><PriorityBadge priority={grievance.priority} /></div>
        <div><span className="detail-label">Status</span><StatusBadge status={grievance.status} /></div>
        <div><span className="detail-label">Location</span><span>{grievance.location}</span></div>
        <div><span className="detail-label">Created</span><span>{new Date(grievance.createdAt).toLocaleString()}</span></div>
        <div><span className="detail-label">Updated</span><span>{new Date(grievance.updatedAt).toLocaleString()}</span></div>
        <div><span className="detail-label">Assigned Staff</span><span>{grievance.assignedStaff ? grievance.assignedStaff.name : 'Not assigned yet'}</span></div>
      </div>

      <div className="panel">
        <span className="detail-label">Description</span>
        <p>{grievance.description}</p>
        {grievance.imageUrl && <img src={grievance.imageUrl} alt="Grievance evidence" className="grievance-image" />}
      </div>

      <div className="panel two-col">
        <form onSubmit={handleAssign} className="form-panel">
          <h2>Assign Staff</h2>
          <label>
            Staff Member
            <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
              <option value="">Select staff</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>{s.name} — {s.department}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={assigning}>
            {assigning ? 'Assigning...' : 'Assign'}
          </button>
        </form>

        <form onSubmit={handleStatusUpdate} className="form-panel">
          <h2>Update Status</h2>
          <label>
            New Status
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select status</option>
              {STATUS_OPTIONS.filter((s) => s !== grievance.status).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Note (optional)
            <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Add a short note" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Status History</h2>
        <ul className="history-list">
          {grievance.statusHistory.map((h, idx) => (
            <li key={idx}>
              <StatusBadge status={h.status} />
              <span className="history-time">{new Date(h.changedAt).toLocaleString()}</span>
              {h.note && <span className="history-note">{h.note}</span>}
            </li>
          ))}
        </ul>
      </div>

      {grievance.feedback?.rating && (
        <div className="panel">
          <h2>Student Feedback</h2>
          <p>Rating: {'★'.repeat(grievance.feedback.rating)}{'☆'.repeat(5 - grievance.feedback.rating)}</p>
          {grievance.feedback.comment && <p>"{grievance.feedback.comment}"</p>}
        </div>
      )}

      <div className="panel danger-zone">
        <h2>Danger Zone</h2>
        <p>Deleting a grievance is permanent and cannot be undone. Use this only for invalid or spam submissions.</p>
        <button className="btn btn-danger" onClick={handleDelete}>Delete Grievance</button>
      </div>
    </div>
  );
};

export default AdminGrievanceDetails;
