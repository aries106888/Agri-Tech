/* ── ShambaPoint Admin — Static Demo Data ─────────────────── */

export const INITIAL_LISTINGS = [
  { id: 1, crop: '500kg Maize',    farmer: 'David K.',  county: 'Uasin Gishu', price: 'KSh 25,000' },
  { id: 2, crop: '200kg Tomatoes', farmer: 'Aisha M.',  county: 'Kiambu',      price: 'KSh 16,000' },
  { id: 3, crop: '80 Crates Eggs', farmer: 'Peter O.',  county: 'Nakuru',      price: 'KSh 9,600'  },
];

export const MONTHLY_REVENUE = [
  { name: 'Jan', revenue: 420000,  orders: 120 },
  { name: 'Feb', revenue: 510000,  orders: 155 },
  { name: 'Mar', revenue: 680000,  orders: 198 },
  { name: 'Apr', revenue: 850000,  orders: 241 },
  { name: 'May', revenue: 1200000, orders: 360 },
  { name: 'Jun', revenue: 1540000, orders: 482 },
];

export const CROP_SALES = [
  { name: 'Maize',    sales: 45 },
  { name: 'Tomatoes', sales: 25 },
  { name: 'Potatoes', sales: 15 },
  { name: 'Onions',   sales: 10 },
  { name: 'Cabbage',  sales: 5  },
];

export const PIE_DATA = [
  { name: 'Farmers',   value: 38, color: '#1B4332' },
  { name: 'Buyers',    value: 45, color: '#2563eb' },
  { name: 'Logistics', value: 17, color: '#D97706' },
];

export const INITIAL_USERS = [
  { id: 1, name: 'Sarah O.',  email: 'sarah.o@gmail.com',  role: 'Buyer',     status: 'active',      county: 'Nairobi' },
  { id: 2, name: 'Juma M.',   email: 'juma.m@gmail.com',   role: 'Farmer',    status: 'pending_kyc', county: 'Mombasa' },
  { id: 3, name: 'Kevin W.',  email: 'kevin.w@gmail.com',  role: 'Logistics', status: 'active',      county: 'Kisumu'  },
  { id: 4, name: 'Grace A.',  email: 'grace.a@gmail.com',  role: 'Farmer',    status: 'active',      county: 'Nakuru'  },
  { id: 5, name: 'Moses K.',  email: 'moses.k@gmail.com',  role: 'Buyer',     status: 'suspended',   county: 'Eldoret' },
];

export const INITIAL_ORDERS = [
  { id: 1, crop: 'Potatoes', buyer: 'Naivas Ltd',  farmer: 'Mwangi J.', amount: 22500, status: 'completed'  },
  { id: 2, crop: 'Tomatoes', buyer: 'Janet W.',    farmer: 'Sarah K.',  amount: 8000,  status: 'in_transit' },
  { id: 3, crop: 'Maize',    buyer: 'Quickmart',   farmer: 'David K.',  amount: 16400, status: 'pending'    },
];

export const INITIAL_DRIVERS = [
  { id: 1, name: 'David Ochieng', vehicle: 'KCA 123Z (Isuzu FRR)',   status: 'available', trips: 12 },
  { id: 2, name: 'Peter Waweru',  vehicle: 'KBX 456Y (Mitsubishi)',  status: 'on_trip',   trips: 8  },
  { id: 3, name: 'James Kimani',  vehicle: 'KDA 789W (Toyota Dyna)', status: 'available', trips: 19 },
];

export const ALL_REVIEWS = [
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
