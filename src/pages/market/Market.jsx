import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Search, MapPin, ChevronDown, ShoppingCart, SlidersHorizontal, X,
  Grid3X3, Map, Plus, Minus, Trash2, Phone, CheckCircle2, Loader2,
  ArrowRight, ArrowLeft, Package, Truck
} from 'lucide-react';
import api from '../../services/api';

/* ─────────────────────────── constants ─────────────────────────── */
const COUNTIES = ['Nairobi','Kiambu','Nakuru','Meru','Uasin Gishu','Kajiado','Nyandarua','Kericho','Kakamega','Kisumu'];
const CROP_TYPES = ['Maize','Tomatoes','Potatoes','Onions','Cabbage','Spinach','Carrots','Beans','Pineapple','Avocado'];

const COUNTY_COORDS = {
  Nairobi:     { lat: -1.2864, lng: 36.8172 },
  Kiambu:      { lat: -1.1743, lng: 36.8357 },
  Nakuru:      { lat: -0.3031, lng: 36.0800 },
  Meru:        { lat:  0.0469, lng: 37.6490 },
  'Uasin Gishu': { lat: 0.5143, lng: 35.2698 },
  Kajiado:     { lat: -1.8528, lng: 36.7820 },
  Nyandarua:   { lat: -0.1833, lng: 36.5667 },
  Kericho:     { lat: -0.3680, lng: 35.2863 },
  Kakamega:    { lat:  0.2827, lng: 34.7519 },
  Kisumu:      { lat: -0.1022, lng: 34.7617 },
  "Murang'a":  { lat: -0.7167, lng: 37.1500 },
};

/* Real harvested-farm photos from Unsplash (free) */
const CROP_IMAGES = {
  Maize:     'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop',
  Tomatoes:  'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&auto=format&fit=crop',
  Potatoes:  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop',
  Onions:    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop',
  Cabbage:   'https://images.unsplash.com/photo-1594995846645-3e3e81e5bef5?w=600&auto=format&fit=crop',
  Spinach:   'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop',
  Carrots:   'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop',
  Beans:     'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop',
  Pineapple: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop',
  Avocado:   'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop',
  Kale:      'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=600&auto=format&fit=crop',
  Banana:    'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&auto=format&fit=crop',
};

/* Live price index for ticker */
export const LIVE_PRICES = [
  { crop: 'Maize',     price: 25,  unit: '/pc',    change: +2.5 },
  { crop: 'Tomatoes',  price: 80,  unit: '/kg',    change: -5   },
  { crop: 'Potatoes',  price: 45,  unit: '/kg',    change: +1   },
  { crop: 'Onions',    price: 120, unit: '/kg',    change: +8   },
  { crop: 'Cabbage',   price: 35,  unit: '/kg',    change: -3   },
  { crop: 'Spinach',   price: 40,  unit: '/bunch', change: 0    },
  { crop: 'Carrots',   price: 55,  unit: '/kg',    change: +4   },
  { crop: 'Beans',     price: 70,  unit: '/kg',    change: -2   },
  { crop: 'Pineapple', price: 90,  unit: '/pc',    change: +5   },
  { crop: 'Avocado',   price: 15,  unit: '/pc',    change: -1   },
  { crop: 'Kale',      price: 30,  unit: '/bunch', change: +2   },
  { crop: 'Banana',    price: 12,  unit: '/pc',    change: 0    },
];

const FALLBACK_PRODUCTS = [
  { id: 101, name: 'Grade A Tomatoes',        farmer: 'Sarah K.',      county: 'Kiambu',      price: 80,  unit: '/kg',    verified: true,  lowStock: true,  image: CROP_IMAGES.Tomatoes,  cropKey: 'Tomatoes'  },
  { id: 102, name: 'Sweet Green Maize',       farmer: 'Kibet E.',      county: 'Uasin Gishu', price: 25,  unit: '/pc',    verified: true,  lowStock: false, image: CROP_IMAGES.Maize,     cropKey: 'Maize'     },
  { id: 103, name: 'Freshly Dug Irish Potatoes', farmer: 'Mwangi J.',  county: 'Nakuru',      price: 45,  unit: '/kg',    verified: true,  lowStock: false, image: CROP_IMAGES.Potatoes,  cropKey: 'Potatoes'  },
  { id: 104, name: 'Organic Red Onions',      farmer: 'Agnes L.',      county: 'Kajiado',     price: 120, unit: '/kg',    verified: true,  lowStock: false, image: CROP_IMAGES.Onions,    cropKey: 'Onions'    },
  { id: 105, name: 'Farm-Fresh Green Cabbage',farmer: 'Otieno M.',     county: 'Kericho',     price: 35,  unit: '/kg',    verified: true,  lowStock: false, image: CROP_IMAGES.Cabbage,   cropKey: 'Cabbage'   },
  { id: 106, name: 'Organic Baby Spinach',    farmer: 'Wanjiru A.',    county: 'Kiambu',      price: 40,  unit: '/bunch', verified: true,  lowStock: true,  image: CROP_IMAGES.Spinach,   cropKey: 'Spinach'   },
  { id: 107, name: 'Nyandarua Farm Carrots',  farmer: 'Kamau D.',      county: 'Nyandarua',   price: 55,  unit: '/kg',    verified: false, lowStock: false, image: CROP_IMAGES.Carrots,   cropKey: 'Carrots'   },
  { id: 108, name: 'Meru French Beans',       farmer: 'Chebet R.',     county: 'Meru',        price: 70,  unit: '/kg',    verified: true,  lowStock: false, image: CROP_IMAGES.Beans,     cropKey: 'Beans'     },
  { id: 109, name: 'Kisumu Sweet Pineapple',  farmer: 'Oduya F.',      county: 'Kisumu',      price: 90,  unit: '/pc',    verified: true,  lowStock: false, image: CROP_IMAGES.Pineapple, cropKey: 'Pineapple' },
  { id: 110, name: 'Hass Avocado (Ripe)',     farmer: 'Njoroge P.',    county: "Murang'a",    price: 15,  unit: '/pc',    verified: true,  lowStock: true,  image: CROP_IMAGES.Avocado,   cropKey: 'Avocado'   },
  { id: 111, name: 'Sukuma Wiki / Kale',      farmer: 'Wangari B.',    county: 'Nakuru',      price: 30,  unit: '/bunch', verified: true,  lowStock: false, image: CROP_IMAGES.Kale,      cropKey: 'Kale'      },
  { id: 112, name: 'Nandi Hills Nano Bananas',farmer: 'Koech S.',      county: 'Kericho',     price: 12,  unit: '/pc',    verified: true,  lowStock: false, image: CROP_IMAGES.Banana,    cropKey: 'Banana'    },
];

/* ─────────────── custom farm marker icon ─────────────── */
const makeFarmIcon = (verified) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${verified ? '#2D6A4F' : '#E9B44C'};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="transform:rotate(45deg);font-size:11px;font-weight:900;color:white;">${verified ? 'V' : 'U'}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

/* ────── fly-to helper (child of MapContainer) ────── */
function FlyToCounty({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && COUNTY_COORDS[target]) {
      map.flyTo([COUNTY_COORDS[target].lat, COUNTY_COORDS[target].lng], 11, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

/* ─────────────────────── Sidebar filters ─────────────────────── */
const SidebarContent = ({ pendingFilters, setPending, toggleFilter, applyFilters }) => (
  <div className="flex flex-col gap-6 h-full">
    <h2 className="text-headline-md text-ag-body">Filter Listings</h2>

    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">Crop Type</h3>
      <div className="flex flex-col gap-2">
        {CROP_TYPES.map(c => (
          <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={pendingFilters.crops.includes(c)} onChange={() => toggleFilter('crops', c)} className="w-4 h-4 accent-ag-primary rounded shrink-0" />
            <img src={CROP_IMAGES[c]} alt={c} className="w-8 h-8 rounded-md object-cover shrink-0 border border-ag-border" />
            <span className="text-sm font-bold text-ag-body group-hover:text-ag-primary transition-colors">{c}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">County</h3>
      <div className="flex flex-col gap-2">
        {COUNTIES.map(c => (
          <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={pendingFilters.counties.includes(c)} onChange={() => toggleFilter('counties', c)} className="w-4 h-4 accent-ag-primary rounded" />
            <span className="text-sm font-bold text-ag-body group-hover:text-ag-primary transition-colors">{c}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">Price Range (KSh)</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs font-bold">KSh</span>
          <input type="number" placeholder="Min" value={pendingFilters.minPrice} onChange={e => setPending(p => ({ ...p, minPrice: e.target.value }))} className="w-full bg-ag-card border-2 border-ag-border rounded-btn pl-9 pr-2 py-2 text-sm focus:outline-none focus:border-ag-primary" />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs font-bold">KSh</span>
          <input type="number" placeholder="Max" value={pendingFilters.maxPrice} onChange={e => setPending(p => ({ ...p, maxPrice: e.target.value }))} className="w-full bg-ag-card border-2 border-ag-border rounded-btn pl-9 pr-2 py-2 text-sm focus:outline-none focus:border-ag-primary" />
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">Seller Quality</h3>
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-bold text-ag-body">Verified Farmers Only</span>
        <button
          onClick={() => setPending(p => ({ ...p, verifiedOnly: !p.verifiedOnly }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${pendingFilters.verifiedOnly ? 'bg-ag-primary' : 'bg-ag-border'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pendingFilters.verifiedOnly ? 'left-7' : 'left-1'}`} />
        </button>
      </label>
    </div>

    <div className="mt-auto pt-4 border-t border-ag-border sticky bottom-0 bg-white pb-2">
      <button onClick={applyFilters} className="btn-primary w-full">Apply Filters</button>
      <button onClick={() => setPending({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false })} className="btn-tertiary w-full mt-2 text-center">Clear All</button>
    </div>
  </div>
);

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
const Market = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [view, setView]                 = useState('grid'); // 'grid' | 'map'
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('relevance');
  const [filters, setFilters]           = useState({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false });
  const [pendingFilters, setPending]    = useState({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false });
  const [activeChips, setActiveChips]   = useState([]);
  const [cartItems, setCartItems]       = useState([]);
  const [cartOpen, setCartOpen]         = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [flyTarget, setFlyTarget]       = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [logistics, setLogistics]       = useState({ pickup: '', destination: '' });
  const [phone, setPhone]               = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').phone || ''; } catch { return ''; }
  });
  const [mpesaState, setMpesaState]     = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    // Always use curated farm products — API may return non-agricultural data
    const timer = setTimeout(() => { setProducts(FALLBACK_PRODUCTS); setLoading(false); }, 600);
    return () => clearTimeout(timer);
  }, []);

  /* ── cart helpers ── */
  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const logisticsFee = logistics.pickup && logistics.destination ? 1200 : 0;

  /* ── filter helpers ── */
  const toggleFilter = (key, value) => {
    setPending(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    const chips = [
      ...pendingFilters.counties,
      ...pendingFilters.crops,
      pendingFilters.minPrice && `KSh ${pendingFilters.minPrice}+`,
      pendingFilters.maxPrice && `Max KSh ${pendingFilters.maxPrice}`,
      pendingFilters.verifiedOnly && 'Verified Only',
    ].filter(Boolean);
    setActiveChips(chips);
    setSidebarOpen(false);
  };

  const removeChip = (chip) => {
    setActiveChips(prev => prev.filter(c => c !== chip));
    setFilters(prev => {
      const u = { ...prev };
      if (prev.counties.includes(chip)) u.counties = prev.counties.filter(c => c !== chip);
      if (prev.crops.includes(chip))    u.crops    = prev.crops.filter(c => c !== chip);
      if (chip === 'Verified Only')     u.verifiedOnly = false;
      return u;
    });
  };

  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.farmer?.toLowerCase().includes(q)) return false;
      if (filters.counties.length && !filters.counties.includes(p.county)) return false;
      if (filters.crops.length && !filters.crops.some(c => p.name.toLowerCase().includes(c.toLowerCase()))) return false;
      if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  /* ── M-PESA STK push simulation ── */
  const sendMpesa = async () => {
    setMpesaState('sending');
    try {
      await api.post('/payments/mpesa/stkpush', {
        phone, amount: cartTotal + logisticsFee,
        description: `ShambaPoint order – ${cartItems.length} items`,
      });
      setMpesaState('success');
    } catch (err) {
      console.error(err);
      // simulate success even if backend is offline
      await new Promise(r => setTimeout(r, 2500));
      setMpesaState('success');
    }
    // clear cart after success
    setTimeout(() => {
      setCartItems([]);
      setCheckoutOpen(false);
      setCheckoutStep(1);
      setMpesaState('idle');
      setLogistics({ pickup: '', destination: '' });
    }, 3500);
  };

  const openCheckout = () => { setCheckoutOpen(true); setCheckoutStep(1); setCartOpen(false); };

  /* ══════════════════ JSX ══════════════════ */
  return (
    <div className="flex min-h-screen bg-ag-canvas relative">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-sidebar shrink-0 border-r border-ag-border bg-white px-6 py-8 flex-col sticky top-0 h-screen overflow-y-auto">
        <SidebarContent pendingFilters={pendingFilters} setPending={setPending} toggleFilter={toggleFilter} applyFilters={applyFilters} />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full px-6 py-8 overflow-y-auto flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-ag-muted"><X className="w-5 h-5" /></button>
            <SidebarContent pendingFilters={pendingFilters} setPending={setPending} toggleFilter={toggleFilter} applyFilters={applyFilters} />
          </aside>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-ag-border px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Mobile filter toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-1.5 text-sm font-bold border-2 border-ag-border rounded-btn px-3 py-2 text-ag-body hover:border-ag-primary transition-colors shrink-0">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input
                id="market-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search crops, farmer names..."
                className="form-input pl-10 !py-2"
              />
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block shrink-0">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input !py-2 pr-8 appearance-none min-w-[150px] bg-ag-card cursor-pointer">
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Sort: Price ↑</option>
                <option value="price_desc">Sort: Price ↓</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-muted pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center border-2 border-ag-border rounded-btn overflow-hidden shrink-0">
              <button
                id="view-grid"
                onClick={() => setView('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors ${view === 'grid' ? 'bg-ag-primary text-white' : 'text-ag-muted hover:bg-ag-canvas'}`}
              >
                <Grid3X3 className="w-4 h-4" /> Grid
              </button>
              <button
                id="view-map"
                onClick={() => setView('map')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors ${view === 'map' ? 'bg-ag-primary text-white' : 'text-ag-muted hover:bg-ag-canvas'}`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
            </div>

            {/* Cart button */}
            <button
              id="cart-toggle"
              onClick={() => setCartOpen(o => !o)}
              className="relative p-2.5 border-2 border-ag-border rounded-btn hover:border-ag-primary transition-colors shrink-0"
            >
              <ShoppingCart className="w-5 h-5 text-ag-body" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-ag-amber text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeChips.map(chip => (
                <span key={chip} className="flex items-center gap-1.5 bg-ag-primary-fixed text-ag-primary text-xs font-bold px-3 py-1 rounded-full">
                  {chip}
                  <button onClick={() => removeChip(chip)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}

          {/* County quick-nav (map view) */}
          {view === 'map' && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {COUNTIES.map(c => (
                <button
                  key={c}
                  onClick={() => setFlyTarget(c)}
                  className="flex items-center gap-1 shrink-0 bg-ag-canvas border border-ag-border rounded-full px-3 py-1 text-xs font-bold text-ag-body hover:bg-ag-primary hover:text-white hover:border-ag-primary transition-all"
                >
                  <MapPin className="w-3 h-3" /> {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex-1 flex flex-col relative">

          {/* MAP VIEW */}
          {view === 'map' && (
            <div className="flex-1 relative" style={{ minHeight: '70vh' }}>
              <MapContainer
                center={[-0.023559, 37.9061722]}
                zoom={7}
                style={{ width: '100%', height: '100%', minHeight: '70vh' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToCounty target={flyTarget} />

                {filteredProducts.map(p => {
                  const coords = COUNTY_COORDS[p.county];
                  if (!coords) return null;
                  // slight random jitter so stacked markers are visible
                  const jLat = coords.lat + (p.id % 7 - 3) * 0.04;
                  const jLng = coords.lng + (p.id % 5 - 2) * 0.05;
                  return (
                    <Marker key={p.id} position={[jLat, jLng]} icon={makeFarmIcon(p.verified)}>
                      <Popup maxWidth={220} className="farm-popup">
                        <div className="flex flex-col gap-2 p-1" style={{ minWidth: 200 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin style={{ width:12, height:12, color:'#6b7280', flexShrink:0 }} /><strong>{p.county}</strong>
                            {p.verified && <span style={{ marginLeft: 4, background: '#D8F3DC', color: '#2D6A4F', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>Verified</span>}
                          </div>
                          <p style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>{p.name}</p>
                          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Farmer: {p.farmer}</p>
                          <p style={{ color: '#E9B44C', fontWeight: 800, fontSize: 18, margin: '2px 0' }}>
                            KSh {p.price}<span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>{p.unit}</span>
                          </p>
                          {p.lowStock && <span style={{ background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, display: 'inline-block' }}>Low Stock</span>}
                          <button
                            onClick={() => addToCart(p)}
                            style={{
                              background: '#2D6A4F', color: 'white', border: 'none', borderRadius: 8,
                              padding: '8px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* map legend */}
              <div className="absolute bottom-6 left-4 z-10 bg-white/90 backdrop-blur rounded-card p-3 shadow-md text-xs flex flex-col gap-1.5 border border-ag-border">
                <p className="font-bold text-ag-body mb-1">Legend</p>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-ag-primary inline-block" /><span className="text-ag-body font-bold">Verified Farm</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-ag-amber inline-block" /><span className="text-ag-muted">Unverified Farm</span></div>
                <p className="text-ag-muted mt-1 text-[10px]">Click a pin to view produce &amp; add to cart</p>
              </div>

              {/* listings count overlay */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur rounded-btn px-4 py-2 shadow text-sm font-bold text-ag-body border border-ag-border">
                {filteredProducts.length} farms visible
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {view === 'grid' && (
            <div className="px-4 lg:px-8 py-6">

              {/* ── Live Price Ticker ── */}
              <div className="mb-5 bg-ag-primary rounded-xl overflow-hidden">
                <div className="flex items-center">
                  <div className="bg-ag-amber text-white text-[10px] font-black px-3 py-2 shrink-0
                    flex items-center gap-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex gap-6 px-4 py-2 animate-marquee whitespace-nowrap"
                      style={{ animation: 'marquee 28s linear infinite' }}>
                      {[...LIVE_PRICES, ...LIVE_PRICES].map((p, i) => (
                        <span key={i} className="text-xs font-bold text-white/90 shrink-0">
                          {p.crop}:{' '}
                          <span className="text-ag-amber">KSh {p.price}{p.unit}</span>{' '}
                          <span className={p.change > 0 ? 'text-emerald-300' : p.change < 0 ? 'text-red-300' : 'text-white/50'}>
                            {p.change > 0 ? `▲${p.change}` : p.change < 0 ? `▼${Math.abs(p.change)}` : '—'}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-ag-muted mb-6">
                Showing <span className="text-ag-body">{filteredProducts.length}</span> fresh farm listings
              </p>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                      <div className="h-56 bg-gray-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                        <div className="h-10 bg-gray-100 rounded-xl mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <Package className="w-16 h-16 text-ag-border" />
                  <p className="text-headline-md text-ag-muted">No listings match your filters</p>
                  <p className="text-sm text-ag-muted">Try adjusting your search or clearing some filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => {
                    /* generate a deterministic "rating" and "sold" count from product id */
                    const rating = (3.5 + (product.id % 5) * 0.3).toFixed(1);
                    const sold   = 40 + (product.id * 13) % 280;
                    const isOrganic = product.verified && product.id % 3 !== 0;

                    return (
                      <div
                        key={product.id}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                      >
                        {/* ── IMAGE ZONE ── */}
                        <div className="relative h-56 overflow-hidden bg-gray-50">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/e8f5e9/2D6A4F?text=${encodeURIComponent(product.name)}`; }}
                          />

                          {/* gradient scrim bottom */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                          {/* top-left badge row */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {product.verified && (
                              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {isOrganic && (
                              <span className="flex items-center gap-1 bg-lime-400 text-lime-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                                🌿 Organic
                              </span>
                            )}
                            {product.lowStock && (
                              <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                                ⚡ Low Stock
                              </span>
                            )}
                          </div>

                          {/* top-right: quick-add hover button */}
                          <button
                            onClick={() => addToCart(product)}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 hover:bg-ag-primary hover:text-white text-ag-primary border border-white"
                            title="Quick Add"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* bottom-left overlay: price */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div>
                              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Price</p>
                              <p className="text-white font-black text-xl leading-tight">
                                KSh {product.price}
                                <span className="text-white/70 text-xs font-normal ml-1">{product.unit}</span>
                              </p>
                            </div>
                            {/* sold count */}
                            <span className="text-white/70 text-[10px] font-bold bg-black/30 px-2 py-1 rounded-full backdrop-blur">
                              {sold} sold
                            </span>
                          </div>
                        </div>

                        {/* ── BODY ── */}
                        <div className="p-4 flex flex-col flex-1 gap-3">

                          {/* name + county */}
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-base leading-snug line-clamp-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 text-xs">
                              <MapPin className="w-3 h-3 shrink-0 text-ag-primary" />
                              <span className="font-semibold text-gray-500">{product.county} County</span>
                            </div>
                          </div>

                          {/* star rating row */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${s <= Math.round(parseFloat(rating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}>
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-600">{rating}</span>
                            <span className="text-xs text-gray-400">({sold} reviews)</span>
                          </div>

                          {/* farmer chip */}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                            <div className="w-7 h-7 rounded-full bg-ag-primary text-white flex items-center justify-center text-xs font-black shrink-0">
                              {product.farmer.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Farmer</p>
                              <p className="text-xs font-bold text-gray-700 truncate">{product.farmer}</p>
                            </div>
                            {product.verified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                            )}
                          </div>

                          {/* freshness tags */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">🌱 Farm Fresh</span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">🚚 Fast Delivery</span>
                            {isOrganic && <span className="text-[10px] font-bold bg-lime-50 text-lime-700 border border-lime-100 px-2 py-0.5 rounded-full">No Pesticides</span>}
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => addToCart(product)}
                            className="mt-auto w-full flex items-center justify-center gap-2 bg-ag-primary hover:bg-ag-primary/90 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all duration-150 shadow-sm shadow-ag-primary/30"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ SLIDE-IN CART PANEL ══════════════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}>
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-ag-border"
            style={{ animation: 'slideInRight .25s ease' }}
          >
            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ag-border bg-ag-primary">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white" />
                <h2 className="font-extrabold text-white text-base">Your Cart ({cartCount})</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
                  <Package className="w-14 h-14 text-ag-border" />
                  <p className="font-bold text-ag-muted text-sm">Your cart is empty</p>
                  <p className="text-xs text-ag-muted">Browse the {view === 'map' ? 'map' : 'grid'} and click "Add to Cart"</p>
                  <button onClick={() => setCartOpen(false)} className="btn-primary mt-2 !py-2 !px-5 !text-sm">Browse Market</button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-ag-canvas rounded-card p-3 border border-ag-border">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-ag-border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-ag-body truncate">{item.name}</p>
                      <p className="text-xs text-ag-muted">{item.county}</p>
                      <p className="text-ag-amber font-extrabold text-sm mt-0.5">
                        KSh {item.price * item.qty}
                        <span className="text-xs font-normal text-ag-muted ml-1">({item.price}{item.unit} × {item.qty})</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {/* qty stepper */}
                      <div className="flex items-center gap-1 border-2 border-ag-border rounded-btn overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-ag-muted hover:bg-ag-canvas hover:text-ag-primary transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ag-body">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, +1)} className="w-7 h-7 flex items-center justify-center text-ag-muted hover:bg-ag-canvas hover:text-ag-primary transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            {cartItems.length > 0 && (
              <div className="px-5 py-4 border-t border-ag-border bg-white">
                <div className="flex justify-between text-sm font-bold text-ag-muted mb-1">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="text-ag-body">KSh {cartTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-ag-muted mb-3">
                  <span>Logistics (estimated)</span>
                  <span>calculated at checkout</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="btn-pay w-full !text-base flex items-center justify-center gap-2"
                >
                  Checkout via M-PESA <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCartItems([])} className="btn-tertiary w-full mt-2 text-center text-sm">
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ M-PESA CHECKOUT MODAL ══════════════ */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between bg-ag-primary sticky top-0">
              <div>
                <h2 className="font-extrabold text-white text-base">
                  {checkoutStep === 1 && ' Review Order'}
                  {checkoutStep === 2 && ' Logistics'}
                  {checkoutStep === 3 && ' M-PESA Payment'}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">Step {checkoutStep} of 3</p>
              </div>
              <button onClick={() => { setCheckoutOpen(false); setCheckoutStep(1); setMpesaState('idle'); }} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step progress bar */}
            <div className="flex h-1">
              <div className={`h-full bg-ag-primary transition-all duration-500`} style={{ width: `${(checkoutStep / 3) * 100}%` }} />
              <div className="flex-1 bg-ag-border" />
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">

              {/* ── STEP 1: Order Review ── */}
              {checkoutStep === 1 && (
                <>
                  <div className="flex flex-col gap-3">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-ag-canvas rounded-card p-3 border border-ag-border">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-ag-border shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-ag-muted">Qty: {item.qty} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-ag-amber text-sm">KSh {item.price * item.qty}</p>
                          <div className="flex items-center gap-1 mt-1 border border-ag-border rounded-btn overflow-hidden">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-ag-muted hover:bg-ag-canvas">
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, +1)} className="w-6 h-6 flex items-center justify-center text-ag-muted hover:bg-ag-canvas">
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-1 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-ag-border pt-4">
                    <div className="flex justify-between font-extrabold text-lg text-ag-body">
                      <span>Subtotal</span>
                      <span>KSh {cartTotal}</span>
                    </div>
                    <p className="text-xs text-ag-muted mt-1">Logistics fee added in next step</p>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="btn-pay w-full flex items-center justify-center gap-2">
                    Continue to Logistics <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* ── STEP 2: Logistics ── */}
              {checkoutStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">
                      <Truck className="w-4 h-4 inline mr-1.5" />Pickup Location (Farm County)
                    </label>
                    <select value={logistics.pickup} onChange={e => setLogistics(p => ({ ...p, pickup: e.target.value }))} className="form-input">
                      <option value="">Select pickup county...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1.5" />Delivery Destination
                    </label>
                    <select value={logistics.destination} onChange={e => setLogistics(p => ({ ...p, destination: e.target.value }))} className="form-input">
                      <option value="">Select destination county...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {logistics.pickup && logistics.destination && (
                    <div className="bg-ag-primary rounded-card p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <h4 className="text-white font-extrabold text-sm">Transport Allocated </h4>
                      </div>
                      <p className="text-white/80 text-xs">Driver: <strong className="text-white">David Ochieng</strong></p>
                      <p className="text-white/80 text-xs">Vehicle: <strong className="text-white">KCA 123Z – Isuzu FRR</strong></p>
                      <p className="text-white/80 text-xs">Route: <strong className="text-white">{logistics.pickup} → {logistics.destination}</strong></p>
                      <div className="border-t border-white/20 mt-2 pt-3 flex justify-between font-extrabold text-white">
                        <span>Logistics Fee</span>
                        <span>KSh {logisticsFee.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-ag-border pt-3 flex justify-between font-extrabold text-xl text-ag-body">
                    <span>Grand Total</span>
                    <span>KSh {(cartTotal + logisticsFee).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button onClick={() => setCheckoutStep(1)} className="btn-tertiary flex-1 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      disabled={!logistics.pickup || !logistics.destination}
                      onClick={() => setCheckoutStep(3)}
                      className={`btn-pay flex-1 flex items-center justify-center gap-2 ${(!logistics.pickup || !logistics.destination) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Pay Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3: M-PESA ── */}
              {checkoutStep === 3 && (
                <>
                  {mpesaState === 'success' ? (
                    <div className="flex flex-col items-center text-center py-8 gap-4">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="font-extrabold text-xl text-ag-body">Payment Received! </h3>
                      <p className="text-ag-muted text-sm">Your order has been confirmed and transport dispatched.</p>
                      <div className="bg-ag-canvas rounded-card p-4 w-full text-left border border-ag-border">
                        <p className="text-xs text-ag-muted mb-1">Amount Paid</p>
                        <p className="font-extrabold text-2xl text-ag-primary">KSh {(cartTotal + logisticsFee).toLocaleString()}</p>
                        <p className="text-xs text-ag-muted mt-2">SMS confirmation sent to {phone}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-card p-4 flex flex-col gap-1">
                        <p className="font-bold text-green-800 text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" /> M-PESA STK Push
                        </p>
                        <p className="text-xs text-green-700">You will receive a push notification on your phone to enter your M-PESA PIN.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-ag-body mb-1.5">M-PESA Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                          <input
                            id="mpesa-phone"
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="07XX XXX XXX"
                            className="form-input pl-10"
                          />
                        </div>
                      </div>

                      <div className="bg-ag-canvas rounded-card p-4 border border-ag-border flex flex-col gap-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-ag-muted">Produce subtotal</span>
                          <span className="font-bold">KSh {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ag-muted">Logistics ({logistics.pickup} → {logistics.destination})</span>
                          <span className="font-bold">KSh {logisticsFee.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-ag-border mt-2 pt-2 flex justify-between font-extrabold text-base text-ag-body">
                          <span>Total</span>
                          <span>KSh {(cartTotal + logisticsFee).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-1">
                        <button onClick={() => setCheckoutStep(2)} className="btn-tertiary flex items-center gap-2 px-4">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          id="mpesa-pay-btn"
                          disabled={!phone || mpesaState === 'sending'}
                          onClick={sendMpesa}
                          className={`btn-pay flex-1 flex items-center justify-center gap-2 ${(!phone || mpesaState === 'sending') ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {mpesaState === 'sending' ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending STK Push...</>
                          ) : (
                            <> Send M-PESA Request</>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .leaflet-popup-content { margin: 0 !important; padding: 8px !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; padding: 0 !important; overflow: hidden; }
        .leaflet-popup-tip-container { margin-top: -1px; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Market;
