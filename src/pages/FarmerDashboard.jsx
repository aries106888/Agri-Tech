import React, { useState } from 'react';
import { TrendingUp, Package, Clock, BarChart2, Pencil, ArrowDownToLine, FileText, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

const listings = [
  { id: 1, crop: 'Grade A Maize', qty: '50 Bags', price: 'KSh 4,100/bag', harvested: '12 Oct', status: 'verified' },
  { id: 2, crop: 'Red Onions',    qty: '200 Kg',  price: 'KSh 105/kg',    harvested: 'Bulk Grade', status: 'verified' },
  { id: 3, crop: 'Kienyeji Eggs', qty: '15 Crates', price: 'KSh 450/crate', harvested: 'Organic Farm', status: 'pending' },
  { id: 4, crop: 'Leafy Spinach', qty: '80 Bunches', price: 'KSh 30/bunch', harvested: '8 Oct', status: 'sold_out' },
];

const transactions = [
  { id: 1, crop: 'Maize (Grade A)',  buyer: 'Naivas Ltd',     amount: 'KSh 41,000', date: '9 Jun 2026', status: 'completed' },
  { id: 2, crop: 'Red Onions',       buyer: 'Janet Wanjiku',  amount: 'KSh 12,600', date: '8 Jun 2026', status: 'in_transit' },
  { id: 3, crop: 'Kienyeji Eggs',    buyer: 'Quickmart Nrb',  amount: 'KSh 6,750',  date: '7 Jun 2026', status: 'pending' },
  { id: 4, crop: 'Sweet Corn',       buyer: 'David Ochieng',  amount: 'KSh 9,200',  date: '5 Jun 2026', status: 'completed' },
];

const statusChip = (status) => {
  const map = {
    verified:   <span className="chip-verified">Verified</span>,
    pending:    <span className="chip-pending">Pending</span>,
    sold_out:   <span className="chip-sold-out">Sold Out</span>,
    completed:  <span className="chip-completed">Completed</span>,
    in_transit: <span className="chip-transit">In Transit</span>,
  };
  return map[status] || null;
};

const FarmerDashboard = () => {
  const [walletBalance] = useState('34,200');

  const stats = [
    { icon: TrendingUp, label: 'Total Sales',       value: 'KSh 128,400', sub: '+12% this month',  color: 'text-ag-pay' },
    { icon: Package,    label: 'Active Listings',   value: '6',           sub: '2 pending review', color: 'text-ag-amber' },
    { icon: Clock,      label: 'Pending Orders',    value: '3',           sub: 'Awaiting dispatch', color: 'text-yellow-600' },
    { icon: BarChart2,  label: 'Avg. Price / kg',   value: 'KSh 52',      sub: 'Market avg: KSh 48', color: 'text-ag-primary' },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── STATS ROW ── */}
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

      {/* ── M-PESA WALLET ── */}
      <div className="bg-ag-primary-cont border border-ag-primary rounded-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-ag-primary-fixed text-xs font-bold uppercase tracking-widest">M-PESA Wallet Balance</span>
            </div>
            <p className="text-4xl font-extrabold text-white">KSh {walletBalance}</p>
            <p className="text-white/50 text-xs mt-1 font-bold">Last updated: Today, 2:15 PM</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => alert('M-PESA Withdrawal Initiated!')} className="btn-pay !min-h-0 !py-3 !text-sm">
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw to M-PESA
            </button>
            <button onClick={() => alert('Viewing transactions...')} className="btn-secondary !min-h-0 !py-3 !text-sm !border-white !text-white hover:!bg-white/10">
              <FileText className="w-4 h-4" />
              View Transactions
            </button>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: My Active Listings */}
        <div className="bg-white border border-ag-border rounded-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ag-border">
            <h2 className="text-headline-md text-ag-body">My Active Listings</h2>
            <button onClick={() => alert('Viewing Archive...')} className="btn-tertiary !text-xs">View All Archive →</button>
          </div>
          <div className="divide-y divide-ag-border">
            {listings.map(listing => (
              <div key={listing.id} className="flex items-center justify-between px-5 py-4 hover:bg-ag-canvas transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                    {listing.crop.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-ag-body text-sm">{listing.crop}</p>
                    <p className="text-xs text-ag-muted">{listing.harvested}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-ag-amber font-extrabold text-sm">{listing.price}</span>
                  <div className="flex items-center gap-2">
                    {statusChip(listing.status)}
                    <button className="text-ag-muted hover:text-ag-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Recent Transactions */}
        <div className="bg-white border border-ag-border rounded-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ag-border">
            <h2 className="text-headline-md text-ag-body">Recent Transactions</h2>
            <button onClick={() => alert('Viewing all transactions...')} className="btn-tertiary !text-xs">View All →</button>
          </div>
          <div className="divide-y divide-ag-border">
            {transactions.map(tx => {
              const StatusIcon = tx.status === 'completed' ? CheckCircle2 : tx.status === 'in_transit' ? Truck : AlertCircle;
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-ag-canvas transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ag-surface rounded-btn flex items-center justify-center shrink-0">
                      <StatusIcon className={`w-5 h-5 ${
                        tx.status === 'completed' ? 'text-ag-pay' :
                        tx.status === 'in_transit' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body text-sm">{tx.crop}</p>
                      <p className="text-xs text-ag-muted">{tx.buyer} · {tx.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-ag-amber font-extrabold text-sm">{tx.amount}</span>
                    {statusChip(tx.status)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Logistics Promo */}
          <div className="m-4 bg-ag-primary rounded-card p-4">
            <p className="text-ag-primary-fixed font-bold text-sm mb-1">Need Logistics?</p>
            <p className="text-white/60 text-xs mb-3">Request an AgriTech truck for your pending deliveries and get 10% off your next transport.</p>
            <button onClick={() => alert('Delivery Request Opened')} className="btn-primary !min-h-0 !py-2.5 !text-xs !px-4">
              🚚 Request Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
