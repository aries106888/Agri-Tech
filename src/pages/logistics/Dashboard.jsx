/* ── ShambaPoint Logistics Dashboard ─────────────────────── */
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import WalletView from '../shared/WalletView';
import {
  CheckCircle2, TrendingUp, MapPin, X,
  Navigation, Activity, Thermometer, Droplets, Gauge,
  Play, Pause, Package, Radio, Signal,
  Battery, ChevronRight, Eye, Target,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ClipboardList,
  Wallet, Banknote, Clock
} from 'lucide-react';

/* ── DATA ──────────────────────────────────────────────────── */
const LIVE_OPS = [
  { id: 1, cargo: 'Irish Potatoes', weight: '120kg', from: 'Nakuru', to: 'Nairobi CBD',  status: 'in_transit', driver: 'John Kamau',     action: 'track' },
  { id: 2, cargo: 'Tomatoes',       weight: '80kg',  from: 'Kiambu', to: 'Westlands',    status: 'completed',  driver: 'Janet Wanjiku',  action: 'view'  },
  { id: 3, cargo: 'Red Onions',     weight: '200kg', from: 'Kajiado', to: 'Mombasa Rd',  status: 'pending',    driver: 'Unassigned',     action: 'view'  },
  { id: 4, cargo: 'Cabbage',        weight: '150kg', from: 'Nyeri',  to: 'Thika',         status: 'delayed',    driver: 'Peter Njoroge',  action: 'track' },
];

const ROUTE_CHECKPOINTS = [
  { name: 'Nakuru Market',      km: 0,   reached: true  },
  { name: 'Gilgil Weighbridge', km: 45,  reached: true  },
  { name: 'Naivasha Town',      km: 85,  reached: false },
  { name: 'Limuru Junction',    km: 135, reached: false },
  { name: 'Nairobi CBD Depot',  km: 165, reached: false },
];

const STATUS_CONFIG = {
  in_transit: { label: 'IN-TRANSIT', cls: 'bg-ag-primary-fixed text-ag-primary border border-ag-primary/20' },
  completed:  { label: 'COMPLETED',  cls: 'bg-ag-pay/10 text-ag-pay border border-ag-pay/25' },
  pending:    { label: 'PENDING',    cls: 'bg-amber-100 text-amber-900 border border-amber-400 font-black' },
  delayed:    { label: 'DELAYED',    cls: 'bg-red-50 text-ag-error border border-ag-error/25' },
};

/* ── LIVE TRACKING MODAL ───────────────────────────────────── */
const LiveTrackingModal = ({ cargo, onClose }) => {
  const [progress, setProgress]     = useState(37);
  const [running, setRunning]       = useState(true);
  const [telemetry, setTelemetry]   = useState({ speed: 72, temp: 14.2, humidity: 68, battery: 87, signal: 4 });
  const [logs, setLogs] = useState([
    { time: '09:14', msg: 'Shipment departed Nakuru Market', type: 'info' },
    { time: '09:52', msg: 'Passed Gilgil Weighbridge — 45 km', type: 'success' },
    { time: '10:18', msg: 'Cargo temperature optimal: 14.2°C', type: 'info' },
    { time: '10:41', msg: 'Current: 78 km from origin on A104', type: 'info' },
  ]);
  const intervalRef = useRef(null);
  const logRef      = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 0.4, 100));
      setTelemetry(t => ({
        speed:    Math.max(0,  Math.min(110, t.speed    + (Math.random() - 0.5) * 8)),
        temp:     Math.max(10, Math.min(22,  t.temp     + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(55, Math.min(85,  t.humidity + (Math.random() - 0.5) * 3)),
        battery:  Math.max(10, t.battery - 0.05),
        signal:   Math.max(1,  Math.min(5, Math.round(t.signal + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0)))),
      }));
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  /* milestone logs */
  useEffect(() => {
    ROUTE_CHECKPOINTS.forEach(cp => {
      const pct = (cp.km / 165) * 100;
      if (Math.abs(progress - pct) < 0.5) {
        setLogs(l => [...l, {
          time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
          msg: `Reached ${cp.name} — ${cp.km} km`,
          type: 'success',
        }]);
      }
    });
  }, [progress]);

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight); }, [logs]);

  const progressPct = Math.round(progress);
  const currentCp   = ROUTE_CHECKPOINTS.filter(c => (c.km / 165) * 100 <= progress).at(-1);
  const nextCp      = ROUTE_CHECKPOINTS.find(c => (c.km / 165) * 100 > progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-ag-primary to-emerald-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Live Tracking — {cargo}</p>
              <p className="text-xs text-emerald-200">Nakuru → Nairobi CBD · {progressPct}% complete</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning(r => !r)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* Progress Bar */}
          <div className="bg-ag-canvas rounded-xl p-4">
            <div className="flex justify-between text-xs font-bold text-ag-muted mb-2">
              <span>Nakuru Market</span><span>Nairobi CBD Depot</span>
            </div>
            <div className="h-3 bg-ag-border rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-ag-primary to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between items-center">
              {ROUTE_CHECKPOINTS.map((cp, i) => {
                const reached = (cp.km / 165) * 100 <= progress;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-3 h-3 rounded-full border-2 ${reached ? 'bg-ag-primary border-ag-primary' : 'bg-white border-ag-border'}`} />
                    <span className="text-[9px] text-ag-muted text-center leading-tight max-w-[52px]">{cp.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            {currentCp && <p className="text-xs text-ag-primary font-bold mt-2">📍 Currently past: {currentCp.name}</p>}
            {nextCp      && <p className="text-xs text-ag-muted mt-0.5">Next: {nextCp.name} ({nextCp.km} km)</p>}
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { icon: Gauge,       label: 'Speed',    value: `${Math.round(telemetry.speed)} km/h`, color: 'text-ag-primary' },
              { icon: Thermometer, label: 'Temp',     value: `${telemetry.temp.toFixed(1)}°C`,      color: telemetry.temp > 18 ? 'text-red-500' : 'text-ag-pay' },
              { icon: Droplets,    label: 'Humidity', value: `${Math.round(telemetry.humidity)}%`,  color: 'text-blue-500' },
              { icon: Battery,     label: 'Battery',  value: `${Math.round(telemetry.battery)}%`,   color: telemetry.battery < 20 ? 'text-red-500' : 'text-ag-amber' },
              { icon: Signal,      label: 'Signal',   value: `${telemetry.signal}/5`,               color: telemetry.signal >= 3 ? 'text-ag-primary' : 'text-red-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-ag-canvas rounded-xl p-3 text-center border border-ag-border">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className={`text-sm font-extrabold ${color}`}>{value}</p>
                <p className="text-[10px] text-ag-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Live Log */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-ag-primary animate-pulse" />
              <p className="text-xs font-extrabold text-ag-body uppercase tracking-wider">Live Log</p>
            </div>
            <div ref={logRef} className="bg-ag-body rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-[11px] flex flex-col gap-1">
              {logs.map((l, i) => (
                <p key={i} className={l.type === 'success' ? 'text-emerald-400' : 'text-gray-300'}>
                  <span className="text-amber-300">[{l.time}]</span> {l.msg}
                </p>
              ))}
              <p className="text-gray-600 animate-pulse">▌</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WALLET CARD (matches screenshot design)
══════════════════════════════════════════════════════════ */
const WalletCard = ({ onAction }) => {
  const [wallet, setWallet] = useState({
    available: 14700,
    thisMonth: 10700,
    pending:   1200,
    withdrawn: 6200,
  });
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | 'transfer' | 'history'
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('0712345678');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([
    { id: 'TXN-901', type: 'credit', label: 'Trip Earnings: Nakuru → Nrb', amount: 3500, date: 'Today, 14:20', ref: 'LOG902A' },
    { id: 'TXN-892', type: 'debit',  label: 'Withdrawal to M-PESA (KSh 20 fee)', amount: 4020, date: 'Yesterday', ref: 'WD892K' },
    { id: 'TXN-711', type: 'credit', label: 'Trip Earnings: Kiambu → Westlands', amount: 2200, date: '18 Jul 2026', ref: 'LOG811D' },
  ]);

  const fmt = (n) => `KSh ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const openModal = (type) => {
    setAmount('');
    setError('');
    setSuccess('');
    setModal(type);
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setWallet(w => ({ ...w, available: w.available + amt, thisMonth: w.thisMonth + amt }));
      const newTx = {
        id: 'TXN-' + Math.floor(100 + Math.random() * 900),
        type: 'credit',
        label: 'M-PESA Deposit',
        amount: amt,
        date: 'Just now',
        ref: 'DEP' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      };
      setHistory(h => [newTx, ...h]);
      setSuccess(`Deposit of KSh ${amt.toLocaleString()} received via STK Push!`);
      setLoading(false);
      setTimeout(() => setModal(null), 1500);
    }, 1000);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    const fee = 20; // KSh 20 transaction fee
    const totalDeduction = amt + fee;

    if (!amt || amt <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (totalDeduction > wallet.available) {
      setError(`Insufficient balance. KSh ${amt.toLocaleString()} + KSh ${fee} fee requires KSh ${totalDeduction.toLocaleString()} (Available: KSh ${wallet.available.toLocaleString()}).`);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setWallet(w => ({
        ...w,
        available: w.available - totalDeduction,
        withdrawn: w.withdrawn + amt,
      }));
      const newTx = {
        id: 'TXN-' + Math.floor(100 + Math.random() * 900),
        type: 'debit',
        label: `M-PESA Withdrawal (KSh ${fee} fee included)`,
        amount: totalDeduction,
        date: 'Just now',
        ref: 'WD' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      };
      setHistory(h => [newTx, ...h]);
      setSuccess(`Withdrawal of KSh ${amt.toLocaleString()} sent to ${phone}! (KSh ${fee} transaction fee charged)`);
      onAction(`Withdrew KSh ${amt.toLocaleString()} (KSh ${fee} fee charged)`);
      setLoading(false);
      setTimeout(() => setModal(null), 1800);
    }, 1200);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (amt > wallet.available) {
      setError('Insufficient available balance.');
      return;
    }
    if (!recipient) {
      setError('Please enter recipient details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setWallet(w => ({ ...w, available: w.available - amt }));
      const newTx = {
        id: 'TXN-' + Math.floor(100 + Math.random() * 900),
        type: 'debit',
        label: `Transfer to ${recipient}`,
        amount: amt,
        date: 'Just now',
        ref: 'TR' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      };
      setHistory(h => [newTx, ...h]);
      setSuccess(`Transferred KSh ${amt.toLocaleString()} to ${recipient}!`);
      setLoading(false);
      setTimeout(() => setModal(null), 1500);
    }, 1000);
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl relative"
      style={{ background: 'linear-gradient(135deg, #1B4332 0%, #1e5738 50%, #14532d 100%)' }}>

      {/* Main row: balance left, overview right */}
      <div className="flex flex-col xl:flex-row">

        {/* ── LEFT: Balance + Actions ─────────────────── */}
        <div className="flex-1 p-7 relative">
          {/* decorative rings */}
          <div className="absolute top-4 right-8 w-40 h-40 border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -right-4 w-64 h-64 border border-white/5 rounded-full pointer-events-none" />

          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400 mb-1">
            Wallet Balance
          </p>
          <p className="text-[2.6rem] font-black text-white leading-none mb-1 tracking-tight">
            {fmt(wallet.available)}
          </p>
          <p className="text-sm text-emerald-300/80 mb-6">Available balance</p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <button
              onClick={() => openModal('deposit')}
              className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl
                border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Add Funds
            </button>

            <button
              onClick={() => openModal('withdraw')}
              className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl
                border border-amber-400/30 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 transition-all backdrop-blur-sm"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-300" /> Withdraw
            </button>

            <button
              onClick={() => openModal('transfer')}
              className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl
                border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
            </button>

            <button
              onClick={() => openModal('history')}
              className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl
                border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
            >
              <ClipboardList className="w-3.5 h-3.5" /> History
            </button>
          </div>

          {/* Withdraw to M-PESA strip */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-emerald-200/80">Withdraw instantly to M-PESA anytime, 24/7 (KSh 20 fee)</p>
            <button
              onClick={() => openModal('withdraw')}
              className="flex items-center gap-1.5 bg-ag-amber hover:bg-amber-500
                text-white text-xs font-extrabold px-4 py-2 rounded-lg transition-colors
                active:scale-95 shrink-0 ml-4 shadow-md"
            >
              Withdraw to M-PESA <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Overview panel ───────────────────── */}
        <div className="xl:w-72 border-t xl:border-t-0 xl:border-l border-white/10
          bg-white/5 p-6 flex flex-col justify-center gap-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-300">
            Wallet Overview
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Available Balance', value: fmt(wallet.available), green: true,  warn: false },
              { label: 'This Month',        value: fmt(wallet.thisMonth), green: false, warn: false },
              { label: 'Pending Balance',   value: fmt(wallet.pending),   green: false, warn: true  },
              { label: 'Total Withdrawn',   value: fmt(wallet.withdrawn), green: false, warn: false },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 hover:bg-white/15 transition-colors">
                <p className="text-[10px] text-emerald-300/70 mb-1 leading-tight">{item.label}</p>
                <p className={`text-sm font-extrabold ${
                  item.green ? 'text-emerald-300' :
                  item.warn  ? 'text-amber-300'   : 'text-white'
                }`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => openModal('history')}
            className="w-full text-center text-xs font-extrabold text-emerald-300
              hover:text-white py-2 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            <Wallet className="w-3.5 h-3.5 inline mr-1.5" />
            View Full Wallet
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 text-ag-body">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-ag-border relative">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-ag-muted hover:text-ag-body p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <h3 className="text-base font-extrabold text-ag-body mb-4 pb-2 border-b border-ag-border flex items-center gap-2">
              {modal === 'deposit'  && 'Add Funds via M-PESA'}
              {modal === 'withdraw' && 'Withdraw Earnings to M-PESA'}
              {modal === 'transfer' && 'Transfer Wallet Funds'}
              {modal === 'history'  && 'Wallet Transaction History'}
            </h3>

            {/* Banners */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl p-3 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl p-3 mb-4">
                {success}
              </div>
            )}

            {/* Deposit */}
            {modal === 'deposit' && (
              <form onSubmit={handleDeposit} className="flex flex-col gap-4">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-medium border border-emerald-200">
                  Enter your phone number to receive an M-PESA STK Push prompt.
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">M-PESA Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="form-input"
                    min="10"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-pay w-full mt-2">
                  {loading ? 'Sending STK Push...' : 'Request M-PESA Deposit'}
                </button>
              </form>
            )}

            {/* Withdraw */}
            {modal === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-xs font-bold border border-amber-200 flex justify-between">
                  <span>Available Balance:</span>
                  <span>{fmt(wallet.available)}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">M-PESA Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Withdrawal Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="form-input"
                    max={wallet.available}
                    min="10"
                    required
                  />
                </div>

                {/* Fee calculation breakdown */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-ag-canvas rounded-xl p-3 text-xs flex flex-col gap-1.5 border border-ag-border font-medium">
                    <div className="flex justify-between text-ag-muted">
                      <span>Requested Withdrawal:</span>
                      <span>KSh {parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-ag-muted">
                      <span>Driver Transaction Fee:</span>
                      <span className="text-amber-600 font-bold">+ KSh 20.00</span>
                    </div>
                    <div className="flex justify-between text-ag-body font-bold border-t border-ag-border pt-1.5">
                      <span>Total Balance Deduction:</span>
                      <span className="text-ag-primary">KSh {(parseFloat(amount) + 20).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-escrow w-full mt-2">
                  {loading ? 'Processing Withdrawal...' : `Withdraw KSh ${amount ? parseFloat(amount).toLocaleString() : '0'} (+ KSh 20 Fee)`}
                </button>
              </form>
            )}

            {/* Transfer */}
            {modal === 'transfer' && (
              <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-bold border border-emerald-200 flex justify-between">
                  <span>Available Balance:</span>
                  <span>{fmt(wallet.available)}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Recipient Name / Phone</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="Recipient details"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    className="form-input"
                    max={wallet.available}
                    min="10"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? 'Transferring...' : 'Send Transfer'}
                </button>
              </form>
            )}

            {/* History */}
            {modal === 'history' && (
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                {history.map(tx => (
                  <div key={tx.id} className="p-3 bg-ag-canvas rounded-xl flex items-center justify-between border border-ag-border text-xs">
                    <div>
                      <p className="font-bold text-ag-body">{tx.label}</p>
                      <p className="text-[11px] text-ag-muted">Ref: {tx.ref} • {tx.date}</p>
                    </div>
                    <p className={`font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-ag-body'}`}>
                      {tx.type === 'credit' ? '+' : '-'} KSh {tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function LogisticsDashboard() {
  const location  = useLocation();
  const path      = location.pathname.split('/').pop();
  const [trackingCargo, setTrackingCargo] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  /* ── WALLET / EARNINGS paths delegate to WalletView ── */
  if (path === 'wallet' || path === 'earnings' || path === 'payments') {
    return <WalletView role="logistics" />;
  }

  /* ── STATS ── */
  const STATS = [
    { label: 'Total Deliveries', value: '47',         sub: 'All time',         icon: Package,        trend: '+12%', up: true,  color: 'bg-ag-primary-fixed text-ag-primary' },
    { label: 'On-Time Rate',     value: '95%',        sub: 'Last 30 days',     icon: CheckCircle2,   trend: '+3%',  up: true,  color: 'bg-ag-pay/10 text-ag-pay' },
    { label: 'Active Drivers',   value: '12',         sub: 'Currently online', icon: Clock,          trend: null,   up: null,  color: 'bg-amber-100 text-amber-800' },
    { label: 'Revenue',          value: 'KSh 35,200', sub: 'This month',       icon: Banknote,       trend: '+8%',  up: true,  color: 'bg-ag-dispute-cont text-ag-dispute' },
  ];



  return (
    <div className="flex flex-col gap-6 relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-xl shadow-lg
          font-bold text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingCargo && <LiveTrackingModal cargo={trackingCargo} onClose={() => setTrackingCargo(null)} />}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, trend, up, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-ag-border p-5 flex flex-col gap-3
            hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-ag-body">{value}</p>
              {up !== null && (
                <span className={`text-xs font-extrabold flex items-center gap-0.5
                  ${up ? 'text-ag-pay' : 'text-ag-error'}`}>
                  <TrendingUp className={`w-3 h-3 ${!up && 'rotate-180'}`} /> {trend}
                </span>
              )}
            </div>
            <p className="text-xs text-ag-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── WALLET BALANCE CARD (screenshot design) ── */}
      <WalletCard onAction={showToast} />



      {/* ── LIVE OPERATIONS TABLE ── */}
      <div className="bg-white rounded-2xl border border-ag-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ag-primary" />
            <h2 className="font-extrabold text-ag-body text-sm uppercase tracking-wider">Live Operations</h2>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-ag-muted font-bold">{LIVE_OPS.length} active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ag-canvas text-ag-muted text-xs border-b border-ag-border">
                {['Cargo', 'Weight', 'Route', 'Status', 'Driver', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ag-border">
              {LIVE_OPS.map(op => {
                const s = STATUS_CONFIG[op.status];
                return (
                  <tr key={op.id} className="hover:bg-ag-canvas transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ag-primary/10 rounded-xl flex items-center justify-center">
                          <Package className="w-4 h-4 text-ag-primary" />
                        </div>
                        <span className="font-bold text-ag-body">{op.cargo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ag-muted font-medium">{op.weight}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-ag-body">
                        <MapPin className="w-3 h-3 text-ag-muted shrink-0" />
                        <span className="text-xs">{op.from}</span>
                        <ChevronRight className="w-3 h-3 text-ag-muted" />
                        <span className="text-xs font-semibold">{op.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black px-3 py-1.5 rounded-full ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ag-body font-medium">{op.driver}</td>
                    <td className="px-6 py-4">
                      {op.action === 'track' ? (
                        <button
                          onClick={() => setTrackingCargo(op.cargo)}
                          className="flex items-center gap-1.5 bg-ag-primary hover:bg-emerald-800 text-white
                            text-xs font-extrabold px-3 py-2 rounded-lg transition-colors"
                        >
                          <Target className="w-3 h-3" /> Track Live
                        </button>
                      ) : (
                        <button
                          onClick={() => showToast(`Viewing details for ${op.cargo}`)}
                          className="flex items-center gap-1.5 bg-white border-2 border-ag-border hover:border-ag-primary
                            text-ag-body hover:text-ag-primary text-xs font-extrabold px-3 py-2 rounded-lg transition-all"
                        >
                          <Eye className="w-3 h-3" /> View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
