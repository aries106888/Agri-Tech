import { useState } from 'react';
import {
  Shield, CheckCircle, Clock, Truck, Package,
  AlertTriangle, X, Phone, RefreshCw, FileText, Eye, Download,
  Lock, Unlock, ArrowRight, Search
} from 'lucide-react';

/* ── MOCK DATA ─────────────────────────────────────────── */
const MOCK_PAYMENTS = [
  {
    id: 'TXN-SP-001', orderId: 'ORD-2481', buyerId: 'BYR-112', farmerId: 'FMR-045',
    buyer: 'Naivas Supermarket', farmer: 'James Mwangi', crop: 'Grade A Maize',
    amount: 82000, method: 'M-Pesa', date: '2026-06-15', time: '09:42 AM',
    invoice: 'INV-2026-0341', paymentStatus: 'completed', escrowStatus: 'released',
    timeline: ['order_created','payment_held','farmer_accepted','preparing','shipped','delivered','confirmed','released'],
    currentStep: 7,
  },
  {
    id: 'TXN-SP-002', orderId: 'ORD-2489', buyerId: 'BYR-098', farmerId: 'FMR-021',
    buyer: 'Janet Wanjiku', farmer: 'Mary Akinyi', crop: 'Red Onions 200kg',
    amount: 21000, method: 'M-Pesa', date: '2026-06-16', time: '11:15 AM',
    invoice: 'INV-2026-0342', paymentStatus: 'in_escrow', escrowStatus: 'held',
    timeline: ['order_created','payment_held','farmer_accepted','preparing','shipped','delivered','confirmed','released'],
    currentStep: 4,
  },
  {
    id: 'TXN-SP-003', orderId: 'ORD-2495', buyerId: 'BYR-203', farmerId: 'FMR-078',
    buyer: 'Quickmart Nairobi', farmer: 'Peter Kibet', crop: 'Irish Potatoes 500kg',
    amount: 22500, method: 'M-Pesa', date: '2026-06-17', time: '02:30 PM',
    invoice: 'INV-2026-0343', paymentStatus: 'pending', escrowStatus: 'pending',
    timeline: ['order_created','payment_held','farmer_accepted','preparing','shipped','delivered','confirmed','released'],
    currentStep: 0,
  },
  {
    id: 'TXN-SP-004', orderId: 'ORD-2501', buyerId: 'BYR-067', farmerId: 'FMR-033',
    buyer: 'David Ochieng', farmer: 'Grace Njoroge', crop: 'Tomatoes 300kg',
    amount: 18000, method: 'M-Pesa', date: '2026-06-17', time: '04:10 PM',
    invoice: 'INV-2026-0344', paymentStatus: 'disputed', escrowStatus: 'locked',
    timeline: ['order_created','payment_held','farmer_accepted','preparing','shipped','delivered','confirmed','released'],
    currentStep: 5,
  },
];

const TIMELINE_LABELS = [
  { key: 'order_created',    label: 'Order Created',    icon: Package },
  { key: 'payment_held',     label: 'Payment Held',     icon: Lock },
  { key: 'farmer_accepted',  label: 'Farmer Accepted',  icon: CheckCircle },
  { key: 'preparing',        label: 'Preparing Order',  icon: Clock },
  { key: 'shipped',          label: 'Shipped',          icon: Truck },
  { key: 'delivered',        label: 'Delivered',        icon: CheckCircle },
  { key: 'confirmed',        label: 'Buyer Confirmed',  icon: CheckCircle },
  { key: 'released',         label: 'Funds Released',   icon: Unlock },
];

const escrowChip = (status) => {
  const map = {
    held:     <span className="chip-escrow">In Escrow</span>,
    released: <span className="chip-released">Released</span>,
    locked:   <span className="chip-dispute">Locked (Dispute)</span>,
    pending:  <span className="chip-pending">Pending</span>,
  };
  return map[status] || null;
};

/* ── MPESA MODAL ────────────────────────────────────────── */
const MpesaModal = ({ amount, onClose, onSuccess }) => {
  const [step, setStep]   = useState(1); // 1=enter phone, 2=stk_push, 3=success
  const [phone, setPhone] = useState('0712 345 678');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp]     = useState('');
  const [receiptNo]       = useState(() => `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);

  const initiatePush = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1800);
  };
  const confirmOtp = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h3 className="font-extrabold text-ag-body flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-btn flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            Pay with M-Pesa
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-ag-muted" /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-ag-escrow-cont rounded-card p-4 text-center">
                <p className="text-xs text-ag-muted font-bold uppercase tracking-wide mb-1">Amount to Pay</p>
                <p className="text-3xl font-extrabold text-ag-body">KSh {amount.toLocaleString()}</p>
                <p className="text-xs text-ag-muted mt-1">Funds held securely in SecurePay Escrow</p>
              </div>
              <div>
                <label className="form-label">M-Pesa Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="form-input" placeholder="07XX XXX XXX" />
              </div>
              {amount >= 50000 && (
                <div className="alert-warning text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  High-value transaction — OTP verification required after PIN
                </div>
              )}
              <button onClick={initiatePush} disabled={loading} className="btn-pay w-full">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Initiating…' : 'Send STK Push →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse-soft">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-ag-body">STK Push Sent!</p>
                <p className="text-sm text-ag-muted mt-1">
                  Check your phone <strong>{phone}</strong> and enter your M-Pesa PIN
                </p>
              </div>
              {amount >= 50000 && (
                <div>
                  <label className="form-label">Enter OTP (sent via SMS)</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)}
                    className="form-input text-center text-2xl tracking-widest" maxLength={6} placeholder="000000" />
                </div>
              )}
              <button onClick={amount >= 50000 ? confirmOtp : () => setStep(3)}
                disabled={loading || (amount >= 50000 && otp.length < 6)}
                className="btn-pay w-full">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Verifying…' : 'I have entered my PIN ✓'}
              </button>
              <button onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-xs">
                ← Change phone number
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-ag-body text-lg">Payment Successful!</p>
                <p className="text-sm text-ag-muted mt-1">
                  KSh {amount.toLocaleString()} held securely in SecurePay Escrow
                </p>
              </div>
              <div className="bg-ag-surface rounded-card p-4 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-ag-muted">Receipt No.</span>
                  <span className="font-bold">{receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ag-muted">Escrow Status</span>
                  <span className="font-bold text-ag-escrow">Funds Held</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ag-muted">Farmer Notified</span>
                  <span className="font-bold text-green-600">✓ Yes</span>
                </div>
              </div>
              <button onClick={() => { onSuccess(); onClose(); }} className="btn-pay w-full">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── PAYMENT TIMELINE ───────────────────────────────────── */
const PaymentTimeline = ({ currentStep }) => (
  <div className="overflow-x-auto py-2">
    <div className="flex items-center gap-0 min-w-max">
      {TIMELINE_LABELS.map((step, i) => {
        const done    = i <= currentStep;
        const active  = i === currentStep;
        const Icon    = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all
                ${done && !active ? 'bg-ag-pay text-white' : ''}
                ${active ? 'bg-ag-amber text-white animate-pulse-soft' : ''}
                ${!done ? 'bg-ag-surface border-2 border-ag-border text-ag-muted' : ''}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-bold uppercase text-center w-16 leading-tight
                ${done ? 'text-ag-primary' : 'text-ag-muted'}`}>
                {step.label}
              </span>
            </div>
            {i < TIMELINE_LABELS.length - 1 && (
              <div className={`w-8 h-0.5 mb-5 shrink-0 transition-colors
                ${i < currentStep ? 'bg-ag-pay' : 'bg-ag-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ── MAIN PAGE ──────────────────────────────────────────── */
export default function SmartSecurePay() {
  const [payments]       = useState(MOCK_PAYMENTS);
  const [selected, setSelected] = useState(null);
  const [mpesaModal, setMpesaModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast]  = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.buyer.toLowerCase().includes(q) || p.crop.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || p.escrowStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalEscrow  = payments.filter(p => p.escrowStatus === 'held').reduce((a, p) => a + p.amount, 0);
  const totalReleased = payments.filter(p => p.escrowStatus === 'released').reduce((a, p) => a + p.amount, 0);
  const totalDisputed = payments.filter(p => p.escrowStatus === 'locked').length;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-pay text-white px-5 py-3 rounded-card
          shadow-lg font-bold text-sm flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="escrow-gradient rounded-xl2 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6" />
              <h2 className="font-extrabold text-xl">Smart SecurePay</h2>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">ESCROW</span>
            </div>
            <p className="text-white/70 text-sm">Your funds are protected until delivery is confirmed.</p>
          </div>
          <button
            onClick={() => setMpesaModal({ amount: 45000 })}
            className="bg-white text-ag-escrow font-extrabold px-5 py-3 rounded-btn hover:bg-gray-100
              transition-colors flex items-center gap-2 self-start"
          >
            <Phone className="w-4 h-4" /> Pay with M-Pesa
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'In Escrow', value: `KSh ${totalEscrow.toLocaleString()}`, icon: Lock, color: 'text-ag-escrow', bg: 'bg-ag-escrow-cont' },
          { label: 'Released',  value: `KSh ${totalReleased.toLocaleString()}`, icon: Unlock, color: 'text-ag-pay', bg: 'bg-green-100' },
          { label: 'Disputes',  value: totalDisputed, icon: AlertTriangle, color: 'text-ag-dispute', bg: 'bg-ag-dispute-cont' },
          { label: 'Transactions', value: payments.length, icon: FileText, color: 'text-ag-amber', bg: 'bg-amber-100' },
        ].map(s => (
          <div key={s.label} className="ag-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-btn ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-ag-muted font-bold uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-extrabold text-ag-body">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="ag-card flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 !py-2.5"
            placeholder="Search by buyer, crop, or transaction ID…"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','held','released','locked','pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-btn text-xs font-bold capitalize transition-colors
                ${filter === f ? 'bg-ag-primary text-white' : 'bg-ag-surface text-ag-muted hover:bg-ag-border'}`}>
              {f === 'all' ? 'All' : f === 'held' ? 'In Escrow' : f === 'locked' ? 'Disputed' : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="ag-card overflow-hidden !p-0">
        <div className="section-header">
          <h3 className="font-extrabold text-ag-body">Payment Records</h3>
          <button className="btn-ghost text-xs !py-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ag-surface text-ag-muted text-xs font-bold uppercase tracking-wide">
                <th className="text-left px-5 py-3">Transaction</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Buyer / Farmer</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Invoice</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-center px-5 py-3">Escrow</th>
                <th className="text-center px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ag-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-ag-canvas transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ag-body">{p.crop}</p>
                    <p className="text-xs text-ag-muted">{p.id} · {p.date}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-ag-muted">Buyer: <span className="text-ag-body font-semibold">{p.buyer}</span></p>
                    <p className="text-xs text-ag-muted">Farmer: <span className="text-ag-body font-semibold">{p.farmer}</span></p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-xs text-ag-muted">{p.invoice}</td>
                  <td className="px-5 py-4 text-right font-extrabold text-ag-amber">
                    KSh {p.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center">{escrowChip(p.escrowStatus)}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-ag-primary hover:text-ag-amber transition-colors p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-ag-muted">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-bold">No transactions found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
              <h3 className="font-extrabold text-ag-body">Transaction Detail — {selected.id}</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

              {/* Timeline */}
              <div>
                <p className="font-bold text-ag-body mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-ag-amber" /> Payment Timeline
                </p>
                <PaymentTimeline currentStep={selected.currentStep} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Transaction ID', selected.id],
                  ['Order ID', selected.orderId],
                  ['Invoice', selected.invoice],
                  ['Amount', `KSh ${selected.amount.toLocaleString()}`],
                  ['Payment Method', selected.method],
                  ['Date', `${selected.date} ${selected.time}`],
                  ['Buyer', selected.buyer],
                  ['Farmer', selected.farmer],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ag-surface rounded-btn p-3">
                    <p className="text-xs text-ag-muted font-bold uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="font-bold text-ag-body">{v}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span>Escrow Status:</span>
                {escrowChip(selected.escrowStatus)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                {selected.escrowStatus === 'held' && (
                  <button
                    onClick={() => { showToast('Funds released to farmer successfully!'); setSelected(null); }}
                    className="btn-pay flex-1"
                  >
                    <Unlock className="w-4 h-4" /> Release Funds
                  </button>
                )}
                {selected.escrowStatus !== 'locked' && (
                  <button
                    onClick={() => { showToast('Dispute raised. Funds locked pending review.'); setSelected(null); }}
                    className="btn-danger flex-1"
                  >
                    <AlertTriangle className="w-4 h-4" /> Raise Dispute
                  </button>
                )}
                <button className="btn-ghost flex-1 justify-center">
                  <Download className="w-4 h-4" /> Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MPESA MODAL ── */}
      {mpesaModal && (
        <MpesaModal
          amount={mpesaModal.amount}
          onClose={() => setMpesaModal(null)}
          onSuccess={() => showToast('M-Pesa payment confirmed! Funds secured in escrow.')}
        />
      )}
    </div>
  );
}
