import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  if (!token || !storedUser) {
    // Unauthenticated -> Redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    // Authenticated but wrong role -> Redirect to their respective dashboard
    const roleRedirects = {
      farmer: '/farmer/dashboard',
      buyer: '/buyer/dashboard',
      logistics: '/logistics/dashboard',
      admin: '/admin/dashboard',
    };
    const target = roleRedirects[storedUser.role] || '/';
    return <Navigate to={target} replace />;
  }

  // Permitted -> Render children
  return <Outlet />;
};

export default ProtectedRoute;
