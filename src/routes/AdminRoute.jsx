import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    // Unauthenticated -> Redirect to admin login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    // Authenticated but not Admin -> Redirect to Unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Permitted -> Render children
  return <Outlet />;
};

export default AdminRoute;
