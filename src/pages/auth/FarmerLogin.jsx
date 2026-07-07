import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Leaf, CheckCircle, Tractor, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * FarmerLogin — dedicated login portal for farmers.
 * Auth via Flask POST /api/auth/login with role='farmer'.
 * If the returned user.role is not 'farmer', the session is cleared
 * and an inline error is shown — no navigation occurs.
 */
const FarmerLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, user, role } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Reactive redirect once AuthContext has a farmer session
  useEffect(() => {
    if (user && role) {
      if (role !== 'farmer') {
        navigate('/unauthorized', { replace: true });
        return;
      }
      navigate('/farmer/dashboard', { replace: true });
    }
  }, [user, role, navigate]);

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

    setLoading(true);
    try {
      const { data, error: signInError } = await signIn({
        email:    form.email,
        password: form.password,
        role:     'farmer', // hardcoded — this portal is farmer-only
      });

      if (signInError) {
        setError(signInError.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Validate the server confirmed farmer role
      if (data?.user?.role !== 'farmer') {
        signOut();
        setError('This portal is for farmers only. Please use the correct login page for your role.');
        return;
      }

      setSuccess('Welcome back! Redirecting to your Farmer Portal…');
      // Navigation handled by the useEffect above
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[480px]">

        {/* Brand Header */}
        <div className="bg-ag-primary rounded-card p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tractor className="w-8 h-8 text-ag-primary-fixed" />
            <div>
              <p className="text-white font-extrabold text-xl">Farmer Portal</p>
              <p className="text-ag-primary-fixed text-xs font-bold">ShambaPoint for Kenyan Growers</p>
            </div>
          </div>
          <Leaf className="w-6 h-6 text-white/20" />
        </div>

        {/* Card */}
        <div className="bg-white border border-ag-border rounded-card p-8 shadow-sm">
          <h1 className="text-headline-lg text-ag-body mb-1">Grower Sign In</h1>
          <p className="text-ag-muted text-sm mb-8">Access your products, orders, and earnings</p>

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-btn px-4 py-3 mb-6">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-btn px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-ag-error shrink-0" />
              <p className="text-sm font-bold text-ag-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  id="farmer-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="grower@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  id="farmer-password"
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

            <button
              id="farmer-login-submit-btn"
              type="submit"
              disabled={loading}
              className={`btn-primary w-full text-base mt-2 flex items-center justify-center gap-2
                ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verifying Grower Account…' : (
                <>Access Farmer Dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="flex items-center justify-between border-t border-ag-border pt-4 mt-2">
              <Link to="/login" className="text-xs font-bold text-ag-muted hover:text-ag-primary">
                Not a Farmer? Go to Main Login
              </Link>
              <Link to="/signup" className="text-xs font-bold text-ag-amber hover:underline">
                Create Farmer Account
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default FarmerLogin;
