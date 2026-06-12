import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, DollarSign, MapPin, X, CheckCircle, Phone, Settings, Map } from 'lucide-react';

const INITIAL_TRIPS = [
  { id: 1, from: 'Nakuru', to: 'Nairobi CBD', cargo: 'Irish Potatoes (120kg)', status: 'in_transit', earning: 3500, date: '9 Jun 2026' },
  { id: 2, from: 'Kiambu', to: 'Westlands', cargo: 'Tomatoes (80kg)', status: 'completed', earning: 2200, date: '8 Jun 2026' },
  { id: 3, from: 'Kajiado', to: 'Mombasa Rd', cargo: 'Red Onions (200kg)', status: 'pending', earning: 5000, date: '10 Jun 2026' },
];

const chipClass = (s) => ({ in_transit: 'chip-transit', completed: 'chip-completed', pending: 'chip-pending' })[s] || 'chip-pending';

const LogisticsDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [trips, setTrips]     = useState(INITIAL_TRIPS);
  const [modal, setModal]     = useState(null); // 'withdraw' | 'trip'
  const [selected, setSelected] = useState(null);
  const [toast, setToast]     = useState('');
  const [phone, setPhone]     = useState('0712 345 678');
  const balance = 14700;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = (id, newStatus) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    showToast(newStatus === 'in_transit' ? 'Trip accepted! Safe travels.' : 'Trip marked as completed.');
    setModal(null);
  };

  const stats = [
    { icon: Truck,        label: 'Active Trips',   value: trips.filter(t=>t.status==='in_transit').length, sub: 'In progress now' },
    { icon: CheckCircle2, label: 'Completed',       value: trips.filter(t=>t.status==='completed').length + 46, sub: 'All time' },
    { icon: Clock,        label: 'Pending',         value: trips.filter(t=>t.status==='pending').length, sub: 'Awaiting dispatch' },
    { icon: DollarSign,   label: 'Total Earnings',  value: `KSh ${trips.reduce((a,b)=>a+b.earning,0).toLocaleString()}`, sub: 'This month' },
  ];

  if (currentPath === 'trips') {
    return (
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <h2 className="text-headline-md text-ag-body">All Trips</h2>
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
                    <p className="text-xs text-ag-muted mt-0.5">{trip.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold text-sm">KSh {trip.earning.toLocaleString()}</span>
                  <span className={chipClass(trip.status)}>{trip.status.replace('_', ' ')}</span>
                  {trip.status === 'pending' && (
                    <button onClick={() => { setSelected(trip); setModal('trip'); }} className="text-xs text-ag-primary font-bold hover:underline">
                      Accept Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Reuse Trip Modal */}
        {modal === 'trip' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card w-full max-w-sm p-6">
              <h3 className="font-extrabold text-ag-body text-lg mb-2">Accept Trip?</h3>
              <p className="text-sm text-ag-muted mb-1">Cargo: <strong>{selected.cargo}</strong></p>
              <p className="text-sm text-ag-muted mb-1">Route: <strong>{selected.from} → {selected.to}</strong></p>
              <p className="text-sm text-ag-muted mb-4">Earnings: <strong className="text-ag-amber">KSh {selected.earning.toLocaleString()}</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Decline</button>
                <button onClick={() => updateStatus(selected.id, 'in_transit')} className="btn-primary flex-1 !min-h-0 !py-3 !text-sm">Accept Trip</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === 'deliveries') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-headline-md text-ag-body flex items-center gap-2"><Map className="w-6 h-6 text-ag-primary" /> Active Deliveries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.filter(t => t.status === 'in_transit').map(trip => (
            <div key={trip.id} className="bg-ag-primary-cont border border-ag-primary rounded-card p-6">
              <p className="text-white text-sm mb-1 font-bold">{trip.cargo}</p>
              <p className="text-white/70 text-xs mb-3 flex items-center gap-1"><MapPin className="w-3 h-3"/> {trip.from} → {trip.to}</p>
              <button onClick={() => updateStatus(trip.id, 'completed')} className="btn-pay !min-h-0 !py-2 !text-xs w-full">Mark Delivered & Collect Payment</button>
            </div>
          ))}
          {trips.filter(t => t.status === 'in_transit').length === 0 && (
            <p className="text-ag-muted font-bold text-sm">No active deliveries at the moment.</p>
          )}
        </div>
      </div>
    );
  }

  if (currentPath === 'earnings') {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-ag-primary-fixed text-sm font-bold uppercase tracking-widest mb-2">M-PESA Earnings Balance</p>
              <p className="text-5xl font-extrabold text-white">KSh {balance.toLocaleString()}</p>
              <p className="text-white/50 text-xs mt-1 font-bold">Available for withdrawal</p>
            </div>
            <button onClick={() => setModal('withdraw')} className="btn-pay !min-h-0 !py-4 !px-6 !text-base">
              Withdraw to M-PESA
            </button>
          </div>
        </div>
        {/* Modal Logic Reuse */}
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
                  <input type="number" defaultValue={balance} max={balance} className="form-input text-sm" placeholder="Enter amount" />
                </div>
                <button onClick={() => { showToast(`KSh ${balance.toLocaleString()} withdrawal initiated to ${phone}!`); setModal(null); }} className="btn-pay w-full mt-2">
                  Confirm Withdrawal
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
        <h2 className="text-headline-md text-ag-body mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-ag-primary" /> Logistics Settings</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Driver Name</label>
            <input type="text" defaultValue="David Ochieng" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Vehicle Registration</label>
            <input type="text" defaultValue="KCA 123Z (Isuzu FRR)" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ag-body mb-1.5">Active Routes</label>
            <input type="text" defaultValue="Nakuru, Nairobi, Kiambu" className="form-input" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="ag-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</span>
              <div className="w-9 h-9 bg-ag-surface rounded-btn flex items-center justify-center">
                <Icon className="w-4 h-4 text-ag-primary" />
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
          <button onClick={() => setModal('withdraw')} className="btn-pay !min-h-0 !py-3 !text-sm">
            Withdraw to M-PESA
          </button>
        </div>
      </div>

      {/* My Trips */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <h2 className="text-headline-md text-ag-body">My Trips</h2>
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
                    <p className="text-xs text-ag-muted mt-0.5">{trip.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold text-sm">KSh {trip.earning.toLocaleString()}</span>
                  <span className={chipClass(trip.status)}>{trip.status.replace('_', ' ')}</span>
                  {trip.status === 'pending' && (
                    <button onClick={() => { setSelected(trip); setModal('trip'); }} className="text-xs text-ag-primary font-bold hover:underline">
                      Accept Trip
                    </button>
                  )}
                  {trip.status === 'in_transit' && (
                    <button onClick={() => updateStatus(trip.id, 'completed')} className="text-xs text-ag-pay font-bold hover:underline">
                      Mark Delivered
                    </button>
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
                <input type="number" defaultValue={balance} max={balance} className="form-input text-sm" placeholder="Enter amount" />
              </div>
              <button
                onClick={() => { showToast(`KSh ${balance.toLocaleString()} withdrawal initiated to ${phone}!`); setModal(null); }}
                className="btn-pay w-full mt-2"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Accept Trip ── */}
      {modal === 'trip' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <h3 className="font-extrabold text-ag-body text-lg mb-2">Accept Trip?</h3>
            <p className="text-sm text-ag-muted mb-1">Cargo: <strong>{selected.cargo}</strong></p>
            <p className="text-sm text-ag-muted mb-1">Route: <strong>{selected.from} → {selected.to}</strong></p>
            <p className="text-sm text-ag-muted mb-4">Earnings: <strong className="text-ag-amber">KSh {selected.earning.toLocaleString()}</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-3 !text-sm">Decline</button>
              <button onClick={() => updateStatus(selected.id, 'in_transit')} className="btn-primary flex-1 !min-h-0 !py-3 !text-sm">
                Accept Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
