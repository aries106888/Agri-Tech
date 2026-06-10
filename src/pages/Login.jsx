import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Leaf } from 'lucide-react';
import api from '../services/api';

const ROLES = [
  { id: 'farmer',    label: 'Farmer' },
  { id: 'buyer',     label: 'Buyer' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'admin',     label: 'Admin' },
];

const Login = () => {
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '', role: 'farmer' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate(res.data.redirect);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[480px]">
        {/* Brand */}
        <div className="bg-ag-primary rounded-card p-6 mb-6 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-ag-primary-fixed" />
          <div>
            <p className="text-white font-extrabold text-xl">AgriTech</p>
            <p className="text-ag-primary-fixed text-sm font-bold">Sell Your Harvest. Get Paid Instantly.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-ag-border rounded-card p-8 shadow-sm">
          <h1 className="text-headline-lg text-ag-body mb-1">Welcome back</h1>
          <p className="text-ag-muted text-sm mb-8">Sign in to your AgriTech account</p>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-btn px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-ag-error shrink-0" />
              <p className="text-sm font-bold text-ag-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Sign in as</label>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.id }))}
                    className={`py-2 rounded-btn border-2 text-xs font-bold transition-colors ${
                      form.role === r.id
                        ? 'bg-ag-primary border-ag-primary text-white'
                        : 'border-ag-border text-ag-muted hover:border-ag-primary'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
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
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full text-base mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Login to AgriTech →'}
            </button>

            <p className="text-center text-sm text-ag-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="btn-tertiary !text-sm">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
