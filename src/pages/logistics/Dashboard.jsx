/* ── ShambaPoint Logistics Dashboard ─────────────────────── */
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import WalletView from '../shared/WalletView';
import {
  Truck, CheckCircle2, Clock, TrendingUp, MapPin, X,
  Navigation, Activity, Thermometer, Droplets, Gauge,
  Play, Pause, AlertTriangle, Package, Radio, Signal,
  Battery, ChevronRight, Eye, Target
} from 'lucide-react';

/* ── DATA ──────────────────────────────────────────────────── */
const LIVE_OPS = [
  { id: 1, cargo: 'Irish Potatoes', weight: '120kg', from: 'Nakuru', to: 'Nairobi CBD',  status: 'in_transit', driver: 'John Kamau',     action: 'track' },
  { id: 2, cargo: 'Tomatoes',       weight: '80kg',  from: 'Kiambu', to: 'Westlands',    status: 'completed',  driver: 'Janet Wanjiku',  action: 'view'  },
  { id: 3, cargo: 'Red Onions',     weight: '200kg', from: 'Kajiado', to: 'Mombasa Rd', status: 'pending',    driver: 'Unknown',        action: 'view'  },
  { id: 4, cargo: 'Cabbage',        weight: '150kg', from: 'Nyeri',  to: 'Thika',        status: 'delayed',    driver: 'Peter Njoroge',  action: 'track' },
];

const ROUTE_CHECKPOINTS = [
  { name: 'Nakuru Market',      km: 0,   reached: true  },
  { name: 'Gilgil Weighbridge', km: 45,  reached: true  },
  { name: 'Naivasha Town',      km: 85,  reached: false },
  { name: 'Limuru Junction',    km: 135, reached: false },
  { name: 'Nairobi CBD Depot',  km: 165, reached: false },
];

const STATUS_CONFIG = {
  in_transit: { label: 'IN-TRANSIT', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  completed:  { label: 'COMPLETED',  cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  pending:    { label: 'PENDING',    cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  delayed:    { label: 'DELAYED',    cls: 'bg-red-100 text-red-600 border border-red-200' },
};

/* ── LIVE TRACKING MODAL ───────────────────────────────────── */
const LiveTrackingModal = ({ cargo, onClose }) => {
  const [progress, setProgress] = useState(37);
  const [running, setRunning]   = useState(true);
  const [telemetry, setTelemetry] = useState({ speed: 72, temp: 14.2, humidity: 68, battery: 87, signal: 4 });
  const [logs, setLogs] = useState([
    { time: '09:14', msg: 'Shipment departed Nakuru Market', type: 'info' },
    { time: '09:52', msg: 'Passed Gilgil Weighbridge — 45 km', type: 'success' },
    { time: '10:18', msg: 'Cargo temperature optimal: 14.2°C', type: 'info' },
    { time: '10:41', msg: 'Current: 78 km from origin on A104', type: 'info' },
  ]);
  const intervalRef = useRef(null);
  const logRef = useRef(null);

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
        setLogs(l => [...l, { time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }), msg: `Reached ${cp.name} — ${cp.km} km`, type: 'success' }]);
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
                <p key={i} className={l.type === 'success' ? 'text-emerald-400' : 'text-gray-400'}>
                  <span className="text-ag-amber">[{l.time}]</span> {l.msg}
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
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function LogisticsDashboard() {
  const location  = useLocation();
  const path      = location.pathname.split('/').pop();
  const [trackingCargo, setTrackingCargo] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ── WALLET / EARNINGS paths delegate to WalletView ── */
  if (path === 'wallet' || path === 'earnings' || path === 'payments') {
    return <WalletView role="logistics" />;
  }

  /* ── STATS ── */
  const STATS = [
    { label: 'Total Deliveries', value: '47',          sub: 'All time',         trend: '+12%', up: true  },
    { label: 'On-Time Rate',     value: '95%',         sub: 'Last 30 days',     trend: '+3%',  up: true  },
    { label: 'Active Drivers',   value: '12',          sub: 'Currently online', trend: '0',    up: null  },
    { label: 'Revenue',          value: 'KSh 35,200',  sub: 'This month',       trend: '+8%',  up: true  },
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
        {STATS.map(({ label, value, sub, trend, up }) => (
          <div key={label} className="bg-white rounded-2xl border border-ag-border p-5 flex flex-col gap-3
            hover:shadow-md transition-shadow">
            <p className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-ag-body">{value}</p>
              {up !== null && (
                <span className={`text-xs font-extrabold flex items-center gap-0.5
                  ${up ? 'text-ag-pay' : 'text-red-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${!up && 'rotate-180'}`} /> {trend}
                </span>
              )}
            </div>
            <p className="text-xs text-ag-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── WALLET BALANCE CARD ── */}
      <div className="bg-gradient-to-br from-[#1B4332] via-[#1e5738] to-[#14532d] rounded-2xl p-6 text-white
        shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute -bottom-8 -right-8 w-64 h-64 border border-white rounded-full" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">Wallet Balance</p>
          <p className="text-4xl font-black mb-1">KSh 14,700.00</p>
          <p className="text-sm text-emerald-200 mb-5">Available balance</p>
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Add Funds', icon: '↓' },
              { label: 'Withdraw',  icon: '↑' },
              { label: 'Transfer',  icon: '⇄' },
              { label: 'History',   icon: '📋' },
            ].map(b => (
              <button key={b.label}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm
                  font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all backdrop-blur-sm"
                onClick={() => showToast(`${b.label} coming soon!`)}
              >
                <span>{b.icon}</span> {b.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-emerald-900/40 rounded-xl px-4 py-3 border border-emerald-700/40">
            <p className="text-xs text-emerald-200">Withdraw instantly to M-PESA anytime, 24/7</p>
            <button
              onClick={() => showToast('M-PESA withdrawal initiated!')}
              className="flex items-center gap-2 bg-ag-amber hover:bg-amber-600 text-white text-xs
                font-extrabold px-4 py-2 rounded-lg transition-colors"
            >
              Withdraw to M-PESA <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Wallet Overview Side Panel */}
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white/5 backdrop-blur-sm border-l border-white/10
          p-5 hidden xl:flex flex-col justify-center gap-4">
          <p className="text-xs font-extrabold text-emerald-200 uppercase tracking-wider">Wallet Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Available Balance', value: 'KSh 14,700.00', green: true },
              { label: 'This Month',        value: 'KSh 10,700.00', green: false },
              { label: 'Pending Balance',   value: 'KSh 1,200.00',  green: false, warn: true },
              { label: 'Total Withdrawn',   value: 'KSh 6,200.00',  green: false },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3">
                <p className="text-[10px] text-emerald-300 mb-1">{item.label}</p>
                <p className={`text-sm font-extrabold ${item.green ? 'text-emerald-300' : item.warn ? 'text-amber-300' : 'text-white'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
