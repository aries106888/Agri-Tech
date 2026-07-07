import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();

  const handleGoBack = () => {
    if (role && ROLE_REDIRECTS[role]) {
      navigate(ROLE_REDIRECTS[role], { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex items-center justify-center p-4">
      <div className="bg-white border border-ag-border rounded-card p-8 max-w-md w-full text-center shadow-lg flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ag-body mb-2">Access Denied</h1>
          <p className="text-sm text-ag-muted leading-relaxed">
            You do not have the required permissions to access this page. Your account is registered under a different role.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleGoBack}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go to My Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out & Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
