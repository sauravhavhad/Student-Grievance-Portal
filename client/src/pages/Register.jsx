import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  studentId: '',
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  year: '',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    for (const key of Object.keys(initialForm)) {
      if (!form[key] || !form[key].toString().trim()) {
        return 'All fields are required.';
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return 'Please provide a valid email address.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
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
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
        <h2>Create your student account</h2>
        <p className="auth-sub">Register to submit and track grievances</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <label>
            Student ID
            <input name="studentId" value={form.studentId} onChange={handleChange} />
          </label>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>
          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} />
          </label>
          <label>
            Year
            <select name="year" value={form.year} onChange={handleChange}>
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
