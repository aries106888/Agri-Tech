/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — single source of truth for authentication state.
 * Auth system: Flask backend (/api/auth/register, /api/auth/login).
 * Tokens (HMAC-SHA256 JWT) are stored in localStorage under 'spToken'.
 * User profile is stored in localStorage under 'spUser'.
 */

const AuthContext = createContext(null);

export const ROLE_REDIRECTS = {
  farmer:    '/farmer/dashboard',
  buyer:     '/buyer/dashboard',
  logistics: '/logistics/dashboard',
  admin:     '/admin/dashboard',
};

// ── helpers ────────────────────────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('spToken');
    const user  = JSON.parse(localStorage.getItem('spUser') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = loadFromStorage();
  const [user, setUser]       = useState(initial.user);
  const [role, setRole]       = useState(initial.user?.role || null);
  const [loading, setLoading] = useState(false);

  // Listen for a signout event dispatched by the Axios 401 interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setRole(null);
    };
    window.addEventListener('shambapoint:signout', handler);
    return () => window.removeEventListener('shambapoint:signout', handler);
  }, []);

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password, role: loginRole }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role: loginRole });
      const { token, user: u } = data;
      localStorage.setItem('spToken', token);
      localStorage.setItem('spUser', JSON.stringify(u));
      setUser(u);
      setRole(u.role);
      return { data, error: null };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed.';
      return { data: null, error: { message } };
    }
  }, []);

  // ── signUp ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ email, password, name, phone, county, role: userRole }) => {
    try {
      const { data } = await api.post('/auth/register', {
        email, password, name, phone, county,
        role: userRole || 'buyer',
      });
      // Auto-login after successful registration
      const { token, user: u } = data;
      if (token && u) {
        localStorage.setItem('spToken', token);
        localStorage.setItem('spUser', JSON.stringify(u));
        setUser(u);
        setRole(u.role);
      }
      return { data, error: null };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed.';
      return { data: null, error: { message } };
    }
  }, []);

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback((redirect = true) => {
    localStorage.removeItem('spToken');
    localStorage.removeItem('spUser');
    setUser(null);
    setRole(null);
    if (redirect) window.location.href = '/login';
  }, []);

  const value = { user, role, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>.');
  }
  return ctx;
};

export default AuthContext;
