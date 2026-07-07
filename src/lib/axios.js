import axios from 'axios';

/**
 * lib/axios.js — secondary Axios instance (used by legacy dashboard components).
 * Reads JWT from the same canonical key as services/api.js ('spToken').
 * Supabase token references have been removed.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

// ─── REQUEST: inject JWT ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE: handle auth errors ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spToken');
      localStorage.removeItem('spUser');
      window.dispatchEvent(new CustomEvent('shambapoint:signout'));
    }
    return Promise.reject(error);
  }
);

export default api;
