import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Truck, CheckCircle2, Clock, DollarSign, MapPin, X, CheckCircle, Phone, Settings, Map,
  Navigation, Activity, Thermometer, Droplets, Gauge, Zap, Play, Pause, AlertTriangle,
  Package, User, MessageSquare, Radio, Signal, Battery,
  ArrowRight, CheckSquare, Wifi
} from 'lucide-react';

const INITIAL_TRIPS = [
  { id: 1, from: 'Nakuru', to: 'Nairobi CBD',  cargo: 'Irish Potatoes (120kg)', status: 'in_transit', earning: 3500, date: '9 Jun 2026', buyer: 'Naivas Supermarket', buyerPhone: '+254 712 345 678' },
  { id: 2, from: 'Kiambu', to: 'Westlands',    cargo: 'Tomatoes (80kg)',         status: 'completed',  earning: 2200, date: '8 Jun 2026', buyer: 'Janet Wanjiku',       buyerPhone: '+254 701 234 567' },
  { id: 3, from: 'Kajiado', to: 'Mombasa Rd',  cargo: 'Red Onions (200kg)',      status: 'pending',    earning: 5000, date: '10 Jun 2026', buyer: 'QuickMart Nairobi',  buyerPhone: '+254 722 987 654' },
];

const ROUTE_CHECKPOINTS = [
  { name: 'Nakuru Market',       km: 0,   lat: -0.303, lng: 36.080, reached: true  },
  { name: 'Gilgil Weighbridge',  km: 45,  lat: -0.509, lng: 36.316, reached: true  },
  { name: 'Naivasha Town',       km: 85,  lat: -0.717, lng: 36.431, reached: false },
  { name: 'Limuru Junction',     km: 135, lat: -1.107, lng: 36.651, reached: false },
  { name: 'Nairobi CBD Depot',   km: 165, lat: -1.286, lng: 36.817, reached: false },
];

const chipClass = (s) => ({ in_transit: 'chip-transit', completed: 'chip-completed', pending: 'chip-pending' })[s] || 'chip-pending';

/* ── LIVE TRACKING MODAL ─────────────────────────────────── */
const LiveTrackingModal = ({ trip, onClose }) => {
  const [progress, setProgress]   = useState(37); // 0–100 route progress %
  const [running, setRunning]     = useState(true);
  const [logs, setLogs]           = useState([
    { time: '09:14', msg: '🚀 Shipment departed Nakuru Market', type: 'info' },
    { time: '09:52', msg: '✅ Passed Gilgil Weighbridge — 45 km', type: 'success' },
    { time: '10:18', msg: '🌡️ Cargo temperature optimal: 14.2°C', type: 'info' },
    { time: '10:41', msg: '📍 Current: 78 km from origin on A104', type: 'info' },
  ]);
  const [telemetry, setTelemetry] = useState({ speed: 72, temp: 14.2, humidity: 68, battery: 87, signal: 4 });
  const intervalRef = useRef(null);
  const logRef = useRef(null);

  /* Live simulation */
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(intervalRef.current); return 100; }
        return Math.min(p + 0.4, 100);
      });
      setTelemetry(t => ({
        speed:    Math.max(0,  Math.min(110, t.speed    + (Math.random() - 0.5) * 8)),
        temp:     Math.max(10, Math.min(22,  t.temp     + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(55, Math.min(85,  t.humidity + (Math.random() - 0.5) * 3)),
        battery:  Math.max(10, t.battery - 0.05),
        signal:   Math.max(1,  Math.min(5, t.signal + (Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
      }));
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  /* Checkpoint events */
  useEffect(() => {
    const checkpointKm = (progress / 100) * 165;
    const checkpoint = ROUTE_CHECKPOINTS.find(c => !c.reached && checkpointKm >= c.km);
    if (checkpoint) {
      checkpoint.reached = true;
      const newLog = { time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }), msg: `✅ Reached checkpoint: ${checkpoint.name}`, type: 'success' };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs(l => [...l, newLog].slice(-20));
    }
  }, [progress]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const addLog = (msg, type = 'warning') => {
    const entry = { time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }), msg, type };
    setLogs(l => [...l, entry].slice(-20));
  };

  /* SVG route map coordinates */
  const mapW = 520, mapH = 200;
  const routePoints = [
    { x: 50,  y: 90, label: 'Nakuru' },
    { x: 145, y: 75, label: 'Gilgil' },
    { x: 230, y: 110, label: 'Naivasha' },
    { x: 360, y: 70, label: 'Limuru' },
    { x: 470, y: 100, label: 'Nairobi' },
  ];
  const svgPath = routePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const truckX = routePoints[0].x + (routePoints[routePoints.length - 1].x - routePoints[0].x) * (progress / 100);
  const truckY = 90 + Math.sin(progress * 0.1) * 20;
  const progressKm = Math.round((progress / 100) * 165);
  const eta = Math.max(0, Math.round(((165 - progressKm) / Math.max(telemetry.speed, 1)) * 60));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-ag-primary p-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold">Live Shipment Tracker</h3>
              <p className="text-white/70 text-xs">{trip.cargo} · {trip.from} → {trip.to}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* SVG Map */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-ag-border p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Map className="w-4 h-4 text-ag-primary" />
              <span className="text-xs font-extrabold text-ag-body uppercase tracking-wider">Route Map — A104 Highway, Kenya</span>
              <span className={`ml-auto flex items-center gap-1 text-xs font-bold ${running ? 'text-ag-pay' : 'text-ag-amber'}`}>
                <Signal className="w-3 h-3" /> GPS {running ? 'Active' : 'Paused'}
              </span>
            </div>
            <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full" style={{ height: '140px' }}>
              {/* Road shadow */}
              <path d={svgPath} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              {/* Completed path */}
              <path d={svgPath} fill="none" stroke="#d1fae5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="1000" strokeDashoffset={1000 - (progress / 100) * 1000} />
              {/* Full route */}
              <path d={svgPath} fill="none" stroke="#3d6c38" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="8 6" opacity="0.5" />

              {/* Checkpoint dots */}
              {routePoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="7" fill={i === 0 || i === routePoints.length - 1 ? '#3d6c38' : '#e5e7eb'}
                    stroke="white" strokeWidth="2" />
                  <text x={p.x} y={p.y + 20} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="600">{p.label}</text>
                </g>
              ))}

              {/* Animated truck */}
              <g transform={`translate(${truckX - 10}, ${truckY - 10})`}>
                <circle cx="10" cy="10" r="12" fill="#d97706" opacity="0.25" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                <circle cx="10" cy="10" r="9" fill="#d97706" stroke="white" strokeWidth="2" />
                <text x="10" y="14" textAnchor="middle" fontSize="10">🚛</text>
              </g>

              {/* Progress km label */}
              <text x={truckX} y={truckY - 20} textAnchor="middle" fontSize="10" fill="#d97706" fontWeight="700">{progressKm}km</text>
            </svg>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs font-bold text-ag-muted mb-1">
                <span>{trip.from}</span>
                <span className="text-ag-primary">{progress.toFixed(1)}% complete</span>
                <span>{trip.to}</span>
              </div>
              <div className="h-2 bg-ag-surface rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-ag-primary to-ag-pay rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* IoT Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Speed',      value: `${telemetry.speed.toFixed(0)}`,     unit: 'km/h',  icon: Gauge,       color: telemetry.speed > 90 ? 'text-red-500' : 'text-ag-primary', bg: 'bg-green-50' },
              { label: 'Cargo Temp', value: `${telemetry.temp.toFixed(1)}`,       unit: '°C',    icon: Thermometer, color: telemetry.temp > 20 ? 'text-red-500' : 'text-blue-500',     bg: 'bg-blue-50'  },
              { label: 'Humidity',   value: `${telemetry.humidity.toFixed(0)}`,   unit: '%',     icon: Droplets,    color: 'text-cyan-600',                                              bg: 'bg-cyan-50'  },
              { label: 'Battery',    value: `${telemetry.battery.toFixed(0)}`,    unit: '%',     icon: Battery,     color: telemetry.battery < 20 ? 'text-red-500' : 'text-ag-pay',     bg: 'bg-amber-50' },
              { label: 'ETA',        value: `${eta}`,                              unit: 'min',   icon: Clock,       color: 'text-purple-600',                                            bg: 'bg-purple-50'},
            ].map(({ label, value, unit, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} border border-ag-border rounded-xl p-3 flex flex-col items-center gap-1`}>
                <Icon className={`w-5 h-5 ${color}`} />
                <p className={`text-xl font-extrabold ${color}`}>{value}<span className="text-xs font-normal ml-0.5">{unit}</span></p>
                <p className="text-[10px] text-ag-muted font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Checkpoints */}
          <div className="border border-ag-border rounded-xl p-4 bg-white">
            <h4 className="text-sm font-extrabold text-ag-body mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-ag-primary" /> Route Checkpoints
            </h4>
            <div className="flex flex-col gap-2">
              {ROUTE_CHECKPOINTS.map((cp, i) => {
                const passed = (progress / 100) * 165 >= cp.km;
                const isCurrent = i === ROUTE_CHECKPOINTS.filter(c => (progress / 100) * 165 >= c.km).length - 1;
                return (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${isCurrent ? 'bg-ag-amber/10 border border-ag-amber' : passed ? 'bg-green-50' : 'bg-ag-surface'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${passed ? 'bg-ag-pay' : 'bg-ag-border'}`}>
                      {passed ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-ag-muted rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-ag-amber' : passed ? 'text-ag-pay' : 'text-ag-muted'}`}>
                        {isCurrent && '📍 '}{cp.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-ag-muted font-bold">{cp.km} km</span>
                    {isCurrent && <span className="text-[10px] bg-ag-amber text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">HERE</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buyer Info + Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buyer info */}
            <div className="border border-ag-border rounded-xl p-4 bg-white">
              <h4 className="text-sm font-extrabold text-ag-body mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Consumer Info
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <p><span className="text-ag-muted font-bold">Buyer:</span> {trip.buyer}</p>
                <p><span className="text-ag-muted font-bold">Contact:</span> {trip.buyerPhone}</p>
                <p><span className="text-ag-muted font-bold">Cargo:</span> {trip.cargo}</p>
                <p><span className="text-ag-muted font-bold">Destination:</span> {trip.to}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-ag-pay text-white font-bold py-2 rounded-lg hover:opacity-90">
                  <Phone className="w-3.5 h-3.5" /> Call Buyer
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-ag-border text-ag-body font-bold py-2 rounded-lg hover:bg-ag-surface">
                  <MessageSquare className="w-3.5 h-3.5" /> SMS Update
                </button>
              </div>
            </div>

            {/* Simulator controls */}
            <div className="border border-ag-border rounded-xl p-4 bg-white">
              <h4 className="text-sm font-extrabold text-ag-body mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-ag-amber" /> Simulator Controls
              </h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => setRunning(v => !v)} className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold text-sm transition-all ${running ? 'bg-ag-amber text-white' : 'bg-ag-primary text-white'}`}>
                  {running ? <><Pause className="w-4 h-4" /> Pause Simulation</> : <><Play className="w-4 h-4" /> Resume Simulation</>}
                </button>
                <button
                  onClick={() => { addLog('⚠️ Traffic jam detected — rerouting via Nakuru-Naivasha bypass', 'warning'); setTelemetry(t => ({ ...t, speed: 12 })); }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-xs border border-ag-amber text-ag-amber hover:bg-amber-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Simulate Traffic Delay
                </button>
                <button
                  onClick={() => { addLog('🚨 ALERT: Cargo temperature exceeded 20°C! Action required.', 'warning'); setTelemetry(t => ({ ...t, temp: 22.1 })); }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-xs border border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Thermometer className="w-3.5 h-3.5" /> Simulate Temp Alert
                </button>
                <button
                  onClick={() => { setProgress(100); addLog('🎉 Delivery completed! Buyer signature obtained.', 'success'); setRunning(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-xs bg-ag-pay text-white hover:opacity-90"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Simulate Delivery Done
                </button>
              </div>
            </div>
          </div>

          {/* Live log console */}
          <div className="border border-ag-border rounded-xl overflow-hidden">
            <div className="bg-ag-body px-4 py-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-ag-pay" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Telemetry Event Log</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-ag-pay font-bold">
                <Wifi className="w-3 h-3" /> Live
              </span>
            </div>
            <div ref={logRef} className="bg-gray-950 p-4 h-36 overflow-y-auto font-mono text-xs flex flex-col gap-1.5">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-gray-400'}`}>
                  <span className="text-gray-600 shrink-0">[{log.time}]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
              {running && <span className="text-green-500 animate-pulse">█ streaming...</span>}
            </div>
          </div>

          {/* Delivery confirmation */}
          {progress >= 100 && (
            <div className="bg-ag-pay/10 border-2 border-ag-pay rounded-xl p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-ag-pay mx-auto mb-2" />
              <p className="font-extrabold text-ag-pay text-lg">Delivery Complete!</p>
              <p className="text-sm text-ag-muted mt-1">All {trip.cargo} delivered to {trip.buyer} at {trip.to}</p>
              <button onClick={onClose} className="mt-4 btn-pay !py-3 !px-8">Confirm & Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   LOGISTICS DASHBOARD
═══════════════════════════════════════════════════════════ */
const LogisticsDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [trips, setTrips]         = useState(INITIAL_TRIPS);
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [trackingTrip, setTrackingTrip] = useState(null);
  const [toast, setToast]         = useState('');
  const [phone, setPhone]         = useState('0712 345 678');
  const balance = 14700;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = (id, newStatus) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    showToast(newStatus === 'in_transit' ? 'Trip accepted! Safe travels.' : 'Delivery marked as completed! Payment processed.');
    setModal(null);
  };

  const stats = [
    { icon: Truck,        label: 'Active Trips',  value: trips.filter(t=>t.status==='in_transit').length, sub: 'In progress now',   color: 'text-ag-primary' },
    { icon: CheckCircle2, label: 'Completed',      value: trips.filter(t=>t.status==='completed').length + 46, sub: 'All time',      color: 'text-ag-pay'    },
    { icon: Clock,        label: 'Pending',         value: trips.filter(t=>t.status==='pending').length,  sub: 'Awaiting dispatch',  color: 'text-ag-amber'  },
    { icon: DollarSign,   label: 'Total Earnings', value: `KSh ${trips.reduce((a,b)=>a+b.earning,0).toLocaleString()}`, sub: 'This month', color: 'text-blue-600' },
  ];

  /* ── TRIPS sub-page ── */
  if (currentPath === 'trips') {
    return (
      <div className="flex flex-col gap-4">
        {toast && <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{toast}</div>}
        <div className="bg-white border border-ag-border rounded-card overflow-hidden">
          <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
            <h2 className="text-headline-md text-ag-body flex items-center gap-2"><Truck className="w-5 h-5 text-ag-primary" /> All Trips</h2>
            <span className="chip-pending">{trips.filter(t=>t.status==='pending').length} Pending</span>
          </div>
          <div className="divide-y divide-ag-border">
            {trips.map(trip => (
              <div key={trip.id} className="px-6 py-4 hover:bg-ag-canvas transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-5 h-5 text-ag-primary-fixed" />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body text-sm">{trip.cargo}</p>
                      <div className="flex items-center gap-2 text-xs text-ag-muted mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{trip.from} → {trip.to}</span>
                      </div>
                      <p className="text-xs text-ag-muted mt-0.5">Buyer: {trip.buyer} · {trip.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-ag-amber font-extrabold text-sm">KSh {trip.earning.toLocaleString()}</span>
                    <span className={chipClass(trip.status)}>{trip.status.replace('_', ' ')}</span>
                    {trip.status === 'pending' && (
                      <button onClick={() => { setSelected(trip); setModal('trip'); }} className="text-xs text-ag-primary font-bold hover:underline">Accept Trip</button>
                    )}
                    {trip.status === 'in_transit' && (
                      <button onClick={() => setTrackingTrip(trip)} className="text-xs flex items-center gap-1 bg-ag-primary text-white px-2.5 py-1 rounded-full font-bold hover:opacity-90">
                        <Radio className="w-3 h-3" /> Track Live
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {modal === 'trip' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <h3 className="font-extrabold text-ag-body text-lg mb-3">Accept Trip?</h3>
              <p className="text-sm text-ag-muted mb-1">Cargo: <strong>{selected.cargo}</strong></p>
              <p className="text-sm text-ag-muted mb-1">Route: <strong>{selected.from} → {selected.to}</strong></p>
              <p className="text-sm text-ag-muted mb-1">Buyer: <strong>{selected.buyer}</strong></p>
              <p className="text-sm text-ag-muted mb-4">Earnings: <strong className="text-ag-amber">KSh {selected.earning.toLocaleString()}</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Decline</button>
                <button onClick={() => updateStatus(selected.id, 'in_transit')} className="btn-primary flex-1 !min-h-0 !py-3 !text-sm">Accept Trip</button>
              </div>
            </div>
          </div>
        )}
        {trackingTrip && <LiveTrackingModal trip={trackingTrip} onClose={() => setTrackingTrip(null)} />}
      </div>
    );
  }

  /* ── DELIVERIES sub-page ── */
  if (currentPath === 'deliveries') {
    const activeDeliveries = trips.filter(t => t.status === 'in_transit');
    const pendingDeliveries = trips.filter(t => t.status === 'pending');
    return (
      <div className="flex flex-col gap-6">
        {toast && <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{toast}</div>}

        <div className="flex items-center justify-between">
          <h2 className="text-headline-md text-ag-body flex items-center gap-2">
            <Map className="w-6 h-6 text-ag-primary" /> Consumer Deliveries
          </h2>
          <div className="flex items-center gap-2">
            <span className="chip-transit">{activeDeliveries.length} Active</span>
            <span className="chip-pending">{pendingDeliveries.length} Pending</span>
          </div>
        </div>

        {/* Active deliveries with Live Track button */}
        {activeDeliveries.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-ag-body flex items-center gap-2">
              <span className="w-2 h-2 bg-ag-pay rounded-full animate-pulse" /> Active Shipments
            </h3>
            {activeDeliveries.map(trip => (
              <div key={trip.id} className="bg-gradient-to-br from-ag-primary to-ag-primary-cont rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-5 h-5 text-ag-amber" />
                      <p className="font-extrabold text-lg">{trip.cargo}</p>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{trip.from} <ArrowRight className="w-3 h-3 inline mx-1" /> {trip.to}</span>
                    </div>
                    <p className="text-white/60 text-xs mt-1">Consumer: <span className="text-white font-bold">{trip.buyer}</span> · {trip.buyerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-ag-amber font-extrabold text-xl">KSh {trip.earning.toLocaleString()}</p>
                    <p className="text-white/50 text-xs">Earnings</p>
                  </div>
                </div>

                {/* Live telemetry bar */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Speed', value: '72 km/h', icon: Gauge },
                    { label: 'Temp',  value: '14.2°C',  icon: Thermometer },
                    { label: 'ETA',   value: '~52 min', icon: Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-ag-amber mx-auto mb-1" />
                      <p className="font-extrabold text-sm">{value}</p>
                      <p className="text-white/50 text-[10px]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Route progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-white/60 mb-1.5">
                    <span>{trip.from}</span>
                    <span className="text-ag-amber">In Transit — 47% complete</span>
                    <span>{trip.to}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[47%] bg-ag-amber rounded-full" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setTrackingTrip(trip)} className="flex-1 flex items-center justify-center gap-2 bg-ag-amber text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all">
                    <Radio className="w-4 h-4 animate-pulse" /> Track Shipment Live
                  </button>
                  <button onClick={() => { updateStatus(trip.id, 'completed'); }} className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold py-3 px-4 rounded-xl transition-all">
                    <CheckSquare className="w-4 h-4" /> Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending deliveries */}
        {pendingDeliveries.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-ag-body flex items-center gap-2">
              <Clock className="w-4 h-4 text-ag-amber" /> Pending Acceptance
            </h3>
            {pendingDeliveries.map(trip => (
              <div key={trip.id} className="border border-ag-border rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-ag-amber" />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body">{trip.cargo}</p>
                      <p className="text-xs text-ag-muted">{trip.from} → {trip.to} · {trip.buyer}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-ag-amber font-extrabold">KSh {trip.earning.toLocaleString()}</span>
                    <button onClick={() => { setSelected(trip); setModal('trip'); }} className="btn-primary !min-h-0 !py-2 !px-4 !text-xs">
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDeliveries.length === 0 && pendingDeliveries.length === 0 && (
          <div className="py-16 text-center">
            <Truck className="w-14 h-14 text-ag-border mx-auto mb-3" />
            <p className="font-bold text-ag-muted">No active deliveries at the moment.</p>
          </div>
        )}

        {/* Modal: Accept Trip */}
        {modal === 'trip' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <h3 className="font-extrabold text-ag-body text-lg mb-3">Accept Delivery?</h3>
              <p className="text-sm text-ag-muted mb-1">Cargo: <strong>{selected.cargo}</strong></p>
              <p className="text-sm text-ag-muted mb-1">Route: <strong>{selected.from} → {selected.to}</strong></p>
              <p className="text-sm text-ag-muted mb-1">Consumer: <strong>{selected.buyer}</strong></p>
              <p className="text-sm text-ag-muted mb-4">Earnings: <strong className="text-ag-amber">KSh {selected.earning.toLocaleString()}</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Decline</button>
                <button onClick={() => updateStatus(selected.id, 'in_transit')} className="btn-primary flex-1 !min-h-0 !py-3 !text-sm">Accept Delivery</button>
              </div>
            </div>
          </div>
        )}

        {trackingTrip && <LiveTrackingModal trip={trackingTrip} onClose={() => setTrackingTrip(null)} />}
      </div>
    );
  }

  /* ── EARNINGS sub-page ── */
  if (currentPath === 'earnings') {
    return (
      <div className="flex flex-col gap-6">
        {toast && <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{toast}</div>}
        <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-ag-primary-fixed text-sm font-bold uppercase tracking-widest mb-2">M-PESA Earnings Balance</p>
              <p className="text-5xl font-extrabold text-white">KSh {balance.toLocaleString()}</p>
              <p className="text-white/50 text-xs mt-1 font-bold">Available for withdrawal</p>
            </div>
            <button onClick={() => setModal('withdraw')} className="btn-pay !min-h-0 !py-4 !px-6 !text-base">Withdraw to M-PESA</button>
          </div>
        </div>
        {modal === 'withdraw' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-ag-body">Withdraw to M-PESA</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
              </div>
              <div className="bg-ag-surface rounded-btn p-3 mb-4 text-sm font-bold text-ag-body">
                Available: <span className="text-ag-pay">KSh {balance.toLocaleString()}</span>
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
                  <input type="number" defaultValue={balance} max={balance} className="form-input text-sm" />
                </div>
                <button onClick={() => { showToast(`KSh ${balance.toLocaleString()} withdrawal initiated to ${phone}!`); setModal(null); }} className="btn-pay w-full mt-2">Confirm Withdrawal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── SETTINGS sub-page ── */
  if (currentPath === 'settings') {
    return (
      <div className="bg-white border border-ag-border rounded-card p-8 max-w-2xl">
        <h2 className="text-headline-md text-ag-body mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-ag-primary" /> Logistics Settings</h2>
        <div className="flex flex-col gap-5">
          <div><label className="block text-sm font-bold text-ag-body mb-1.5">Driver Name</label><input type="text" defaultValue="David Ochieng" className="form-input" /></div>
          <div><label className="block text-sm font-bold text-ag-body mb-1.5">Vehicle Registration</label><input type="text" defaultValue="KCA 123Z (Isuzu FRR)" className="form-input" /></div>
          <div><label className="block text-sm font-bold text-ag-body mb-1.5">Active Routes</label><input type="text" defaultValue="Nakuru, Nairobi, Kiambu" className="form-input" /></div>
          <div><label className="block text-sm font-bold text-ag-body mb-1.5">M-PESA Number</label><input type="text" defaultValue="+254 712 345 678" className="form-input" /></div>
          <button onClick={() => showToast('Settings saved successfully!')} className="btn-primary w-fit mt-2">Save Profile Settings</button>
        </div>
      </div>
    );
  }

  /* ── MAIN DASHBOARD ── */
  return (
    <div className="flex flex-col gap-6 relative">
      {toast && <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{toast}</div>}

      {/* Stats */}
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

      {/* Earnings Card */}
      <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-ag-primary-fixed text-xs font-bold uppercase tracking-widest mb-2">M-PESA Earnings Balance</p>
            <p className="text-4xl font-extrabold text-white">KSh {balance.toLocaleString()}</p>
            <p className="text-white/50 text-xs mt-1 font-bold">Available for withdrawal</p>
          </div>
          <button onClick={() => setModal('withdraw')} className="btn-pay !min-h-0 !py-3 !text-sm">Withdraw to M-PESA</button>
        </div>
      </div>

      {/* My Trips */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <h2 className="text-headline-md text-ag-body flex items-center gap-2"><Truck className="w-5 h-5 text-ag-primary" /> My Trips</h2>
          <span className="chip-pending">{trips.filter(t=>t.status==='pending').length} Pending</span>
        </div>
        <div className="divide-y divide-ag-border">
          {trips.map(trip => (
            <div key={trip.id} className="px-6 py-4 hover:bg-ag-canvas transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-5 h-5 text-ag-primary-fixed" />
                  </div>
                  <div>
                    <p className="font-bold text-ag-body text-sm">{trip.cargo}</p>
                    <div className="flex items-center gap-2 text-xs text-ag-muted mt-0.5">
                      <MapPin className="w-3 h-3" /><span>{trip.from} → {trip.to}</span>
                    </div>
                    <p className="text-xs text-ag-muted mt-0.5">Consumer: {trip.buyer} · {trip.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold text-sm">KSh {trip.earning.toLocaleString()}</span>
                  <span className={chipClass(trip.status)}>{trip.status.replace('_', ' ')}</span>
                  {trip.status === 'pending' && (
                    <button onClick={() => { setSelected(trip); setModal('trip'); }} className="text-xs text-ag-primary font-bold hover:underline">Accept Trip</button>
                  )}
                  {trip.status === 'in_transit' && (
                    <div className="flex gap-2">
                      <button onClick={() => setTrackingTrip(trip)} className="text-xs flex items-center gap-1 bg-ag-primary text-white px-2.5 py-1 rounded-full font-bold hover:opacity-90">
                        <Radio className="w-3 h-3" /> Track Live
                      </button>
                      <button onClick={() => updateStatus(trip.id, 'completed')} className="text-xs text-ag-pay font-bold hover:underline">Mark Delivered</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Withdraw ── */}
      {modal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body">Withdraw to M-PESA</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="bg-ag-surface rounded-btn p-3 mb-4 text-sm font-bold text-ag-body">
              Available: <span className="text-ag-pay">KSh {balance.toLocaleString()}</span>
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
                <input type="number" defaultValue={balance} max={balance} className="form-input text-sm" />
              </div>
              <button onClick={() => { showToast(`KSh ${balance.toLocaleString()} withdrawal initiated to ${phone}!`); setModal(null); }} className="btn-pay w-full mt-2">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Accept Trip ── */}
      {modal === 'trip' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <h3 className="font-extrabold text-ag-body text-lg mb-3">Accept Trip?</h3>
            <p className="text-sm text-ag-muted mb-1">Cargo: <strong>{selected.cargo}</strong></p>
            <p className="text-sm text-ag-muted mb-1">Route: <strong>{selected.from} → {selected.to}</strong></p>
            <p className="text-sm text-ag-muted mb-1">Consumer: <strong>{selected.buyer}</strong></p>
            <p className="text-sm text-ag-muted mb-4">Earnings: <strong className="text-ag-amber">KSh {selected.earning.toLocaleString()}</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Decline</button>
              <button onClick={() => updateStatus(selected.id, 'in_transit')} className="btn-primary flex-1 !min-h-0 !py-3 !text-sm">Accept Trip</button>
            </div>
          </div>
        </div>
      )}

      {trackingTrip && <LiveTrackingModal trip={trackingTrip} onClose={() => setTrackingTrip(null)} />}
    </div>
  );
};

export default LogisticsDashboard;
