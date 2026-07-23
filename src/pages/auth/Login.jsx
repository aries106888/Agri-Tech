import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Leaf, CheckCircle, Shield, Tractor, Briefcase, Truck, Eye, EyeOff } from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '../../contexts/AuthContext';

/**
 * Login — handles /login (all non-admin roles) and /admin/login.
 * Auth is via Flask POST /api/auth/login.
 * Role must be supplied at login time (Flask encodes it into the JWT).
 * Admin portal hardcodes role='admin'; general portal shows a role selector.
 */

const ROLE_OPTIONS = [
  { id: 'farmer',    label: 'Farmer',    Icon: Tractor   },
  { id: 'buyer',     label: 'Buyer',     Icon: Briefcase },
  { id: 'logistics', label: 'Logistics', Icon: Truck     },
];

const Login = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { signIn, signOut, user, role } = useAuth();
  const isAdminRoute  = location.pathname === '/admin/login';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('farmer'); // for non-admin login
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(
    location.state?.registered ? 'Account created! Please sign in below.' : ''
  );
  const [loading, setLoading]   = useState(false);

  // ── Reactive redirect ONLY if redirected from a ProtectedRoute ─────────────────
  useEffect(() => {
    if (user && role && location.state?.from) {
      if (isAdminRoute && role !== 'admin') return;
      navigate(location.state.from, { replace: true });
    }
  }, [user, role, navigate, isAdminRoute, location.state]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    const loginRole = isAdminRoute ? 'admin' : selectedRole;

    setLoading(true);
    try {
      const { data, error: signInError } = await signIn({
        email:    form.email,
        password: form.password,
        role:     loginRole,
      });

      if (signInError) {
        setError(signInError.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Admin portal: reject if the returned role is not admin
      if (isAdminRoute && data?.user?.role !== 'admin') {
        signOut();
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }

      const userRole = data?.user?.role || loginRole;
      const dest = location.state?.from || ROLE_REDIRECTS[userRole] || '/';
      setSuccess('Welcome back! Redirecting to portal…');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[480px]">

        {/* Brand Header */}
        <div className="bg-ag-primary rounded-card p-6 mb-6 flex items-center gap-3">
          {isAdminRoute
            ? <Shield className="w-8 h-8 text-ag-primary-fixed" />
            : <Leaf   className="w-8 h-8 text-ag-primary-fixed" />}
          <div>
            <p className="text-white font-extrabold text-xl">ShambaPoint</p>
            <p className="text-ag-primary-fixed text-sm font-bold">
              {isAdminRoute ? 'Administrator Portal' : 'Sell Your Harvest. Get Paid Instantly.'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-ag-border rounded-card p-8 shadow-sm">
          <h1 className="text-headline-lg text-ag-body mb-1">
            {isAdminRoute ? 'Admin Sign In' : 'Welcome Back'}
          </h1>
          <p className="text-ag-muted text-sm mb-6">
            {isAdminRoute
              ? 'Authenticate with your administrator credentials'
              : 'Sign in to your ShambaPoint account'}
          </p>

          {/* Role selector — only on general login */}
          {!isAdminRoute && (
            <div className="mb-6">
              <p className="text-sm font-bold text-ag-body mb-3">I am a…</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedRole(id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-card border-2 text-center
                      transition-all text-xs font-bold ${
                        selectedRole === id
                          ? 'border-ag-primary bg-ag-primary-fixed text-ag-primary'
                          : 'border-ag-border bg-ag-card text-ag-muted hover:border-ag-primary/40'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-btn px-4 py-3 mb-5">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-700">{success}</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-btn px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-ag-error shrink-0" />
              <p className="text-sm font-bold text-ag-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  id="email"
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
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ag-outline hover:text-ag-body focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Peek password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`btn-primary w-full text-base mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading
                ? 'Signing in…'
                : isAdminRoute
                  ? 'Access Admin Portal →'
                  : 'Login to ShambaPoint →'}
            </button>

            {!isAdminRoute && (
              <p className="text-center text-sm text-ag-muted">
                Don't have an account?{' '}
                <Link to="/signup" className="btn-tertiary !text-sm">Create Account</Link>
              </p>
            )}

            {!isAdminRoute ? (
              <p className="text-center text-xs text-ag-muted border-t border-ag-border pt-4">
                Are you an administrator?{' '}
                <Link to="/admin/login" className="text-ag-primary font-bold hover:underline">
                  Go to Admin Portal →
                </Link>
              </p>
            ) : (
              <p className="text-center text-xs text-ag-muted border-t border-ag-border pt-4">
                Not an administrator?{' '}
                <Link to="/login" className="text-ag-primary font-bold hover:underline">
                  User Login →
                </Link>
              </p>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
