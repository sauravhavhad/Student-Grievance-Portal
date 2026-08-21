import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const TIMELINE_STEPS = ['Submitted', 'Pending', 'In Progress', 'Resolved'];

const StatusTimeline = ({ status, statusHistory }) => {
  if (status === 'Rejected') {
    return (
      <div className="timeline">
        <div className="timeline-step done">
          <span className="timeline-dot" />
          <span>Submitted</span>
        </div>
        <div className="timeline-connector done" />
        <div className="timeline-step rejected">
          <span className="timeline-dot" />
          <span>Rejected</span>
        </div>
      </div>
    );
  }

  const reachedIndex = TIMELINE_STEPS.indexOf(status === 'Pending' ? 'Pending' : status);

  return (
    <div className="timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= (reachedIndex === -1 ? 1 : reachedIndex);
        return (
          <React.Fragment key={step}>
            {idx > 0 && <div className={`timeline-connector ${isDone ? 'done' : ''}`} />}
            <div className={`timeline-step ${isDone ? 'done' : ''}`}>
              <span className="timeline-dot" />
              <span>{step}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const GrievanceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const fetchGrievance = async () => {
    try {
      const res = await api.get(`/grievances/${id}`);
      setGrievance(res.data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load grievance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSubmitting(true);
    try {
      const res = await api.post(`/grievances/${id}/feedback`, { rating, comment });
      setGrievance(res.data.data);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading grievance..." />;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!grievance) return null;

  const isOwner = user?.role === 'student' && grievance.student?._id === user.id;
  const canGiveFeedback = isOwner && grievance.status === 'Resolved' && !grievance.feedback?.rating;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1>{grievance.title}</h1>
          <p className="page-subtitle">{grievance.grievanceId}</p>
        </div>
        <Link to={user?.role === 'admin' ? '/admin/grievances' : '/grievances'} className="btn btn-outline">
          Back
        </Link>
      </div>

      <div className="panel">
        <StatusTimeline status={grievance.status} />
      </div>

      <div className="panel detail-grid">
        <div><span className="detail-label">Category</span><span>{grievance.category}</span></div>
        <div><span className="detail-label">Priority</span><PriorityBadge priority={grievance.priority} /></div>
        <div><span className="detail-label">Status</span><StatusBadge status={grievance.status} /></div>
        <div><span className="detail-label">Location</span><span>{grievance.location}</span></div>
        <div><span className="detail-label">Created</span><span>{new Date(grievance.createdAt).toLocaleString()}</span></div>
        <div><span className="detail-label">Updated</span><span>{new Date(grievance.updatedAt).toLocaleString()}</span></div>
        <div><span className="detail-label">Assigned Staff</span><span>{grievance.assignedStaff ? `${grievance.assignedStaff.name} (${grievance.assignedStaff.department})` : 'Not assigned yet'}</span></div>
        {grievance.student && (
          <div><span className="detail-label">Student</span><span>{grievance.student.name} ({grievance.student.studentId})</span></div>
        )}
      </div>

      <div className="panel">
        <span className="detail-label">Description</span>
        <p>{grievance.description}</p>
        {grievance.imageUrl && (
          <img src={grievance.imageUrl} alt="Grievance evidence" className="grievance-image" />
        )}
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

      {grievance.status === 'Resolved' && (
        <div className="panel">
          <h2>Feedback</h2>
          {grievance.feedback?.rating ? (
            <div className="feedback-display">
              <p>Rating: {'★'.repeat(grievance.feedback.rating)}{'☆'.repeat(5 - grievance.feedback.rating)}</p>
              {grievance.feedback.comment && <p>"{grievance.feedback.comment}"</p>}
            </div>
          ) : canGiveFeedback ? (
            <form onSubmit={handleFeedbackSubmit} className="form-panel">
              {feedbackError && <div className="alert alert-error">{feedbackError}</div>}
              <label>
                Rating
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                </select>
              </label>
              <label>
                Comment
                <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience" />
              </label>
              <button type="submit" className="btn btn-primary" disabled={feedbackSubmitting}>
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          ) : (
            <p className="empty-state">No feedback submitted for this grievance.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GrievanceDetails;
