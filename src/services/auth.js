/**
 * auth.js — Authentication service helpers
 * Wraps login, register, and logout API calls so pages stay thin.
 */
import api from './api';

/** POST /auth/login — returns { token, user } */
export const loginUser = (credentials) =>
  api.post('/auth/login', credentials).then((r) => r.data);

/** POST /auth/register — returns { token, user } */
export const registerUser = (payload) =>
  api.post('/auth/register', payload).then((r) => r.data);

/** Persist auth data to localStorage */
export const persistAuth = ({ token, user }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/** Clear all auth data from localStorage */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/** Returns the currently stored user object or null */
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

/** Returns the currently stored JWT token or null */
export const getStoredToken = () => localStorage.getItem('token') || null;
