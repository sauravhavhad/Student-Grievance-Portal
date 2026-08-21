import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error handling: always surface a readable message
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response) {
      // Auto-logout on invalid/expired token
      if (err.response.status === 401) {
        localStorage.removeItem('gp_token');
        localStorage.removeItem('gp_user');
      }
      return Promise.reject({
        message: err.response.data?.message || 'Something went wrong. Please try again.',
        status: err.response.status,
      });
    }
    if (err.request) {
      return Promise.reject({ message: 'Network error. Please check your connection and try again.', status: 0 });
    }
    return Promise.reject({ message: 'Something went wrong. Please try again.', status: 0 });
  }
);

export default api;
