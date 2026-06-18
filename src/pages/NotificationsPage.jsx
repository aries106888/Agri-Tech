import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Package, CreditCard, Truck, AlertTriangle, Archive, Star } from 'lucide-react';

const TYPE_ICONS = {
  order:    { icon: Package,       color: 'text-ag-primary', bg: 'bg-ag-primary-fixed' },
  payment:  { icon: CreditCard,    color: 'text-ag-pay',     bg: 'bg-green-100' },
  delivery: { icon: Truck,         color: 'text-blue-600',   bg: 'bg-blue-100' },
  dispute:  { icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-100' },
  storage:  { icon: Archive,       color: 'text-ag-amber',   bg: 'bg-amber-100' },
  review:   { icon: Star,          color: 'text-yellow-500', bg: 'bg-yellow-100' },
};

const INIT = [
  { id: 1, type: 'payment',  title: 'Payment Released',       msg: 'KSh 82,000 from Naivas Ltd order has been released to your wallet.',                                         time: '10 min ago', read: false },
  { id: 2, type: 'order',    title: 'New Order Received',     msg: 'Janet Wanjiku placed an order for 200kg Red Onions. Please confirm.',                                        time: '25 min ago', read: false },
  { id: 3, type: 'storage',  title: 'Storage Alert',          msg: 'Tomatoes (300kg) in Nairobi Cold Room B are at HIGH RISK. Check moisture levels.',                          time: '1 hr ago',   read: false },
  { id: 4, type: 'delivery', title: 'Shipment Dispatched',    msg: 'Your maize order (50 bags) is now in transit. ETA: Today 14:30.',                                           time: '2 hrs ago',  read: true  },
  { id: 5, type: 'dispute',  title: 'Dispute Filed',          msg: 'David Ochieng filed a dispute on Order ORD-2471. Funds are locked pending review.',                         time: '3 hrs ago',  read: true  },
  { id: 6, type: 'review',   title: 'New 5-Star Review',      msg: 'Quickmart Nairobi gave you a 5-star review — "Excellent quality maize, timely delivery."',                  time: '5 hrs ago',  read: true  },
  { id: 7, type: 'payment',  title: 'M-Pesa Payment Confirmed', msg: 'KSh 21,000 payment from Janet Wanjiku is now held in SecurePay escrow.',                                  time: '1 day ago',  read: true  },
  { id: 8, type: 'order',    title: 'Order Completed',        msg: 'Sweet Corn order for David Ochieng marked as completed. Funds released!',                                   time: '2 days ago', read: true  },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(INIT);
  const [filter, setFilter] = useState('all');

  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead   = id => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const remove     = id => setNotifs(n => n.filter(x => x.id !== id));

  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-7 h-7 text-ag-primary" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
                text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-ag-body">Notifications</h2>
            <p className="text-sm text-ag-muted">{unread} unread</p>
          </div>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-ghost !py-2 text-xs">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button onClick={() => setNotifs([])} className="btn-ghost !py-2 text-xs text-red-500">
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {['all','order','payment','delivery','dispute','storage','review'].map(f => {
          const cnt = f === 'all'
            ? notifs.filter(n => !n.read).length
            : notifs.filter(n => n.type === f && !n.read).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-btn text-xs font-bold capitalize transition-colors flex items-center gap-1.5
                ${filter === f ? 'bg-ag-primary text-white' : 'bg-ag-surface text-ag-muted hover:bg-ag-border'}`}>
              {f}
              {cnt > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="ag-card !p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-ag-muted">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-bold">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-ag-border">
            {filtered.map(n => {
              const cfg = TYPE_ICONS[n.type] || TYPE_ICONS.order;
              const Icon = cfg.icon;
              return (
                <div key={n.id} onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors
                    ${n.read ? 'hover:bg-ag-canvas' : 'bg-blue-50/50 border-l-4 border-ag-primary hover:bg-blue-50'}`}>

                  <div className={`w-10 h-10 rounded-btn ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-bold text-sm ${n.read ? 'text-ag-body' : 'text-ag-primary'}`}>
                        {n.title}
                        {!n.read && <span className="ml-2 inline-block w-2 h-2 bg-ag-primary rounded-full align-middle" />}
                      </p>
                      <span className="text-[11px] text-ag-muted shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-ag-muted mt-0.5 leading-relaxed">{n.msg}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); markRead(n.id); }}
                        className="p-1.5 text-ag-muted hover:text-ag-primary rounded">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); remove(n.id); }}
                      className="p-1.5 text-ag-muted hover:text-red-500 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="ag-card">
        <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-ag-primary" /> Notification Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[['In-App Notifications', true],['SMS Alerts', true],['WhatsApp Alerts', true],
            ['Email Notifications', false],['Push Notifications', true],['Storage Alerts', true],
            ['Payment Alerts', true],['Order Updates', true]].map(([label, def]) => (
            <label key={label} className="flex items-center justify-between py-2.5 px-4
              bg-ag-surface rounded-btn cursor-pointer hover:bg-ag-card transition-colors">
              <span className="text-sm font-semibold text-ag-body">{label}</span>
              <input type="checkbox" defaultChecked={def} className="w-4 h-4 accent-ag-primary" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
