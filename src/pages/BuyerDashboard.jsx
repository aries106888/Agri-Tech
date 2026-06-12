import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Truck, Package, Clock, MapPin, X, CheckCircle, CheckCircle2,
  Plus, Heart, ShoppingCart, Minus, Settings, Map, Trash2, Phone,
  ArrowRight, ArrowLeft, Loader2, Star
} from 'lucide-react';

/* ─── produce that actually has images ─── */
const SHOP_PRODUCTS = [
  { id: 1,  name: 'Irish Potatoes',      farmer: 'Mwangi J.',  county: 'Nakuru',      price: 45,  unit: '/kg',    image: '/images/potatoes.png',  badge: 'VERIFIED'  },
  { id: 2,  name: 'Grade A Tomatoes',    farmer: 'Sarah K.',   county: 'Kiambu',      price: 80,  unit: '/kg',    image: '/images/tomatoes.png',  badge: 'LOW STOCK' },
  { id: 3,  name: 'Sweet Green Maize',   farmer: 'Kibet E.',   county: 'Uasin Gishu', price: 25,  unit: '/pc',    image: '/images/maize.png',     badge: 'VERIFIED'  },
  { id: 4,  name: 'Red Onions',          farmer: 'Agnes L.',   county: 'Kajiado',     price: 120, unit: '/kg',    image: '/images/onions.png',    badge: 'VERIFIED'  },
  { id: 5,  name: 'Fresh Green Cabbage', farmer: 'Otieno M.',  county: 'Kericho',     price: 35,  unit: '/kg',    image: '/images/cabbage.png',   badge: 'VERIFIED'  },
  { id: 6,  name: 'Organic Spinach',     farmer: 'Wanjiru A.', county: 'Kiambu',      price: 40,  unit: '/bunch', image: '/images/spinach.png',   badge: 'LOW STOCK' },
  { id: 7,  name: 'Farm Carrots',        farmer: 'Kamau D.',   county: 'Nyandarua',   price: 55,  unit: '/kg',    image: '/images/carrots.png',   badge: null        },
  { id: 8,  name: 'Yellow Wax Beans',    farmer: 'Chebet R.',  county: 'Meru',        price: 70,  unit: '/kg',    image: '/images/beans.png',     badge: 'VERIFIED'  },
  { id: 9,  name: 'Sweet Pineapple',     farmer: 'Oduya F.',   county: 'Kisumu',      price: 90,  unit: '/pc',    image: 'https://images.unsplash.com/photo-1587883012610-e3df17d41270?w=400&q=80', badge: 'VERIFIED' },
  { id: 10, name: 'Hass Avocado',        farmer: 'Njoroge P.', county: "Murang'a",    price: 15,  unit: '/pc',    image: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=400&q=80', badge: 'LOW STOCK'},
];

const COUNTIES = ['Nairobi','Kiambu','Nakuru','Meru','Uasin Gishu','Kajiado','Kisumu','Machakos','Nyandarua','Kericho'];

const INITIAL_ORDERS = [
  { id: 1, crop: 'Irish Potatoes',   farmer: 'Mwangi J.', county: 'Nakuru', qty: '50kg', amount: 2250, status: 'in_transit' },
  { id: 2, crop: 'Grade A Tomatoes', farmer: 'Sarah K.',  county: 'Kiambu', qty: '20kg', amount: 1600, status: 'completed'  },
  { id: 3, crop: 'Red Onions',       farmer: 'Agnes L.',  county: 'Kajiado',qty: '30kg', amount: 3600, status: 'pending'    },
];

const chipClass = (s) => ({
  in_transit: 'chip-transit',
  completed:  'chip-completed',
  pending:    'chip-pending',
  cancelled:  'bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full',
})[s] || 'chip-pending';

/* ══════════════════════════════════════════════════════ */
const BuyerDashboard = () => {
  const location    = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [orders, setOrders]           = useState(INITIAL_ORDERS);
  const [cartItems, setCartItems]     = useState([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [modal, setModal]             = useState(null); // 'checkout' | 'cancel'
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState('');
  const [logistics, setLogistics]     = useState({ pickup: '', destination: '' });
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [phone, setPhone]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').phone || ''; } catch { return ''; }
  });
  const [mpesaState, setMpesaState]   = useState('idle'); // idle | sending | success

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ── cart helpers ── */
  const addToCart = (product) => {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    showToast(`✅ ${product.name} added to cart!`);
    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const logisticsFee = logistics.pickup && logistics.destination ? 1200 : 0;

  /* ── M-PESA simulation ── */
  const sendMpesa = async () => {
    setMpesaState('sending');
    await new Promise(r => setTimeout(r, 2800));
    setMpesaState('success');
    // after success: add orders + clear cart
    setTimeout(() => {
      const newOrders = cartItems.map((item, idx) => ({
        id: Date.now() + idx,
        crop: item.name, farmer: item.farmer, county: item.county,
        qty: `${item.qty}${item.unit.replace('/', '')}`,
        amount: item.price * item.qty,
        status: 'pending',
      }));
      setOrders(prev => [...newOrders, ...prev]);
      setCartItems([]);
      setCartOpen(false);
      setModal(null);
      setCheckoutStep(1);
      setMpesaState('idle');
      setLogistics({ pickup: '', destination: '' });
      showToast('🎉 Payment confirmed! Order placed successfully.');
    }, 3000);
  };

  const cancelOrder = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    showToast('Order cancelled.');
    setModal(null);
  };

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders',  value: orders.length + 21 },
    { icon: Truck,        label: 'In Transit',    value: orders.filter(o => o.status === 'in_transit').length },
    { icon: Package,      label: 'Completed',     value: orders.filter(o => o.status === 'completed').length + 21 },
    { icon: Clock,        label: 'Pending',       value: orders.filter(o => o.status === 'pending').length },
  ];

  /* ═══════════════ SUB-PAGES ═══════════════ */
  if (currentPath === 'orders') {
    return (
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">All My Orders</h2>
        </div>
        <div className="divide-y divide-ag-border">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                  {order.crop.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Farmer: {order.farmer} · {order.qty}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-ag-muted">
                    <MapPin className="w-3 h-3" /> {order.county}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-ag-amber font-extrabold text-sm">KSh {order.amount.toLocaleString()}</span>
                <span className={chipClass(order.status)}>{order.status.replace('_', ' ')}</span>
                {order.status === 'pending' && (
                  <button onClick={() => { setSelected(order); setModal('cancel'); }} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {modal === 'cancel' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <h3 className="font-extrabold text-ag-body text-lg mb-2">Cancel Order?</h3>
              <p className="text-sm text-ag-muted mb-4">Cancel your order of <strong>{selected.crop}</strong> from {selected.farmer}?</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Keep It</button>
                <button onClick={() => cancelOrder(selected.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-btn text-sm">Cancel Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === 'deliveries') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-headline-md text-ag-body flex items-center gap-2"><Map className="w-6 h-6 text-ag-primary" /> Delivery Tracking</h2>
        <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-6">
          <p className="text-ag-primary-fixed font-bold text-sm mb-2">1 Active Delivery</p>
          <p className="text-white text-xs mb-1">Driver: <strong>David Ochieng</strong> (0712 345 678)</p>
          <p className="text-white text-xs mb-1">Vehicle: <strong>KCA 123Z (Isuzu FRR)</strong></p>
          <p className="text-white text-xs mb-1">Route: <strong>Nakuru → Nairobi CBD</strong></p>
          <div className="mt-4 bg-white/10 rounded-btn h-2 w-full overflow-hidden">
            <div className="bg-ag-primary-fixed h-full w-2/3" />
          </div>
          <p className="text-xs font-bold text-white mt-2 text-right">65% complete (ETA: 45 mins)</p>
        </div>
      </div>
    );
  }

  if (currentPath === 'settings') {
    return (
      <div className="bg-white border border-ag-border rounded-card p-8 max-w-2xl">
        <h2 className="text-headline-md text-ag-body mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-ag-primary" /> Buyer Settings</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Business Name</label>
            <input type="text" defaultValue="Naivas Ltd" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Default Delivery Location</label>
            <input type="text" defaultValue="Nairobi CBD, Tom Mboya St" className="form-input" />
          </div>
          <button onClick={() => alert('Settings saved!')} className="btn-primary w-fit mt-2">Save Settings</button>
        </div>
      </div>
    );
  }

  /* ═══════════════ MAIN DASHBOARD ═══════════════ */
  return (
    <div className="flex flex-col gap-6 relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-ag-primary text-white px-5 py-3 rounded-card shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce-once">
          <CheckCircle className="w-4 h-4 shrink-0" /> {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="ag-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</span>
              <div className="w-9 h-9 bg-ag-surface rounded-btn flex items-center justify-center">
                <Icon className="w-4 h-4 text-ag-primary" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ag-body">{value}</p>
          </div>
        ))}
      </div>

      {/* ── SHOP SECTION ── */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <div>
            <h2 className="text-headline-md text-ag-body">Shop Fresh Produce</h2>
            <p className="text-xs text-ag-muted mt-0.5">Direct from verified Kenyan farms</p>
          </div>
          {/* Cart floating button */}
          <button
            id="buyer-cart-btn"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 btn-primary !min-h-0 !py-2.5 !px-4 !text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            My Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-ag-amber text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 p-6">
          {SHOP_PRODUCTS.map(product => {
            const inCart = cartItems.find(i => i.id === product.id);
            return (
              <div
                key={product.id}
                className={`border-2 rounded-card overflow-hidden flex flex-col hover:shadow-lg transition-all group ${
                  inCart ? 'border-ag-primary shadow-sm' : 'border-ag-border'
                }`}
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden bg-ag-canvas">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      product.badge === 'VERIFIED' ? 'chip-verified' : 'chip-low-stock'
                    }`}>
                      {product.badge === 'VERIFIED' ? '✓ Verified' : 'Low Stock'}
                    </span>
                  )}
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-ag-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ×{inCart.qty}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1 gap-1.5">
                  <p className="font-extrabold text-sm text-ag-body leading-tight">{product.name}</p>
                  <p className="text-[11px] text-ag-muted">{product.farmer} · {product.county}</p>
                  <p className="font-extrabold text-ag-amber text-base">
                    KSh {product.price}<span className="text-xs font-normal text-ag-muted">{product.unit}</span>
                  </p>

                  {/* Add / Qty control */}
                  {inCart ? (
                    <div className="flex items-center gap-1 mt-auto border-2 border-ag-primary rounded-btn overflow-hidden">
                      <button
                        onClick={() => updateQty(product.id, -1)}
                        className="flex-1 py-1.5 flex items-center justify-center text-ag-primary hover:bg-ag-canvas transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-extrabold text-sm text-ag-primary px-1">{inCart.qty}</span>
                      <button
                        onClick={() => updateQty(product.id, +1)}
                        className="flex-1 py-1.5 flex items-center justify-center text-ag-primary hover:bg-ag-canvas transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`add-cart-${product.id}`}
                      onClick={() => addToCart(product)}
                      className="btn-primary !min-h-0 !py-2 !text-xs mt-auto flex items-center gap-1 justify-center w-full"
                    >
                      <Plus className="w-3 h-3" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">My Orders</h2>
          <Link to="/market" className="btn-tertiary !text-xs">Browse Market →</Link>
        </div>
        <div className="divide-y divide-ag-border">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                  {order.crop.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Farmer: {order.farmer} · {order.qty}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-ag-muted">
                    <MapPin className="w-3 h-3" /> {order.county}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-ag-amber font-extrabold text-sm">KSh {order.amount.toLocaleString()}</span>
                <span className={chipClass(order.status)}>{order.status.replace('_', ' ')}</span>
                {order.status === 'pending' && (
                  <button onClick={() => { setSelected(order); setModal('cancel'); }} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring order promo */}
      <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-ag-primary-fixed" />
          <p className="text-ag-primary-fixed font-bold text-sm">Need Regular Supply?</p>
        </div>
        <p className="text-white/60 text-xs">Set up weekly recurring orders from your favourite farmers and save 5% per order.</p>
        <button onClick={() => showToast('Recurring order feature coming soon!')} className="btn-primary !min-h-0 !py-2.5 !text-sm w-fit">
          Set Up Recurring Order
        </button>
      </div>

      {/* ══════════════ SLIDE-IN CART PANEL ══════════════ */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[80] flex justify-end"
          onClick={e => e.target === e.currentTarget && setCartOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-ag-border"
            style={{ animation: 'slideInRight .25s ease' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-ag-primary">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white" />
                <h2 className="font-extrabold text-white text-base">My Cart ({cartCount} items)</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
                  <Package className="w-14 h-14 text-ag-border" />
                  <p className="font-bold text-ag-muted text-sm">Your cart is empty</p>
                  <p className="text-xs text-ag-muted">Click "Add to Cart" on any produce above</p>
                  <button onClick={() => setCartOpen(false)} className="btn-primary mt-2 !py-2 !px-5 !text-sm">
                    Browse Produce
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-ag-canvas rounded-card p-3 border border-ag-border">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-ag-border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-ag-body truncate">{item.name}</p>
                      <p className="text-xs text-ag-muted">{item.county} · {item.farmer}</p>
                      <p className="text-ag-amber font-extrabold text-sm mt-0.5">
                        KSh {item.price * item.qty}
                        <span className="text-xs font-normal text-ag-muted ml-1">({item.price}{item.unit} × {item.qty})</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-0.5 border-2 border-ag-border rounded-btn overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-ag-muted hover:bg-ag-canvas hover:text-ag-primary transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ag-body">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, +1)} className="w-7 h-7 flex items-center justify-center text-ag-muted hover:bg-ag-canvas hover:text-ag-primary transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-5 py-4 border-t border-ag-border bg-white">
                <div className="flex justify-between text-sm font-bold text-ag-muted mb-1">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="text-ag-body">KSh {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-ag-muted mb-3">
                  <span>Logistics fee</span>
                  <span>calculated at checkout</span>
                </div>
                <button
                  onClick={() => { setModal('checkout'); setCheckoutStep(1); setCartOpen(false); }}
                  className="btn-pay w-full !text-base flex items-center justify-center gap-2"
                >
                  Checkout via M-PESA <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => { setCartItems([]); }} className="btn-tertiary w-full mt-2 text-center text-sm">
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ CHECKOUT MODAL (3 steps) ══════════════ */}
      {modal === 'checkout' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">

            {/* Header */}
            <div className="px-6 py-4 border-b border-ag-border bg-ag-primary flex items-center justify-between sticky top-0">
              <div>
                <h2 className="font-extrabold text-white text-base">
                  {checkoutStep === 1 && '🛒 Review Order'}
                  {checkoutStep === 2 && '🚚 Logistics & Delivery'}
                  {checkoutStep === 3 && '📱 M-PESA Payment'}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">Step {checkoutStep} of 3</p>
              </div>
              <button onClick={() => { setModal(null); setCheckoutStep(1); setMpesaState('idle'); }} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex h-1">
              <div className="h-full bg-ag-primary transition-all duration-500" style={{ width: `${(checkoutStep / 3) * 100}%` }} />
              <div className="flex-1 bg-ag-border" />
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">

              {/* ── STEP 1: Review ── */}
              {checkoutStep === 1 && (
                <>
                  <div className="flex flex-col gap-3">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-ag-canvas rounded-card p-3 border border-ag-border">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-ag-border shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-ag-muted">{item.farmer} · {item.county}</p>
                          <p className="text-xs text-ag-muted">Qty: {item.qty} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-ag-amber text-sm">KSh {item.price * item.qty}</p>
                          <div className="flex items-center gap-0.5 mt-1 border border-ag-border rounded-btn overflow-hidden">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-ag-muted hover:bg-ag-canvas">
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, +1)} className="w-6 h-6 flex items-center justify-center text-ag-muted hover:bg-ag-canvas">
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 ml-1 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-ag-border pt-4 flex justify-between font-extrabold text-lg text-ag-body">
                    <span>Subtotal</span>
                    <span>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="btn-pay w-full flex items-center justify-center gap-2">
                    Continue to Logistics <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setModal(null); setCartOpen(true); }} className="btn-tertiary w-full flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
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
                        <h4 className="text-white font-extrabold text-sm">Transport Allocated ✅</h4>
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
                      <h3 className="font-extrabold text-xl text-ag-body">Payment Received! 🎉</h3>
                      <p className="text-ag-muted text-sm">Your order is confirmed and transport dispatched.</p>
                      <div className="bg-ag-canvas rounded-card p-4 w-full text-left border border-ag-border">
                        <p className="text-xs text-ag-muted mb-1">Amount Paid</p>
                        <p className="font-extrabold text-2xl text-ag-primary">KSh {(cartTotal + logisticsFee).toLocaleString()}</p>
                        <p className="text-xs text-ag-muted mt-2">M-PESA confirmation sent to {phone}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-card p-4">
                        <p className="font-bold text-green-800 text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" /> M-PESA STK Push
                        </p>
                        <p className="text-xs text-green-700 mt-1">You'll receive a push notification on your phone to enter your M-PESA PIN.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-ag-body mb-1.5">M-PESA Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                          <input
                            id="buyer-mpesa-phone"
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

                      <div className="flex gap-3">
                        <button onClick={() => setCheckoutStep(2)} className="btn-tertiary flex items-center gap-2 px-4">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          id="buyer-mpesa-pay-btn"
                          disabled={!phone || mpesaState === 'sending'}
                          onClick={sendMpesa}
                          className={`btn-pay flex-1 flex items-center justify-center gap-2 ${(!phone || mpesaState === 'sending') ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {mpesaState === 'sending' ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending STK Push...</>
                          ) : (
                            <>📱 Send M-PESA Request</>
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

      {/* ── MODAL: Cancel Order ── */}
      {modal === 'cancel' && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <h3 className="font-extrabold text-ag-body text-lg mb-2">Cancel Order?</h3>
            <p className="text-sm text-ag-muted mb-4">Cancel your order of <strong>{selected.crop}</strong> from {selected.farmer}?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Keep It</button>
              <button onClick={() => cancelOrder(selected.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-btn text-sm">Cancel Order</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;
