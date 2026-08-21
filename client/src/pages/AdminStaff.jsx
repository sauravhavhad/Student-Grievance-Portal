import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.department.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const res = await api.post('/admin/staff', form);
      setStaff((prev) => [...prev, res.data.data]);
      setForm({ name: '', email: '', department: '' });
    } catch (err) {
      setFormError(err.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Remove this staff member?')) return;
    setDeletingId(staffId);
    try {
      await api.delete(`/admin/staff/${staffId}`);
      setStaff((prev) => prev.filter((s) => s._id !== staffId));
    } catch (err) {
      setError(err.message || 'Failed to delete staff member.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Staff Management</h1>
      </div>

      <div className="panel form-panel">
        <h2>Add Staff Member</h2>
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit} className="form-grid form-grid-inline">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Staff'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading staff..." />
      ) : staff.length === 0 ? (
        <p className="empty-state">No staff members added yet.</p>
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.department}</td>
                  <td>
                    <button
                      className="link link-danger"
                      onClick={() => handleDelete(s._id)}
                      disabled={deletingId === s._id}
                    >
                      {deletingId === s._id ? 'Removing...' : 'Remove'}
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

export default AdminStaff;
