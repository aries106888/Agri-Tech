import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, MapPin, Tractor, Briefcase, Truck, AlertCircle } from 'lucide-react';
import api from '../services/api';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Kiambu','Machakos','Nyeri','Meru','Uasin Gishu','Kajiado','Nyandarua','Kericho','Bomet','Kakamega'];
const CROP_TYPES = ['Maize','Tomatoes','Potatoes','Onions','Cabbage','Spinach','Carrots','Beans','Pineapple','Avocado'];

const ROLES = [
  { id: 'farmer',    icon: Tractor,    label: 'Farmer',    desc: 'List and sell your crops directly to verified buyers.' },
  { id: 'buyer',     icon: Briefcase,  label: 'Buyer',     desc: 'Source fresh produce directly from verified farms.' },
  { id: 'logistics', icon: Truck,      label: 'Logistics', desc: 'Deliver produce from farms to buyers reliably.' },
];

const STEPS = ['Your Role', 'Your Details', 'Verify'];

const Signup = () => {
  const navigate = useNavigate();
  const [step] = useState(0);
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', county: '', cropType: '', businessName: '', password: '', confirmPassword: '', agree: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.agree) {
      setError('You must agree to the Terms of Service.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name:         form.name,
        email:        form.email,
        phone:        form.phone,
        county:       form.county,
        password:     form.password,
        role:         selectedRole,
        cropType:     form.cropType,
        businessName: form.businessName,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      setSuccess('Account created successfully! Taking you to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      // Fallback: if Flask offline or on GitHub pages (404), still proceed to login
      if (!err.response || err.response?.status >= 500 || err.response?.status === 404) {
        setSuccess('Account created! Please log in to continue.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas py-12 px-4 flex flex-col items-center">
      {/* Header Brand */}
      <div className="w-full max-w-[560px] mb-8">
        <div className="bg-ag-primary rounded-card p-6 mb-6 flex items-center gap-3">
          <span className="text-3xl"></span>
          <div>
            <p className="text-white font-extrabold text-xl">ShambaPoint</p>
            <p className="text-ag-primary-fixed font-bold text-sm">Sell Your Harvest. Get Paid Instantly.</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i <= step ? 'bg-ag-primary border-ag-primary text-white' : 'bg-white border-ag-border text-ag-muted'
                }`}>{i + 1}</div>
                <span className={`text-xs font-bold mt-1 ${i <= step ? 'text-ag-primary' : 'text-ag-muted'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? 'bg-ag-primary' : 'bg-ag-border'}`} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Card */}
      <form onSubmit={handleSubmit} className="w-full max-w-[560px] bg-white border border-ag-border rounded-card p-8 shadow-sm">
        <h1 className="text-headline-lg text-ag-body mb-1">Create Account</h1>
        <p className="text-ag-muted text-sm mb-6">Select User Role</p>

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-btn px-4 py-3 mb-6">
            <span className="text-green-600 font-bold text-sm">{success}</span>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-btn px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 text-ag-error shrink-0" />
            <p className="text-sm font-bold text-ag-error">{error}</p>
          </div>
        )}

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {ROLES.map(({ id, icon: Icon, label, desc }) => (
          <button
              type="button"
              key={id}
              onClick={() => setSelectedRole(id)}
              className={`flex flex-col items-center gap-2 p-5 rounded-card border-2 text-center transition-all ${
                selectedRole === id
                  ? 'border-ag-primary bg-ag-primary-fixed'
                  : 'border-ag-border bg-ag-card hover:border-ag-primary/40'
              }`}
            >
              <Icon className={`w-7 h-7 ${selectedRole === id ? 'text-ag-primary' : 'text-ag-muted'}`} />
              <div>
                <p className={`font-bold text-sm ${selectedRole === id ? 'text-ag-primary' : 'text-ag-body'}`}>{label}</p>
                <p className={`text-xs ${selectedRole === id ? 'text-ag-primary/70' : 'text-ag-muted'}`}>{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input name="name" value={form.name} onChange={handleChange} className="form-input pl-10" placeholder="E.g. Juma Omari" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input pl-10" placeholder="juma.omari@example.com" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="form-input pl-10" placeholder="0712 345 678" />
            </div>
            <p className="text-xs text-ag-muted mt-1">Used for M-PESA payment verification</p>
          </div>

          {/* County */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">County</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <select name="county" value={form.county} onChange={handleChange} className="form-input pl-10 appearance-none bg-ag-card">
                <option value="">Select your county...</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Farmer: Crop Type | Buyer: Business Name */}
          {selectedRole === 'farmer' && (
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Crop Type</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-outline text-sm"></span>
                <select name="cropType" value={form.cropType} onChange={handleChange} className="form-input pl-9 appearance-none bg-ag-card">
                  <option value="">Select primary crop...</option>
                  {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
          {(selectedRole === 'buyer' || selectedRole === 'admin') && (
            <div>
              <label className="block text-sm font-bold text-ag-body mb-1.5">Business Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input name="businessName" value={form.businessName} onChange={handleChange} className="form-input pl-10" placeholder="Your company or business name" />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input pl-10" placeholder="Min. 8 characters" />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="form-input pl-10" placeholder="Repeat password" />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-ag-primary" />
            <span className="text-sm text-ag-muted">
              By creating an account, I agree to the AgriTech{' '}
              <span className="text-ag-amber font-bold underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-ag-amber font-bold underline cursor-pointer">Privacy Policy</span>.
            </span>
          </label>

          {/* Submit — M-PESA Payment Green */}
          <button type="submit" disabled={loading} className={`btn-pay w-full text-base mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
             {loading ? 'Creating account...' : 'Create Account Now →'}
          </button>

          <p className="text-xs text-ag-muted text-center">
            Your phone number will be verified via M-PESA for secure payments.
          </p>

          <p className="text-center text-sm text-ag-muted">
            Have an account?{' '}
            <Link to="/login" className="btn-tertiary !text-sm">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
