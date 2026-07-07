import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletView from '../shared/WalletView';
import {
  TrendingUp, Package, Clock, BarChart2, Pencil,
  CheckCircle2, Truck, X, CheckCircle, Settings, Wallet, AlertCircle, Phone
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleWithdraw = () => {
    showToast(`KSh ${walletBalance.toLocaleString()} withdrawal initiated to ${phone}!`);
    setWalletBalance(0);
    setModal(null);
  };

  const handleDeliveryRequest = () => {
    showToast('Delivery request sent to Logistics Team. A truck will be assigned shortly.');
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
          <div className="m-4 bg-ag-primary rounded-card p-4">
            <p className="text-ag-primary-fixed font-bold text-sm mb-1">Need Logistics?</p>
            <p className="text-white/60 text-xs mb-3">Request an AgriTech truck for your pending deliveries and get 10% off your next transport.</p>
            <button onClick={() => setModal('delivery')} className="btn-primary !min-h-0 !py-2.5 !text-xs !px-4">
               Request Delivery
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

      {/* Delivery Request Modal */}
      {modal === 'delivery' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body flex items-center gap-2"><Truck className="w-5 h-5 text-ag-primary" /> Request Truck</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Select Order</label>
                <select className="form-input text-sm">
                  {transactions.filter(t=>t.status==='pending').map(t => (
                    <option key={t.id}>{t.crop} to {t.buyer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-body mb-1">Pickup Date</label>
                <input type="date" className="form-input text-sm" />
              </div>
              <button onClick={handleDeliveryRequest} className="btn-primary w-full mt-2">
                Submit Request
              </button>
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
