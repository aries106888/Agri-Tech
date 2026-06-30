import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp, Package, Clock, BarChart2, Pencil, ArrowDownToLine,
  CheckCircle2, Truck, AlertCircle, X, CheckCircle, Phone, Settings,
  Wallet, Send, RefreshCw, ArrowUpRight, ArrowDownLeft, Shield, CreditCard,
  Eye, EyeOff, Download, Star, Lock
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
  const currentPath = location.pathname.split('/').pop();
  
  const [walletBalance, setWalletBalance] = useState(34200);
  const [showBalance, setShowBalance] = useState(true);
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

  if (currentPath === 'payments') {
    const payTxns = [
      { id: 'TXN-001', type: 'credit', label: 'Naivas Ltd – Maize Payment',    amount: 41000, date: '9 Jun 2026', status: 'completed',  ref: 'QK7A3NM' },
      { id: 'TXN-002', type: 'credit', label: 'Janet Wanjiku – Red Onions',    amount: 12600, date: '8 Jun 2026', status: 'in_transit', ref: 'QK8B2PL' },
      { id: 'TXN-003', type: 'debit',  label: 'Withdrawal to M-PESA',         amount: 15000, date: '7 Jun 2026', status: 'completed',  ref: 'QK5C9RZ' },
      { id: 'TXN-004', type: 'credit', label: 'Quickmart – Kienyeji Eggs',     amount: 6750,  date: '7 Jun 2026', status: 'pending',    ref: 'QK2D4WQ' },
      { id: 'TXN-005', type: 'credit', label: 'David Ochieng – Sweet Corn',    amount: 9200,  date: '5 Jun 2026', status: 'completed',  ref: 'QK6E1TX' },
      { id: 'TXN-006', type: 'debit',  label: 'Logistics Fee – Nakuru Trip',   amount: 2350,  date: '4 Jun 2026', status: 'completed',  ref: 'QK3F7YK' },
    ];
    const totalIn  = payTxns.filter(t => t.type==='credit' && t.status==='completed').reduce((a,b)=>a+b.amount,0);
    const totalOut = payTxns.filter(t => t.type==='debit'  && t.status==='completed').reduce((a,b)=>a+b.amount,0);
    const pending  = payTxns.filter(t => t.status==='pending').reduce((a,b)=>a+b.amount,0);

    return (
      <div className="flex flex-col gap-6 animate-slide-up">

        {/* ── HERO WALLET CARD ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d3320 0%, #1a5c38 40%, #0f4028 70%, #0a2218 100%)',
          borderRadius: '1.25rem',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(13,51,32,0.4), 0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {/* Decorative orbs */}
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', bottom:-40, left:-20, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
          <div style={{ position:'absolute', top:'50%', right:80, width:80, height:80, borderRadius:'50%', background:'rgba(233,180,76,0.08)' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left: balance */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,255,255,0.12)' }}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' }}>M-PESA Wallet</span>
                <button
                  onClick={() => setShowBalance(v=>!v)}
                  style={{ marginLeft:4, color:'rgba(255,255,255,0.4)' }}
                  className="hover:text-white/80 transition-colors"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p style={{ fontSize:48, fontWeight:900, color:'white', lineHeight:1, letterSpacing:'-0.02em', marginBottom:6 }}>
                {showBalance ? `KSh ${walletBalance.toLocaleString()}` : 'KSh ••••••'}
              </p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600 }}>Last updated: Just now · Account: +254 712 345 678</p>
            </div>

            {/* Right: action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModal('withdraw')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'white', boxShadow:'0 4px 15px rgba(22,163,74,0.4)' }}
              >
                <ArrowDownToLine className="w-4 h-4" /> Withdraw to M-PESA
              </button>
              <button
                onClick={() => setModal('send')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1.5px solid rgba(255,255,255,0.2)', backdropFilter:'blur(8px)' }}
              >
                <Send className="w-4 h-4" /> Send Money
              </button>
              <button
                onClick={() => setModal('topup')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1.5px solid rgba(255,255,255,0.2)', backdropFilter:'blur(8px)' }}
              >
                <RefreshCw className="w-4 h-4" /> Top Up
              </button>
            </div>
          </div>

          {/* Mini stats inside card */}
          <div className="relative grid grid-cols-3 gap-4 mt-8 pt-6" style={{ borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            {[
              { label:'Total Received', value:`KSh ${totalIn.toLocaleString()}`, icon:ArrowDownLeft, color:'#4ade80' },
              { label:'Total Withdrawn', value:`KSh ${totalOut.toLocaleString()}`, icon:ArrowUpRight, color:'#fb923c' },
              { label:'Pending Credit', value:`KSh ${pending.toLocaleString()}`, icon:Clock, color:'#facc15' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="w-3.5 h-3.5" style={{ color:s.color }} />
                  <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</span>
                </div>
                <p style={{ color:'white', fontWeight:800, fontSize:16 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTION CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon:ArrowDownToLine, label:'Withdraw',  sub:'To M-PESA',    action:'withdraw', grad:'linear-gradient(135deg,#16a34a,#15803d)', shadow:'rgba(22,163,74,0.25)' },
            { icon:Send,            label:'Send Money', sub:'To any number', action:'send',     grad:'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow:'rgba(37,99,235,0.25)' },
            { icon:Shield,          label:'SecurePay',  sub:'Escrow wallet', action:null,        grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow:'rgba(124,58,237,0.25)' },
            { icon:Download,        label:'Statement',  sub:'Download PDF',  action:null,        grad:'linear-gradient(135deg,#0891b2,#0e7490)', shadow:'rgba(8,145,178,0.25)' },
          ].map(q => (
            <button
              key={q.label}
              onClick={() => q.action && setModal(q.action)}
              className="ag-card flex flex-col items-center gap-3 py-6 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background:q.grad, boxShadow:`0 8px 20px ${q.shadow}` }}>
                <q.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-ag-body text-sm">{q.label}</p>
                <p className="text-ag-muted text-xs mt-0.5">{q.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── TRANSACTION HISTORY ── */}
        <div className="ag-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-ag-primary" />
              <h3 className="font-extrabold text-ag-body text-base">Transaction History</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ag-muted font-bold bg-ag-surface px-3 py-1.5 rounded-full">{payTxns.length} records</span>
              <button className="btn-ghost !py-1.5 !text-xs">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          <div className="divide-y divide-ag-border">
            {payTxns.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ag-canvas/60 transition-colors group">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: tx.type==='credit' ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fee2e2,#fecaca)',
                }}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5" style={{ color:'#059669' }} />
                    : <ArrowUpRight className="w-5 h-5" style={{ color:'#dc2626' }} />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ag-body text-sm truncate">{tx.label}</p>
                  <p className="text-xs text-ag-muted mt-0.5">Ref: <span className="font-mono">{tx.ref}</span> · {tx.date}</p>
                </div>

                {/* Status */}
                <div className="hidden sm:block">
                  {tx.status === 'completed' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                  {tx.status === 'pending' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                  {tx.status === 'in_transit' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Truck className="w-3.5 h-3.5" /> In Transit
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={`font-extrabold text-base ${tx.type==='credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type==='credit' ? '+' : '-'}KSh {tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-ag-border bg-ag-canvas/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-ag-muted" />
              <span className="text-xs text-ag-muted font-bold">All transactions are secured by ShambaPoint Escrow</span>
            </div>
            <button className="text-xs font-bold text-ag-primary hover:underline">Load more →</button>
          </div>
        </div>

        {/* ── SECURITY BANNER ── */}
        <div className="ag-card flex items-center gap-4" style={{ borderLeft:'4px solid #16a34a' }}>
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-ag-body text-sm">Bank-Grade Security</p>
            <p className="text-xs text-ag-muted mt-0.5">Your funds are protected with 256-bit encryption and M-PESA SecurePay escrow. Withdrawals are processed within 5 minutes.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full shrink-0">
            <Star className="w-3.5 h-3.5" /> Verified
          </div>
        </div>

        {/* ── MODALS ── */}
        {/* WITHDRAW */}
        {modal === 'withdraw' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div style={{ background:'linear-gradient(135deg,#0d3320,#1a5c38)', padding:'1.5rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <ArrowDownToLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white">Withdraw to M-PESA</p>
                      <p className="text-white/60 text-xs mt-0.5">Available: KSh {walletBalance.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">M-PESA Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                    <input value={phone} onChange={e=>setPhone(e.target.value)} className="form-input pl-10" placeholder="+254 7XX XXX XXX" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">Amount (KSh)</label>
                  <input type="number" defaultValue={walletBalance} max={walletBalance} className="form-input" placeholder="Enter amount" />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Funds arrive in your M-PESA within 5 minutes.
                </div>
                <button onClick={handleWithdraw} disabled={walletBalance === 0}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${walletBalance===0?'opacity-40 cursor-not-allowed':''}`}
                  style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', boxShadow:'0 4px 15px rgba(22,163,74,0.35)' }}
                >
                  <ArrowDownToLine className="w-4 h-4" /> Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEND MONEY */}
        {modal === 'send' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div style={{ background:'linear-gradient(135deg,#1e3a8a,#2563eb)', padding:'1.5rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white">Send Money</p>
                      <p className="text-white/60 text-xs mt-0.5">Transfer to M-PESA number</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">Recipient M-PESA Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                    <input className="form-input pl-10" placeholder="+254 7XX XXX XXX" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">Amount (KSh)</label>
                  <input type="number" className="form-input" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">Reason (optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. Payment for maize" />
                </div>
                <button
                  onClick={() => { showToast('Transfer initiated successfully!'); setModal(null); }}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background:'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow:'0 4px 15px rgba(37,99,235,0.35)' }}
                >
                  <Send className="w-4 h-4" /> Send Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOP UP */}
        {modal === 'topup' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div style={{ background:'linear-gradient(135deg,#4c1d95,#7c3aed)', padding:'1.5rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white">Top Up Wallet</p>
                      <p className="text-white/60 text-xs mt-0.5">From M-PESA to ShambaPoint</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-ag-muted font-bold">Send M-PESA to Paybill below, then enter the amount:</p>
                <div className="bg-ag-surface rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ag-muted">Paybill Number</span>
                    <span className="font-extrabold font-mono text-ag-body">247 247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ag-muted">Account Number</span>
                    <span className="font-extrabold font-mono text-ag-body">FMR-045</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5">Amount Sent (KSh)</label>
                  <input type="number" className="form-input" placeholder="Enter amount you sent" />
                </div>
                <button
                  onClick={() => { showToast('Top-up confirmed! Balance updating…'); setModal(null); }}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow:'0 4px 15px rgba(124,58,237,0.35)' }}
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Top Up
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
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
        onClick={() => window.location.href = `/${location.pathname.split('/')[1]}/payments`}
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
