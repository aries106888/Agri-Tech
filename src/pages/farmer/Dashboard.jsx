import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletView from '../shared/WalletView';
import {
  TrendingUp, Package, Clock, BarChart2, Pencil,
  CheckCircle2, Truck, X, CheckCircle, Settings, Wallet, AlertCircle, Phone,
  MapPin, ArrowRight, ArrowLeft, CalendarDays
} from 'lucide-react';

const INITIAL_LISTINGS = [
  { id: 1, crop: 'Grade A Maize', qty: '50 Bags', price: 'KSh 4,100/bag', harvested: '12 Oct', status: 'verified' },
  { id: 2, crop: 'Red Onions',    qty: '200 Kg',  price: 'KSh 105/kg',    harvested: 'Bulk Grade', status: 'verified' },
  { id: 3, crop: 'Kienyeji Eggs', qty: '15 Crates', price: 'KSh 450/crate', harvested: 'Organic Farm', status: 'pending' },
  { id: 4, crop: 'Leafy Spinach', qty: '80 Bunches', price: 'KSh 30/bunch', harvested: '8 Oct', status: 'sold_out' },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, crop: 'Maize (Grade A)',  buyer: 'Naivas Ltd',     amount: 41000, date: '9 Jun 2026', status: 'completed' },
  { id: 2, crop: 'Red Onions',       buyer: 'Janet Wanjiku',  amount: 12600, date: '8 Jun 2026', status: 'in_transit' },
  { id: 3, crop: 'Kienyeji Eggs',    buyer: 'Quickmart Nrb',  amount: 6750,  date: '7 Jun 2026', status: 'pending' },
  { id: 4, crop: 'Sweet Corn',       buyer: 'David Ochieng',  amount: 9200,  date: '5 Jun 2026', status: 'completed' },
];

const statusChip = (status) => {
  const map = {
    verified:   <span className="chip-verified">Verified</span>,
    pending:    <span className="chip-pending">Pending</span>,
    sold_out:   <span className="chip-sold-out">Sold Out</span>,
    completed:  <span className="chip-completed">Completed</span>,
    in_transit: <span className="chip-transit">In Transit</span>,
  };
  return map[status] || null;
};

const FarmerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/').pop();
  const [walletBalance, setWalletBalance] = useState(34200);
  const [listings] = useState(INITIAL_LISTINGS);
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [modal, setModal] = useState(null); // 'withdraw' | 'transactions' | 'archive' | 'delivery' | 'edit_listing'
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const [phone, setPhone] = useState('0712 345 678');

  // Delivery request state
  const [deliveryStep, setDeliveryStep] = useState(1); // 1=configure, 2=confirm, 3=success
  const [deliveryForm, setDeliveryForm] = useState({
    listing: '', truckType: 'pickup', pickupCounty: '', destCounty: '',
    pickupDate: '', weight: '', notes: '', urgency: 'standard'
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleWithdraw = () => {
    showToast(`KSh ${walletBalance.toLocaleString()} withdrawal initiated to ${phone}!`);
    setWalletBalance(0);
    setModal(null);
  };


  const saveListing = (e) => {
    e.preventDefault();
    showToast('Listing updated successfully.');
    setModal(null);
  };

  const stats = [
    { icon: TrendingUp, label: 'Total Sales',       value: `KSh ${transactions.filter(t=>t.status==='completed').reduce((a,b)=>a+b.amount,0).toLocaleString()}`, sub: '+12% this month',  color: 'text-ag-pay' },
    { icon: Package,    label: 'Active Listings',   value: listings.filter(l=>l.status!=='sold_out').length, sub: `${listings.filter(l=>l.status==='pending').length} pending review`, color: 'text-ag-amber' },
    { icon: Clock,      label: 'Pending Orders',    value: transactions.filter(t=>t.status==='pending').length, sub: 'Awaiting dispatch', color: 'text-yellow-600' },
    { icon: BarChart2,  label: 'Avg. Price / kg',   value: 'KSh 52',      sub: 'Market avg: KSh 48', color: 'text-ag-primary' },
  ];

  if (currentPath === 'listings') {
    return (
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">My Active & Archived Listings</h2>
          <button className="btn-primary !min-h-0 !py-2 !text-xs">+ New Listing</button>
        </div>
        <div className="divide-y divide-ag-border">
          {listings.map(listing => (
            <div key={listing.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-sm shrink-0">
                  {listing.crop.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ag-body">{listing.crop}</p>
                  <p className="text-sm text-ag-muted">{listing.harvested} · {listing.qty}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-ag-amber font-extrabold">{listing.price}</span>
                <div className="flex items-center gap-3">
                  {statusChip(listing.status)}
                  <button onClick={() => { setSelected(listing); setModal('edit_listing'); }} className="text-ag-muted hover:text-ag-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Reuse Edit Modal */}
        {modal === 'edit_listing' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ag-body">Edit Listing</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
              </div>
              <form onSubmit={saveListing} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1">Crop</label>
                  <input type="text" defaultValue={selected.crop} className="form-input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1">Quantity</label>
                  <input type="text" defaultValue={selected.qty} className="form-input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1">Price</label>
                  <input type="text" defaultValue={selected.price} className="form-input text-sm" />
                </div>
                <button type="submit" className="btn-primary w-full mt-2">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === 'orders') {
    return (
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">All Orders & Transactions</h2>
        </div>
        <div className="divide-y divide-ag-border">
          {transactions.map(tx => {
            const StatusIcon = tx.status === 'completed' ? CheckCircle2 : tx.status === 'in_transit' ? Truck : AlertCircle;
            return (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ag-surface rounded-btn flex items-center justify-center shrink-0">
                    <StatusIcon className={`w-6 h-6 ${tx.status === 'completed' ? 'text-ag-pay' : tx.status === 'in_transit' ? 'text-blue-500' : 'text-yellow-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-ag-body">{tx.crop}</p>
                    <p className="text-sm text-ag-muted">{tx.buyer} · {tx.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold">KSh {tx.amount.toLocaleString()}</span>
                  {statusChip(tx.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentPath === 'payments' || currentPath === 'wallet') {
    return <WalletView role="farmer" />;
  }

  

  if (currentPath === 'settings') {
    return (
      <div className="bg-white border border-ag-border rounded-card p-8 max-w-2xl">
        <h2 className="text-headline-md text-ag-body mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-ag-primary" /> Profile Settings</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Farm Name</label>
            <input type="text" defaultValue="Mwangi Farms Ltd" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Primary Phone (M-PESA)</label>
            <input type="text" defaultValue="0712 345 678" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">County Location</label>
            <input type="text" defaultValue="Nakuru" className="form-input" />
          </div>
          <button onClick={() => alert('Settings saved!')} className="btn-primary w-fit mt-2">Save Profile Settings</button>
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

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="ag-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</span>
              <div className="w-9 h-9 bg-ag-surface rounded-btn flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ag-body">{value}</p>
            <p className="text-xs text-ag-muted font-bold">{sub}</p>
          </div>
        ))}
      </div>

      {/* Wallet quick link for dashboard – navigates to /payments */}
      <div className="ag-card flex items-center justify-between gap-4 cursor-pointer hover:border-ag-primary transition-colors group"
        onClick={() => navigate(`/${location.pathname.split('/')[1]}/payments`)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#16a34a,#15803d)' }}>
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-ag-muted uppercase tracking-widest">M-PESA Wallet</p>
            <p className="text-xl font-extrabold text-ag-body">KSh {walletBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ag-primary group-hover:underline">Manage Payments →</span>
        </div>
      </div>

      {/* ── TWO COLUMN SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: My Active Listings */}
        <div className="bg-white border border-ag-border rounded-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ag-border">
            <h2 className="text-headline-md text-ag-body">My Active Listings</h2>
            <button onClick={() => setModal('archive')} className="btn-tertiary !text-xs">View All Archive →</button>
          </div>
          <div className="divide-y divide-ag-border">
            {listings.slice(0, 4).map(listing => (
              <div key={listing.id} className="flex items-center justify-between px-5 py-4 hover:bg-ag-canvas transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                    {listing.crop.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-ag-body text-sm">{listing.crop}</p>
                    <p className="text-xs text-ag-muted">{listing.harvested} · {listing.qty}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold text-sm">{listing.price}</span>
                  <div className="flex items-center gap-2">
                    {statusChip(listing.status)}
                    <button onClick={() => { setSelected(listing); setModal('edit_listing'); }} className="text-ag-muted hover:text-ag-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Recent Transactions */}
        <div className="bg-white border border-ag-border rounded-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ag-border">
            <h2 className="text-headline-md text-ag-body">Recent Transactions</h2>
            <button onClick={() => setModal('transactions')} className="btn-tertiary !text-xs">View All →</button>
          </div>
          <div className="divide-y divide-ag-border">
            {transactions.slice(0, 3).map(tx => {
              const StatusIcon = tx.status === 'completed' ? CheckCircle2 : tx.status === 'in_transit' ? Truck : AlertCircle;
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-ag-canvas transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ag-surface rounded-btn flex items-center justify-center shrink-0">
                      <StatusIcon className={`w-5 h-5 ${
                        tx.status === 'completed' ? 'text-ag-pay' :
                        tx.status === 'in_transit' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body text-sm">{tx.crop}</p>
                      <p className="text-xs text-ag-muted">{tx.buyer} · {tx.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-ag-amber font-extrabold text-sm">KSh {tx.amount.toLocaleString()}</span>
                    {statusChip(tx.status)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Logistics Promo */}
          <div className="m-4 rounded-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #012D1D 0%, #1B4332 60%, #904D00 100%)', border: '1px solid #2d6a4f' }}>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-ag-amber-cont shrink-0" />
                <p className="text-white font-extrabold text-sm">Need Logistics?</p>
              </div>
              <p className="text-ag-primary-fixed text-xs leading-relaxed">
                Request an AgriTech truck for your pending deliveries and get <strong className="text-ag-amber-cont">10% off your next transport</strong>.
              </p>
              <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-white/70">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-ag-pay" /> Cold-chain trucks available</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-ag-pay" /> GPS tracked live</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-ag-pay" /> Same-day dispatch</span>
              </div>
            </div>
            <button
              onClick={() => { setDeliveryStep(1); setModal('delivery'); }}
              className="shrink-0 bg-ag-amber-cont hover:bg-amber-400 text-white font-extrabold text-sm px-5 py-3 rounded-btn transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Request Delivery →
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {/* Withdraw Modal */}
      {modal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body">Withdraw to M-PESA</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="bg-ag-surface rounded-btn p-3 mb-4 text-sm font-bold text-ag-body">
              Available: <span className="text-ag-pay">KSh {walletBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">M-PESA Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                  <input value={phone} onChange={e=>setPhone(e.target.value)} className="form-input pl-10 text-sm" placeholder="07XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Amount (KSh)</label>
                <input type="number" defaultValue={walletBalance} max={walletBalance} className="form-input text-sm" placeholder="Enter amount" />
              </div>
              <button onClick={handleWithdraw} disabled={walletBalance === 0} className={`btn-pay w-full mt-2 ${walletBalance === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {modal === 'transactions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border sticky top-0 bg-white">
              <h3 className="font-extrabold text-ag-body">All Transactions</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="overflow-y-auto divide-y divide-ag-border">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-bold text-sm text-ag-body">{tx.crop}</p>
                    <p className="text-xs text-ag-muted">{tx.buyer} · {tx.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-ag-amber font-extrabold text-sm">KSh {tx.amount.toLocaleString()}</span>
                    {statusChip(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {modal === 'archive' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border sticky top-0 bg-white">
              <h3 className="font-extrabold text-ag-body">All Listings (Archive)</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="overflow-y-auto divide-y divide-ag-border">
              {listings.map(listing => (
                <div key={listing.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-bold text-sm text-ag-body">{listing.crop}</p>
                    <p className="text-xs text-ag-muted">{listing.harvested} · {listing.qty}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-ag-amber font-extrabold text-sm">{listing.price}</span>
                    {statusChip(listing.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELIVERY REQUEST MODAL (3 steps) ════════ */}
      {modal === 'delivery' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-lg overflow-hidden flex flex-col max-h-[94vh]">

            {/* Header */}
            <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between sticky top-0"
              style={{ background: 'linear-gradient(135deg, #012D1D 0%, #1B4332 80%, #904D00 100%)' }}>
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Truck className="w-4 h-4 text-ag-amber-cont" />
                  {deliveryStep === 1 && 'Request a Delivery Truck'}
                  {deliveryStep === 2 && 'Review Delivery Details'}
                  {deliveryStep === 3 && 'Request Submitted!'}
                </h3>
                {deliveryStep < 3 && (
                  <p className="text-white/60 text-xs mt-0.5">Step {deliveryStep} of 2 — ShambaPoint logistics network</p>
                )}
              </div>
              <button onClick={() => setModal(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            {deliveryStep < 3 && (
              <div className="flex h-1">
                <div className="h-full bg-ag-amber-cont transition-all duration-500" style={{ width: `${(deliveryStep / 2) * 100}%` }} />
                <div className="flex-1 bg-ag-border" />
              </div>
            )}

            <div className="p-6 overflow-y-auto flex flex-col gap-4">

              {/* ── STEP 1: Configure ── */}
              {deliveryStep === 1 && (
                <>
                  {/* Promo callout */}
                  <div className="bg-amber-50 border border-amber-200 rounded-card p-3 flex items-start gap-2">
                    <Truck className="w-4 h-4 text-ag-amber mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">
                      <strong>10% off</strong> your transport fee on this request — applied automatically at confirmation.
                    </p>
                  </div>

                  {/* Listing / Cargo */}
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Select Listing / Cargo *</label>
                    <select
                      value={deliveryForm.listing}
                      onChange={e => setDeliveryForm(f => ({ ...f, listing: e.target.value }))}
                      className="form-input"
                    >
                      <option value="">Choose a listing to dispatch...</option>
                      {listings.filter(l => l.status !== 'sold_out').map(l => (
                        <option key={l.id} value={l.crop}>{l.crop} — {l.qty} ({l.price})</option>
                      ))}
                    </select>
                  </div>

                  {/* Truck Type */}
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Truck Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'pickup',      label: 'Pickup',       desc: 'Up to 1T', icon: '🛻' },
                        { id: 'lorry',       label: 'Lorry',        desc: '1T – 5T',  icon: '🚛' },
                        { id: 'cold_chain',  label: 'Cold Chain',   desc: 'Perishables', icon: '❄️' },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDeliveryForm(f => ({ ...f, truckType: t.id }))}
                          className={`flex flex-col items-center gap-1 p-3 rounded-card border-2 text-center transition-all text-xs font-bold ${
                            deliveryForm.truckType === t.id
                              ? 'border-ag-primary bg-ag-primary text-white'
                              : 'border-ag-border bg-ag-canvas text-ag-muted hover:border-ag-primary/50'
                          }`}
                        >
                          <span className="text-xl">{t.icon}</span>
                          <span>{t.label}</span>
                          <span className={`text-[10px] font-normal ${ deliveryForm.truckType === t.id ? 'text-white/70' : 'text-ag-outline'}`}>{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pickup & Destination counties */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-ag-body mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" />Pickup County *</label>
                      <select
                        value={deliveryForm.pickupCounty}
                        onChange={e => setDeliveryForm(f => ({ ...f, pickupCounty: e.target.value }))}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        {['Nakuru','Nairobi','Kisumu','Eldoret','Meru','Kiambu','Nyandarua','Kericho','Kajiado','Machakos'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ag-body mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" />Destination *</label>
                      <select
                        value={deliveryForm.destCounty}
                        onChange={e => setDeliveryForm(f => ({ ...f, destCounty: e.target.value }))}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        {['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Kiambu','Machakos','Nyeri'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Date + Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-ag-body mb-1.5"><CalendarDays className="w-3.5 h-3.5 inline mr-1" />Pickup Date *</label>
                      <input
                        type="date"
                        value={deliveryForm.pickupDate}
                        onChange={e => setDeliveryForm(f => ({ ...f, pickupDate: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ag-body mb-1.5">Est. Weight (kg)</label>
                      <input
                        type="number" min={1}
                        value={deliveryForm.weight}
                        onChange={e => setDeliveryForm(f => ({ ...f, weight: e.target.value }))}
                        placeholder="e.g. 500"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Urgency Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'standard', label: 'Standard', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                        { id: 'express',  label: 'Express',  color: 'border-amber-400 bg-amber-50 text-amber-700' },
                        { id: 'urgent',   label: 'Urgent',   color: 'border-red-400 bg-red-50 text-red-600' },
                      ].map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setDeliveryForm(f => ({ ...f, urgency: u.id }))}
                          className={`py-2 rounded-btn text-xs font-bold border-2 transition-all ${
                            deliveryForm.urgency === u.id ? u.color : 'border-ag-border text-ag-muted bg-ag-canvas hover:border-ag-primary/40'
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-ag-body mb-1.5">Special Instructions (optional)</label>
                    <textarea
                      value={deliveryForm.notes}
                      onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g. Fragile cargo, please handle with care; call 30 min before arrival…"
                      rows={2}
                      className="form-input resize-none"
                    />
                  </div>

                  <button
                    disabled={!deliveryForm.listing || !deliveryForm.pickupCounty || !deliveryForm.destCounty || !deliveryForm.pickupDate}
                    onClick={() => setDeliveryStep(2)}
                    className={`btn-pay w-full flex items-center justify-center gap-2 ${
                      (!deliveryForm.listing || !deliveryForm.pickupCounty || !deliveryForm.destCounty || !deliveryForm.pickupDate) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Review Request <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* ── STEP 2: Review ── */}
              {deliveryStep === 2 && (() => {
                const baseFee = deliveryForm.truckType === 'cold_chain' ? 3500 : deliveryForm.truckType === 'lorry' ? 2200 : 1200;
                const urgencyFee = deliveryForm.urgency === 'urgent' ? baseFee * 0.4 : deliveryForm.urgency === 'express' ? baseFee * 0.2 : 0;
                const gross = baseFee + urgencyFee;
                const discount = Math.round(gross * 0.1);
                const net = Math.round(gross - discount);
                return (
                  <>
                    {/* Order summary */}
                    <div className="bg-ag-canvas border border-ag-border rounded-card divide-y divide-ag-border">
                      {[
                        { label: 'Cargo / Listing', value: deliveryForm.listing },
                        { label: 'Truck Type', value: { pickup: '🛻 Pickup Truck', lorry: '🚛 Lorry', cold_chain: '❄️ Cold Chain' }[deliveryForm.truckType] },
                        { label: 'Route', value: `${deliveryForm.pickupCounty} → ${deliveryForm.destCounty}` },
                        { label: 'Pickup Date', value: deliveryForm.pickupDate },
                        { label: 'Est. Weight', value: deliveryForm.weight ? `${deliveryForm.weight} kg` : 'Not specified' },
                        { label: 'Urgency', value: deliveryForm.urgency.charAt(0).toUpperCase() + deliveryForm.urgency.slice(1) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                          <span className="text-ag-muted font-bold">{label}</span>
                          <span className="text-ag-body font-extrabold text-right max-w-[55%]">{value || '—'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Driver assignment preview */}
                    <div className="bg-ag-surface border border-ag-border rounded-card p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ag-primary flex items-center justify-center text-white font-extrabold text-sm shrink-0">DO</div>
                      <div className="flex-1">
                        <p className="font-bold text-ag-body text-sm">David Ochieng — Assigned Driver</p>
                        <p className="text-xs text-ag-muted">Vehicle: KCA 123Z · Isuzu FRR · GPS Tracked</p>
                      </div>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Available</span>
                    </div>

                    {/* Cost breakdown */}
                    <div className="rounded-card p-4 flex flex-col gap-1.5" style={{ background: 'linear-gradient(135deg, #012D1D, #1B4332)' }}>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Transport Cost Breakdown</p>
                      <div className="flex justify-between text-sm text-white/80">
                        <span>Base fee ({deliveryForm.truckType})</span>
                        <span>KSh {baseFee.toLocaleString()}</span>
                      </div>
                      {urgencyFee > 0 && (
                        <div className="flex justify-between text-sm text-white/80">
                          <span>{deliveryForm.urgency.charAt(0).toUpperCase() + deliveryForm.urgency.slice(1)} surcharge</span>
                          <span>KSh {Math.round(urgencyFee).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-ag-amber-cont">
                        <span>10% first-request discount</span>
                        <span>− KSh {discount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-lg text-white border-t border-white/20 pt-2 mt-1">
                        <span>You pay</span>
                        <span>KSh {net.toLocaleString()}</span>
                      </div>
                    </div>

                    {deliveryForm.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-card p-3 text-xs text-blue-800">
                        <strong>Driver note:</strong> {deliveryForm.notes}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setDeliveryStep(1)} className="btn-tertiary flex-1 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={() => {
                          setDeliveryStep(3);
                          showToast(`Delivery of ${deliveryForm.listing} scheduled for ${deliveryForm.pickupDate}!`);
                        }}
                        className="btn-pay flex-1 flex items-center justify-center gap-2"
                      >
                        Confirm Delivery Request
                      </button>
                    </div>
                  </>
                );
              })()}

              {/* ── STEP 3: Success ── */}
              {deliveryStep === 3 && (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-ag-pay" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-ag-body">Request Submitted!</h3>
                    <p className="text-ag-muted text-sm mt-1">Your truck request for <strong>{deliveryForm.listing}</strong> has been sent to the logistics team.</p>
                  </div>
                  <div className="bg-ag-canvas border border-ag-border rounded-card p-4 w-full text-left flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ag-muted">Pickup date</span>
                      <span className="font-bold text-ag-body">{deliveryForm.pickupDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ag-muted">Route</span>
                      <span className="font-bold text-ag-body">{deliveryForm.pickupCounty} → {deliveryForm.destCounty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ag-muted">Assigned driver</span>
                      <span className="font-bold text-ag-body">David Ochieng</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-full text-xs text-ag-muted">
                    <p className="flex items-center gap-1.5 justify-center"><CheckCircle className="w-3.5 h-3.5 text-ag-pay" /> Driver will call you 1 hour before arrival</p>
                    <p className="flex items-center gap-1.5 justify-center"><CheckCircle className="w-3.5 h-3.5 text-ag-pay" /> Track live from <strong>Logistics → My Deliveries</strong></p>
                  </div>
                  <button onClick={() => setModal(null)} className="btn-primary w-full">Done</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {modal === 'edit_listing' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body">Edit Listing</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <form onSubmit={saveListing} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Crop</label>
                <input type="text" defaultValue={selected.crop} className="form-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Quantity</label>
                <input type="text" defaultValue={selected.qty} className="form-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Price</label>
                <input type="text" defaultValue={selected.price} className="form-input text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;
