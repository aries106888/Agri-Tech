import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Users, ListOrdered, ShoppingBag, TrendingUp, CheckCircle2, X, Truck,
  Settings, Ban, UserCheck, RefreshCw, AlertTriangle, Star,
  ThumbsUp, Filter, Search, Activity, Eye, BarChart2,
  Award, Frown, Smile, Meh, Flag, CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

/* ── DATA ───────────────────────────────────────────────── */
const INITIAL_LISTINGS = [
  { id: 1, crop: '500kg Maize',    farmer: 'David K.',  county: 'Uasin Gishu', price: 'KSh 25,000' },
  { id: 2, crop: '200kg Tomatoes', farmer: 'Aisha M.',  county: 'Kiambu',      price: 'KSh 16,000' },
  { id: 3, crop: '80 Crates Eggs', farmer: 'Peter O.',  county: 'Nakuru',      price: 'KSh 9,600'  },
];

const MONTHLY_REVENUE = [
  { name: 'Jan', revenue: 420000, orders: 120 },
  { name: 'Feb', revenue: 510000, orders: 155 },
  { name: 'Mar', revenue: 680000, orders: 198 },
  { name: 'Apr', revenue: 850000, orders: 241 },
  { name: 'May', revenue: 1200000, orders: 360 },
  { name: 'Jun', revenue: 1540000, orders: 482 },
];

const CROP_SALES = [
  { name: 'Maize', sales: 45 },
  { name: 'Tomatoes', sales: 25 },
  { name: 'Potatoes', sales: 15 },
  { name: 'Onions', sales: 10 },
  { name: 'Cabbage', sales: 5 },
];

const PIE_DATA = [
  { name: 'Farmers', value: 38, color: '#3d6c38' },
  { name: 'Buyers',  value: 45, color: '#2563eb' },
  { name: 'Logistics', value: 17, color: '#d97706' },
];

const INITIAL_USERS = [
  { id: 1, name: 'Sarah O.',  email: 'sarah.o@gmail.com',  role: 'Buyer',     status: 'active',       county: 'Nairobi' },
  { id: 2, name: 'Juma M.',   email: 'juma.m@gmail.com',   role: 'Farmer',    status: 'pending_kyc',  county: 'Mombasa' },
  { id: 3, name: 'Kevin W.',  email: 'kevin.w@gmail.com',  role: 'Logistics', status: 'active',       county: 'Kisumu'  },
  { id: 4, name: 'Grace A.',  email: 'grace.a@gmail.com',  role: 'Farmer',    status: 'active',       county: 'Nakuru'  },
  { id: 5, name: 'Moses K.',  email: 'moses.k@gmail.com',  role: 'Buyer',     status: 'suspended',    county: 'Eldoret' },
];

const INITIAL_ORDERS = [
  { id: 1, crop: 'Potatoes', buyer: 'Naivas Ltd',  farmer: 'Mwangi J.', amount: 22500, status: 'completed' },
  { id: 2, crop: 'Tomatoes', buyer: 'Janet W.',    farmer: 'Sarah K.',  amount: 8000,  status: 'in_transit' },
  { id: 3, crop: 'Maize',    buyer: 'Quickmart',   farmer: 'David K.',  amount: 16400, status: 'pending'    },
];

const INITIAL_DRIVERS = [
  { id: 1, name: 'David Ochieng', vehicle: 'KCA 123Z (Isuzu FRR)',   status: 'available', trips: 12 },
  { id: 2, name: 'Peter Waweru',  vehicle: 'KBX 456Y (Mitsubishi)',  status: 'on_trip',   trips: 8  },
  { id: 3, name: 'James Kimani',  vehicle: 'KDA 789W (Toyota Dyna)', status: 'available', trips: 19 },
];

/* ── All feedback from all 3 roles ──────────────────────── */
const ALL_REVIEWS = [
  /* Buyer → Farmer reviews */
  {
    id: 1, fromRole: 'Buyer', toRole: 'Farmer',
    reviewer: 'Naivas Supermarket', avatar: 'NS', reviewerCounty: 'Nairobi',
    target: 'James Mwangi', crop: 'Maize 100 bags', rating: 5,
    comment: 'Excellent quality Grade A maize. Timely delivery and very professional. Will order again!',
    date: '2026-06-15', helpful: 12, verified: true, flagged: false,
    sentiment: 'positive', category: 'Quality',
  },
  {
    id: 2, fromRole: 'Buyer', toRole: 'Farmer',
    reviewer: 'Janet Wanjiku', avatar: 'JW', reviewerCounty: 'Kiambu',
    target: 'Mary Akinyi', crop: 'Tomatoes 300kg', rating: 4,
    comment: 'Good produce but 1 day delay on delivery. Overall satisfied with quality.',
    date: '2026-06-14', helpful: 5, verified: true, flagged: false,
    sentiment: 'positive', category: 'Delivery',
  },
  {
    id: 3, fromRole: 'Buyer', toRole: 'Farmer',
    reviewer: 'David Ochieng', avatar: 'DO', reviewerCounty: 'Kisumu',
    target: 'Peter Kibet', crop: 'Beans 50 bags', rating: 5,
    comment: 'Peter is one of the best bean farmers on this platform. Clean, dry, well-bagged.',
    date: '2026-06-13', helpful: 18, verified: true, flagged: false,
    sentiment: 'positive', category: 'Quality',
  },
  {
    id: 4, fromRole: 'Buyer', toRole: 'Farmer',
    reviewer: 'QuickMart Nairobi', avatar: 'QM', reviewerCounty: 'Nairobi',
    target: 'Grace Njoroge', crop: 'Spinach 80kg', rating: 2,
    comment: 'Produce arrived wilted. Temperature was not maintained during transit. Very disappointed.',
    date: '2026-06-12', helpful: 9, verified: true, flagged: true,
    sentiment: 'negative', category: 'Quality',
  },
  /* Farmer → Buyer reviews */
  {
    id: 5, fromRole: 'Farmer', toRole: 'Buyer',
    reviewer: 'James Mwangi', avatar: 'JM', reviewerCounty: 'Uasin Gishu',
    target: 'Quickmart Nairobi', crop: 'Sweet Corn', rating: 4,
    comment: 'Good buyer, payment through SecurePay was smooth. Would sell to them again.',
    date: '2026-06-10', helpful: 7, verified: true, flagged: false,
    sentiment: 'positive', category: 'Payment',
  },
  {
    id: 6, fromRole: 'Farmer', toRole: 'Buyer',
    reviewer: 'Grace Njoroge', avatar: 'GN', reviewerCounty: 'Kiambu',
    target: 'LocalMart Ltd', crop: 'Spinach', rating: 3,
    comment: 'Buyer negotiated well below asking price at last minute. Not ideal for farmers.',
    date: '2026-06-08', helpful: 3, verified: false, flagged: false,
    sentiment: 'neutral', category: 'Negotiation',
  },
  /* Buyer → Logistics reviews */
  {
    id: 7, fromRole: 'Buyer', toRole: 'Logistics',
    reviewer: 'Sarah Otieno', avatar: 'SO', reviewerCounty: 'Nairobi',
    target: 'David Ochieng (Driver)', crop: 'Potatoes 200kg', rating: 5,
    comment: 'David was extremely professional! Real-time tracking was superb. Goods arrived in perfect condition.',
    date: '2026-06-11', helpful: 14, verified: true, flagged: false,
    sentiment: 'positive', category: 'Delivery',
  },
  {
    id: 8, fromRole: 'Buyer', toRole: 'Logistics',
    reviewer: 'Naivas Supermarket', avatar: 'NS', reviewerCounty: 'Nairobi',
    target: 'Peter Waweru (Driver)', crop: 'Maize 100 bags', rating: 3,
    comment: 'Delivery was 4 hours late. No communication about delay. Produce okay but service needs improvement.',
    date: '2026-06-09', helpful: 6, verified: true, flagged: false,
    sentiment: 'neutral', category: 'Timeliness',
  },
  /* Farmer → Logistics reviews */
  {
    id: 9, fromRole: 'Farmer', toRole: 'Logistics',
    reviewer: 'Peter Kibet', avatar: 'PK', reviewerCounty: 'Nakuru',
    target: 'James Kimani (Driver)', crop: 'Beans 50 bags', rating: 5,
    comment: 'James was punctual and handled my produce with great care. Beans arrived in perfect condition!',
    date: '2026-06-07', helpful: 11, verified: true, flagged: false,
    sentiment: 'positive', category: 'Handling',
  },
  {
    id: 10, fromRole: 'Farmer', toRole: 'Logistics',
    reviewer: 'Mary Akinyi', avatar: 'MA', reviewerCounty: 'Mombasa',
    target: 'Peter Waweru (Driver)', crop: 'Tomatoes 300kg', rating: 2,
    comment: 'Driver was careless with loading. Several tomato crates were damaged. Need better training.',
    date: '2026-06-06', helpful: 8, verified: true, flagged: true,
    sentiment: 'negative', category: 'Handling',
  },
  /* Logistics → Platform reviews */
  {
    id: 11, fromRole: 'Logistics', toRole: 'Platform',
    reviewer: 'David Ochieng', avatar: 'DO', reviewerCounty: 'Nairobi',
    target: 'ShambaPoint Platform', crop: 'N/A', rating: 5,
    comment: 'The route optimization AI is amazing! Saves me 2hrs per trip. Earnings are consistent.',
    date: '2026-06-05', helpful: 20, verified: true, flagged: false,
    sentiment: 'positive', category: 'Platform',
  },
  {
    id: 12, fromRole: 'Logistics', toRole: 'Platform',
    reviewer: 'James Kimani', avatar: 'JK', reviewerCounty: 'Kisumu',
    target: 'ShambaPoint Platform', crop: 'N/A', rating: 4,
    comment: 'M-PESA payments are instant. Would love a driver community forum feature.',
    date: '2026-06-04', helpful: 9, verified: true, flagged: false,
    sentiment: 'positive', category: 'Platform',
  },
];

/* ── HELPERS ────────────────────────────────────────────── */
const chipByStatus = (s) => ({
  active: 'chip-verified', pending_kyc: 'chip-pending', completed: 'chip-completed',
  in_transit: 'chip-transit', pending: 'chip-pending', suspended: 'chip-sold-out',
  available: 'chip-verified', on_trip: 'chip-transit',
})[s] || 'chip-pending';

const StarRow = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`${size} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-ag-border'}`} />
    ))}
  </div>
);

const SentimentIcon = ({ s }) => {
  if (s === 'positive') return <Smile className="w-4 h-4 text-ag-pay" />;
  if (s === 'negative') return <Frown className="w-4 h-4 text-red-500" />;
  return <Meh className="w-4 h-4 text-ag-amber" />;
};

const roleColor = (role) => ({
  Buyer: 'bg-blue-100 text-blue-700',
  Farmer: 'bg-green-100 text-green-700',
  Logistics: 'bg-amber-100 text-amber-700',
  Platform: 'bg-purple-100 text-purple-700',
})[role] || 'bg-gray-100 text-gray-700';

/* ── TABS ────────────────────────────────────────────────── */
const TABS = [
  { label: 'Overview',    path: 'dashboard',  icon: BarChart2 },
  { label: 'Listings',    path: 'listings',   icon: ListOrdered },
  { label: 'Users',       path: 'users',      icon: Users },
  { label: 'Orders',      path: 'orders',     icon: ShoppingBag },
  { label: 'Reviews',     path: 'reviews',    icon: Star },
  { label: 'Moderation',  path: 'moderation', icon: Truck },
  { label: 'Settings',    path: 'settings',   icon: Settings },
];

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [listings, setListings]   = useState(INITIAL_LISTINGS);
  const [users, setUsers]         = useState(INITIAL_USERS);
  const [orders, setOrders]       = useState(INITIAL_ORDERS);
  const [drivers, setDrivers]     = useState(INITIAL_DRIVERS);
  const [reviews, setReviews]     = useState(ALL_REVIEWS);
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [toast, setToast]         = useState('');
  const [settings, setSettings]   = useState({ commissionRate: '3', maxListings: '10', maintenanceMode: false });
  const [reviewFilter, setReviewFilter] = useState('All');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRoleFilter, setReviewRoleFilter] = useState('All');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const approveListing = (id) => { setListings(p => p.filter(l => l.id !== id)); showToast('Listing approved and published!'); };
  const rejectListing  = (id) => { setListings(p => p.filter(l => l.id !== id)); showToast('Listing rejected and removed.'); };
  const suspendUser    = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'suspended'} : u)); showToast('User suspended.'); setModal(null); };
  const activateUser   = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'active'} : u)); showToast('User activated successfully!'); setModal(null); };
  const approveKyc     = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'active'} : u)); showToast('KYC approved — user is now active!'); setModal(null); };
  const updateOrderStatus = (id, status) => { setOrders(p => p.map(o => o.id===id ? {...o, status} : o)); showToast(`Order updated to: ${status.replace('_',' ')}`); };
  const flagReview     = (id) => { setReviews(p => p.map(r => r.id===id ? {...r, flagged: !r.flagged} : r)); showToast('Review flag updated.'); };
  const removeReview   = (id) => { setReviews(p => p.filter(r => r.id !== id)); showToast('Review removed from platform.'); };

  const exportCSV = () => {
    const csv = 'Name,Email,Role,Status,County\n' + users.map(u=>`${u.name},${u.email},${u.role},${u.status},${u.county}`).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'users_export.csv'; a.click();
    showToast('Users CSV exported!');
  };

  /* ── Review stats ── */
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  const posCount  = reviews.filter(r => r.sentiment === 'positive').length;
  const negCount  = reviews.filter(r => r.sentiment === 'negative').length;
  const flagCount = reviews.filter(r => r.flagged).length;

  const filteredReviews = reviews.filter(r => {
    const roleMatch = reviewRoleFilter === 'All' || r.fromRole === reviewRoleFilter || r.toRole === reviewRoleFilter;
    const sentMatch = reviewFilter === 'All' || r.sentiment === reviewFilter.toLowerCase() || (reviewFilter === 'Flagged' && r.flagged);
    const q = reviewSearch.toLowerCase();
    const textMatch = !q || r.reviewer.toLowerCase().includes(q) || r.target.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    return roleMatch && sentMatch && textMatch;
  });

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Volume (30d)',
      value: 'KES 4.2M',
      trend: '+12.4%',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      gradient: 'from-emerald-500/10 to-teal-500/5'
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: (users.length + 1240).toLocaleString(),
      trend: '+8.3%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500/10 to-indigo-500/5'
    },
    {
      icon: ListOrdered,
      label: 'Pending Listings',
      value: listings.length,
      trend: '-14.2%',
      trendUp: false,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500/10 to-orange-500/5'
    },
    {
      icon: ShoppingBag,
      label: 'Orders This Month',
      value: (orders.length + 889).toLocaleString(),
      trend: '+4.7%',
      trendUp: true,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      gradient: 'from-indigo-500/10 to-purple-500/5'
    },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ icon: Icon, label, value, trend, trendUp, color, bgColor, gradient }) => (
          <div
            key={label}
            className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Soft decorative background gradient block */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} rounded-bl-full opacity-50 pointer-events-none`} />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">{label}</span>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
              </div>
              <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center shadow-inner`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-50 text-xs relative z-10">
              <span className={`font-extrabold px-1.5 py-0.5 rounded-md ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
              </span>
              <span className="text-gray-400 font-medium">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TABS.map(tab => {
            const isActive = currentPath === tab.path;
            return (
              <Link
                key={tab.path}
                to={`/admin/${tab.path}`}
                className={`px-5 py-3 text-sm font-extrabold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-ag-primary text-white shadow-md shadow-ag-primary/20 scale-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                
                {tab.label === 'Listings' && listings.length > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-ag-primary' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                    {listings.length}
                  </span>
                )}
                {tab.label === 'Users' && users.filter(u=>u.status==='pending_kyc').length > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-ag-primary' : 'bg-rose-100 text-rose-600 animate-pulse'}`}>
                    {users.filter(u=>u.status==='pending_kyc').length}
                  </span>
                )}
                {tab.label === 'Reviews' && flagCount > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-ag-primary' : 'bg-rose-100 text-rose-600'}`}>
                    {flagCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

        {/* ── TAB: Overview ── */}
        {currentPath === 'dashboard' && (
          <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 bg-ag-canvas/30">
            {/* Revenue Trend */}
            <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ag-primary" /> Platform Revenue Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `KSh ${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3d6c38" strokeWidth={3} dot={{ r: 4, fill: '#3d6c38', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Categories */}
            <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-ag-amber" /> Top Selling Produce
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CROP_SALES} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v) => [`${v}%`, 'Market Share']} />
                    <Bar dataKey="sales" fill="#d97706" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Distribution Pie */}
            <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-ag-body mb-4 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> User Role Distribution
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '10px' }} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Trend */}
            <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Monthly Orders
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v) => [v, 'Orders']} />
                    <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Listings ── */}
        {currentPath === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-ag-pay mx-auto mb-2" />
                <p className="font-bold text-ag-muted">All listings reviewed — inbox clear!</p>
              </div>
            ) : (
              <div className="divide-y divide-ag-border">
                {listings.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                        {item.crop.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-ag-body text-sm">{item.crop}</p>
                        <p className="text-xs text-ag-muted">Farmer: {item.farmer} · {item.county}</p>
                        <p className="text-xs text-ag-amber font-bold">{item.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => rejectListing(item.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 border-2 border-red-200 text-red-600 rounded-btn font-bold hover:bg-red-50">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button onClick={() => approveListing(item.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-ag-primary text-white rounded-btn font-bold hover:opacity-90">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Users ── */}
        {currentPath === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-ag-muted">{users.length} users</p>
              <button onClick={exportCSV} className="btn-secondary !min-h-0 !py-2 !text-xs">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-ag-surface text-ag-muted text-xs">
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ag-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-ag-canvas transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-ag-body">{user.name}</p>
                        <p className="text-xs text-ag-muted">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ag-muted">{user.role}</td>
                      <td className="px-4 py-3"><span className={chipByStatus(user.status)}>{user.status.replace('_',' ')}</span></td>
                      <td className="px-4 py-3 flex gap-2 flex-wrap">
                        <button onClick={() => { setSelected(user); setModal('user'); }} className="text-xs text-ag-primary font-bold hover:underline">View</button>
                        {user.status === 'pending_kyc' && <button onClick={() => approveKyc(user.id)} className="text-xs text-ag-pay font-bold hover:underline">Approve KYC</button>}
                        {user.status === 'active'      && <button onClick={() => suspendUser(user.id)} className="text-xs text-red-500 font-bold hover:underline">Suspend</button>}
                        {user.status === 'suspended'   && <button onClick={() => activateUser(user.id)} className="text-xs text-ag-primary font-bold hover:underline">Reactivate</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Orders ── */}
        {currentPath === 'orders' && (
          <div className="divide-y divide-ag-border">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Buyer: {order.buyer} · Farmer: {order.farmer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ag-amber font-extrabold text-sm">KSh {order.amount.toLocaleString()}</span>
                  <span className={chipByStatus(order.status)}>{order.status.replace('_',' ')}</span>
                  <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className="text-xs border border-ag-border rounded-btn px-2 py-1 font-bold text-ag-muted">
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ── TAB: Reviews (ALL feedback from all roles) ──
        ══════════════════════════════════════════════════ */}
        {currentPath === 'reviews' && (
          <div className="p-6 flex flex-col gap-6">

            {/* Review Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reviews',     value: reviews.length,         icon: Star,      color: 'text-yellow-500' },
                { label: 'Avg Rating',         value: `${avgRating} `,       icon: Award,     color: 'text-ag-pay' },
                { label: 'Positive Sentiment', value: `${posCount} reviews`,  icon: ThumbsUp,  color: 'text-ag-primary' },
                { label: 'Flagged Content',    value: `${flagCount} items`,   icon: Flag,      color: 'text-red-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="border border-ag-border rounded-card p-4 bg-white hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-ag-muted uppercase tracking-wider">{label}</p>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-xl font-extrabold text-ag-body">{value}</p>
                </div>
              ))}
            </div>

            {/* Sentiment breakdown bar */}
            <div className="border border-ag-border rounded-card p-5 bg-white">
              <h3 className="text-sm font-extrabold text-ag-body mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-ag-primary" /> Platform-Wide Sentiment Analysis
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-3 rounded-full bg-ag-surface overflow-hidden flex">
                  <div className="h-full bg-ag-pay transition-all" style={{ width: `${Math.round(posCount/reviews.length*100)}%` }} />
                  <div className="h-full bg-ag-amber transition-all" style={{ width: `${Math.round(reviews.filter(r=>r.sentiment==='neutral').length/reviews.length*100)}%` }} />
                  <div className="h-full bg-red-400 transition-all" style={{ width: `${Math.round(negCount/reviews.length*100)}%` }} />
                </div>
              </div>
              <div className="flex gap-6 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-ag-pay inline-block"/><span className="text-ag-pay">Positive ({Math.round(posCount/reviews.length*100)}%)</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-ag-amber inline-block"/><span className="text-ag-amber">Neutral ({Math.round(reviews.filter(r=>r.sentiment==='neutral').length/reviews.length*100)}%)</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"/><span className="text-red-500">Negative ({Math.round(negCount/reviews.length*100)}%)</span></span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                <input
                  value={reviewSearch} onChange={e => setReviewSearch(e.target.value)}
                  className="form-input !pl-9 !py-2.5 w-full" placeholder="Search reviews by name, comment..."
                />
              </div>
              {/* Role filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-ag-muted shrink-0" />
                <select value={reviewRoleFilter} onChange={e => setReviewRoleFilter(e.target.value)} className="form-input !py-2.5 !pr-8 text-sm">
                  <option value="All">All Roles</option>
                  <option value="Buyer">From Buyers</option>
                  <option value="Farmer">From Farmers</option>
                  <option value="Logistics">From Logistics</option>
                </select>
              </div>
              {/* Sentiment filter */}
              <div className="flex gap-2">
                {['All', 'Positive', 'Neutral', 'Negative', 'Flagged'].map(f => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`text-xs px-3 py-2 rounded-btn font-bold border transition-all ${
                      reviewFilter === f
                        ? f === 'Flagged' ? 'bg-red-500 text-white border-red-500'
                        : f === 'Positive' ? 'bg-ag-pay text-white border-ag-pay'
                        : f === 'Negative' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-ag-primary text-white border-ag-primary'
                        : 'border-ag-border text-ag-muted hover:border-ag-primary hover:text-ag-primary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Review count */}
            <p className="text-xs text-ag-muted font-bold">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </p>

            {/* Reviews List */}
            <div className="flex flex-col gap-4">
              {filteredReviews.map(r => (
                <div key={r.id} className={`border rounded-card p-5 bg-white transition-shadow hover:shadow-md ${r.flagged ? 'border-red-200 bg-red-50/30' : 'border-ag-border'}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-ag-primary flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                        {r.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-ag-body text-sm">{r.reviewer}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColor(r.fromRole)}`}>{r.fromRole}</span>
                          {r.verified && <CheckCircle className="w-3.5 h-3.5 text-ag-pay" />}
                          {r.flagged && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Flag className="w-3 h-3" /> Flagged</span>}
                        </div>
                        <p className="text-xs text-ag-muted mt-0.5">
                          Reviewing <span className="font-semibold text-ag-body">{r.target}</span>
                          <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${roleColor(r.toRole)}`}>{r.toRole}</span>
                          · {r.category} · {r.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SentimentIcon s={r.sentiment} />
                      <StarRow rating={r.rating} />
                    </div>
                  </div>

                  {/* Comment */}
                  {r.crop !== 'N/A' && (
                    <span className="inline-block mt-3 text-[10px] font-bold bg-ag-surface text-ag-muted px-2 py-0.5 rounded-full">
                      {r.crop}
                    </span>
                  )}
                  <p className="text-sm text-ag-body leading-relaxed mt-2 italic">"{r.comment}"</p>

                  {/* Footer actions */}
                  <div className="flex items-center gap-4 pt-3 mt-3 border-t border-ag-border">
                    <span className="flex items-center gap-1 text-xs text-ag-muted">
                      <ThumbsUp className="w-3.5 h-3.5" /> {r.helpful} found helpful
                    </span>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => flagReview(r.id)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn font-bold border transition-all ${
                          r.flagged
                            ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'
                            : 'border-ag-border text-ag-muted hover:text-ag-amber hover:border-ag-amber'
                        }`}
                      >
                        <Flag className="w-3 h-3" /> {r.flagged ? 'Unflag' : 'Flag'}
                      </button>
                      <button
                        onClick={() => { setSelected(r); setModal('reviewDetail'); }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn font-bold border border-ag-border text-ag-muted hover:text-ag-primary hover:border-ag-primary transition-all"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => removeReview(r.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="py-12 text-center">
                  <Star className="w-10 h-10 text-ag-border mx-auto mb-2" />
                  <p className="font-bold text-ag-muted">No reviews match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Logistics/Moderation ── */}
        {currentPath === 'moderation' && (
          <div className="p-6">
            <p className="text-sm font-bold text-ag-muted mb-4">Active Fleet ({drivers.length} drivers)</p>
            <div className="divide-y divide-ag-border">
              {drivers.map(driver => (
                <div key={driver.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-ag-primary-fixed" />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body text-sm">{driver.name}</p>
                      <p className="text-xs text-ag-muted">{driver.vehicle} · {driver.trips} trips</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={chipByStatus(driver.status)}>{driver.status.replace('_',' ')}</span>
                    <button
                      onClick={() => {
                        setDrivers(p => p.map(d => d.id===driver.id ? {...d, status: d.status==='available' ? 'on_trip' : 'available'} : d));
                        showToast('Driver status updated.');
                      }}
                      className="text-xs text-ag-primary font-bold hover:underline"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Settings ── */}
        {currentPath === 'settings' && (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-ag-body mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Platform Settings</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-ag-body mb-1">Commission Rate (%)</label>
                  <input type="number" value={settings.commissionRate} min="0" max="20" onChange={e => setSettings(p=>({...p, commissionRate: e.target.value}))} className="form-input w-40 text-sm" />
                  <p className="text-xs text-ag-muted mt-1">Currently charged on every transaction.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ag-body mb-1">Max Listings per Farmer</label>
                  <input type="number" value={settings.maxListings} min="1" max="50" onChange={e => setSettings(p=>({...p, maxListings: e.target.value}))} className="form-input w-40 text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setSettings(p=>({...p, maintenanceMode: !p.maintenanceMode}))} className={`w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-ag-border'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.maintenanceMode ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm font-bold text-ag-body flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${settings.maintenanceMode ? 'text-red-500' : 'text-ag-muted'}`} />
                      Maintenance Mode {settings.maintenanceMode ? '(ON)' : '(OFF)'}
                    </span>
                  </label>
                </div>
                <button onClick={() => showToast('Platform settings saved successfully!')} className="btn-primary w-fit !min-h-0 !py-3 !text-sm">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}


      {/* ── MODAL: User Profile ── */}
      {modal === 'user' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body">User Profile</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="flex flex-col gap-2 mb-4 text-sm">
              <p><span className="text-ag-muted font-bold">Name:</span> {selected.name}</p>
              <p><span className="text-ag-muted font-bold">Email:</span> {selected.email}</p>
              <p><span className="text-ag-muted font-bold">Role:</span> {selected.role}</p>
              <p><span className="text-ag-muted font-bold">County:</span> {selected.county}</p>
              <p><span className="text-ag-muted font-bold">Status:</span> <span className={chipByStatus(selected.status)}>{selected.status.replace('_',' ')}</span></p>
            </div>
            <div className="flex gap-2">
              {selected.status === 'active'      && <button onClick={() => suspendUser(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 rounded-btn"><Ban className="w-4 h-4" /> Suspend</button>}
              {selected.status === 'pending_kyc' && <button onClick={() => approveKyc(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-ag-pay hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-btn"><UserCheck className="w-4 h-4" /> Approve KYC</button>}
              {selected.status === 'suspended'   && <button onClick={() => activateUser(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-ag-primary hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-btn"><RefreshCw className="w-4 h-4" /> Reactivate</button>}
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-2.5 !text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Review Detail ── */}
      {modal === 'reviewDetail' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-ag-body flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Review Detail
              </h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-ag-primary flex items-center justify-center text-white font-extrabold">{selected.avatar}</div>
                <div>
                  <p className="font-bold text-ag-body">{selected.reviewer}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColor(selected.fromRole)}`}>{selected.fromRole}</span>
                  {selected.verified && <span className="ml-2 text-xs text-ag-pay font-bold"> Verified</span>}
                </div>
              </div>
              <div className="bg-ag-surface rounded-card p-4">
                <p className="text-xs text-ag-muted font-bold mb-1">Reviewing: <span className="text-ag-body">{selected.target}</span> ({selected.toRole})</p>
                <p className="text-xs text-ag-muted font-bold mb-3">Category: {selected.category} · {selected.date}</p>
                <StarRow rating={selected.rating} size="w-5 h-5" />
                <p className="text-sm text-ag-body mt-3 leading-relaxed italic">"{selected.comment}"</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <SentimentIcon s={selected.sentiment} />
                <span className="font-bold text-ag-body capitalize">{selected.sentiment} sentiment</span>
                <span className="text-ag-muted">·</span>
                <ThumbsUp className="w-4 h-4 text-ag-muted" />
                <span className="text-ag-muted">{selected.helpful} found helpful</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-ag-border">
                <button onClick={() => { flagReview(selected.id); setModal(null); }} className={`flex-1 flex items-center justify-center gap-1 text-sm font-bold py-2.5 rounded-btn border ${selected.flagged ? 'border-ag-border text-ag-muted' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                  <Flag className="w-4 h-4" /> {selected.flagged ? 'Unflag' : 'Flag'}
                </button>
                <button onClick={() => { removeReview(selected.id); setModal(null); }} className="flex-1 flex items-center justify-center gap-1 text-sm font-bold py-2.5 rounded-btn bg-red-600 text-white hover:bg-red-700">
                  <X className="w-4 h-4" /> Remove Review
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-2.5 !text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
