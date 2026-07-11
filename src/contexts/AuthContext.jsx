/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — single source of truth for authentication state.
 *
 * Auth system: Flask JWT via POST /api/auth/login and POST /api/auth/register.
 * Tokens are stored under two canonical localStorage keys:
 *   spToken — the JWT bearer token injected into every Axios request
 *   spUser  — JSON-serialised { id, name, email, phone, role }
 *
 * Exposes:
 *   user     — { id, name, email, phone, role } | null
 *   role     — 'farmer' | 'buyer' | 'logistics' | 'admin' | null
 *   loading  — true until localStorage rehydration completes (prevents flash)
 *   signIn   — ({ email, password, role }) => Promise<{ data, error }>
 *   signUp   — ({ email, password, name, phone, county, role }) => Promise<{ data, error }>
 *   signOut  — () => void
 */

const AuthContext = createContext(null);

// Canonical storage keys — one source of truth, no mirroring
export const TOKEN_KEY = 'spToken';
export const USER_KEY  = 'spUser';

export const ROLE_REDIRECTS = {
  farmer:    '/farmer/dashboard',
  buyer:     '/buyer/dashboard',
  logistics: '/logistics/dashboard',
  admin:     '/admin/dashboard',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const writeAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const eraseAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ─── Provider ─────────────────────────────────────────────────────────────────

// ── Lazy initialiser: reads localStorage synchronously at mount (no useEffect) ─
const _initUser = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    const u     = raw ? JSON.parse(raw) : null;
    if (token && u?.role) return u;
  } catch { eraseAuth(); }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Lazy initialisers: localStorage is synchronous, so no async effect is needed.
  // This eliminates the setState-in-effect anti-pattern.
  const [user, setUser] = useState(_initUser);
  const [role, setRole] = useState(() => _initUser()?.role ?? null);
  // loading is false immediately because init is synchronous
  const [loading]       = useState(false);

  // Apply an authenticated session into React state + localStorage
  const applySession = useCallback((token, userData) => {
    writeAuth(token, userData);
    setUser(userData);
    setRole(userData?.role ?? null);
  }, []);

  // Clear session from React state + localStorage
  const clearSession = useCallback(() => {
    eraseAuth();
    setUser(null);
    setRole(null);
  }, []);

  // ── 2. Listen for 401 events dispatched by api.js interceptor ─────────────
  //    This lets the Axios interceptor trigger a clean React-state logout
  //    without needing a direct import of this context.
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('shambapoint:signout', handler);
    return () => window.removeEventListener('shambapoint:signout', handler);
  }, [clearSession]);

  // ── signIn — POST /api/auth/login ─────────────────────────────────────────
  const signIn = useCallback(async ({ email, password, role: userRole }) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
        ...(userRole ? { role: userRole } : {}),
      });
      applySession(data.token, data.user);
      return { data, error: null };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please check your credentials.';
      return { data: null, error: { message } };
    }
  }, [applySession]);

  // ── signUp — POST /api/auth/register ──────────────────────────────────────
  const signUp = useCallback(async ({ email, password, name, phone, county, role: userRole }) => {
    try {
      const { data } = await api.post('/auth/register', {
        email, password, name, phone, county, role: userRole,
      });
      applySession(data.token, data.user);
      return { data, error: null };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      return { data: null, error: { message } };
    }
  }, [applySession]);

  // ── signOut — clear local state (JWT is stateless; no server call needed) ─
  const signOut = useCallback(async (redirect = true) => {
    try {
      // If the page fade helper exists, run the fade-out before clearing session
      if (window?.pageFade?.fadeOut) {
        await window.pageFade.fadeOut(300);
      }
    } catch { /* ignore — pageFade is optional */ }

    clearSession();
    if (redirect) {
      try { window.location.href = '/login'; } catch { /* ignore */ }
    }
  }, [clearSession]);

  const value = { user, role, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — consume auth context inside any component.
 * Throws a clear error if used outside <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be used within <AuthProvider>. ' +
      'Make sure <AuthProvider> wraps your app in main.jsx.'
    );
  }
  return ctx;
};

export default AuthContext;
