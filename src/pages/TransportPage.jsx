import { useState, useEffect, useRef } from 'react';
import {
  Truck, MapPin, Clock, CheckCircle, AlertTriangle,
  Phone, Star, Navigation, Plus, X, User,
  Activity, ShieldCheck, ThermometerSnowflake, Droplets, Play, ShieldAlert
} from 'lucide-react';

const DRIVERS = [
  { id: 1, name: 'David Ochieng', vehicle: 'Isuzu FRR · KCA 123Z', rating: 4.8, trips: 142, status: 'available', rate: 85, avatar: 'DO', phone: '0711222333' },
  { id: 2, name: 'Peter Waweru',  vehicle: 'Mitsubishi Canter · KBX 456Y', rating: 4.6, trips: 98,  status: 'available', rate: 90, avatar: 'PW', phone: '0722333444' },
  { id: 3, name: 'James Kimani',  vehicle: 'Toyota Dyna · KDA 789W', rating: 4.9, trips: 201, status: 'on_trip',   rate: 80, avatar: 'JK', phone: '0733444555' },
  { id: 4, name: 'Agnes Wambui',  vehicle: 'Isuzu NKR · KDB 012X', rating: 4.7, trips: 77,  status: 'available', rate: 88, avatar: 'AW', phone: '0744555666' },
];

const ORDER_STATUSES = ['Pending','Accepted','Preparing','Collected','In Transit','Delivered','Completed'];

const DELIVERIES = [
  { id: 'DEL-001', driver: 'David Ochieng', from: 'Nakuru Warehouse', to: 'Nairobi CBD', crop: 'Maize 50 bags', status: 'In Transit', step: 4, date: '2026-06-18', cost: 4200, eta: '14:30', phone: '0711222333', vehicle: 'Isuzu FRR · KCA 123Z' },
  { id: 'DEL-002', driver: 'Agnes Wambui',  from: 'Eldoret Farm',    to: 'Kisumu Market', crop: 'Beans 30 bags', status: 'Delivered', step: 5, date: '2026-06-17', cost: 3100, eta: 'Done', phone: '0744555666', vehicle: 'Isuzu NKR · KDB 012X' },
  { id: 'DEL-003', driver: 'Unassigned',    from: 'Meru Farm',       to: 'Nairobi Wakulima', crop: 'Tomatoes 300kg', status: 'Pending', step: 0, date: '2026-06-19', cost: 2800, eta: 'TBD', phone: '', vehicle: '' },
];

const statusColors = {
  'Pending':    'chip-pending',
  'Accepted':   'chip-verified',
  'Preparing':  'chip-escrow',
  'Collected':  'chip-transit',
  'In Transit': 'chip-transit',
  'Delivered':  'chip-completed',
  'Completed':  'chip-completed',
};

// Real-Time GPS Tracking & IoT Diagnostics Modal
const TrackingModal = ({ delivery, onClose, onStatusChange }) => {
  const [progress, setProgress] = useState(65); // starts at 65%
  const [speed, setSpeed] = useState(72);
  const [temp, setTemp] = useState(16.5);
  const [humidity, setHumidity] = useState(55);
  const [eta, setEta] = useState(45); // 45 minutes remaining
  const [routeStatus, setRouteStatus] = useState('On Schedule'); // 'On Schedule' | 'Delayed' | 'Cooling Alert'
  const [simRunning, setSimRunning] = useState(true);
  const [logs, setLogs] = useState([
    'GPS Lock established on vehicle KCA 123Z.',
    'Cold chain temperature sensor: 16.2°C [OK]',
    'Enroute via Nakuru-Nairobi highway. Speed: 72 km/h'
  ]);
  const consoleEndRef = useRef(null);

  // Auto increment progress slightly
  useEffect(() => {
    if (!simRunning) return;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setSimRunning(false);
          setSpeed(0);
          setEta(0);
          setLogs(l => [...l, '🚚 Cargo reached destination. Awaiting recipient confirmation.']);
          onStatusChange(delivery.id, 'Delivered', 5);
          return 100;
        }
        
        const nextProgress = Number((prev + 0.5).toFixed(1));
        const nextEta = Math.max(1, Math.round(eta * (1 - (nextProgress - prev) / (100 - prev))));
        setEta(nextEta);

        // Fluctuate stats
        setSpeed(s => Math.round(s + (Math.random() - 0.5) * 4));
        setTemp(t => Number((t + (Math.random() - 0.5) * 0.2).toFixed(1)));
        setHumidity(h => Math.min(100, Math.max(0, h + Math.round((Math.random() - 0.5) * 2))));

        // Append log sometimes
        if (Math.random() > 0.7) {
          const timestamp = new Date().toLocaleTimeString();
          const routeLog = `[${timestamp}] Telemetry update: Location Lat/Long updated. Signal strength 98%`;
          setLogs(l => [...l.slice(-10), routeLog]);
        }

        return nextProgress;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [simRunning, eta, delivery.id, onStatusChange]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle Delay Simulation
  const simulateDelay = () => {
    setRouteStatus('Delayed');
    setSpeed(12); // traffic speed
    setEta(prev => prev + 25); // extend ETA
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] ⚠️ ALERT: Heavy traffic delay near Limuru toll plaza. Speed reduced to 12km/h. ETA updated.`]);
  };

  // Handle Cold Chain Anomaly
  const simulateTempSpike = () => {
    setRouteStatus('Cooling Alert');
    setTemp(22.8); // high temp
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] 🚨 ALARM: Cargo temperature (22.8°C) exceeds safety limit (20°C)! Cooling compressor malfunction detected.`]);
    setTimeout(() => {
      setLogs(l => [...l, `[${timestamp}] 🔧 SYSTEM RESPONSE: Auxiliary compressor deployed. Cooling re-stabilized.`]);
      setTemp(18.2);
    }, 4500);
  };

  // Fast forward to destination
  const instantComplete = () => {
    setProgress(100);
    setSpeed(0);
    setEta(0);
    setSimRunning(false);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] 🟢 Manual override: Shipment arrived at destination. Delivered status saved.`]);
    onStatusChange(delivery.id, 'Delivered', 5);
  };

  return (
    <div className="modal-overlay z-[120]" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl bg-white dark:bg-dark-card border border-ag-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-ag-primary animate-pulse" />
            <div>
              <h3 className="font-extrabold text-ag-body dark:text-white text-base">GPS Live Shipment Tracker</h3>
              <p className="text-xs text-ag-muted font-semibold">{delivery.crop} · Shipment ID: {delivery.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ag-muted hover:text-ag-body dark:hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Map Vector Animation */}
          <div className="bg-slate-900 border border-slate-800 rounded-card p-5 relative overflow-hidden h-44 flex flex-col justify-between text-white">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
            
            {/* Vector Route Path */}
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-1 bg-slate-700 rounded-full">
              {/* Progress fill */}
              <div className="h-full bg-ag-pay rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Checkpoints */}
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 flex justify-between">
              {[
                { name: delivery.from.split(' ')[0], active: progress >= 0 },
                { name: 'Gilgil', active: progress >= 33 },
                { name: 'Limuru', active: progress >= 66 },
                { name: delivery.to.split(' ')[0], active: progress >= 100 },
              ].map((cp, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    cp.active ? 'bg-ag-pay border-white' : 'bg-slate-800 border-slate-600'
                  }`}>
                    {cp.active && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </div>
                  <span className={`absolute top-5 text-[9px] font-bold uppercase tracking-wider ${
                    cp.active ? 'text-white' : 'text-slate-500'
                  }`}>{cp.name}</span>
                </div>
              ))}
            </div>

            {/* Moving Truck Icon */}
            <div
              className="absolute top-1/2 -translate-y-[18px] transition-all duration-300 flex flex-col items-center"
              style={{ left: `calc(10px + (100% - 60px) * (${progress} / 100))` }}
            >
              <div className="bg-ag-pay text-white p-1.5 rounded-full shadow-lg border border-white flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-ag-pay animate-ping absolute top-0" />
            </div>

            {/* Overlay indicators */}
            <div className="z-10 flex items-center justify-between">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-btn text-[10px] font-bold text-white border border-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ag-pay" /> {delivery.from} → {delivery.to}
              </span>
              <span className={`px-2.5 py-1 rounded-btn text-[10px] font-extrabold border uppercase tracking-wider ${
                routeStatus === 'On Schedule' ? 'bg-green-500/20 border-green-500 text-green-300' :
                routeStatus === 'Delayed' ? 'bg-amber-500/20 border-amber-500 text-amber-300' :
                'bg-red-500/20 border-red-500 text-red-300'
              }`}>{routeStatus}</span>
            </div>

            <div className="z-10 flex justify-between items-end">
              <p className="text-[10px] font-mono text-slate-400">Telemetry: Lat -1.2921, Long 36.8219</p>
              <p className="text-sm font-extrabold text-white">{progress}% Completed</p>
            </div>
          </div>

          {/* IoT Diagnostics Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ThermometerSnowflake, label: 'Cargo Temp', value: `${temp}°C`, indicator: temp > 20 ? 'TEMP ALERT' : 'optimal', color: temp > 20 ? 'text-red-600 bg-red-50 dark:bg-red-950/15' : 'text-blue-600 bg-blue-50 dark:bg-blue-950/15' },
              { icon: Activity, label: 'Speed', value: `${speed} km/h`, indicator: speed === 0 ? 'Stationary' : 'cruising', color: 'text-green-600 bg-green-50 dark:bg-green-950/15' },
              { icon: Droplets, label: 'Humidity', value: `${humidity}%`, indicator: 'monitored', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/15' },
              { icon: Clock, label: 'Time to Arrival', value: eta === 0 ? 'Arrived' : `${eta} mins`, indicator: eta === 0 ? 'Discharging' : 'on time', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/15' },
            ].map((g, idx) => (
              <div key={idx} className="border border-ag-border dark:border-dark-border rounded-card p-3 flex flex-col gap-1.5 bg-ag-surface dark:bg-dark-surface/50">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-ag-muted uppercase tracking-wider">{g.label}</span>
                  <g.icon className="w-3.5 h-3.5 text-ag-muted" />
                </div>
                <p className="text-lg font-extrabold text-ag-body dark:text-white">{g.value}</p>
                <span className={`inline-block text-[9px] font-bold uppercase text-center px-1.5 py-0.5 rounded-full ${g.color}`}>
                  {g.indicator}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Simulator Tools */}
          <div className="border border-dashed border-ag-primary-cont bg-ag-primary-cont/5 dark:bg-dark-card rounded-card p-4">
            <h4 className="text-xs font-extrabold text-ag-body dark:text-white mb-2 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-ag-primary" /> Live Anomaly Simulator Controls
            </h4>
            <p className="text-[11px] text-ag-muted mb-3">Trigger physical challenges along the transit route to inspect the system's fail-safes and notification mechanisms.</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={simulateDelay}
                disabled={progress >= 100}
                className="bg-white dark:bg-dark-surface border border-ag-border dark:border-dark-border hover:border-amber-500 text-ag-body dark:text-gray-300 font-bold text-xs py-2 px-3 rounded-btn flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Simulate Traffic Delay
              </button>
              <button
                onClick={simulateTempSpike}
                disabled={progress >= 100}
                className="bg-white dark:bg-dark-surface border border-ag-border dark:border-dark-border hover:border-red-500 text-ag-body dark:text-gray-300 font-bold text-xs py-2 px-3 rounded-btn flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Simulate Cooling Failure
              </button>
              <button
                onClick={instantComplete}
                disabled={progress >= 100}
                className="bg-ag-pay hover:bg-green-700 text-white font-bold text-xs py-2 px-3 rounded-btn flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Instant Delivery
              </button>
            </div>
          </div>

          {/* Live Telemetry Console Logs */}
          <div className="flex flex-col bg-slate-900 rounded-card p-3 text-xs text-slate-300 font-mono border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 mb-1.5 border-b border-slate-800 pb-1 uppercase tracking-wider flex items-center justify-between">
              <span>Transit Telemetry Log</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Live Feed</span>
            </p>
            <div className="h-24 overflow-y-auto flex flex-col gap-1.5">
              {logs.map((l, idx) => (
                <p key={idx} className="leading-tight">
                  {l.includes('🚨') || l.includes('ALARM') ? (
                    <span className="text-red-400 font-bold">{l}</span>
                  ) : l.includes('⚠️') ? (
                    <span className="text-amber-400">{l}</span>
                  ) : l.includes('🚚') || l.includes('🟢') ? (
                    <span className="text-green-400">{l}</span>
                  ) : (
                    <span className="text-slate-400">{l}</span>
                  )}
                </p>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-4 bg-ag-surface dark:bg-dark-surface/50 px-6 py-4 border-t border-ag-border dark:border-dark-border sticky bottom-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ag-primary flex items-center justify-center text-white text-xs font-bold font-mono">
              DO
            </div>
            <div>
              <p className="text-xs font-extrabold text-ag-body dark:text-white">{delivery.driver}</p>
              <p className="text-[10px] text-ag-muted font-semibold">{delivery.vehicle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${delivery.phone}`} className="btn-secondary !min-h-0 !py-2 !px-4 !text-xs dark:bg-dark-surface flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Call Driver
            </a>
            <button onClick={onClose} className="btn-primary !min-h-0 !py-2 !px-4 !text-xs">
              Close Tracker
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const BookModal = ({ onClose, onBook }) => {
  const [form, setForm] = useState({ pickup: '', destination: '', crop: '', weight: '', date: '', notes: '' });
  const [step, setStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const available = DRIVERS.filter(d => d.status === 'available');

  const estimateCost = () => {
    if (!selectedDriver || !form.weight) return '—';
    return `KSh ${(selectedDriver.rate * 45 + Number(form.weight) * 2).toLocaleString()}`;
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg bg-white dark:bg-dark-card border border-ag-border dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border dark:border-dark-border">
          <h3 className="font-extrabold text-ag-body dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-ag-primary" />
            {step === 1 ? 'Book Transport' : 'Choose Driver'}
          </h3>
          <button onClick={onClose} className="text-ag-muted hover:text-ag-body dark:hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="form-label dark:text-gray-300">Pickup Location</label>
                  <input value={form.pickup} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" placeholder="e.g. Nakuru Warehouse A" />
                </div>
                <div className="col-span-2">
                  <label className="form-label dark:text-gray-300">Destination</label>
                  <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" placeholder="e.g. Nairobi Wakulima Market" />
                </div>
                <div>
                  <label className="form-label dark:text-gray-300">Produce</label>
                  <input value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" placeholder="e.g. Maize" />
                </div>
                <div>
                  <label className="form-label dark:text-gray-300">Total Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" placeholder="500" />
                </div>
                <div>
                  <label className="form-label dark:text-gray-300">Pickup Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" />
                </div>
                <div>
                  <label className="form-label dark:text-gray-300">Notes (optional)</label>
                  <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="form-input dark:bg-dark-surface dark:border-dark-border dark:text-white" placeholder="Fragile, keep cool, etc." />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.pickup || !form.destination}
                className="btn-primary w-full mt-2">Next — Choose Driver →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ag-muted dark:text-gray-400">Select an available driver for your delivery:</p>
              {available.map(d => (
                <button key={d.id} onClick={() => setSelectedDriver(d)}
                  className={`flex items-center gap-4 p-4 rounded-card border-2 text-left transition-all dark:bg-dark-surface/50
                    ${selectedDriver?.id === d.id ? 'border-ag-primary bg-ag-primary-fixed dark:border-ag-primary' : 'border-ag-border hover:border-ag-primary dark:border-dark-border'}`}>
                  <div className="w-12 h-12 rounded-full bg-ag-primary flex items-center justify-center text-white font-extrabold shrink-0">
                    {d.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-ag-body dark:text-white">{d.name}</p>
                    <p className="text-xs text-ag-muted dark:text-gray-400">{d.vehicle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold dark:text-gray-300">{d.rating}</span>
                      <span className="text-xs text-ag-muted dark:text-gray-400">· {d.trips} trips</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ag-amber text-sm">KSh {d.rate}/km</p>
                    <span className="chip-completed text-[9px]">Available</span>
                  </div>
                </button>
              ))}

              {selectedDriver && (
                <div className="bg-ag-surface dark:bg-dark-surface border border-ag-border dark:border-dark-border rounded-card p-4 text-sm">
                  <p className="font-bold text-ag-body dark:text-white mb-2">Estimated Cost</p>
                  <div className="flex justify-between">
                    <span className="text-ag-muted dark:text-gray-400">Route distance (est.)</span>
                    <span className="font-bold dark:text-white">~45 km</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-ag-muted dark:text-gray-400">Total estimate</span>
                    <span className="font-extrabold text-ag-amber text-base">{estimateCost()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-ghost dark:text-gray-300 border border-ag-border dark:border-dark-border flex-1 justify-center">← Back</button>
                <button onClick={() => { onBook(form, selectedDriver); onClose(); }}
                  disabled={!selectedDriver} className="btn-primary flex-1">
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TransportPage() {
  const [deliveries, setDeliveries] = useState(DELIVERIES);
  const [showBook, setShowBook] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleBook = (form, driver) => {
    const newDel = {
      id: `DEL-00${deliveries.length + 1}`,
      driver: driver?.name || 'Unassigned',
      from: form.pickup,
      to: form.destination,
      crop: `${form.crop} ${form.weight}kg`,
      status: driver ? 'Accepted' : 'Pending',
      step: driver ? 1 : 0,
      date: form.date || '2026-06-19',
      cost: driver ? driver.rate * 45 : 0,
      eta: 'TBD',
      phone: driver?.phone || '',
      vehicle: driver?.vehicle || '',
    };
    setDeliveries(prev => [newDel, ...prev]);
    showToast(`Delivery booked! ${driver ? `${driver.name} assigned.` : 'Finding driver...'}`);
  };

  const handleStatusChange = (id, newStatus, newStep) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, step: newStep, eta: newStatus === 'Delivered' ? 'Done' : d.eta } : d));
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-pay text-white px-5 py-3 rounded-card
          shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="green-gradient rounded-xl2 p-6 text-white flex items-center justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-6 h-6" />
            <h2 className="font-extrabold text-xl">Logistics & Transport</h2>
          </div>
          <p className="text-white/70 text-sm">Book, track and manage your deliveries in real-time.</p>
        </div>
        <button onClick={() => setShowBook(true)}
          className="bg-white text-ag-primary font-extrabold px-5 py-3 rounded-btn
            hover:bg-ag-primary-fixed transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Book Transport
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', value: deliveries.length, color: 'text-ag-primary dark:text-ag-primary-fixed' },
          { label: 'In Transit',       value: deliveries.filter(d => d.status === 'In Transit').length, color: 'text-blue-600' },
          { label: 'Delivered',        value: deliveries.filter(d => d.status === 'Delivered' || d.status === 'Completed').length, color: 'text-ag-pay' },
          { label: 'Pending',          value: deliveries.filter(d => d.status === 'Pending').length, color: 'text-ag-amber' },
        ].map(s => (
          <div key={s.label} className="ag-card dark:bg-dark-card text-center shadow-sm">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ag-muted dark:text-gray-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Deliveries */}
      <div className="ag-card dark:bg-dark-card !p-0 overflow-hidden shadow-sm">
        <div className="section-header dark:border-dark-border px-6 py-4 border-b border-ag-border">
          <h3 className="font-extrabold text-ag-body dark:text-white">My Deliveries</h3>
        </div>
        <div className="divide-y divide-ag-border dark:divide-dark-border">
          {deliveries.map(d => (
            <div key={d.id} className="p-5 hover:bg-ag-canvas dark:hover:bg-dark-surface/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-btn bg-ag-surface dark:bg-dark-surface flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-ag-primary dark:text-ag-primary-fixed" />
                  </div>
                  <div>
                    <p className="font-extrabold text-ag-body dark:text-white">{d.crop}</p>
                    <p className="text-xs text-ag-muted dark:text-gray-400">
                      {d.from} → {d.to}
                    </p>
                    <p className="text-xs text-ag-muted dark:text-gray-400 mt-0.5">
                      Driver: <span className="font-bold text-ag-body dark:text-white">{d.driver}</span> · {d.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center sm:items-end gap-3 sm:flex-col shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className={statusColors[d.status]}>{d.status}</span>
                    <p className="text-xs font-bold text-ag-amber">KSh {d.cost.toLocaleString()}</p>
                    {d.eta !== 'Done' && d.eta !== 'TBD' && (
                      <p className="text-xs text-ag-muted dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ETA {d.eta}
                      </p>
                    )}
                  </div>
                  {d.status === 'In Transit' && (
                    <button
                      onClick={() => setSelectedTrack(d)}
                      className="btn-primary !min-h-0 !py-2 !px-3.5 !text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Navigation className="w-3.5 h-3.5 text-white animate-pulse" /> Track Live
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-1 mt-2">
                {ORDER_STATUSES.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full h-1.5 rounded-full ${i <= d.step ? 'bg-ag-pay' : 'bg-ag-surface dark:bg-dark-surface'}`} />
                    {i <= d.step && (
                      <span className="text-[8px] text-ag-muted dark:text-gray-400 font-bold hidden lg:block text-center leading-tight">
                        {s}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Drivers */}
      <div className="ag-card dark:bg-dark-card shadow-sm">
        <h3 className="font-extrabold text-ag-body dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-ag-primary" /> Registered Fleet Drivers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DRIVERS.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 bg-ag-surface dark:bg-dark-surface/50 border border-ag-border dark:border-dark-border rounded-card">
              <div className="w-12 h-12 rounded-full bg-ag-primary flex items-center justify-center
                text-white font-extrabold shrink-0">{d.avatar}</div>
              <div className="flex-1">
                <p className="font-extrabold text-ag-body dark:text-white">{d.name}</p>
                <p className="text-xs text-ag-muted dark:text-gray-400">{d.vehicle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold dark:text-gray-300">{d.rating}</span>
                  <span className="text-xs text-ag-muted dark:text-gray-400">· {d.trips} trips · KSh {d.rate}/km</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={d.status === 'available' ? 'chip-completed' : 'chip-transit'}>
                  {d.status === 'available' ? 'Available' : 'On Trip'}
                </span>
                {d.status === 'available' && (
                  <a href={`tel:${d.phone}`} className="btn-ghost border border-ag-border dark:border-dark-border !py-1 !px-2.5 !text-xs text-green-600 dark:text-green-400">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBook && <BookModal onClose={() => setShowBook(false)} onBook={handleBook} />}
      
      {selectedTrack && (
        <TrackingModal
          delivery={selectedTrack}
          onClose={() => setSelectedTrack(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
