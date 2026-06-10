import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, ListOrdered, ShoppingBag, TrendingUp, CheckCircle2, X, Truck, Settings, Ban, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

const INITIAL_LISTINGS = [
  { id: 1, crop: '500kg Maize',    farmer: 'David K.',  county: 'Uasin Gishu', price: 'KSh 25,000' },
  { id: 2, crop: '200kg Tomatoes', farmer: 'Aisha M.',  county: 'Kiambu',      price: 'KSh 16,000' },
  { id: 3, crop: '80 Crates Eggs', farmer: 'Peter O.',  county: 'Nakuru',      price: 'KSh 9,600'  },
];

const INITIAL_USERS = [
  { id: 1, name: 'Sarah O.',  email: 'sarah.o@gmail.com',  role: 'Buyer',     status: 'active',       county: 'Nairobi' },
  { id: 2, name: 'Juma M.',   email: 'juma.m@gmail.com',   role: 'Farmer',    status: 'pending_kyc',  county: 'Mombasa' },
  { id: 3, name: 'Kevin W.',  email: 'kevin.w@gmail.com',  role: 'Logistics', status: 'active',       county: 'Kisumu'  },
  { id: 4, name: 'Grace A.',  email: 'grace.a@gmail.com',  role: 'Farmer',    status: 'active',       county: 'Nakuru'  },
  { id: 5, name: 'Moses K.',  email: 'moses.k@gmail.com',  role: 'Buyer',     status: 'suspended',    county: 'Eldoret' },
];

const INITIAL_ORDERS = [
  { id: 1, crop: 'Potatoes', buyer: 'Naivas Ltd',  farmer: 'Mwangi J.', amount: 22500, status: 'completed' },
  { id: 2, crop: 'Tomatoes', buyer: 'Janet W.',    farmer: 'Sarah K.',  amount: 8000,  status: 'in_transit' },
  { id: 3, crop: 'Maize',    buyer: 'Quickmart',   farmer: 'David K.',  amount: 16400, status: 'pending'    },
];

const INITIAL_DRIVERS = [
  { id: 1, name: 'David Ochieng', vehicle: 'KCA 123Z (Isuzu FRR)',   status: 'available', trips: 12 },
  { id: 2, name: 'Peter Waweru',  vehicle: 'KBX 456Y (Mitsubishi)',  status: 'on_trip',   trips: 8  },
  { id: 3, name: 'James Kimani',  vehicle: 'KDA 789W (Toyota Dyna)', status: 'available', trips: 19 },
];

const chipByStatus = (s) => ({
  active: 'chip-verified', pending_kyc: 'chip-pending', completed: 'chip-completed',
  in_transit: 'chip-transit', pending: 'chip-pending', suspended: 'chip-sold-out', available: 'chip-verified', on_trip: 'chip-transit',
})[s] || 'chip-pending';

const TABS = [
  { label: 'Overview', path: 'dashboard' },
  { label: 'Listings', path: 'listings' },
  { label: 'Users', path: 'users' },
  { label: 'Orders', path: 'orders' },
  { label: 'Moderation', path: 'moderation' },
  { label: 'Settings', path: 'settings' }
];

const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const [listings, setListings]   = useState(INITIAL_LISTINGS);
  const [users, setUsers]         = useState(INITIAL_USERS);
  const [orders, setOrders]       = useState(INITIAL_ORDERS);
  const [drivers, setDrivers]     = useState(INITIAL_DRIVERS);
  const [modal, setModal]         = useState(null); // 'user' | 'setting' | 'confirm'
  const [selected, setSelected]   = useState(null);
  const [toast, setToast]         = useState('');
  const [settings, setSettings]   = useState({ commissionRate: '3', maxListings: '10', maintenanceMode: false });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const approveListing = (id) => { setListings(p => p.filter(l => l.id !== id)); showToast('Listing approved and published!'); };
  const rejectListing  = (id) => { setListings(p => p.filter(l => l.id !== id)); showToast('Listing rejected and removed.'); };

  const suspendUser   = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'suspended'} : u)); showToast('User suspended.'); setModal(null); };
  const activateUser  = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'active'} : u)); showToast('User activated successfully!'); setModal(null); };
  const approveKyc    = (id) => { setUsers(p => p.map(u => u.id===id ? {...u, status:'active'} : u)); showToast('KYC approved — user is now active!'); setModal(null); };

  const updateOrderStatus = (id, status) => { setOrders(p => p.map(o => o.id===id ? {...o, status} : o)); showToast(`Order updated to: ${status.replace('_',' ')}`); };

  const exportCSV = () => {
    const csv = 'Name,Email,Role,Status,County\n' + users.map(u=>`${u.name},${u.email},${u.role},${u.status},${u.county}`).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'users_export.csv'; a.click();
    showToast('Users CSV exported!');
  };

  const stats = [
    { icon: TrendingUp,  label: 'Total Volume (30d)',  value: 'KES 4.2M', color: 'text-ag-pay' },
    { icon: Users,       label: 'Registered Users',    value: users.length + 1240, color: 'text-ag-primary' },
    { icon: ListOrdered, label: 'Pending Listings',    value: listings.length, color: 'text-ag-amber' },
    { icon: ShoppingBag, label: 'Orders This Month',   value: orders.length + 889, color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-primary text-white px-5 py-3 rounded-card shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

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
        <div className="flex border-b border-ag-border overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.path}
              to={`/admin/${tab.path}`}
              className={`px-5 py-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
                currentPath === tab.path
                  ? 'text-ag-primary border-b-2 border-ag-primary bg-ag-primary-fixed/30'
                  : 'text-ag-muted hover:text-ag-body'
              }`}
            >
              {tab.label === 'Listings' && <ListOrdered className="w-4 h-4" />}
              {tab.label === 'Users' && <Users className="w-4 h-4" />}
              {tab.label === 'Orders' && <ShoppingBag className="w-4 h-4" />}
              {tab.label === 'Moderation' && <Truck className="w-4 h-4" />}
              {tab.label === 'Settings' && <Settings className="w-4 h-4" />}
              {tab.label}
              {tab.label === 'Listings' && listings.length > 0 && (
                <span className="bg-ag-amber text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{listings.length}</span>
              )}
              {tab.label === 'Users' && users.filter(u=>u.status==='pending_kyc').length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{users.filter(u=>u.status==='pending_kyc').length}</span>
              )}
            </Link>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {currentPath === 'dashboard' && (
           <div className="p-12 text-center">
             <CheckCircle2 className="w-16 h-16 text-ag-primary mx-auto mb-4" />
             <h2 className="text-2xl font-extrabold text-ag-body mb-2">System Running Smoothly</h2>
             <p className="text-ag-muted font-bold">Select a tab above or from the sidebar to manage the platform.</p>
           </div>
        )}

        {/* ── TAB: Listings ── */}
        {currentPath === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-ag-pay mx-auto mb-2" />
                <p className="font-bold text-ag-muted">All listings reviewed — inbox clear!</p>
              </div>
            ) : (
              <div className="divide-y divide-ag-border">
                {listings.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                        {item.crop.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-ag-body text-sm">{item.crop}</p>
                        <p className="text-xs text-ag-muted">Farmer: {item.farmer} · {item.county}</p>
                        <p className="text-xs text-ag-amber font-bold">{item.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => rejectListing(item.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 border-2 border-red-200 text-red-600 rounded-btn font-bold hover:bg-red-50">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button onClick={() => approveListing(item.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-ag-primary text-white rounded-btn font-bold hover:opacity-90">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Users ── */}
        {currentPath === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-ag-muted">{users.length} users</p>
              <button onClick={exportCSV} className="btn-secondary !min-h-0 !py-2 !text-xs">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-ag-surface text-ag-muted text-xs">
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ag-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-ag-canvas transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-ag-body">{user.name}</p>
                        <p className="text-xs text-ag-muted">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ag-muted">{user.role}</td>
                      <td className="px-4 py-3"><span className={chipByStatus(user.status)}>{user.status.replace('_',' ')}</span></td>
                      <td className="px-4 py-3 flex gap-2 flex-wrap">
                        <button onClick={() => { setSelected(user); setModal('user'); }} className="text-xs text-ag-primary font-bold hover:underline">
                          View
                        </button>
                        {user.status === 'pending_kyc' && (
                          <button onClick={() => approveKyc(user.id)} className="text-xs text-ag-pay font-bold hover:underline">
                            Approve KYC
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button onClick={() => suspendUser(user.id)} className="text-xs text-red-500 font-bold hover:underline">
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button onClick={() => activateUser(user.id)} className="text-xs text-ag-primary font-bold hover:underline">
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Orders ── */}
        {currentPath === 'orders' && (
          <div className="divide-y divide-ag-border">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
                <div>
                  <p className="font-bold text-ag-body text-sm">{order.crop}</p>
                  <p className="text-xs text-ag-muted">Buyer: {order.buyer} · Farmer: {order.farmer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ag-amber font-extrabold text-sm">KSh {order.amount.toLocaleString()}</span>
                  <span className={chipByStatus(order.status)}>{order.status.replace('_',' ')}</span>
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                    className="text-xs border border-ag-border rounded-btn px-2 py-1 font-bold text-ag-muted"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Logistics/Moderation ── */}
        {currentPath === 'moderation' && (
          <div className="p-6">
            <p className="text-sm font-bold text-ag-muted mb-4">Active Fleet ({drivers.length} drivers)</p>
            <div className="divide-y divide-ag-border">
              {drivers.map(driver => (
                <div key={driver.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-ag-primary-fixed" />
                    </div>
                    <div>
                      <p className="font-bold text-ag-body text-sm">{driver.name}</p>
                      <p className="text-xs text-ag-muted">{driver.vehicle} · {driver.trips} trips</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={chipByStatus(driver.status)}>{driver.status.replace('_',' ')}</span>
                    <button
                      onClick={() => {
                        setDrivers(p => p.map(d => d.id===driver.id ? {...d, status: d.status==='available' ? 'on_trip' : 'available'} : d));
                        showToast(`Driver status updated.`);
                      }}
                      className="text-xs text-ag-primary font-bold hover:underline"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Settings ── */}
        {currentPath === 'settings' && (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-ag-body mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Platform Settings</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-ag-body mb-1">Commission Rate (%)</label>
                  <input
                    type="number" value={settings.commissionRate} min="0" max="20"
                    onChange={e => setSettings(p=>({...p, commissionRate: e.target.value}))}
                    className="form-input w-40 text-sm"
                  />
                  <p className="text-xs text-ag-muted mt-1">Currently charged on every transaction.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ag-body mb-1">Max Listings per Farmer</label>
                  <input
                    type="number" value={settings.maxListings} min="1" max="50"
                    onChange={e => setSettings(p=>({...p, maxListings: e.target.value}))}
                    className="form-input w-40 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setSettings(p=>({...p, maintenanceMode: !p.maintenanceMode}))}
                      className={`w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-ag-border'} relative`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.maintenanceMode ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm font-bold text-ag-body flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${settings.maintenanceMode ? 'text-red-500' : 'text-ag-muted'}`} />
                      Maintenance Mode {settings.maintenanceMode ? '(ON)' : '(OFF)'}
                    </span>
                  </label>
                </div>
                <button
                  onClick={() => showToast('Platform settings saved successfully!')}
                  className="btn-primary w-fit !min-h-0 !py-3 !text-sm"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: User Profile ── */}
      {modal === 'user' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ag-body">User Profile</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="flex flex-col gap-2 mb-4 text-sm">
              <p><span className="text-ag-muted font-bold">Name:</span> {selected.name}</p>
              <p><span className="text-ag-muted font-bold">Email:</span> {selected.email}</p>
              <p><span className="text-ag-muted font-bold">Role:</span> {selected.role}</p>
              <p><span className="text-ag-muted font-bold">County:</span> {selected.county}</p>
              <p><span className="text-ag-muted font-bold">Status:</span> <span className={chipByStatus(selected.status)}>{selected.status.replace('_',' ')}</span></p>
            </div>
            <div className="flex gap-2">
              {selected.status === 'active' && (
                <button onClick={() => suspendUser(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 rounded-btn transition-colors">
                  <Ban className="w-4 h-4" /> Suspend
                </button>
              )}
              {selected.status === 'pending_kyc' && (
                <button onClick={() => approveKyc(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-ag-pay hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-btn transition-colors">
                  <UserCheck className="w-4 h-4" /> Approve KYC
                </button>
              )}
              {selected.status === 'suspended' && (
                <button onClick={() => activateUser(selected.id)} className="flex-1 flex items-center justify-center gap-1 bg-ag-primary hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-btn transition-colors">
                  <RefreshCw className="w-4 h-4" /> Reactivate
                </button>
              )}
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 !min-h-0 !py-2.5 !text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
