import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = [
  'Electrical', 'Plumbing', 'Internet/Wi-Fi', 'Classroom', 'Laboratory',
  'Hostel', 'Library', 'Cleanliness', 'Security', 'Other',
];
const PRIORITIES = ['Low', 'Medium', 'High'];

const initialForm = {
  title: '',
  category: '',
  description: '',
  location: '',
  priority: 'Medium',
  imageUrl: '',
};

const SubmitGrievance = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.category) return 'Please select a category.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.location.trim()) return 'Location is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/grievances', form);
      navigate(`/grievances/${res.data.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Submit a Grievance</h1>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} placeholder="Short summary of the issue" />
        </label>

        <div className="form-grid">
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Block B, Room 204" />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail"
          />
        </label>

        <label>
          Image URL (optional)
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Grievance'}
        </button>
      </form>
    </div>
  );
};

export default SubmitGrievance;
