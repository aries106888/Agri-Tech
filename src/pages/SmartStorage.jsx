import { useState } from 'react';
import {
  Archive, Plus, AlertTriangle, CheckCircle, Thermometer,
  Droplets, Wind, Clock, MapPin, X, TrendingDown, Leaf
} from 'lucide-react';

/* ── DATA ──────────────────────────────────────────────── */
const AI_TIPS = {
  Maize:       { tip: 'Store at 13% moisture, 15°C. Use hermetic bags to prevent aflatoxin.', method: 'Hermetic Bags' },
  Beans:       { tip: 'Dry to 12% moisture before storage. Metal silos prevent weevils effectively.', method: 'Metal Silos' },
  Rice:        { tip: 'Store paddy at 14% moisture, 18°C. Avoid humid environments.', method: 'Warehouses' },
  Sorghum:     { tip: 'Store at 12% moisture. Solar drying before hermetic bagging is optimal.', method: 'Solar Dryers' },
  Millet:      { tip: 'Dry to <13% moisture. Traditional granaries work well with good ventilation.', method: 'Hermetic Bags' },
  Wheat:       { tip: 'Store at 14% moisture, cool temperature. Monitor for mold frequently.', method: 'Metal Silos' },
  Groundnuts:  { tip: 'Store at <9% moisture to prevent aflatoxin. Use shade drying first.', method: 'Hermetic Bags' },
  Potatoes:    { tip: 'Store at 4-7°C in dark, ventilated cold room. Avoid light exposure.', method: 'Cold Rooms' },
  Onions:      { tip: 'Cure at 30°C for 2 weeks, then store at 0-5°C. Good airflow essential.', method: 'Warehouses' },
  Tomatoes:    { tip: 'Store at 10-13°C for up to 2 weeks. Do not store near ethylene-producing fruits.', method: 'Refrigerated Storage' },
  Fruits:      { tip: 'Store at 0-4°C. Control ethylene gas. Check daily for ripeness.', method: 'Refrigerated Storage' },
  Vegetables:  { tip: 'Store at high humidity (90-95%), cool temperature. Harvest regularly.', method: 'Cold Rooms' },
};

const STORAGE_METHODS = ['Hermetic Bags','Metal Silos','Cold Rooms','Warehouses','Solar Dryers','Refrigerated Storage'];

const MOCK_STORAGE = [
  {
    id: 1, produce: 'Maize', qty: 120, unit: 'bags', date: '2026-05-20',
    moisture: 12.8, temp: 16, humidity: 55, shelfLife: 8, method: 'Hermetic Bags',
    location: 'Nakuru Warehouse A', status: 'excellent',
  },
  {
    id: 2, produce: 'Beans', qty: 50, unit: 'bags', date: '2026-05-25',
    moisture: 13.5, temp: 19, humidity: 65, shelfLife: 5, method: 'Metal Silos',
    location: 'Eldoret Grain Store', status: 'moderate',
  },
  {
    id: 3, produce: 'Tomatoes', qty: 300, unit: 'kg', date: '2026-06-10',
    moisture: 94, temp: 24, humidity: 85, shelfLife: 1, method: 'Refrigerated Storage',
    location: 'Nairobi Cold Room B', status: 'high_risk',
  },
  {
    id: 4, produce: 'Potatoes', qty: 800, unit: 'kg', date: '2026-06-01',
    moisture: 78, temp: 6, humidity: 88, shelfLife: 12, method: 'Cold Rooms',
    location: 'Limuru Cold Store', status: 'excellent',
  },
  {
    id: 5, produce: 'Onions', qty: 200, unit: 'kg', date: '2026-05-15',
    moisture: 85, temp: 28, humidity: 72, shelfLife: 3, method: 'Warehouses',
    location: 'Meru Store 2', status: 'moderate',
  },
];

const statusConfig = {
  excellent: { label: '🟢 Excellent', color: 'text-ag-risk-low',  bg: 'bg-green-50  border-green-200' },
  moderate:  { label: '🟡 Moderate',  color: 'text-ag-risk-mid',  bg: 'bg-yellow-50 border-yellow-200' },
  high_risk: { label: '🔴 High Risk', color: 'text-ag-risk-high', bg: 'bg-red-50    border-red-200' },
};

/* ── ADD STORAGE MODAL ──────────────────────────────────── */
const AddStorageModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    produce: 'Maize', qty: '', unit: 'bags', moisture: '',
    temp: '', humidity: '', method: 'Hermetic Bags', location: '', date: new Date().toISOString().slice(0,10),
  });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form, id: Date.now(), shelfLife: 6, status: 'excellent' });
    onClose();
  };

  const tip = AI_TIPS[form.produce];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h3 className="font-extrabold text-ag-body flex items-center gap-2">
            <Archive className="w-5 h-5 text-ag-primary" /> Add Storage Record
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-ag-muted" /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {tip && (
            <div className="alert-info mb-4 text-xs">
              <Leaf className="w-4 h-4 shrink-0 text-blue-600" />
              <span><strong>AI Tip for {form.produce}:</strong> {tip.tip}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Produce</label>
                <select value={form.produce} onChange={e => up('produce', e.target.value)} className="form-input">
                  {Object.keys(AI_TIPS).map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Storage Method</label>
                <select value={form.method} onChange={e => up('method', e.target.value)} className="form-input">
                  {STORAGE_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input value={form.qty} onChange={e => up('qty', e.target.value)}
                  type="number" className="form-input" placeholder="120" required />
              </div>
              <div>
                <label className="form-label">Unit</label>
                <select value={form.unit} onChange={e => up('unit', e.target.value)} className="form-input">
                  {['bags','kg','tonnes','crates','boxes'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Moisture (%)</label>
                <input value={form.moisture} onChange={e => up('moisture', e.target.value)}
                  type="number" step="0.1" className="form-input" placeholder="12.5" />
              </div>
              <div>
                <label className="form-label">Temperature (°C)</label>
                <input value={form.temp} onChange={e => up('temp', e.target.value)}
                  type="number" className="form-input" placeholder="16" />
              </div>
              <div>
                <label className="form-label">Humidity (%)</label>
                <input value={form.humidity} onChange={e => up('humidity', e.target.value)}
                  type="number" className="form-input" placeholder="55" />
              </div>
              <div>
                <label className="form-label">Storage Date</label>
                <input value={form.date} onChange={e => up('date', e.target.value)}
                  type="date" className="form-input" />
              </div>
            </div>
            <div>
              <label className="form-label">Warehouse Location</label>
              <input value={form.location} onChange={e => up('location', e.target.value)}
                className="form-input" placeholder="e.g. Nakuru Warehouse A" required />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Plus className="w-4 h-4" /> Save Storage Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN PAGE ──────────────────────────────────────────── */
export default function SmartStorage() {
  const [records, setRecords] = useState(MOCK_STORAGE);
  const [showAdd, setShowAdd] = useState(false);
  const [aiProduce, setAiProduce] = useState('Maize');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const alerts = records.filter(r => r.status !== 'excellent');
  const highRisk = records.filter(r => r.status === 'high_risk');

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card
          shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="green-gradient rounded-xl2 p-6 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Archive className="w-6 h-6" />
            <h2 className="font-extrabold text-xl">Smart Produce Storage</h2>
          </div>
          <p className="text-white/70 text-sm">
            Monitor conditions, prevent losses, get AI preservation tips.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-white text-ag-primary font-extrabold
          px-5 py-3 rounded-btn hover:bg-ag-primary-fixed transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* ── ALERTS ── */}
      {highRisk.length > 0 && (
        <div className="alert-danger">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold">⚠️ {highRisk.length} storage record(s) at HIGH RISK</p>
            <p className="text-xs mt-0.5">{highRisk.map(r => r.produce).join(', ')} — take immediate action to prevent loss.</p>
          </div>
        </div>
      )}
      {alerts.filter(r => r.status === 'moderate').length > 0 && (
        <div className="alert-warning">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            {alerts.filter(r => r.status === 'moderate').length} record(s) have moderate conditions — monitor closely.
          </span>
        </div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records',    value: records.length,                              color: 'text-ag-primary' },
          { label: '🟢 Excellent',     value: records.filter(r=>r.status==='excellent').length, color: 'text-ag-risk-low' },
          { label: '🟡 Moderate',      value: records.filter(r=>r.status==='moderate').length,  color: 'text-ag-risk-mid' },
          { label: '🔴 High Risk',     value: records.filter(r=>r.status==='high_risk').length,  color: 'text-ag-risk-high' },
        ].map(s => (
          <div key={s.label} className="ag-card text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ag-muted font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── STORAGE RECORDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {records.map(r => {
          const cfg = statusConfig[r.status];
          return (
            <div key={r.id} className={`ag-card border-2 ${cfg.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ag-primary rounded-btn flex items-center justify-center
                    text-white font-extrabold text-sm shrink-0">
                    {r.produce.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-ag-body">{r.produce}</p>
                    <p className="text-xs text-ag-muted">{r.qty} {r.unit} · {r.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-sm ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white/60 rounded-btn p-2.5 text-center">
                  <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                  <p className="text-lg font-extrabold text-ag-body">{r.moisture}%</p>
                  <p className="text-[10px] text-ag-muted font-bold">MOISTURE</p>
                </div>
                <div className="bg-white/60 rounded-btn p-2.5 text-center">
                  <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                  <p className="text-lg font-extrabold text-ag-body">{r.temp}°C</p>
                  <p className="text-[10px] text-ag-muted font-bold">TEMP</p>
                </div>
                <div className="bg-white/60 rounded-btn p-2.5 text-center">
                  <Wind className="w-4 h-4 text-cyan-500 mx-auto mb-0.5" />
                  <p className="text-lg font-extrabold text-ag-body">{r.humidity}%</p>
                  <p className="text-[10px] text-ag-muted font-bold">HUMIDITY</p>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-ag-muted">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {r.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className={r.shelfLife <= 2 ? 'text-red-600 font-bold' : ''}>
                    {r.shelfLife} months shelf life
                  </span>
                </div>
              </div>

              {/* AI tip */}
              {AI_TIPS[r.produce] && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-btn p-2.5 text-xs text-blue-800">
                  <span className="font-bold">🤖 AI Tip:</span> {AI_TIPS[r.produce].tip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── AI RECOMMENDATIONS PANEL ── */}
      <div className="ag-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-ag-body flex items-center gap-2">
            <Leaf className="w-5 h-5 text-ag-primary" /> AI Storage Recommendations
          </h3>
          <select value={aiProduce} onChange={e => setAiProduce(e.target.value)} className="form-input !w-auto !py-1.5 !text-xs">
            {Object.keys(AI_TIPS).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {AI_TIPS[aiProduce] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-ag-primary-fixed rounded-card p-4">
              <p className="font-bold text-ag-primary mb-1">Recommended Method</p>
              <p className="text-lg font-extrabold text-ag-primary">{AI_TIPS[aiProduce].method}</p>
            </div>
            <div className="bg-ag-surface rounded-card p-4">
              <p className="font-bold text-ag-body mb-1">Storage Guidelines</p>
              <p className="text-sm text-ag-muted">{AI_TIPS[aiProduce].tip}</p>
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: TrendingDown, label: 'Losses Prevented', value: '23%', color: 'text-green-600' },
            { icon: Archive,      label: 'Records Active',   value: records.length,   color: 'text-ag-primary' },
            { icon: AlertTriangle,label: 'Active Alerts',    value: alerts.length,    color: 'text-orange-500' },
            { icon: Clock,        label: 'Avg Shelf Life',   value: `${Math.round(records.reduce((a,r)=>a+r.shelfLife,0)/records.length)}mo`, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="ag-card !p-3 flex items-center gap-3">
              <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
              <div>
                <p className={`font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-ag-muted font-bold uppercase">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <AddStorageModal
          onClose={() => setShowAdd(false)}
          onAdd={(rec) => {
            setRecords(r => [rec, ...r]);
            showToast('Storage record added successfully!');
          }}
        />
      )}
    </div>
  );
}
