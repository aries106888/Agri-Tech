import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, isTokenExpired } from '../contexts/AuthContext';

/**
 * ProtectedRoute — guards routes requiring authentication.
 *
 * Waits for AuthContext to finish verifying the stored session token
 * before making any redirect decision. This prevents a flash-to-login
 * for users who ARE authenticated but whose session hasn't been confirmed yet.
 */

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8faf8'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 40, height: 40,
        border: '4px solid #2d6a4f',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 12px'
      }} />
      <p style={{ color: '#2d6a4f', fontWeight: 700, fontSize: 14 }}>Verifying session…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // While session verification is in progress, show a spinner.
  // This prevents a premature redirect to /login for authenticated users.
  if (loading) {
    return <PageLoader />;
  }

  const token = localStorage.getItem('spToken');
  const tokenValid = token && !isTokenExpired(token);

  if (!user || !tokenValid) {
    // Unauthenticated → redirect to correct login page, preserving path
    const isTryingAdmin = allowedRoles && allowedRoles.includes('admin');
    const redirectTarget = isTryingAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Authenticated but wrong role → redirect to Unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Permitted → Render children
  return <Outlet />;
};

export default ProtectedRoute;
