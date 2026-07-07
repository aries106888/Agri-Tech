import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    // Unauthenticated -> Redirect to correct login page, preserving path
    const isTryingAdmin = allowedRoles && allowedRoles.includes('admin');
    const redirectTarget = isTryingAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Authenticated but wrong role -> Redirect to Unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Permitted -> Render children
  return <Outlet />;
};

export default ProtectedRoute;
