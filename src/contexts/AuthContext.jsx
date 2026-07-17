/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * AuthContext — single source of truth for authentication state.
 * Auth system: Supabase Auth (email/password).
 * Profile data (name, phone, county, role) stored in public.profiles table.
 */

const AuthContext = createContext(null);

export const ROLE_REDIRECTS = {
  farmer:    '/farmer/dashboard',
  buyer:     '/buyer/dashboard',
  logistics: '/logistics/dashboard',
  admin:     '/admin/dashboard',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from public.profiles table
  const fetchProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setRole(null);
      return;
    }
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const merged = {
        id:    supabaseUser.id,
        email: supabaseUser.email,
        name:  profile?.name  || supabaseUser.email?.split('@')[0],
        phone: profile?.phone || '',
        county: profile?.county || '',
        role:  profile?.role  || 'buyer',
      };
      setUser(merged);
      setRole(merged.role);
    } catch {
      // Profile not found — use basic info
      const fallback = {
        id:    supabaseUser.id,
        email: supabaseUser.email,
        name:  supabaseUser.email?.split('@')[0],
        role:  'buyer',
      };
      setUser(fallback);
      setRole('buyer');
    }
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── signIn ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { data: null, error: { message: error.message } };
    await fetchProfile(data.user);
    return { data, error: null };
  }, [fetchProfile]);

  // ── signUp ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ email, password, name, phone, county, role: userRole }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, county, role: userRole || 'buyer' },
      },
    });
    if (error) return { data: null, error: { message: error.message } };
    return { data, error: null };
  }, []);

  // ── signOut ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async (redirect = true) => {
    await supabase.auth.signOut();
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
