import { useState } from 'react';
import {
  Shield, CheckCircle, Clock, Truck, Package,
  AlertTriangle, X, Phone, RefreshCw, Eye, Download,
  Lock, Unlock, ArrowRight, Search, Star, MessageSquare,
  SmilePlus, Meh, Frown, Smile, ShieldCheck, Send
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
  { key: 'order_created',   label: 'Order Created',   icon: Package },
  { key: 'payment_held',    label: 'Payment Held',    icon: Lock },
  { key: 'farmer_accepted', label: 'Farmer Accepted', icon: CheckCircle },
  { key: 'preparing',       label: 'Preparing',       icon: Clock },
  { key: 'shipped',         label: 'Shipped',         icon: Truck },
  { key: 'delivered',       label: 'Delivered',       icon: CheckCircle },
  { key: 'confirmed',       label: 'Confirmed',       icon: CheckCircle },
  { key: 'released',        label: 'Funds Released',  icon: Unlock },
];

const SENTIMENT_OPTIONS = [
  { key: 'great', label: 'Great!', Icon: SmilePlus, color: 'text-green-600', bg: 'bg-green-50 border-green-400', emoji: '😊' },
  { key: 'good',  label: 'Good',   Icon: Smile,     color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-400',   emoji: '🙂' },
  { key: 'ok',    label: 'Okay',   Icon: Meh,       color: 'text-yellow-600',bg: 'bg-yellow-50 border-yellow-400',emoji: '😐' },
  { key: 'poor',  label: 'Poor',   Icon: Frown,     color: 'text-red-600',   bg: 'bg-red-50 border-red-400',     emoji: '😞' },
];

const ESCROW_BADGES = {
  held:     { label: 'In Escrow',       cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  released: { label: 'Released',        cls: 'bg-green-100 text-green-700 border border-green-200' },
  locked:   { label: 'Locked (Dispute)',cls: 'bg-red-100 text-red-700 border border-red-200' },
  pending:  { label: 'Pending',         cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

const EscrowBadge = ({ status }) => {
  const b = ESCROW_BADGES[status];
  if (!b) return null;
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.cls}`}>{b.label}</span>;
};

/* ── FEEDBACK MODAL ─────────────────────────────────────── */
const FeedbackModal = ({ receiptNo, farmer, crop, amount, onClose, onSubmit }) => {
  const [step, setStep]         = useState(1);
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [sentiment, setSentiment] = useState('');
  const [comment, setComment]   = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [tags, setTags]         = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const QUICK_TAGS = ['Fresh produce','On time delivery','Good packaging','Fair price','Great communication','Would buy again'];
  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const starLabel = ['','Poor','Fair','Good','Very Good','Excellent'];

  const handleSubmit = () => {
    setSubmitting(true);
    const payload = { receiptNo, farmer, crop, amount, rating, sentiment, comment, tags, anonymous, submittedAt: new Date().toISOString() };
    fetch('/api/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).catch(() => {}).finally(() => { setSubmitting(false); setStep(3); onSubmit(payload); });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-ag-body text-sm">Secure Feedback</p>
              <p className="text-ag-muted text-xs">Receipt: {receiptNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ag-muted hover:text-ag-body">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-4">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-green-500' : 'bg-gray-100'}`} />
          ))}
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-ag-body">How was your experience?</p>
                <p className="text-ag-muted text-sm mt-0.5">Rate order from <strong>{farmer}</strong></p>
                <p className="text-xs text-ag-muted mt-1 font-mono">{crop} · KSh {amount.toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)}
                    onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110">
                    <Star className={`w-9 h-9 transition-colors ${i <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <p className="text-center text-sm font-bold text-green-600">{starLabel[hovered || rating]}</p>
              )}

              <div>
                <p className="text-xs font-bold text-ag-muted mb-2">Overall Feeling</p>
                <div className="grid grid-cols-4 gap-2">
                  {SENTIMENT_OPTIONS.map(({ key, label, emoji, bg, color }) => (
                    <button key={key} onClick={() => setSentiment(key)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all
                        ${sentiment === key ? bg + ' scale-105' : 'border-gray-100 bg-gray-50 hover:border-green-300'}`}>
                      <span className="text-xl">{emoji}</span>
                      <span className={`text-[10px] font-bold ${sentiment === key ? color : 'text-ag-muted'}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={rating === 0 || !sentiment} className="btn-pay w-full">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-bold text-ag-body">Tell us more</p>
                <p className="text-ag-muted text-sm mt-0.5">Your feedback helps improve our marketplace</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map(t => (
                  <button key={t} onClick={() => toggleTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                      ${tags.includes(t) ? 'bg-ag-primary text-white border-ag-primary' : 'bg-gray-50 text-ag-muted border-gray-200 hover:border-green-400'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="form-label flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Written Review (optional)
                </label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  className="form-input !h-20 resize-none" maxLength={500}
                  placeholder="Share your experience…" />
                <p className="text-right text-xs text-ag-muted mt-1">{comment.length}/500</p>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-bold text-ag-body">Submit Anonymously</p>
                  <p className="text-xs text-ag-muted">Your name won't be shown to the farmer</p>
                </div>
                <button onClick={() => setAnonymous(a => !a)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${anonymous ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${anonymous ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center">← Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-pay flex-1">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending…' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-bold text-ag-body text-lg">Thank You! 🎉</p>
                <p className="text-ag-muted text-sm mt-1">Your feedback has been received securely.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-2 text-xs border border-gray-100">
                <div className="flex justify-between"><span className="text-ag-muted">Receipt</span><span className="font-bold font-mono">{receiptNo}</span></div>
                <div className="flex justify-between"><span className="text-ag-muted">Rating</span>
                  <div className="flex">{[1,2,3,4,5].map(i => (<Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />))}</div>
                </div>
                <div className="flex justify-between"><span className="text-ag-muted">Identity</span>
                  <span className={`font-bold ${anonymous ? 'text-ag-primary' : 'text-ag-body'}`}>{anonymous ? 'Anonymous' : 'Named'}</span>
                </div>
              </div>
              <button onClick={onClose} className="btn-pay w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── MPESA MODAL ─────────────────────────────────────────── */
const MpesaModal = ({ amount, onClose, onSuccess }) => {
  const [step, setStep]   = useState(1);
  const [phone, setPhone] = useState('0712 345 678');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp]     = useState('');
  const [receiptNo]       = useState(() => `REC-${Math.random().toString(36).substring(2,10).toUpperCase()}`);

  const initiatePush = () => { setLoading(true); setTimeout(() => { setLoading(false); setStep(2); }, 1800); };
  const confirmOtp   = () => { setLoading(true); setTimeout(() => { setLoading(false); setStep(3); }, 1500); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-ag-body">Pay with M-Pesa</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-ag-muted" /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-xs text-ag-muted font-bold uppercase mb-1">Amount to Pay</p>
                <p className="text-3xl font-extrabold text-ag-body">KSh {amount.toLocaleString()}</p>
                <p className="text-xs text-ag-muted mt-1">Secured in escrow until delivery confirmed</p>
              </div>
              <div>
                <label className="form-label">M-Pesa Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="07XX XXX XXX" />
              </div>
              {amount >= 50000 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-ag-body">STK Push Sent!</p>
                <p className="text-sm text-ag-muted mt-1">Check your phone <strong>{phone}</strong> and enter your M-Pesa PIN</p>
              </div>
              {amount >= 50000 && (
                <div>
                  <label className="form-label">Enter OTP (sent via SMS)</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)}
                    className="form-input text-center text-xl tracking-widest" maxLength={6} placeholder="000000" />
                </div>
              )}
              <button onClick={amount >= 50000 ? confirmOtp : () => setStep(3)}
                disabled={loading || (amount >= 50000 && otp.length < 6)} className="btn-pay w-full">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Verifying…' : 'I have entered my PIN ✓'}
              </button>
              <button onClick={() => setStep(1)} className="text-xs text-ag-muted hover:text-ag-body transition-colors">← Change phone number</button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-ag-body text-lg">Payment Successful!</p>
                <p className="text-sm text-ag-muted mt-1">KSh {amount.toLocaleString()} held securely in escrow</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-left space-y-2">
                <div className="flex justify-between"><span className="text-ag-muted">Receipt No.</span><span className="font-bold font-mono">{receiptNo}</span></div>
                <div className="flex justify-between"><span className="text-ag-muted">Escrow Status</span><span className="font-bold text-amber-600">Funds Held</span></div>
                <div className="flex justify-between"><span className="text-ag-muted">Farmer Notified</span><span className="font-bold text-green-600">✓ Yes</span></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left">
                <p className="font-bold text-green-800 text-sm">Rate this transaction</p>
                <p className="text-green-700 text-xs mt-0.5 mb-2">Help other buyers — takes 30 seconds.</p>
                <button onClick={() => { onSuccess(receiptNo); onClose(); }}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                  <SmilePlus className="w-4 h-4" /> Give Feedback
                </button>
                <button onClick={() => onClose()} className="w-full mt-1.5 text-xs text-green-600 hover:text-green-800 transition-colors py-1">Skip for now</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── PAYMENT TIMELINE ───────────────────────────────────── */
const PaymentTimeline = ({ currentStep }) => (
  <div className="overflow-x-auto pb-1">
    <div className="flex items-center gap-0 min-w-max">
      {TIMELINE_LABELS.map((step, i) => {
        const done   = i <= currentStep;
        const active = i === currentStep;
        const Icon   = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                ${active ? 'bg-amber-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-bold uppercase text-center w-14 leading-tight
                ${done ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < TIMELINE_LABELS.length - 1 && (
              <div className={`w-7 h-0.5 mb-5 shrink-0 ${i < currentStep ? 'bg-green-400' : 'bg-gray-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ── MAIN PAGE ──────────────────────────────────────────── */
export default function SmartSecurePay() {
  const [payments]      = useState(MOCK_PAYMENTS);
  const [selected, setSelected] = useState(null);
  const [mpesaModal, setMpesaModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast]  = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.buyer.toLowerCase().includes(q) || p.crop.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || p.escrowStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalEscrow   = payments.filter(p => p.escrowStatus === 'held').reduce((a, p) => a + p.amount, 0);
  const totalReleased = payments.filter(p => p.escrowStatus === 'released').reduce((a, p) => a + p.amount, 0);
  const totalDisputed = payments.filter(p => p.escrowStatus === 'locked').length;

  const FILTERS = [
    { key: 'all',      label: 'All' },
    { key: 'held',     label: 'In Escrow' },
    { key: 'released', label: 'Released' },
    { key: 'locked',   label: 'Disputed' },
    { key: 'pending',  label: 'Pending' },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield className="w-5 h-5 text-ag-primary" />
            <h2 className="font-extrabold text-xl text-ag-body">Smart SecurePay</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">ESCROW</span>
          </div>
          <p className="text-ag-muted text-sm">Your funds are protected until delivery is confirmed.</p>
        </div>
        <button
          onClick={() => setMpesaModal({ amount: 45000, farmer: 'Peter Kibet', crop: 'Irish Potatoes 500kg' })}
          className="btn-pay self-start"
        >
          <Phone className="w-4 h-4" /> Pay with M-Pesa
        </button>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'In Escrow',  value: `KSh ${totalEscrow.toLocaleString()}`,   icon: Lock,          color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-100' },
          { label: 'Released',   value: `KSh ${totalReleased.toLocaleString()}`, icon: Unlock,        color: 'text-green-600',  bg: 'bg-green-50  border-green-100' },
          { label: 'Disputes',   value: totalDisputed,                           icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50    border-red-100' },
          { label: 'Feedback',   value: feedbacks.length,                        icon: Star,          color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 bg-white ${s.bg}`}>
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0 border`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-ag-muted font-bold">{s.label}</p>
              <p className="text-lg font-extrabold text-ag-body leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── LATEST FEEDBACK BANNER ── */}
      {feedbacks.length > 0 && (
        <div className="bg-white border border-green-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-green-600 fill-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ag-body text-sm">Latest Feedback</p>
            <p className="text-xs text-ag-muted mt-0.5 truncate">
              Receipt: <span className="font-mono font-bold">{feedbacks[feedbacks.length-1].receiptNo}</span>
              &nbsp;·&nbsp;
              {[1,2,3,4,5].map(i => (<span key={i}>{i <= feedbacks[feedbacks.length-1].rating ? '⭐' : '☆'}</span>))}
              &nbsp;·&nbsp;
              <span className="capitalize">{feedbacks[feedbacks.length-1].sentiment}</span>
            </p>
          </div>
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full shrink-0">Secure</span>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 !py-2"
            placeholder="Search by buyer, crop, or transaction ID…"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                ${filter === f.key ? 'bg-ag-primary text-white' : 'bg-gray-50 text-ag-muted hover:bg-gray-100 border border-gray-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-ag-body">Payment Records</h3>
          <button className="btn-ghost text-xs !py-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-ag-muted text-xs font-bold uppercase tracking-wide">
                <th className="text-left px-5 py-3">Transaction</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Buyer / Farmer</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Invoice</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-center px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-ag-body text-sm">{p.crop}</p>
                    <p className="text-xs text-ag-muted">{p.id} · {p.date}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-ag-muted">Buyer: <span className="text-ag-body font-semibold">{p.buyer}</span></p>
                    <p className="text-xs text-ag-muted">Farmer: <span className="text-ag-body font-semibold">{p.farmer}</span></p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-ag-muted font-mono">{p.invoice}</td>
                  <td className="px-5 py-3.5 text-right font-extrabold text-ag-body">KSh {p.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center"><EscrowBadge status={p.escrowStatus} /></td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => setSelected(p)}
                      className="text-ag-primary hover:text-ag-amber transition-colors p-1 rounded-lg hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-ag-muted">
              <Shield className="w-9 h-9 mx-auto mb-2 opacity-20" />
              <p className="font-bold text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box max-w-2xl bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-ag-body">Transaction Detail</h3>
                <p className="text-xs text-ag-muted font-mono">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-ag-muted" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

              {/* Timeline */}
              <div>
                <p className="font-bold text-ag-body text-sm mb-3">Payment Timeline</p>
                <PaymentTimeline currentStep={selected.currentStep} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Transaction ID', selected.id],
                  ['Order ID', selected.orderId],
                  ['Invoice', selected.invoice],
                  ['Amount', `KSh ${selected.amount.toLocaleString()}`],
                  ['Method', selected.method],
                  ['Date', `${selected.date} ${selected.time}`],
                  ['Buyer', selected.buyer],
                  ['Farmer', selected.farmer],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-ag-muted font-bold mb-0.5">{k}</p>
                    <p className="font-bold text-ag-body text-sm">{v}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-ag-muted">Escrow Status:</span>
                <EscrowBadge status={selected.escrowStatus} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap pt-1 border-t border-gray-100">
                {selected.escrowStatus === 'held' && (
                  <button onClick={() => { showToast('Funds released to farmer!'); setSelected(null); }} className="btn-pay flex-1">
                    <Unlock className="w-4 h-4" /> Release Funds
                  </button>
                )}
                {selected.escrowStatus !== 'locked' && (
                  <button onClick={() => { showToast('Dispute raised. Funds locked pending review.'); setSelected(null); }} className="btn-danger flex-1">
                    <AlertTriangle className="w-4 h-4" /> Raise Dispute
                  </button>
                )}
                <button onClick={() => {
                    setSelected(null);
                    const receipt = `REC-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
                    setFeedbackModal({ receiptNo: receipt, farmer: selected.farmer, crop: selected.crop, amount: selected.amount });
                  }} className="btn-ghost flex-1 justify-center text-green-600 border-green-200">
                  <Star className="w-4 h-4" /> Give Feedback
                </button>
                <button className="btn-ghost flex-1 justify-center">
                  <Download className="w-4 h-4" /> Receipt
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
          farmer={mpesaModal.farmer}
          crop={mpesaModal.crop}
          onClose={() => setMpesaModal(null)}
          onSuccess={(receiptNo) => {
            showToast('M-Pesa payment confirmed! Funds secured in escrow.');
            setFeedbackModal({ receiptNo, farmer: mpesaModal.farmer || 'Your Farmer', crop: mpesaModal.crop || 'Produce', amount: mpesaModal.amount });
          }}
        />
      )}

      {/* ── SECURE FEEDBACK MODAL ── */}
      {feedbackModal && (
        <FeedbackModal
          receiptNo={feedbackModal.receiptNo}
          farmer={feedbackModal.farmer}
          crop={feedbackModal.crop}
          amount={feedbackModal.amount}
          onClose={() => setFeedbackModal(null)}
          onSubmit={(data) => {
            setFeedbacks(prev => [...prev, data]);
            showToast('✓ Feedback submitted securely! Thank you.');
          }}
        />
      )}
    </div>
  );
}
