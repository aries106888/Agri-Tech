import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopNavLayout    from './layouts/TopNavLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute  from './routes/ProtectedRoute';
import { useAuth }     from './contexts/AuthContext';

/* ── Lazy-loaded pages ─────────────────────────────────── */
const Landing            = lazy(() => import('./pages/landing/Landing'));
const Login              = lazy(() => import('./pages/auth/Login'));
const Signup             = lazy(() => import('./pages/auth/Signup'));
const Market             = lazy(() => import('./pages/market/Market'));
const FarmerDashboard    = lazy(() => import('./pages/farmer/Dashboard'));
const BuyerDashboard     = lazy(() => import('./pages/buyer/Dashboard'));
const LogisticsDashboard = lazy(() => import('./pages/logistics/Dashboard'));
const AdminDashboard     = lazy(() => import('./pages/admin/Dashboard'));
// New pages
const SmartSecurePay     = lazy(() => import('./pages/shared/SmartSecurePay'));
const SmartStorage       = lazy(() => import('./pages/shared/SmartStorage'));
const MessagesPage       = lazy(() => import('./pages/shared/MessagesPage'));
const WeatherPage        = lazy(() => import('./pages/shared/WeatherPage'));
const TransportPage      = lazy(() => import('./pages/shared/TransportPage'));
const CallFarmers        = lazy(() => import('./pages/shared/CallFarmers'));
const AnalyticsPage      = lazy(() => import('./pages/admin/Analytics'));
const ReviewsPage        = lazy(() => import('./pages/shared/ReviewsPage'));
const HelpCenter         = lazy(() => import('./pages/shared/HelpCenter'));
const FarmerLogin        = lazy(() => import('./pages/auth/FarmerLogin'));
const Unauthorized       = lazy(() => import('./pages/shared/Unauthorized'));

/* ── Full-screen loader ────────────────────────────────── */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-ag-canvas">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-ag-primary border-t-transparent rounded-full
        animate-spin mx-auto mb-3" />
      <p className="text-ag-primary font-bold text-sm">Loading…</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ── Helper: route groups ──────────────────────────────── */
const dashRoutes = (role, DashComp) => {
  const base = `/${role}`;
  return (
    <Route path={role} element={<DashboardLayout role={role} />}>
      <Route path="dashboard"    element={<DashComp />} />
      <Route path="listings"     element={<DashComp />} />
      <Route path="orders"       element={<DashComp />} />
      <Route path="payments"     element={<DashComp />} />
      <Route path="settings"     element={<DashComp />} />
      <Route path="wallet"       element={<DashComp />} />
      <Route path="profile"      element={<DashComp />} />
      <Route path="reports"      element={<DashComp />} />
      <Route path="deliveries"   element={<DashComp />} />
      <Route path="trips"        element={<DashComp />} />
      <Route path="earnings"     element={<DashComp />} />
      {/* Shared feature routes */}
      <Route path="securepay"    element={<SmartSecurePay />} />
      <Route path="storage"      element={<SmartStorage />} />
      <Route path="messages"     element={<MessagesPage />} />
      <Route path="weather"      element={<WeatherPage />} />
      <Route path="transport"    element={<TransportPage />} />
      <Route path="reviews"      element={<ReviewsPage />} />
      <Route path="help"         element={<HelpCenter />} />
      <Route path="*"            element={<Navigate to={`${base}/dashboard`} replace />} />
    </Route>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public / top-nav ── */}
          <Route element={<TopNavLayout />}>
            <Route index         element={<Landing />} />
            <Route path="login"  element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="market" element={<Market />} />
            <Route path="call-farmers" element={<CallFarmers />} />
            <Route path="farmer/login" element={<FarmerLogin />} />
            <Route path="admin/login"  element={<Login />} />
          </Route>

          {/* ── Farmer ── */}
          <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
            {dashRoutes('farmer', FarmerDashboard)}
          </Route>

          {/* ── Buyer ── */}
          <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
            {dashRoutes('buyer', BuyerDashboard)}
          </Route>

          {/* ── Logistics ── */}
          <Route element={<ProtectedRoute allowedRoles={['logistics']} />}>
            {dashRoutes('logistics', LogisticsDashboard)}
          </Route>

          {/* ── Admin ── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="admin" element={<DashboardLayout role="admin" />}>
              <Route path="dashboard"    element={<AdminDashboard />} />
              <Route path="users"        element={<AdminDashboard />} />
              <Route path="listings"     element={<AdminDashboard />} />
              <Route path="orders"       element={<AdminDashboard />} />
              <Route path="moderation"   element={<AdminDashboard />} />
              <Route path="settings"     element={<AdminDashboard />} />
              <Route path="panel"        element={<AdminDashboard />} />
              <Route path="securepay"    element={<SmartSecurePay />} />
              <Route path="storage"      element={<SmartStorage />} />
              <Route path="transport"    element={<TransportPage />} />
              <Route path="analytics"    element={<AnalyticsPage />} />
              <Route path="reviews"      element={<AdminDashboard />} />
              <Route path="reports"      element={<AnalyticsPage />} />
              <Route path="*"            element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="unauthorized" element={<Unauthorized />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
