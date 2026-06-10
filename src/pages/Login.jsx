import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Leaf, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ROLES = [
  { id: 'farmer',    label: 'Farmer',    redirect: '/farmer/dashboard' },
  { id: 'buyer',     label: 'Buyer',     redirect: '/buyer/dashboard' },
  { id: 'logistics', label: 'Logistics', redirect: '/logistics/dashboard' },
  { id: 'admin',     label: 'Admin',     redirect: '/admin/dashboard' },
];

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '', role: 'farmer' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getRedirect = (role) => {
    const found = ROLES.find(r => r.id === role);
    return found ? found.redirect : '/farmer/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      // Try Flask backend first
      const res = await api.post('/auth/login', form);
      const { token, user, redirect } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(`Welcome back, ${user.name}! Redirecting...`);
      setTimeout(() => navigate(redirect || getRedirect(form.role)), 800);
    } catch (err) {
      // Fallback: if Flask is offline, use role-based local redirect
      if (!err.response || err.response?.status >= 500) {
        const user = { name: form.email.split('@')[0], role: form.role, email: form.email };
        localStorage.setItem('token', btoa(form.email + ':' + form.role));
        localStorage.setItem('user', JSON.stringify(user));
        setSuccess(`Welcome, ${user.name}! Redirecting to your dashboard...`);
        setTimeout(() => navigate(getRedirect(form.role)), 800);
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[480px]">

        {/* Brand Header */}
        <div className="bg-ag-primary rounded-card p-6 mb-6 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-ag-primary-fixed" />
          <div>
            <p className="text-white font-extrabold text-xl">ShambaPoint</p>
            <p className="text-ag-primary-fixed text-sm font-bold">Sell Your Harvest. Get Paid Instantly.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-ag-border rounded-card p-8 shadow-sm">
          <h1 className="text-headline-lg text-ag-body mb-1">Welcome Back</h1>
          <p className="text-ag-muted text-sm mb-8">Sign in to your AgriTech account</p>

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-btn px-4 py-3 mb-6">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-700">{success}</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-btn px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-ag-error shrink-0" />
              <p className="text-sm font-bold text-ag-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-bold text-ag-body mb-2">Sign in as</label>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.id }))}
                    className={`py-2.5 rounded-btn border-2 text-xs font-bold transition-all ${
                      form.role === r.id
                        ? 'bg-ag-primary border-ag-primary text-white shadow-sm'
                        : 'border-ag-border text-ag-muted hover:border-ag-primary hover:text-ag-primary'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ag-muted mt-2">
                You will be redirected to your <strong>{ROLES.find(r => r.id === form.role)?.label}</strong> dashboard after login.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full text-base mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : `Login to AgriTech \u2192`}
            </button>

            <p className="text-center text-sm text-ag-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="btn-tertiary !text-sm">Create Account</Link>
            </p>
          </form>
        </div>

        {/* Role Hint Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {ROLES.map(r => (
            <div
              key={r.id}
              onClick={() => setForm(p => ({ ...p, role: r.id }))}
              className={`p-3 rounded-card border-2 cursor-pointer transition-all ${
                form.role === r.id ? 'border-ag-primary bg-ag-primary/5' : 'border-ag-border bg-white hover:border-ag-primary/40'
              }`}
            >
              <p className={`text-xs font-bold ${form.role === r.id ? 'text-ag-primary' : 'text-ag-body'}`}>{r.label}</p>
              <p className="text-xs text-ag-muted mt-0.5">{r.redirect}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
