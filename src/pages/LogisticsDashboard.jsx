import React from 'react';
import { Truck, Package, Clock, CheckCircle2, MapPin, DollarSign } from 'lucide-react';

const trips = [
  { id: 1, from: 'Nakuru', to: 'Nairobi CBD', cargo: 'Irish Potatoes (120kg)', status: 'in_transit', earning: 'KSh 3,500', date: '9 Jun 2026' },
  { id: 2, from: 'Kiambu', to: 'Westlands', cargo: 'Tomatoes (80kg)', status: 'completed', earning: 'KSh 2,200', date: '8 Jun 2026' },
  { id: 3, from: 'Kajiado', to: 'Mombasa Rd', cargo: 'Red Onions (200kg)', status: 'pending', earning: 'KSh 5,000', date: '10 Jun 2026' },
];

const chipClass = (status) => ({
  in_transit: 'chip-transit',
  completed:  'chip-completed',
  pending:    'chip-pending',
})[status] || 'chip-pending';

const LogisticsDashboard = () => {
  const stats = [
    { icon: Truck,        label: 'Active Trips',     value: '2',         sub: 'In progress now' },
    { icon: CheckCircle2, label: 'Completed',         value: '48',        sub: 'All time' },
    { icon: Clock,        label: 'Pending',           value: '3',         sub: 'Awaiting dispatch' },
    { icon: DollarSign,   label: 'Total Earnings',    value: 'KSh 82,400', sub: 'This month' },
  ];

  return (
    <div className="flex flex-col gap-6">
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

      {/* Earnings card */}
      <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-ag-primary-fixed text-xs font-bold uppercase tracking-widest mb-2">M-PESA Earnings Balance</p>
            <p className="text-4xl font-extrabold text-white">KSh 14,700</p>
            <p className="text-white/50 text-xs mt-1 font-bold">Available for withdrawal</p>
          </div>
          <button className="btn-pay !min-h-0 !py-3 !text-sm">
            💰 Withdraw to M-PESA
          </button>
        </div>
      </div>

      {/* My Trips */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <h2 className="text-headline-md text-ag-body">My Trips</h2>
          <span className="chip-pending">3 Active</span>
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
                  <span className="text-ag-amber font-extrabold text-sm">{trip.earning}</span>
                  <span className={chipClass(trip.status)}>{trip.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
