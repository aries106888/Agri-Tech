import React, { useState } from 'react';
import { Users, ListOrdered, ShoppingBag, TrendingUp, CheckCircle2, X } from 'lucide-react';

const pendingListings = [
  { id: 1, crop: '500kg Maize',       farmer: 'David K.',   county: 'Uasin Gishu' },
  { id: 2, crop: '200kg Tomatoes',    farmer: 'Aisha M.',   county: 'Kiambu' },
  { id: 3, crop: '80 Crates Eggs',    farmer: 'Peter O.',   county: 'Nakuru' },
];

const recentUsers = [
  { id: 1, name: 'Sarah O.',     role: 'Buyer',     status: 'active' },
  { id: 2, name: 'Juma M.',      role: 'Farmer',    status: 'pending_kyc' },
  { id: 3, name: 'Kevin W.',     role: 'Logistics', status: 'active' },
  { id: 4, name: 'Grace A.',     role: 'Farmer',    status: 'active' },
];

const recentOrders = [
  { id: 1, crop: 'Potatoes', buyer: 'Naivas Ltd',    amount: 'KSh 22,500', status: 'completed' },
  { id: 2, crop: 'Tomatoes', buyer: 'Janet W.',      amount: 'KSh 8,000',  status: 'in_transit' },
  { id: 3, crop: 'Maize',    buyer: 'Quickmart',     amount: 'KSh 16,400', status: 'pending' },
];

const chipByStatus = (s) => {
  const map = {
    active:       'chip-verified',
    pending_kyc:  'chip-pending',
    completed:    'chip-completed',
    in_transit:   'chip-transit',
    pending:      'chip-pending',
  };
  return map[s] || 'chip-pending';
};

const TABS = ['Listings Moderation', 'User Management', 'Orders'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Listings Moderation');
  const [listings, setListings]   = useState(pendingListings);

  const handleApprove = (id) => setListings(prev => prev.filter(l => l.id !== id));
  const handleReject  = (id) => setListings(prev => prev.filter(l => l.id !== id));

  const stats = [
    { icon: TrendingUp,   label: 'Total Volume (30d)', value: 'KES 4.2M', color: 'text-ag-pay' },
    { icon: Users,        label: 'Registered Users',   value: '1,245',    color: 'text-ag-primary' },
    { icon: ListOrdered,  label: 'Active Listings',    value: '348',      color: 'text-ag-amber' },
    { icon: ShoppingBag,  label: 'Orders This Month',  value: '892',      color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="ag-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-ag-muted">{label}</span>
              <div className="w-9 h-9 bg-ag-surface rounded-btn flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ag-body">{value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="bg-white border border-ag-border rounded-card overflow-hidden">
        <div className="flex border-b border-ag-border">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === tab
                  ? 'text-ag-primary border-b-2 border-ag-primary bg-ag-primary-fixed/30'
                  : 'text-ag-muted hover:text-ag-body'
              }`}
            >
              {tab}
              {tab === 'Listings Moderation' && listings.length > 0 && (
                <span className="ml-2 bg-ag-amber text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{listings.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Listings Moderation */}
        {activeTab === 'Listings Moderation' && (
          <div>
            {listings.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-ag-pay mx-auto mb-2" />
                <p className="font-bold text-ag-muted">All listings reviewed — inbox clear!</p>
              </div>
            ) : (
              <div className="divide-y divide-ag-border">
                {listings.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                        {item.crop.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-ag-body text-sm">{item.crop}</p>
                        <p className="text-xs text-ag-muted">Farmer: {item.farmer} · {item.county}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 border-2 border-red-200 text-red-600 rounded-btn font-bold hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-ag-primary text-white rounded-btn font-bold hover:bg-ag-primary-cont transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Management */}
        {activeTab === 'User Management' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-ag-muted">{recentUsers.length} recent signups</p>
              <button
                onClick={() => {
                  const csv = 'Name,Role,Status\n' + recentUsers.map(u => `${u.name},${u.role},${u.status}`).join('\n');
                  const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
                  a.download = 'users.csv'; a.click();
                }}
                className="btn-secondary !min-h-0 !py-2 !text-xs"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-ag-surface text-ag-muted text-xs">
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ag-border">
                  {recentUsers.map(user => (
                    <tr key={user.id} className="hover:bg-ag-canvas transition-colors">
                      <td className="px-4 py-3 font-bold text-ag-body">{user.name}</td>
                      <td className="px-4 py-3 text-ag-muted">{user.role}</td>
                      <td className="px-4 py-3"><span className={chipByStatus(user.status)}>{user.status.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-ag-amber font-bold hover:underline">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'Orders' && (
          <div className="divide-y divide-ag-border">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas transition-colors">
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Buyer: {order.buyer}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-ag-amber font-extrabold text-sm">{order.amount}</span>
                  <span className={chipByStatus(order.status)}>{order.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
