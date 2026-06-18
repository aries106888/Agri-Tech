import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, Store, Package, ShoppingBag, Shield, Wallet,
  CreditCard, Truck, Archive, Phone, MessageSquare, CloudSun, Bot,
  BarChart2, FileText, AlertTriangle, Bell, Star, Settings, User,
  ShieldCheck, HelpCircle, LogOut, Menu, ChevronRight, Sun, Moon
} from 'lucide-react';

/* ── NAV STRUCTURE ─────────────────────────────────────── */
const ALL_NAV = {
  farmer: [
    { section: 'Main' },
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/farmer/dashboard' },
    { icon: Store,           label: 'Marketplace',      path: '/market' },
    { icon: Package,         label: 'My Products',      path: '/farmer/listings' },
    { icon: ShoppingBag,     label: 'Orders',            path: '/farmer/orders' },
    { section: 'Finance' },
    { icon: Shield,          label: 'Smart SecurePay',  path: '/farmer/securepay' },
    { icon: Wallet,          label: 'Wallet',            path: '/farmer/payments' },
    { section: 'Operations' },
    { icon: Truck,           label: 'Transport',         path: '/farmer/transport' },
    { icon: Archive,         label: 'Storage',           path: '/farmer/storage' },
    { icon: Phone,           label: 'Call Farmers',      path: '/call-farmers' },
    { icon: MessageSquare,   label: 'Messages',          path: '/farmer/messages' },
    { section: 'Intelligence' },
    { icon: CloudSun,        label: 'Weather',           path: '/farmer/weather' },
    { icon: Bot,             label: 'AI Crop Assistant', path: '/farmer/ai-assistant' },
    { icon: BarChart2,       label: 'Analytics',         path: '/farmer/analytics' },
    { section: 'Account' },
    { icon: FileText,        label: 'Reports',           path: '/farmer/reports' },
    { icon: AlertTriangle,   label: 'Disputes',          path: '/farmer/disputes' },
    { icon: Bell,            label: 'Notifications',     path: '/farmer/notifications', badge: 3 },
    { icon: Star,            label: 'Reviews',           path: '/farmer/reviews' },
    { icon: Settings,        label: 'Settings',          path: '/farmer/settings' },
    { icon: User,            label: 'Profile',           path: '/farmer/profile' },
    { icon: HelpCircle,      label: 'Help Center',       path: '/help' },
  ],
  buyer: [
    { section: 'Main' },
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/buyer/dashboard' },
    { icon: Store,           label: 'Marketplace',      path: '/market' },
    { icon: ShoppingBag,     label: 'My Orders',        path: '/buyer/orders' },
    { section: 'Finance' },
    { icon: Shield,          label: 'Smart SecurePay',  path: '/buyer/securepay' },
    { icon: Wallet,          label: 'Wallet',            path: '/buyer/wallet' },
    { icon: CreditCard,      label: 'Payments',          path: '/buyer/payments' },
    { section: 'Operations' },
    { icon: Truck,           label: 'Transport',         path: '/buyer/transport' },
    { icon: Phone,           label: 'Call Farmers',      path: '/call-farmers' },
    { icon: MessageSquare,   label: 'Messages',          path: '/buyer/messages' },
    { section: 'Intelligence' },
    { icon: CloudSun,        label: 'Weather',           path: '/buyer/weather' },
    { icon: Bot,             label: 'AI Crop Assistant', path: '/buyer/ai-assistant' },
    { icon: BarChart2,       label: 'Analytics',         path: '/buyer/analytics' },
    { section: 'Account' },
    { icon: AlertTriangle,   label: 'Disputes',          path: '/buyer/disputes' },
    { icon: Bell,            label: 'Notifications',     path: '/buyer/notifications', badge: 2 },
    { icon: Star,            label: 'Reviews',           path: '/buyer/reviews' },
    { icon: Settings,        label: 'Settings',          path: '/buyer/settings' },
    { icon: User,            label: 'Profile',           path: '/buyer/profile' },
    { icon: HelpCircle,      label: 'Help Center',       path: '/help' },
  ],
  logistics: [
    { section: 'Main' },
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/logistics/dashboard' },
    { icon: Truck,           label: 'My Trips',          path: '/logistics/trips' },
    { icon: Package,         label: 'Deliveries',        path: '/logistics/deliveries' },
    { section: 'Finance' },
    { icon: CreditCard,      label: 'Earnings',          path: '/logistics/earnings' },
    { icon: Wallet,          label: 'Wallet',            path: '/logistics/wallet' },
    { section: 'Account' },
    { icon: Bell,            label: 'Notifications',     path: '/logistics/notifications', badge: 1 },
    { icon: Settings,        label: 'Settings',          path: '/logistics/settings' },
    { icon: User,            label: 'Profile',           path: '/logistics/profile' },
    { icon: HelpCircle,      label: 'Help Center',       path: '/help' },
  ],
  admin: [
    { section: 'Main' },
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/admin/dashboard' },
    { icon: Store,           label: 'Marketplace',      path: '/market' },
    { section: 'Management' },
    { icon: User,            label: 'Users',             path: '/admin/users' },
    { icon: Package,         label: 'Listings',          path: '/admin/listings' },
    { icon: ShoppingBag,     label: 'Orders',            path: '/admin/orders' },
    { icon: Shield,          label: 'Smart SecurePay',  path: '/admin/securepay' },
    { section: 'Operations' },
    { icon: Truck,           label: 'Transport',         path: '/admin/transport' },
    { icon: Archive,         label: 'Storage',           path: '/admin/storage' },
    { section: 'Intelligence' },
    { icon: Bot,             label: 'AI Assistant',      path: '/admin/ai-assistant' },
    { icon: BarChart2,       label: 'Analytics',         path: '/admin/analytics' },
    { section: 'Compliance' },
    { icon: FileText,        label: 'Reports',           path: '/admin/reports' },
    { icon: AlertTriangle,   label: 'Disputes',          path: '/admin/disputes', badge: 4 },
    { icon: ShieldCheck,     label: 'Moderation',        path: '/admin/moderation' },
    { icon: Bell,            label: 'Notifications',     path: '/admin/notifications', badge: 7 },
    { icon: Star,            label: 'Reviews',           path: '/admin/reviews' },
    { icon: Settings,        label: 'Settings',          path: '/admin/settings' },
    { icon: ShieldCheck,     label: 'Admin Panel',       path: '/admin/panel' },
    { icon: HelpCircle,      label: 'Help Center',       path: '/help' },
  ],
};

const ROLE_META = {
  farmer:    { label: 'Farmer Portal',    color: 'text-ag-primary-fixed' },
  buyer:     { label: 'Buyer Portal',     color: 'text-blue-300' },
  logistics: { label: 'Logistics Portal', color: 'text-ag-amber-cont' },
  admin:     { label: 'Admin Panel',      color: 'text-purple-300' },
};

/* ── COMPONENT ─────────────────────────────────────────── */
const DashboardLayout = ({ role = 'farmer' }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [darkMode, setDarkMode]         = useState(false);


  const navItems = ALL_NAV[role] || ALL_NAV.farmer;
  const meta     = ROLE_META[role] || ROLE_META.farmer;

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const userName  = storedUser.name || 'James Mwangi';
  const userInit  = userName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Close mobile sidebar on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileSidebar(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const totalBadge = navItems.filter(n => n.badge).reduce((a, n) => a + (n.badge || 0), 0);

  /* ── SIDEBAR INNER ── */
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-lg">
          <div className="w-8 h-8 rounded-btn bg-ag-amber flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span>ShambaPoint</span>}
        </Link>
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="hidden lg:flex text-white/50 hover:text-white transition-colors p-1"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div className="px-4 py-2 border-b border-white/10">
          <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
            {meta.label}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.section) {
            return sidebarOpen ? (
              <p key={i} className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 pt-4 pb-1">
                {item.section}
              </p>
            ) : <div key={i} className="my-1 border-t border-white/10" />;
          }

          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path) && item.path.length > 3);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn font-semibold text-sm
                transition-all relative group
                ${isActive
                  ? 'bg-ag-amber text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {item.badge && sidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
              {item.badge && !sidebarOpen && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-ag-body text-white text-xs rounded-btn
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 flex flex-col gap-1">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-ag-amber flex items-center justify-center text-white text-xs font-extrabold shrink-0">
              {userInit}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{userName}</p>
              <p className={`text-[10px] capitalize ${meta.color}`}>{role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-btn font-semibold text-sm
            text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  /* ── PAGE TITLES ── */
  const pageTitle = (() => {
    const seg = location.pathname.split('/').filter(Boolean);
    const last = seg[seg.length - 1] || 'dashboard';
    const map = {
      dashboard:    `Good morning, ${userName} 👋`,
      listings:     'My Products & Listings',
      orders:       'Orders Management',
      payments:     'Payments & Wallet',
      securepay:    '🔒 Smart SecurePay Escrow',
      storage:      '🌾 Smart Produce Storage',
      transport:    '🚚 Logistics & Transport',
      messages:     '💬 Messages',
      weather:      '🌤 Weather Forecast',
      'ai-assistant': '🤖 AI Crop Assistant',
      analytics:    '📊 Analytics & Reports',
      reports:      '📋 Reports',
      disputes:     '⚖️ Disputes',
      notifications:'🔔 Notifications',
      reviews:      '⭐ Reviews',
      settings:     '⚙️ Settings',
      profile:      '👤 Profile',
      users:        'User Management',
      moderation:   'Content Moderation',
      panel:        'Admin Control Panel',
      market:       'Marketplace',
    };
    return map[last] || last.charAt(0).toUpperCase() + last.slice(1);
  })();

  return (
    <div className="min-h-screen bg-ag-canvas dark:bg-dark-canvas flex">

      {/* ── MOBILE OVERLAY ── */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-ag-primary
          transition-all duration-300 overflow-hidden
          ${sidebarOpen ? 'w-sidebar' : 'w-sidebar-mini'}`}
      >
        {sidebarContent}
      </aside>

      {/* ── MOBILE SIDEBAR ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-ag-primary z-50 flex flex-col lg:hidden
          transition-transform duration-300
          ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">

        {/* Top Header */}
        <header className="bg-white dark:bg-dark-card border-b border-ag-border dark:border-dark-border
          px-4 lg:px-8 py-3 flex items-center gap-4 sticky top-0 z-40">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebar(v => !v)}
            className="lg:hidden text-ag-muted hover:text-ag-body transition-colors p-1"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-md text-ag-body dark:text-white font-extrabold truncate">
              {pageTitle}
            </h1>
            <p className="text-label-sm text-ag-muted hidden sm:block">{meta.label}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(v => !v)}
              className="p-2 rounded-btn text-ag-muted hover:text-ag-body hover:bg-ag-surface
                dark:hover:bg-dark-surface transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <Link
              to={`/${role}/notifications`}
              className="relative p-2 rounded-btn text-ag-muted hover:text-ag-body
                hover:bg-ag-surface transition-colors"
            >
              <Bell className="w-5 h-5" />
              {totalBadge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full
                  text-white text-[9px] font-bold flex items-center justify-center">
                  {totalBadge > 9 ? '9+' : totalBadge}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-ag-primary flex items-center justify-center
              text-white text-xs font-extrabold cursor-pointer hover:opacity-80 transition-opacity">
              {userInit}
            </div>

            {/* Role CTA */}
            {role === 'farmer' && (
              <Link
                to="/farmer/listings"
                className="hidden sm:flex btn-primary !min-h-0 !py-2.5 !px-4 !text-xs"
              >
                + Add Listing
              </Link>
            )}
            {role === 'buyer' && (
              <Link
                to="/market"
                className="hidden sm:flex btn-primary !min-h-0 !py-2.5 !px-4 !text-xs"
              >
                Browse Market
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-ag-border dark:border-dark-border px-8 py-3
          text-xs text-ag-muted text-center">
          ShambaPoint AgriTech © 2026 · Empowering Kenyan Farmers 🌱
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
