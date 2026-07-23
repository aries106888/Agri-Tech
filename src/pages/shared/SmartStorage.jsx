import { useState } from 'react';
import {
  Archive, Plus, AlertTriangle, CheckCircle, Thermometer,
  Droplets, Wind, Clock, MapPin, X, TrendingDown, Leaf, Sparkles,
  Trash2
} from 'lucide-react';

/* ── DATA ──────────────────────────────────────────────── */
const AI_TIPS = {
  Maize: {
    tip: 'Store at 13% moisture, 15°C. Hermetic bags prevent aflatoxins.',
    method: 'Hermetic Bags',
    idealMoisture: '12-13%',
    idealTemp: '15-18°C',
    idealHumidity: '50-60%',
  },
  Beans: {
    tip: 'Dry to 13% moisture before storage. Mesh silos prevent insects effectively.',
    method: 'Mesh Silos / Hermetic Bags',
    idealMoisture: '12-13.5%',
    idealTemp: '16-20°C',
    idealHumidity: '55-65%',
  },
  Tomatoes: {
    tip: 'Temperature is high! Set to 12°C to prevent tomatoes from softening/producing ethylene.',
    method: 'Refrigerated Storage',
    idealMoisture: '85-90%',
    idealTemp: '10-13°C',
    idealHumidity: '80-85%',
  },
  Potatoes: {
    tip: 'Store at 4-7°C in dark, ventilated rooms away from sunlight exposure.',
    method: 'Cold Rooms',
    idealMoisture: '75-80%',
    idealTemp: '4-7°C',
    idealHumidity: '85-90%',
  },
  Onions: {
    tip: 'Cool 25°C for 2 weeks, then store at 0-5°C. Good airflow essential.',
    method: 'Storehouses / Warehouses',
    idealMoisture: '60-70%',
    idealTemp: '0-5°C',
    idealHumidity: '65-72%',
  },
  Rice: {
    tip: 'Store paddy at 14% moisture, 18°C. Avoid humid environments to prevent mold.',
    method: 'Dry Storage Warehouse',
    idealMoisture: '13-14%',
    idealTemp: '16-18°C',
    idealHumidity: '55-60%',
  },
  Sorghum: {
    tip: 'Store at 12% moisture. Solar drying before hermetic bagging is optimal.',
    method: 'Solar Dryers & Hermetic Bags',
    idealMoisture: '11-12%',
    idealTemp: '15-20°C',
    idealHumidity: '50-60%',
  },
};

const STORAGE_METHODS = [
  'Hermetic Bags',
  'Mesh Silos',
  'Cold Rooms',
  'Refrigerated Storage',
  'Storehouses',
  'Solar Dryers',
];

const INITIAL_RECORDS = [
  {
    id: 1,
    produce: 'Maize',
    qty: 500,
    unit: 'bags',
    storageType: 'Hermetic Bags',
    moisture: 12.8,
    temp: 16,
    humidity: 55,
    shelfLife: 6,
    location: 'Nakuru Warehouse A',
    status: 'excellent',
  },
  {
    id: 2,
    produce: 'Beans',
    qty: 120,
    unit: 'bags',
    storageType: 'Mesh Silo',
    moisture: 13.5,
    temp: 19,
    humidity: 60,
    shelfLife: 5,
    location: 'Eldoret Grain Store',
    status: 'moderate',
  },
  {
    id: 3,
    produce: 'Tomatoes',
    qty: 300,
    unit: 'kg',
    storageType: 'Refrigerated Storage',
    moisture: 94,
    temp: 24,
    humidity: 85,
    shelfLife: 1,
    location: 'Naivasha Cold Room B',
    status: 'high_risk',
  },
  {
    id: 4,
    produce: 'Potatoes',
    qty: 600,
    unit: 'kg',
    storageType: 'Cold Room',
    moisture: 78,
    temp: 6,
    humidity: 88,
    shelfLife: 12,
    location: 'Limuru Cold Store',
    status: 'excellent',
  },
  {
    id: 5,
    produce: 'Onions',
    qty: 450,
    unit: 'kg',
    storageType: 'Storehouse',
    moisture: 85,
    temp: 28,
    humidity: 72,
    shelfLife: 3,
    location: 'Meru Store 3',
    status: 'moderate',
  },
];

const statusConfig = {
  excellent: {
    label: 'Excellent',
    icon: '🟢',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cardBorder: 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400',
    avatarBg: 'bg-emerald-800 text-white',
    metricBg: 'bg-emerald-50/80 border-emerald-100',
    alertText: 'Optimal storage conditions maintained.',
  },
  moderate: {
    label: 'Moderate',
    icon: '🟡',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    cardBorder: 'border-amber-200 bg-amber-50/40 hover:border-amber-400',
    avatarBg: 'bg-amber-700 text-white',
    metricBg: 'bg-amber-50/80 border-amber-100',
    alertText: 'Slight deviation from optimal levels. Keep monitoring.',
  },
  high_risk: {
    label: 'High Risk',
    icon: '🔴',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
    cardBorder: 'border-rose-300 bg-rose-50/50 hover:border-rose-400 shadow-sm',
    avatarBg: 'bg-rose-800 text-white',
    metricBg: 'bg-rose-50/90 border-rose-100',
    alertText: 'High temperature or humidity detected! Action required.',
  },
};

/* ── ADD RECORD MODAL ──────────────────────────────────── */
const AddStorageModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    produce: 'Maize',
    qty: '',
    unit: 'bags',
    storageType: 'Hermetic Bags',
    moisture: '',
    temp: '',
    humidity: '',
    location: '',
  });

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const moistureNum = Number(form.moisture) || 12;
    const tempNum = Number(form.temp) || 20;

    // Auto-calculate status based on produce recommendations
    let status = 'excellent';
    if (form.produce === 'Tomatoes' && tempNum > 18) status = 'high_risk';
    else if (form.produce === 'Onions' && tempNum > 24) status = 'moderate';
    else if (moistureNum > 14) status = 'moderate';

    onAdd({
      id: Date.now(),
      produce: form.produce,
      qty: Number(form.qty) || 100,
      unit: form.unit,
      storageType: form.storageType,
      moisture: moistureNum,
      temp: tempNum,
      humidity: Number(form.humidity) || 60,
      shelfLife: status === 'excellent' ? 8 : status === 'moderate' ? 4 : 1,
      location: form.location || 'Central Store A',
      status,
    });
    onClose();
  };

  const currentTip = AI_TIPS[form.produce];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-ag-border">
        <div className="flex items-center justify-between px-6 py-4 bg-ag-surface border-b border-ag-border">
          <h3 className="font-extrabold text-lg text-ag-body flex items-center gap-2">
            <Archive className="w-5 h-5 text-ag-primary" /> Add Storage Monitoring Record
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {currentTip && (
            <div className="p-3.5 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-950">AI Preservation Guideline ({form.produce}):</p>
                <p className="mt-0.5">{currentTip.tip}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Produce</label>
                <select
                  value={form.produce}
                  onChange={(e) => up('produce', e.target.value)}
                  className="form-input text-sm font-semibold"
                >
                  {Object.keys(AI_TIPS).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Storage Method</label>
                <select
                  value={form.storageType}
                  onChange={(e) => up('storageType', e.target.value)}
                  className="form-input text-sm font-semibold"
                >
                  {STORAGE_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Quantity</label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) => up('qty', e.target.value)}
                  placeholder="e.g. 500"
                  required
                  className="form-input text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => up('unit', e.target.value)}
                  className="form-input text-sm font-semibold"
                >
                  <option>bags</option>
                  <option>kg</option>
                  <option>tonnes</option>
                  <option>crates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.moisture}
                  onChange={(e) => up('moisture', e.target.value)}
                  placeholder="12.8"
                  className="form-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Temp (°C)</label>
                <input
                  type="number"
                  value={form.temp}
                  onChange={(e) => up('temp', e.target.value)}
                  placeholder="16"
                  className="form-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Humidity (%)</label>
                <input
                  type="number"
                  value={form.humidity}
                  onChange={(e) => up('humidity', e.target.value)}
                  placeholder="55"
                  className="form-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ag-muted mb-1 uppercase">Facility / Warehouse Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => up('location', e.target.value)}
                placeholder="e.g. Nakuru Warehouse A"
                required
                className="form-input text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save Storage Monitor Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN COMPONENT ────────────────────────────────────── */
export default function SmartStorage() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [filter, setFilter] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    triggerToast('Storage record removed.');
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const countExcellent = records.filter((r) => r.status === 'excellent').length;
  const countModerate = records.filter((r) => r.status === 'moderate').length;
  const countHighRisk = records.filter((r) => r.status === 'high_risk').length;

  const currentCropTip = AI_TIPS[selectedCrop] || AI_TIPS.Maize;

  return (
    <div className="flex flex-col gap-6 animate-fade-in p-2 md:p-4 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-300" /> {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="green-gradient rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">Smart Produce Storage</h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Real-time harvest monitoring, IoT micro-climate sensors & AI preservation guidance.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-white text-ag-primary font-black text-sm px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Top Stat Summary Cards (Exact layout in picture) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`ag-card text-center p-4 transition-all border-2 ${
            filter === 'all' ? 'border-ag-primary ring-2 ring-ag-primary/20 shadow-md' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-3xl font-black text-ag-body">{records.length}</p>
          <p className="text-xs font-bold text-ag-muted uppercase mt-1">Total Harvests</p>
        </button>

        <button
          onClick={() => setFilter('excellent')}
          className={`ag-card text-center p-4 transition-all border-2 ${
            filter === 'excellent' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
          }`}
        >
          <p className="text-3xl font-black text-emerald-600">{countExcellent}</p>
          <p className="text-xs font-bold text-emerald-700 uppercase mt-1 flex items-center justify-center gap-1">
            <span>🟢</span> Excellent
          </p>
        </button>

        <button
          onClick={() => setFilter('moderate')}
          className={`ag-card text-center p-4 transition-all border-2 ${
            filter === 'moderate' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' : 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
          }`}
        >
          <p className="text-3xl font-black text-amber-600">{countModerate}</p>
          <p className="text-xs font-bold text-amber-700 uppercase mt-1 flex items-center justify-center gap-1">
            <span>🟡</span> Moderate
          </p>
        </button>

        <button
          onClick={() => setFilter('high_risk')}
          className={`ag-card text-center p-4 transition-all border-2 ${
            filter === 'high_risk' ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md' : 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
          }`}
        >
          <p className="text-3xl font-black text-rose-600">{countHighRisk}</p>
          <p className="text-xs font-bold text-rose-700 uppercase mt-1 flex items-center justify-center gap-1">
            <span>🔴</span> High Risk
          </p>
        </button>
      </div>

      {/* Filter Row Indicator */}
      {filter !== 'all' && (
        <div className="flex items-center justify-between bg-ag-surface p-3 rounded-xl border border-ag-border text-xs font-bold text-ag-muted">
          <span>Filtering by status: <strong className="text-ag-body uppercase">{filter}</strong></span>
          <button onClick={() => setFilter('all')} className="text-ag-primary underline hover:text-ag-primary-hover">
            Show All ({records.length})
          </button>
        </div>
      )}

      {/* Produce Monitor Grid (Cards matching picture design) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRecords.map((r) => {
          const cfg = statusConfig[r.status] || statusConfig.excellent;
          const cropTip = AI_TIPS[r.produce]?.tip;

          return (
            <div
              key={r.id}
              className={`rounded-2xl p-5 border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${cfg.cardBorder}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center shadow-inner ${cfg.avatarBg}`}
                  >
                    {r.produce.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-ag-body leading-snug">{r.produce}</h3>
                    <p className="text-xs font-semibold text-ag-muted">
                      {r.qty} {r.unit} · <span className="text-ag-body font-bold">{r.storageType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 ${cfg.badgeClass}`}
                  >
                    <span>{cfg.icon}</span> {cfg.label}
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Remove Record"
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3 Metric Displays (Moisture, Temp, Humidity) */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className={`p-3 rounded-xl border text-center ${cfg.metricBg}`}>
                  <Droplets className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-ag-body">{r.moisture}%</p>
                  <p className="text-[10px] font-black text-ag-muted uppercase tracking-wider mt-0.5">MOISTURE</p>
                </div>

                <div className={`p-3 rounded-xl border text-center ${cfg.metricBg}`}>
                  <Thermometer className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-ag-body">{r.temp}°C</p>
                  <p className="text-[10px] font-black text-ag-muted uppercase tracking-wider mt-0.5">TEMP</p>
                </div>

                <div className={`p-3 rounded-xl border text-center ${cfg.metricBg}`}>
                  <Wind className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-ag-body">{r.humidity}%</p>
                  <p className="text-[10px] font-black text-ag-muted uppercase tracking-wider mt-0.5">HUMIDITY</p>
                </div>
              </div>

              {/* Facility & Shelf Life Footer */}
              <div className="flex items-center justify-between text-xs text-ag-muted font-medium mb-3.5 px-1">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-ag-primary shrink-0" />
                  <span>{r.location}</span>
                </div>
                <div
                  className={`flex items-center gap-1 font-bold ${
                    r.shelfLife <= 2 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{r.shelfLife} months shelf life</span>
                </div>
              </div>

              {/* AI Tip Banner */}
              {cropTip && (
                <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    <strong className="font-extrabold text-blue-950">AI Tip:</strong> {cropTip}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center text-ag-muted">
          <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-ag-body text-base">No storage records match this filter.</p>
          <button onClick={() => setFilter('all')} className="btn-secondary mt-3 text-xs font-bold">
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom AI Recommendations Section (Matching Bottom Panel in Pic) */}
      <div className="bg-white border border-ag-border rounded-2xl shadow-sm overflow-hidden mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-ag-border gap-3 bg-ag-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-ag-body text-base">AI Storage Recommendations</h3>
              <p className="text-xs text-ag-muted">Select crop to inspect preservation guidelines & optimal storage parameters.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ag-muted uppercase">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-input !w-auto !py-1.5 !px-3 text-xs font-extrabold bg-white border-ag-border shadow-sm"
            >
              {Object.keys(AI_TIPS).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4.5">
              <p className="text-xs font-black text-emerald-800 uppercase tracking-wide mb-1">Recommended Method</p>
              <p className="text-lg font-black text-emerald-950">{currentCropTip.method}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-emerald-900">
                <span className="bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                  Ideal Moisture: <strong>{currentCropTip.idealMoisture}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                  Ideal Temp: <strong>{currentCropTip.idealTemp}</strong>
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4.5">
              <p className="text-xs font-black text-ag-muted uppercase tracking-wide mb-1">Storage Guidelines</p>
              <p className="text-sm font-semibold text-ag-body leading-relaxed">{currentCropTip.tip}</p>
            </div>
          </div>

          {/* Bottom 4 Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-ag-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-emerald-700 text-base">23%</p>
                <p className="text-[10px] font-extrabold text-ag-muted uppercase leading-tight">Losses Prevented</p>
              </div>
            </div>

            <div className="bg-white border border-ag-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-blue-800 text-base">{records.length}</p>
                <p className="text-[10px] font-extrabold text-ag-muted uppercase leading-tight">Records Active</p>
              </div>
            </div>

            <div className="bg-white border border-ag-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-700 text-base">{countModerate + countHighRisk}</p>
                <p className="text-[10px] font-extrabold text-ag-muted uppercase leading-tight">Active Alerts</p>
              </div>
            </div>

            <div className="bg-white border border-ag-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-purple-900 text-base">
                  {records.length
                    ? Math.round(records.reduce((acc, curr) => acc + curr.shelfLife, 0) / records.length)
                    : 0}
                  mo
                </p>
                <p className="text-[10px] font-extrabold text-ag-muted uppercase leading-tight">Avg Shelf Life</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAdd && (
        <AddStorageModal
          onClose={() => setShowAdd(false)}
          onAdd={(newRec) => {
            setRecords((prev) => [newRec, ...prev]);
            triggerToast(`New record for ${newRec.produce} added!`);
          }}
        />
      )}
    </div>
  );
}
