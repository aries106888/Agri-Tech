import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';

const COUNTIES = ['Nairobi','Kiambu','Nakuru','Meru','Uasin Gishu','Kajiado','Nyandarua','Kericho','Kakamega','Kisumu'];
const CROP_TYPES = ['Maize','Tomatoes','Potatoes','Onions','Cabbage','Spinach','Carrots','Beans','Pineapple','Avocado'];

const FALLBACK_PRODUCTS = [
  { id: 101, name: 'Fresh Yellow Bananas', farmer: 'Njoroge K.', county: 'Kisii', price: '60', unit: '/kg', verified: true, lowStock: false, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80' },
  { id: 102, name: 'Crisp Red Apples', farmer: 'Wanjiku F.', county: 'Meru', price: '150', unit: '/kg', verified: true, lowStock: false, image: 'https://images.unsplash.com/photo-1560806e614c9db59230ddd5586400233?w=500&q=80' },
  { id: 103, name: 'Sweet Ripe Mangoes', farmer: 'Mutua J.', county: 'Machakos', price: '120', unit: '/kg', verified: false, lowStock: true, image: 'https://images.unsplash.com/photo-1545470348-d5e4b1b17b6c?w=500&q=80' },
  { id: 104, name: 'Juicy Oranges', farmer: 'Akinyi O.', county: 'Kisumu', price: '80', unit: '/kg', verified: true, lowStock: false, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b5a?w=500&q=80' },
];

const SidebarContent = ({ pendingFilters, setPending, toggleFilter, applyFilters }) => (
  <div className="flex flex-col gap-6 h-full">
    <h2 className="text-headline-md text-ag-body">Filter Listings</h2>

    {/* Crop Type */}
    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">Crop Type</h3>
      <div className="flex flex-col gap-2">
        {CROP_TYPES.map(c => (
          <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={pendingFilters.crops.includes(c)} onChange={() => toggleFilter('crops', c)} className="w-4 h-4 accent-ag-primary rounded" />
            <span className="text-sm font-bold text-ag-body group-hover:text-ag-primary transition-colors">{c}</span>
          </label>
        ))}
      </div>
    </div>

    {/* County */}
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

    {/* Price Range */}
    <div>
      <h3 className="text-label-bold text-ag-muted uppercase tracking-widest mb-3 text-xs">Price Range (KSh/kg)</h3>
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

    {/* Verified Toggle */}
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

    {/* Apply Button */}
    <div className="mt-auto pt-4 border-t border-ag-border sticky bottom-0 bg-white pb-2">
      <button onClick={applyFilters} className="btn-primary w-full">Apply Filters</button>
      <button onClick={() => { setPending({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false }); }} className="btn-tertiary w-full mt-2 text-center">Clear All</button>
    </div>
  </div>
);

const Market = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('relevance');
  const [filters, setFilters]           = useState({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false });
  const [pendingFilters, setPending]    = useState({ counties: [], crops: [], minPrice: '', maxPrice: '', verifiedOnly: false });
  const [activeChips, setActiveChips]   = useState([]);
  const [cartItems, setCartItems]       = useState([]);
  const [sidebarOpen, setSidebarOpen]   = useState(false); // mobile
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [logistics, setLogistics]       = useState({ pickup: '', destination: '' });

  useEffect(() => {
    api.get('/products')
      .then(r => { setProducts(r.data && r.data.length > 0 ? r.data : FALLBACK_PRODUCTS); setLoading(false); })
      .catch(() => { setProducts(FALLBACK_PRODUCTS); setLoading(false); });
  }, []);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const logisticsPrice = (logistics.pickup && logistics.destination) ? 1200 : 0; // Simulated flat rate or calculated

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
    const next = activeChips.filter(c => c !== chip);
    setActiveChips(next);
    setFilters(prev => {
      const updated = { ...prev };
      if (prev.counties.includes(chip)) updated.counties = prev.counties.filter(c => c !== chip);
      if (prev.crops.includes(chip)) updated.crops = prev.crops.filter(c => c !== chip);
      if (chip === 'Verified Only') updated.verifiedOnly = false;
      return updated;
    });
  };

  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.farmer.toLowerCase().includes(q)) return false;
      if (filters.counties.length && !filters.counties.includes(p.county)) return false;
      if (filters.crops.length && !filters.crops.some(c => p.name.toLowerCase().includes(c.toLowerCase()))) return false;
      if (filters.minPrice && parseFloat(p.price) < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && parseFloat(p.price) > parseFloat(filters.maxPrice)) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });



  return (
    <div className="flex min-h-screen bg-ag-canvas">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-sidebar shrink-0 border-r border-ag-border bg-white px-6 py-8 flex-col sticky top-0 h-screen overflow-y-auto">
        <SidebarContent
          pendingFilters={pendingFilters}
          setPending={setPending}
          toggleFilter={toggleFilter}
          applyFilters={applyFilters}
        />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full px-6 py-8 overflow-y-auto flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-ag-muted"><X className="w-5 h-5" /></button>
            <SidebarContent
              pendingFilters={pendingFilters}
              setPending={setPending}
              toggleFilter={toggleFilter}
              applyFilters={applyFilters}
            />
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col">
        {/* Sticky search bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-ag-border px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 text-sm font-bold border-2 border-ag-border rounded-btn px-3 py-2.5 text-ag-body hover:border-ag-primary transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search crops, farmer names..."
                className="form-input pl-10 !py-2.5"
              />
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input !py-2.5 pr-8 appearance-none min-w-[160px] bg-ag-card cursor-pointer">
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Sort: Price ↑</option>
                <option value="price_desc">Sort: Price ↓</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-muted pointer-events-none" />
            </div>

            {/* Cart */}
            <button onClick={() => setCheckoutOpen(true)} className="relative p-2.5 border-2 border-ag-border rounded-btn hover:border-ag-primary transition-colors">
              <ShoppingCart className="w-5 h-5 text-ag-body" />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-ag-amber text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeChips.map(chip => (
                <span key={chip} className="flex items-center gap-1.5 bg-ag-primary-fixed text-ag-primary text-xs font-bold px-3 py-1 rounded-full">
                  {chip}
                  <button onClick={() => removeChip(chip)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="px-6 lg:px-8 py-6 flex-1">
          <p className="text-sm font-bold text-ag-muted mb-6">
            Showing <span className="text-ag-body">{filteredProducts.length}</span> listings
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="ag-card p-0 animate-pulse">
                  <div className="h-48 bg-ag-surface rounded-t-card" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-ag-surface rounded w-3/4" />
                    <div className="h-3 bg-ag-surface rounded w-1/2" />
                    <div className="h-8 bg-ag-surface rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl mb-2">🌾</p>
              <p className="text-headline-md text-ag-muted">No listings match your filters</p>
              <p className="text-sm text-ag-muted mt-2">Try adjusting your search or clearing some filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="ag-card p-0 overflow-hidden flex flex-col hover:border-ag-primary transition-colors group">
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.verified && <span className="chip-verified">✓ Verified</span>}
                      {product.lowStock && <span className="chip-low-stock">Low Stock</span>}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-ag-muted text-xs mb-1.5">
                      <MapPin className="w-3 h-3" />
                      <span className="font-bold">{product.county}</span>
                    </div>
                    <h3 className="font-extrabold text-ag-body text-base mb-0.5">{product.name}</h3>
                    <p className="text-xs text-ag-muted mb-3">Farmer: {product.farmer}</p>
                    <p className="text-ag-amber font-extrabold text-2xl mb-5">
                      KSh {product.price}<span className="text-sm font-normal text-ag-muted">{product.unit}</span>
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary w-full !py-3 !text-sm mt-auto"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ── CHECKOUT MODAL ── */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg overflow-hidden flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-headline-md text-ag-body">Checkout ({cartCount} items)</h2>
              <button onClick={() => { setCheckoutOpen(false); setCheckoutStep(1); }} className="text-ag-muted hover:text-ag-body">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {cartCount === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ag-muted">Your cart is empty.</p>
                  <button onClick={() => setCheckoutOpen(false)} className="btn-primary mt-4">Browse Market</button>
                </div>
              ) : checkoutStep === 1 ? (
                <div className="flex flex-col gap-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-card object-cover bg-ag-canvas" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-ag-muted">Qty: {item.qty} {item.unit}</p>
                      </div>
                      <p className="font-extrabold text-ag-amber text-sm">KSh {parseFloat(item.price) * item.qty}</p>
                    </div>
                  ))}
                  <div className="border-t border-ag-border mt-2 pt-4 flex justify-between font-extrabold text-lg">
                    <span>Subtotal:</span>
                    <span>KSh {cartTotal}</span>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="btn-primary w-full mt-2">Proceed to Logistics →</button>
                </div>
              ) : checkoutStep === 2 ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Pickup Location (Farm)</label>
                    <select value={logistics.pickup} onChange={e => setLogistics(p => ({ ...p, pickup: e.target.value }))} className="form-input">
                      <option value="">Select County...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Destination (Buyer)</label>
                    <select value={logistics.destination} onChange={e => setLogistics(p => ({ ...p, destination: e.target.value }))} className="form-input">
                      <option value="">Select County...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {logistics.pickup && logistics.destination && (
                    <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-4 mt-2">
                      <h4 className="text-ag-primary-fixed font-bold text-sm mb-2">Transport Allocation Found ✅</h4>
                      <p className="text-white text-xs mb-1">Driver: <strong>David Ochieng</strong></p>
                      <p className="text-white text-xs mb-1">Vehicle: <strong>KCA 123Z (Isuzu FRR)</strong></p>
                      <div className="border-t border-white/20 mt-3 pt-3 flex justify-between font-extrabold text-white text-sm">
                        <span>Logistics Cost:</span>
                        <span>KSh {logisticsPrice}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-ag-border mt-4 pt-4 flex justify-between font-extrabold text-xl text-ag-body">
                    <span>Total Amount:</span>
                    <span>KSh {cartTotal + logisticsPrice}</span>
                  </div>
                  
                  <button 
                    disabled={!logistics.pickup || !logistics.destination} 
                    onClick={() => { alert('Payment successful! Order and transport dispatched.'); setCartItems([]); setCheckoutOpen(false); setCheckoutStep(1); }} 
                    className={`btn-pay w-full mt-2 ${(!logistics.pickup || !logistics.destination) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Pay via M-PESA
                  </button>
                  <button onClick={() => setCheckoutStep(1)} className="btn-tertiary w-full mt-1">← Back to Cart</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
