import React, { useState } from 'react';
import { ShoppingBag, Truck, Heart, MapPin, Package, Clock } from 'lucide-react';

const recentOrders = [
  { id: 1, crop: 'Irish Potatoes', farmer: 'Mwangi J.', county: 'Nakuru', qty: '50kg', amount: 'KSh 2,250', status: 'in_transit', date: '9 Jun 2026' },
  { id: 2, crop: 'Grade A Tomatoes', farmer: 'Sarah K.', county: 'Kiambu', qty: '20kg', amount: 'KSh 1,600', status: 'completed', date: '7 Jun 2026' },
  { id: 3, crop: 'Red Onions', farmer: 'Agnes L.', county: 'Kajiado', qty: '30kg', amount: 'KSh 3,600', status: 'pending', date: '6 Jun 2026' },
];

const chipClass = (status) => ({
  in_transit: 'chip-transit',
  completed:  'chip-completed',
  pending:    'chip-pending',
})[status] || 'chip-pending';

const BuyerDashboard = () => {
  const stats = [
    { icon: ShoppingBag, label: 'Total Orders',    value: '24',          sub: '3 this week' },
    { icon: Truck,        label: 'In Transit',      value: '2',           sub: 'Expected today' },
    { icon: Package,      label: 'Completed',       value: '21',          sub: 'All delivered' },
    { icon: Clock,        label: 'Pending Payment', value: 'KSh 5,850',   sub: '2 invoices' },
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

      {/* Recent Orders */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h2 className="text-headline-md text-ag-body">Recent Orders</h2>
          <a href="/market" className="btn-tertiary !text-xs">Browse More →</a>
        </div>
        <div className="divide-y divide-ag-border">
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                  {order.crop.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Farmer: {order.farmer} · {order.qty} · {order.date}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-ag-muted">
                    <MapPin className="w-3 h-3" /> {order.county}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-ag-amber font-extrabold text-sm">{order.amount}</span>
                <span className={chipClass(order.status)}>{order.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="ag-card flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-ag-amber" />
            <h3 className="font-bold text-ag-body">Saved Farmers</h3>
          </div>
          <p className="text-sm text-ag-muted">You have 4 farmers bookmarked. Order directly from their listings.</p>
          <a href="/market" className="btn-secondary !min-h-0 !py-3 !text-sm w-fit">View Saved Farmers</a>
        </div>
        <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-5 flex flex-col gap-3">
          <p className="text-ag-primary-fixed font-bold text-sm">Need Regular Supply?</p>
          <p className="text-white/60 text-xs">Set up weekly recurring orders from your favourite farmers and save 5% per order.</p>
          <button className="btn-primary !min-h-0 !py-2.5 !text-sm w-fit">
            Set Up Recurring Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
