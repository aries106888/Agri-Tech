import axios from 'axios';

/**
 * Centralized Axios instance for all Flask API calls.
 * baseURL '/api' — Vite proxy forwards to http://localhost:5000 in dev.
 *
 * Auth: reads JWT from localStorage key 'spToken' (written by AuthContext).
 * On 401: clears credentials and fires 'shambapoint:signout' so AuthContext
 *         can clear React state reactively — no window.location.href needed.
 *
 * IMPORTANT: Always use a relative base '/api' so the Vite proxy handles
 * the forwarding to Flask. Never hardcode http://127.0.0.1:5000 here, as
 * that bypasses the proxy and causes CORS issues.
 */

// Dynamically read from import.meta.env.VITE_API_URL if defined, falling back to relative /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: false,
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
      // Clear credentials from storage
      localStorage.removeItem('spToken');
      localStorage.removeItem('spUser');
      // Notify AuthContext to clear React state — ProtectedRoute then redirects
      window.dispatchEvent(new CustomEvent('shambapoint:signout'));
    }

    // Check if it's a network error or 502/504 Bad Gateway (typical backend-down errors from Vite proxy)
    const isNetworkError = !error.response;
    const is502Or504 = error.response?.status === 502 || error.response?.status === 504;
    const isConnError = error.code === 'ECONNREFUSED' || error.message?.includes('Network Error');

    if (isNetworkError || is502Or504 || isConnError) {
      const customMsg = "Cannot reach the server — make sure the backend is running";
      if (!error.response) {
        error.response = { data: { error: customMsg } };
      } else {
        error.response.data = { error: customMsg };
      }
      error.message = customMsg;
    }

    return Promise.reject(error);
  }
);

export default api;
