import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, Store, Package, ShoppingBag, Shield, Wallet,
  CreditCard, Truck, Archive, Phone, MessageSquare, CloudSun,
  BarChart2, FileText, Bell, Star, Settings, User,
  ShieldCheck, HelpCircle, LogOut, Menu, ChevronRight, Sun, Moon,
  X
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
    { section: 'Account' },
    { icon: FileText,        label: 'Reports',           path: '/farmer/reports' },
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
    { icon: CreditCard,      label: 'Payments',          path: '/buyer/payments' },
    { section: 'Operations' },
    { icon: Truck,           label: 'Transport',         path: '/buyer/transport' },
    { icon: Phone,           label: 'Call Farmers',      path: '/call-farmers' },
    { icon: MessageSquare,   label: 'Messages',          path: '/buyer/messages' },
    { section: 'Intelligence' },
    { icon: CloudSun,        label: 'Weather',           path: '/buyer/weather' },
    { section: 'Account' },
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
    { icon: BarChart2,       label: 'Analytics',         path: '/admin/analytics' },
    { section: 'Compliance' },
    { icon: FileText,        label: 'Reports',           path: '/admin/reports' },
    { icon: ShieldCheck,     label: 'Moderation',        path: '/admin/moderation' },
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

/* ── NOTIF BELL DROPDOWN & DRAWER ─────────────────────────── */
const QUICK_NOTIFS = [
  { id: 1, type: 'payment',  title: 'Payment Released',      msg: 'KSh 82,000 from Naivas Ltd released.',                  time: '10m',  read: false, dot: '#059669' },
  { id: 2, type: 'order',    title: 'New Order Received',    msg: 'Janet Wanjiku — 200kg Red Onions.',                     time: '25m',  read: false, dot: '#7c3aed' },
  { id: 3, type: 'dispute',  title: 'Dispute Filed',         msg: 'David Ochieng — ORD-2471 funds locked.',                time: '32m',  read: false, dot: '#dc2626' },
  { id: 4, type: 'storage',  title: 'Storage Alert',         msg: 'Tomatoes: HIGH moisture risk in Cold Room B.',           time: '1h',   read: true,  dot: '#d97706' },
  { id: 5, type: 'delivery', title: 'Shipment Dispatched',   msg: 'Maize 50 bags — ETA Today 14:30.',                      time: '2h',   read: true,  dot: '#0284c7' },
];

const NotifBell = ({ onClick, unread }) => {
  return (
    <button
      id="notif-bell-btn"
      onClick={onClick}
      className="relative p-2 rounded-btn text-ag-muted hover:text-ag-body hover:bg-ag-surface dark:hover:bg-dark-surface transition-all"
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full
          text-white text-[9px] font-black flex items-center justify-center px-0.5
          border-2 border-white shadow-sm animate-pulse">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
};

const NotifDrawer = ({ isOpen, onClose, notifs, setNotifs }) => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const unread = notifs.filter(n => !n.read).length;

  const markRead  = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss   = (id) => setNotifs(ns => ns.filter(n => n.id !== id));
  const markAll   = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const clearAll  = () => setNotifs([]);

  const filteredNotifs = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type === 'dispute' || n.type === 'storage';
    if (filter === 'payments') return n.type === 'payment';
    return true;
  });

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div 
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-dark-card border-l border-ag-border dark:border-dark-border shadow-2xl z-50 flex flex-col animate-slide-left"
        style={{
          boxShadow: '-10px 0 40px rgba(0,0,0,0.15)'
        }}
      >
        <div className="p-4 border-b border-ag-border dark:border-dark-border bg-gradient-to-r from-ag-primary to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide">Notifications</h2>
              <p className="text-[10px] text-emerald-200">{unread} unread notifications</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-ag-canvas dark:bg-dark-canvas border-b border-ag-border dark:border-dark-border flex items-center justify-between text-xs shrink-0">
          <span className="font-bold text-ag-muted">
            Actions
          </span>
          <div className="flex gap-3">
            {unread > 0 && (
              <button 
                onClick={markAll}
                className="text-ag-primary dark:text-emerald-400 font-extrabold hover:underline"
              >
                Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-red-500 font-extrabold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-ag-border dark:border-dark-border p-2 gap-1 overflow-x-auto bg-white dark:bg-dark-card shrink-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'payments', label: 'Payments' },
            { id: 'alerts', label: 'Alerts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setExpandedId(null); }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${
                filter === tab.id
                  ? 'bg-ag-primary text-white shadow-sm'
                  : 'bg-ag-surface dark:bg-dark-surface text-ag-muted hover:text-ag-body hover:bg-ag-border dark:hover:bg-dark-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-ag-border dark:divide-dark-border bg-ag-canvas/40 dark:bg-dark-canvas/20">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <Bell className="w-12 h-12 text-ag-muted/30 animate-pulse" />
              <p className="text-sm font-bold text-ag-muted">All quiet here</p>
              <p className="text-xs text-ag-muted max-w-[200px] leading-relaxed mx-auto">No notifications found in this category.</p>
            </div>
          ) : (
            filteredNotifs.map(n => {
              const isExpanded = expandedId === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    setExpandedId(isExpanded ? null : n.id);
                  }}
                  className={`p-4 transition-all duration-200 cursor-pointer flex flex-col gap-2 relative ${
                    !n.read 
                      ? 'bg-emerald-50/10 dark:bg-emerald-950/5 border-l-4 border-l-ag-primary' 
                      : 'hover:bg-white dark:hover:bg-dark-card/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs"
                      style={{ background: `${n.dot}15`, color: n.dot }}
                    >
                      {n.type.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-xs font-bold leading-tight truncate ${n.read ? 'text-ag-body dark:text-gray-200' : 'text-ag-primary dark:text-emerald-400'}`}>
                          {n.title}
                        </p>
                        <span className="text-[9px] text-ag-muted shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-ag-muted mt-1 leading-relaxed line-clamp-2">
                        {n.msg}
                      </p>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                      className="p-1 rounded text-ag-muted hover:text-red-500 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pl-12 pr-4 py-2 border-t border-dashed border-ag-border dark:border-dark-border text-[11px] text-ag-muted flex flex-col gap-2 animate-fade-in">
                      <p className="leading-relaxed">
                        This is an automated operational alert generated on behalf of ShambaPoint. Details: <span className="font-bold text-ag-body dark:text-gray-200">{n.msg}</span>
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button className="px-3 py-1 bg-ag-primary text-white font-bold rounded hover:bg-ag-primary/80 transition-colors">
                          Take Action
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                          className="px-3 py-1 border border-ag-border dark:border-dark-border font-bold rounded hover:bg-ag-surface transition-colors"
                        >
                          Archive Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-ag-border dark:border-dark-border bg-ag-canvas dark:bg-dark-canvas text-center text-[10px] text-ag-muted font-bold flex flex-col gap-2 shrink-0">
          <span>ShambaPoint Notification Engine v1.2</span>
          <div className="flex justify-center gap-4 text-ag-primary dark:text-emerald-400">
            <button onClick={() => setNotifs(QUICK_NOTIFS)} className="hover:underline">Reset Demo Data</button>
            <span>•</span>
            <button className="hover:underline">Settings</button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── COMPONENT ─────────────────────────────────────────── */
const DashboardLayout = ({ role = 'farmer' }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [darkMode, setDarkMode]         = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifs, setNotifs]             = useState(QUICK_NOTIFS);


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

  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      const t = setTimeout(() => setMobileSidebar(false), 0);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };



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
      dashboard:    `Good morning, ${userName}`,
      listings:     'My Products & Listings',
      orders:       'Orders Management',
      payments:     'Payments & Wallet',
      securepay:    'Smart SecurePay Escrow',
      storage:      'Smart Produce Storage',
      transport:    'Logistics & Transport',
      messages:     'Messages',
      weather:      'Weather Forecast',
      analytics:    'Analytics & Reports',
      reports:      'Reports',
      reviews:      'Reviews',
      settings:     'Settings',
      profile:      'Profile',
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

            {/* Notifications dropdown */}
            <NotifBell onClick={() => setNotifOpen(true)} unread={notifs.filter(n => !n.read).length} />

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
          ShambaPoint AgriTech © 2026 · Empowering Kenyan Farmers
        </footer>
      </div>

      {/* Notifications Drawer */}
      <NotifDrawer 
        isOpen={notifOpen} 
        onClose={() => setNotifOpen(false)} 
        notifs={notifs} 
        setNotifs={setNotifs} 
      />
    </div>
  );
};

export default DashboardLayout;
