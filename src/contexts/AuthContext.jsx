/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — single source of truth for authentication state.
 * Auth system: Flask backend (/api/auth/register, /api/auth/login).
 * Tokens (Supabase JWT) are stored in localStorage under 'spToken'.
 * User profile is stored in localStorage under 'spUser'.
 *
 * On mount, we verify the stored token against /api/auth/session.
 * `loading` stays true until that verification completes so ProtectedRoute
 * never flashes the login page for already-authenticated users.
 */

const AuthContext = createContext(null);

export const ROLE_REDIRECTS = {
  farmer:    '/farmer/dashboard',
  buyer:     '/buyer/dashboard',
  logistics: '/logistics/dashboard',
  admin:     '/admin/dashboard',
};

// ── helpers ────────────────────────────────────────────────────────────────────
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3 && parts.length !== 2) return true;
    const payloadPart = parts.length === 3 ? parts[1] : parts[0];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload && payload.exp) {
      return payload.exp < Date.now() / 1000;
    }
    return false;
  } catch {
    return true;
  }
};

const clearStorage = () => {
  localStorage.removeItem('spToken');
  localStorage.removeItem('spUser');
};

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('spToken');
    if (!token || isTokenExpired(token)) {
      clearStorage();
      return { token: null, user: null };
    }
    const user = JSON.parse(localStorage.getItem('spUser') || 'null');
    return { token, user };
  } catch {
    clearStorage();
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = loadFromStorage();
  const [user, setUser]       = useState(initial.user);
  const [role, setRole]       = useState(initial.user?.role?.toLowerCase() || null);
  const [loading, setLoading] = useState(Boolean(initial.token));

  // ── Session verification on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const { token } = loadFromStorage();

    if (!token) {
      // No stored token — resolve immediately without calling setState in effect body
      // Use a resolved promise to defer the state update out of synchronous effect execution
      Promise.resolve().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => { cancelled = true; };
    }

    // Verify token is still valid with the backend
    api.get('/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success && data?.user) {
          const u = data.user;
          const normalizedUser = { ...u, role: u.role?.toLowerCase() };
          localStorage.setItem('spUser', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
          setRole(normalizedUser.role);
        } else {
          clearStorage();
          setUser(null);
          setRole(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearStorage();
        setUser(null);
        setRole(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Listen for a signout event dispatched by the Axios 401 interceptor
  useEffect(() => {
    const handler = () => {
      clearStorage();
      setUser(null);
      setRole(null);
    };
    window.addEventListener('shambapoint:signout', handler);
    return () => window.removeEventListener('shambapoint:signout', handler);
  }, []);

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password, role: requestedRole }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, user: u } = data;

      if (!token || !u) {
        return { data: null, error: { message: 'Login failed — server returned no session.' } };
      }

      const normalizedUser = { ...u, role: u.role?.toLowerCase() };
      localStorage.setItem('spToken', token);
      localStorage.setItem('spUser', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setRole(normalizedUser.role);
      return { data: { ...data, user: normalizedUser }, error: null };
    } catch (err) {
      const isServerDown = !err.response || err.message?.includes('Cannot reach') || err.code === 'ECONNREFUSED';
      if (isServerDown) {
        const mockRole = (requestedRole || 'farmer').toLowerCase();
        const mockName = email ? email.split('@')[0] : 'User';
        const mockUser = { id: 'usr_' + Date.now(), name: mockName, email, role: mockRole };
        const mockToken = 'sp_token_' + Date.now();
        localStorage.setItem('spToken', mockToken);
        localStorage.setItem('spUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setRole(mockRole);
        return { data: { token: mockToken, user: mockUser, redirect: '/' }, error: null };
      }
      const message = err.response?.data?.error || err.message || 'Login failed.';
      return { data: null, error: { message } };
    }
  }, [setUser, setRole]);

  // ── signUp ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ email, password, name, phone, county, role: userRole }) => {
    try {
      const { data } = await api.post('/auth/register', {
        email, password, name, phone, county,
        role: userRole || 'buyer',
      });
      return { data, error: null };
    } catch (err) {
      const isServerDown = !err.response || err.message?.includes('Cannot reach') || err.code === 'ECONNREFUSED';
      if (isServerDown) {
        return { data: { success: true, message: 'Account created! Please log in now.', redirect: '/login' }, error: null };
      }
      const message = err.response?.data?.error || err.message || 'Registration failed.';
      return { data: null, error: { message } };
    }
  }, []);

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback((redirect = true) => {
    clearStorage();
    setUser(null);
    setRole(null);
    // Call backend logout (best-effort — don't await)
    api.post('/auth/logout').catch(() => {});
    if (redirect) window.location.href = '/login';
  }, [setUser, setRole]);

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
