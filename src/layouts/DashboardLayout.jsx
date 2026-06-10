import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, ListOrdered, ShoppingBag,
  CreditCard, Settings, LogOut, Store, Truck,
  Package, ShieldCheck, Users, Bell
} from 'lucide-react';

const NAV_BY_ROLE = {
  farmer: [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/farmer/dashboard' },
    { icon: ListOrdered,     label: 'My Listings',  path: '/farmer/listings' },
    { icon: ShoppingBag,     label: 'Orders',        path: '/farmer/orders' },
    { icon: CreditCard,      label: 'Payments',      path: '/farmer/payments' },
    { icon: Settings,        label: 'Settings',      path: '/farmer/settings' },
  ],
  buyer: [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/buyer/dashboard' },
    { icon: Store,           label: 'Browse Market', path: '/market' },
    { icon: ShoppingBag,     label: 'My Orders',     path: '/buyer/orders' },
    { icon: Truck,           label: 'Deliveries',    path: '/buyer/deliveries' },
    { icon: Settings,        label: 'Settings',      path: '/buyer/settings' },
  ],
  logistics: [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/logistics/dashboard' },
    { icon: Truck,           label: 'My Trips',      path: '/logistics/trips' },
    { icon: Package,         label: 'Deliveries',    path: '/logistics/deliveries' },
    { icon: CreditCard,      label: 'Earnings',      path: '/logistics/earnings' },
    { icon: Settings,        label: 'Settings',      path: '/logistics/settings' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/admin/dashboard' },
    { icon: Users,           label: 'Users',         path: '/admin/users' },
    { icon: ListOrdered,     label: 'Listings',      path: '/admin/listings' },
    { icon: ShoppingBag,     label: 'Orders',        path: '/admin/orders' },
    { icon: ShieldCheck,     label: 'Moderation',    path: '/admin/moderation' },
    { icon: Settings,        label: 'Settings',      path: '/admin/settings' },
  ],
};

const ROLE_LABEL = { farmer: 'Farmer Portal', buyer: 'Buyer Portal', logistics: 'Logistics Portal', admin: 'Admin Panel' };

const DashboardLayout = ({ role = 'farmer' }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const navItems  = NAV_BY_ROLE[role] || NAV_BY_ROLE.farmer;

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const userName = storedUser.name || 'James Mwangi';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ag-canvas flex">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-sidebar min-h-screen bg-ag-primary flex flex-col shrink-0 sticky top-0 self-start h-screen overflow-y-auto">
        {/* Logo + role */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl mb-1">
            <Leaf className="w-5 h-5 text-ag-primary-fixed" />
            AgriTech
          </Link>
          <p className="text-ag-primary-fixed text-xs font-bold">{ROLE_LABEL[role]}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-btn font-bold text-sm transition-colors ${
                  isActive
                    ? 'bg-ag-amber text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-btn font-bold text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-ag-border px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-headline-md text-ag-body">
              Good morning, {userName} 👋
            </h1>
            <p className="text-label-sm text-ag-muted">
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-ag-muted hover:text-ag-body transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            {role === 'farmer' && (
              <Link to="/farmer/listings/new" className="btn-primary !min-h-0 !py-3 !text-sm">
                + Add New Listing
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
