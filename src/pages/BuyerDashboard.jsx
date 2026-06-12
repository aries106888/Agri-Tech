import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Truck, Package, Clock, MapPin, X, CheckCircle, Plus, Heart, ShoppingCart, Minus, Settings, Map } from 'lucide-react';

const SHOP_PRODUCTS = [
  { id: 1, name: 'Fresh Yellow Bananas', farmer: 'Njoroge K.', county: 'Kisii',      price: 60,  unit: '/kg',    image: '/images/banana.png'  },
  { id: 2, name: 'Crisp Red Apples',     farmer: 'Wanjiku F.', county: 'Meru',       price: 150, unit: '/kg',    image: '/images/apple.png'   },
  { id: 3, name: 'Sweet Ripe Mangoes',   farmer: 'Mutua J.',   county: 'Machakos',   price: 120, unit: '/kg',    image: '/images/mango.png'   },
  { id: 4, name: 'Juicy Oranges',        farmer: 'Akinyi O.',  county: 'Kisumu',     price: 80,  unit: '/kg',    image: '/images/orange.png'  },
  { id: 5, name: 'Irish Potatoes',       farmer: 'Mwangi J.', county: 'Nakuru',     price: 45,  unit: '/kg',    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
  { id: 6, name: 'Grade A Tomatoes',     farmer: 'Sarah K.',  county: 'Kiambu',     price: 80,  unit: '/kg',    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=400&q=80' },
];

const COUNTIES = ['Nairobi', 'Kiambu', 'Nakuru', 'Meru', 'Uasin Gishu', 'Kajiado', 'Kisumu', 'Machakos'];

const INITIAL_ORDERS = [
  { id: 1, crop: 'Irish Potatoes', farmer: 'Mwangi J.', county: 'Nakuru', qty: '50kg', amount: 2250, status: 'in_transit' },
  { id: 2, crop: 'Grade A Tomatoes', farmer: 'Sarah K.', county: 'Kiambu', qty: '20kg', amount: 1600, status: 'completed' },
  { id: 3, crop: 'Red Onions', farmer: 'Agnes L.', county: 'Kajiado', qty: '30kg', amount: 3600, status: 'pending' },
];

const chipClass = (s) => ({ in_transit: 'chip-transit', completed: 'chip-completed', pending: 'chip-pending' })[s] || 'chip-pending';

const BuyerDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [orders, setOrders]       = useState(INITIAL_ORDERS);
  const [cartItems, setCartItems] = useState([]);
  const [modal, setModal]         = useState(null); // 'cart' | 'checkout' | 'cancel' | 'farmers'
  const [selected, setSelected]   = useState(null);
  const [toast, setToast]         = useState('');
  const [logistics, setLogistics] = useState({ pickup: '', destination: '' });
  const [checkoutStep, setCheckoutStep] = useState(1);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart!`);
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const logisticsPrice = logistics.pickup && logistics.destination ? 1200 : 0;

  const placeOrder = () => {
    const newOrders = cartItems.map((item, idx) => ({
      id: Date.now() + idx,
      crop: item.name,
      farmer: item.farmer,
      county: item.county,
      qty: `${item.qty}kg`,
      amount: item.price * item.qty,
      status: 'pending',
    }));
    setOrders(prev => [...newOrders, ...prev]);
    setCartItems([]);
    setModal(null);
    setCheckoutStep(1);
    setLogistics({ pickup: '', destination: '' });
    showToast('Order placed! Logistics team notified for delivery.');
  };

  const cancelOrder = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    showToast('Order cancelled.');
    setModal(null);
  };

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders',    value: orders.length + 21 },
    { icon: Truck,        label: 'In Transit',      value: orders.filter(o => o.status === 'in_transit').length },
    { icon: Package,      label: 'Completed',       value: orders.filter(o => o.status === 'completed').length + 21 },
    { icon: Clock,        label: 'Pending',         value: orders.filter(o => o.status === 'pending').length },
  ];

  if (currentPath === 'orders') {
    return (
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">All My Orders</h2>
        </div>
        <div className="divide-y divide-ag-border">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4">
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
        {/* Cancel Modal logic reuse here if needed */}
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

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
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
          <h2 className="text-headline-md text-ag-body">Shop Fresh Produce</h2>
          <button onClick={() => setModal('cart')} className="relative btn-primary !min-h-0 !py-2.5 !px-4 !text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-ag-amber text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          {SHOP_PRODUCTS.map(product => (
            <div key={product.id} className="border border-ag-border rounded-card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <img src={product.image} alt={product.name} className="w-full h-36 object-cover bg-ag-canvas" />
              <div className="p-3 flex flex-col flex-1 gap-2">
                <p className="font-bold text-sm text-ag-body">{product.name}</p>
                <p className="text-xs text-ag-muted">{product.farmer} · {product.county}</p>
                <p className="font-extrabold text-ag-amber">KSh {product.price}<span className="text-xs font-normal text-ag-muted">{product.unit}</span></p>
                <button onClick={() => addToCart(product)} className="btn-primary !min-h-0 !py-2 !text-xs mt-auto flex items-center gap-1 justify-center">
                  <Plus className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
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

      {/* Saved Farmers */}
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

      {/* ── MODAL: Cart ── */}
      {modal === 'cart' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border sticky top-0 bg-white">
              <h3 className="font-extrabold text-ag-body">Your Cart ({cartCount} items)</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {cartCount === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-ag-muted mx-auto mb-3" />
                  <p className="text-ag-muted font-bold">Your cart is empty.</p>
                  <button onClick={() => setModal(null)} className="btn-primary mt-4">Browse Products</button>
                </div>
              ) : (
                <>
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-card object-cover bg-ag-canvas shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-ag-muted">KSh {item.price}{item.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border-2 border-ag-border flex items-center justify-center hover:border-ag-primary transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border-2 border-ag-border flex items-center justify-center hover:border-ag-primary transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-extrabold text-ag-amber text-sm w-20 text-right">KSh {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="border-t border-ag-border pt-4 flex justify-between font-extrabold text-lg">
                    <span>Subtotal:</span><span>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={() => { setModal('checkout'); setCheckoutStep(1); }} className="btn-primary w-full">
                    Proceed to Checkout →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Checkout ── */}
      {modal === 'checkout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border sticky top-0 bg-white">
              <h3 className="font-extrabold text-ag-body">Checkout — Step {checkoutStep} of 2</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {checkoutStep === 1 && (
                <>
                  <h4 className="font-bold text-ag-body">Order Summary</h4>
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-card object-cover bg-ag-canvas shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-ag-muted">Qty: {item.qty} · {item.farmer}</p>
                      </div>
                      <p className="font-extrabold text-ag-amber text-sm">KSh {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="border-t border-ag-border pt-3 flex justify-between font-extrabold text-base">
                    <span>Subtotal</span><span>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="btn-primary w-full">Set Delivery Details →</button>
                  <button onClick={() => setModal('cart')} className="btn-tertiary w-full text-sm">← Back to Cart</button>
                </>
              )}

              {checkoutStep === 2 && (
                <>
                  <h4 className="font-bold text-ag-body flex items-center gap-2"><Truck className="w-4 h-4" /> Logistics & Delivery</h4>
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Pickup County (Farm Location)</label>
                    <select value={logistics.pickup} onChange={e => setLogistics(p => ({ ...p, pickup: e.target.value }))} className="form-input">
                      <option value="">Select county...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Delivery Destination</label>
                    <select value={logistics.destination} onChange={e => setLogistics(p => ({ ...p, destination: e.target.value }))} className="form-input">
                      <option value="">Select county...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {logistics.pickup && logistics.destination && (
                    <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-4">
                      <p className="text-ag-primary-fixed font-bold text-sm mb-2">Driver Allocated ✅</p>
                      <p className="text-white text-xs mb-1">Driver: <strong>David Ochieng</strong></p>
                      <p className="text-white text-xs mb-1">Vehicle: <strong>KCA 123Z (Isuzu FRR)</strong></p>
                      <p className="text-white text-xs mb-1">Route: <strong>{logistics.pickup} → {logistics.destination}</strong></p>
                      <div className="border-t border-white/20 mt-3 pt-3 flex justify-between font-extrabold text-white text-sm">
                        <span>Logistics:</span><span>KSh {logisticsPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-ag-border pt-3 space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-ag-muted">Products</span><span>KSh {cartTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-ag-muted">Logistics</span><span>KSh {logisticsPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between font-extrabold text-lg border-t border-ag-border pt-2 mt-2">
                      <span>Total</span><span>KSh {(cartTotal + logisticsPrice).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    disabled={!logistics.pickup || !logistics.destination}
                    onClick={placeOrder}
                    className={`btn-pay w-full ${(!logistics.pickup || !logistics.destination) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Confirm & Pay via M-PESA
                  </button>
                  <button onClick={() => setCheckoutStep(1)} className="btn-tertiary w-full text-sm">← Back to Summary</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Cancel Order ── */}
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
};

export default BuyerDashboard;
