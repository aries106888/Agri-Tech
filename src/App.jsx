import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import TopNavLayout    from './layouts/TopNavLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing          from './pages/Landing';
import Login            from './pages/Login';
import Signup           from './pages/Signup';
import Market           from './pages/Market';
import FarmerDashboard  from './pages/FarmerDashboard';
import BuyerDashboard   from './pages/BuyerDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import AdminDashboard   from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public pages with Top Nav ── */}
        <Route element={<TopNavLayout />}>
          <Route index         element={<Landing />} />
          <Route path="login"  element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="market" element={<Market />} />
        </Route>

        {/* ── Farmer dashboard with Left Sidebar ── */}
        <Route path="farmer" element={<DashboardLayout role="farmer" />}>
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="listings" element={<FarmerDashboard />} />
          <Route path="orders" element={<FarmerDashboard />} />
          <Route path="payments" element={<FarmerDashboard />} />
          <Route path="settings" element={<FarmerDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Buyer dashboard with Left Sidebar ── */}
        <Route path="buyer" element={<DashboardLayout role="buyer" />}>
          <Route path="dashboard" element={<BuyerDashboard />} />
          <Route path="orders" element={<BuyerDashboard />} />
          <Route path="deliveries" element={<BuyerDashboard />} />
          <Route path="settings" element={<BuyerDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Logistics dashboard with Left Sidebar ── */}
        <Route path="logistics" element={<DashboardLayout role="logistics" />}>
          <Route path="dashboard" element={<LogisticsDashboard />} />
          <Route path="trips" element={<LogisticsDashboard />} />
          <Route path="deliveries" element={<LogisticsDashboard />} />
          <Route path="earnings" element={<LogisticsDashboard />} />
          <Route path="settings" element={<LogisticsDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Admin dashboard with Left Sidebar ── */}
        <Route path="admin" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="listings" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminDashboard />} />
          <Route path="moderation" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
