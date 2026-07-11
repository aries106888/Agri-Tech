/* ── ShambaPoint — Logistics & Transport Page ─────────────── */
import { useState } from 'react';
import {
  Truck, MapPin, Clock, CheckCircle,
  Plus, X, Navigation, Target, ChevronRight, Package
} from 'lucide-react';

const STEPS = ['Pending', 'Accepted', 'Preparing', 'Collected', 'In Transit', 'Delivered', 'Upcoming'];

const DELIVERIES = [
  {
    id: 'DEL-001', crop: 'Maize 50 bags', from: 'Nakuru Warehouse', to: 'Nairobi CBD',
    driver: 'David Ochieng', date: '2026-06-18', status: 'In Transit', step: 4, cost: 4200, eta: '14:30',
    vehicle: 'Isuzu FRR · KCA 123Z', phone: '0711 222 333',
  },
  {
    id: 'DEL-002', crop: 'Beans 30 bags', from: 'Eldoret Farm', to: 'Kisumu Market',
    driver: 'Agnes Wambui', date: '2026-06-17', status: 'Delivered', step: 5, cost: 3100, eta: 'Done',
    vehicle: 'Isuzu NKR · KDB 012X', phone: '0744 555 666',
  },
  {
    id: 'DEL-003', crop: 'Tomatoes 300kg', from: 'Meru Farm', to: 'Nairobi Wakulima',
    driver: 'Unassigned', date: '2026-06-19', status: 'Pending', step: 0, cost: 2800, eta: 'TBD',
    vehicle: '—', phone: '',
  },
];

const STATUS_COLOR = {
  'Pending': 'bg-amber-100 text-amber-700',
  'Accepted': 'bg-emerald-100 text-emerald-700',
  'Preparing': 'bg-blue-100 text-blue-700',
  'Collected': 'bg-cyan-100 text-cyan-700',
  'In Transit': 'bg-emerald-100 text-emerald-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Completed': 'bg-green-100 text-green-700',
};

/* ── BOOK TRANSPORT MODAL ─────────────────────────────────── */
const BookModal = ({ onClose }) => {
  const [form, setForm] = useState({ from: '', to: '', cargo: '', weight: '', date: '' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-ag-primary to-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <span className="font-extrabold">Book Transport</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {[
            { key: 'from', label: 'Pickup Location', placeholder: 'e.g. Nakuru Farm' },
            { key: 'to', label: 'Destination', placeholder: 'e.g. Nairobi Wakulima Market' },
            { key: 'cargo', label: 'Cargo / Produce', placeholder: 'e.g. Maize 50 bags' },
            { key: 'weight', label: 'Weight (kg)', placeholder: 'e.g. 1500', type: 'number' },
            { key: 'date', label: 'Pickup Date', type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-ag-body mb-1 uppercase tracking-wide">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="form-input text-sm"
              />
            </div>
          ))}
          <button className="btn-primary w-full mt-2" onClick={onClose}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function TransportPage() {
  const [showBook, setShowBook] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const counts = {
    total: DELIVERIES.length,
    inTransit: DELIVERIES.filter(d => d.status === 'In Transit').length,
    delivered: DELIVERIES.filter(d => d.status === 'Delivered' || d.status === 'Completed').length,
    pending: DELIVERIES.filter(d => d.status === 'Pending').length,
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {showBook && <BookModal onClose={() => setShowBook(false)} />}

      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-r from-ag-primary via-[#1e5738] to-[#14532d] rounded-2xl p-8 text-white
        relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 right-20 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute -bottom-12 right-0 w-80 h-80 border border-white rounded-full" />
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1">Logistics & Transport</h1>
            <p className="text-emerald-200 text-sm">Book, track and manage your deliveries in real-time.</p>
          </div>
          <button
            onClick={() => setShowBook(true)}
            className="flex items-center gap-2 bg-white text-ag-primary font-extrabold text-sm
              px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Book Transport
          </button>
        </div>
      </div>

      {/* ── SUMMARY STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', value: counts.total, icon: Package, dot: null },
          { label: 'In Transit', value: counts.inTransit, icon: Truck, dot: 'bg-amber-400' },
          { label: 'Delivered', value: counts.delivered, icon: CheckCircle, dot: 'bg-emerald-500' },
          { label: 'Pending', value: counts.pending, icon: Clock, dot: 'bg-amber-400' },
        ].map(({ label, value, dot }) => (
          <div key={label} className="bg-white rounded-2xl border border-ag-border p-5 flex flex-col gap-2
            hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              {dot && <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />}
              <p className="text-xs font-bold text-ag-muted">{label}</p>
            </div>
            <p className="text-4xl font-black text-ag-body">{value}</p>
          </div>
        ))}
      </div>

      {/* ── MY DELIVERIES ── */}
      <div>
        <h2 className="font-extrabold text-ag-body text-lg mb-4">My Deliveries</h2>
        <div className="flex flex-col gap-4">
          {DELIVERIES.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-ag-border shadow-sm
              hover:shadow-md transition-shadow overflow-hidden">

              {/* Card Top */}
              <div className="p-5 flex items-start gap-4 flex-wrap">
                {/* Truck Icon */}
                <div className="w-12 h-12 bg-ag-canvas rounded-xl flex items-center justify-center shrink-0 border border-ag-border">
                  <Truck className="w-6 h-6 text-ag-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-extrabold text-ag-body text-base">{d.crop}</h3>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${STATUS_COLOR[d.status]}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ag-muted mb-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {d.from} → {d.to}
                  </div>
                  <p className="text-xs text-ag-muted">Driver: {d.driver} · {d.date}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {(d.status === 'In Transit' || d.status === 'Accepted') ? (
                    <button
                      onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                      className="flex items-center gap-1.5 bg-ag-amber hover:bg-amber-600 text-white
                        text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Target className="w-3.5 h-3.5" /> Track Live
                    </button>
                  ) : (
                    <button
                      onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                      className="flex items-center gap-1.5 bg-ag-primary hover:opacity-90 text-white
                        text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" /> View Details
                    </button>
                  )}
                  <div className="flex items-center gap-3 text-xs text-ag-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-ag-primary font-extrabold">KSh {d.cost.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ETA {d.eta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-0">
                  {STEPS.map((step, i) => {
                    const done = i < d.step;
                    const current = i === d.step;
                    const last = i === STEPS.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                            ${done ? 'bg-ag-primary text-white' :
                              current ? 'bg-ag-amber text-white ring-4 ring-ag-amber/20' :
                                'bg-ag-border text-ag-muted'}`}>
                            {done ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : current ? (
                              <Truck className="w-3.5 h-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{i + 1}</span>
                            )}
                          </div>
                          <p className={`text-[9px] font-bold mt-1 text-center leading-tight
                            ${done || current ? 'text-ag-body' : 'text-ag-muted'}`}>
                            {step}
                          </p>
                        </div>
                        {!last && (
                          <div className={`flex-1 h-1 mx-1 rounded-full transition-all
                            ${i < d.step ? 'bg-ag-primary' : 'bg-ag-border'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {expandedId === d.id && (
                <div className="border-t border-ag-border bg-ag-canvas px-5 py-4 flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-xs font-extrabold text-ag-muted uppercase tracking-wider mb-1">Delivery Info</p>
                    <p><span className="font-bold text-ag-muted">ID:</span> {d.id}</p>
                    <p><span className="font-bold text-ag-muted">Vehicle:</span> {d.vehicle || '—'}</p>
                    {d.phone && <p><span className="font-bold text-ag-muted">Driver Phone:</span> <a href={`tel:${d.phone}`} className="text-ag-primary font-bold hover:underline">{d.phone}</a></p>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-xs font-extrabold text-ag-muted uppercase tracking-wider mb-1">Route</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-ag-primary" /> {d.from}</p>
                    <p className="flex items-center gap-1 ml-3"><ChevronRight className="w-3 h-3 text-ag-muted" /> {d.to}</p>
                    <p><span className="font-bold text-ag-muted">Cost:</span> <span className="text-ag-amber font-extrabold">KSh {d.cost.toLocaleString()}</span></p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── ADD NEW BOOKING CTA ── */}
      <button
        onClick={() => setShowBook(true)}
        className="w-full border-2 border-dashed border-ag-border hover:border-ag-primary
          rounded-2xl py-6 flex items-center justify-center gap-2 text-ag-muted
          hover:text-ag-primary transition-all font-bold text-sm"
      >
        <Plus className="w-5 h-5" /> Book a new transport
      </button>
    </div>
  );
}
