import { useState } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown, DollarSign,
  ShoppingBag, Users, Package, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 142000, orders: 38, farmers: 12 },
  { month: 'Feb', revenue: 168000, orders: 45, farmers: 14 },
  { month: 'Mar', revenue: 195000, orders: 52, farmers: 18 },
  { month: 'Apr', revenue: 221000, orders: 61, farmers: 22 },
  { month: 'May', revenue: 198000, orders: 54, farmers: 19 },
  { month: 'Jun', revenue: 267000, orders: 73, farmers: 27 },
  { month: 'Jul', revenue: 312000, orders: 88, farmers: 31 },
];

const CROP_DATA = [
  { name: 'Maize',    value: 35, color: '#4CAF50' },
  { name: 'Tomatoes', value: 22, color: '#EF4444' },
  { name: 'Beans',    value: 18, color: '#F59E0B' },
  { name: 'Potatoes', value: 12, color: '#8B5CF6' },
  { name: 'Others',   value: 13, color: '#64748B' },
];

const COUNTY_DATA = [
  { county: 'Nakuru',    orders: 142, revenue: 680000 },
  { county: 'Nairobi',   orders: 118, revenue: 540000 },
  { county: 'Eldoret',   orders: 97,  revenue: 465000 },
  { county: 'Kisumu',    orders: 74,  revenue: 320000 },
  { county: 'Meru',      orders: 61,  revenue: 278000 },
  { county: 'Kisii',     orders: 48,  revenue: 201000 },
];

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-ag-border rounded-card px-4 py-3 shadow-card-lg text-xs">
      <p className="font-bold text-ag-body mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name === 'revenue'
            ? `KSh ${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7M');

  const totalRevenue = REVENUE_DATA.reduce((a, r) => a + r.revenue, 0);
  const totalOrders  = REVENUE_DATA.reduce((a, r) => a + r.orders,  0);
  const avgOrder     = Math.round(totalRevenue / totalOrders);
  const lastMonth    = REVENUE_DATA[REVENUE_DATA.length - 1];
  const prevMonth    = REVENUE_DATA[REVENUE_DATA.length - 2];
  const growth       = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1);

  const handleExport = () => {
    const headers = 'Month,Revenue (KSh),Orders,Active Farmers\n';
    const rows = REVENUE_DATA.map(r => `${r.month},${r.revenue},${r.orders},${r.farmers}`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'shambapoint_analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-md text-ag-body flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-ag-primary" /> Analytics & Reports
          </h2>
          <p className="text-sm text-ag-muted mt-0.5">Platform performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-ag-surface rounded-btn p-1 gap-1">
            {['7M','3M','1M'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-btn text-xs font-bold transition-colors
                  ${period === p ? 'bg-ag-primary text-white' : 'text-ag-muted hover:text-ag-body'}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-ghost !py-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `${(totalRevenue/10000).toFixed(1)}k kshs`, icon: DollarSign, change: `+${growth}%`, up: true, color: 'text-ag-pay', bg: 'bg-green-100' },
          { label: 'Total Orders',  value: totalOrders, icon: ShoppingBag, change: '+18% vs prev', up: true, color: 'text-ag-amber', bg: 'bg-amber-100' },
          { label: 'Active Farmers', value: lastMonth.farmers, icon: Users, change: '+14 this month', up: true, color: 'text-ag-primary', bg: 'bg-ag-primary-fixed' },
          { label: 'Avg Order Value', value: `KSh ${avgOrder.toLocaleString()}`, icon: Package, change: '-2% vs prev', up: false, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="ag-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-ag-muted uppercase tracking-wide">{s.label}</p>
              <div className={`w-9 h-9 rounded-btn ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ag-body">{s.value}</p>
            <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${s.up ? 'text-green-600' : 'text-red-500'}`}>
              {s.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="ag-card">
        <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-ag-pay" /> Revenue Trend (KSh)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={REVENUE_DATA}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fill="url(#revGrad)"
              strokeWidth={2.5} name="revenue" dot={{ r: 4, fill: '#4CAF50' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders + Crop Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Orders Bar */}
        <div className="ag-card">
          <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-ag-amber" /> Monthly Orders
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#FE932C" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Mix Pie */}
        <div className="ag-card">
          <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-ag-primary" /> Top Produce by Volume
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CROP_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}>
                {CROP_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* County Table */}
      <div className="ag-card !p-0">
        <div className="section-header">
          <h3 className="font-extrabold text-ag-body">Top Counties by Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ag-surface text-ag-muted text-xs font-bold uppercase tracking-wide">
                <th className="text-left px-5 py-3">County</th>
                <th className="text-right px-5 py-3">Orders</th>
                <th className="text-right px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ag-border">
              {COUNTY_DATA.map((c, i) => (
                <tr key={c.county} className="hover:bg-ag-canvas transition-colors">
                  <td className="px-5 py-3 font-bold text-ag-body flex items-center gap-2">
                    <span className="text-ag-muted text-xs w-4">{i + 1}</span>
                    {c.county}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{c.orders}</td>
                  <td className="px-5 py-3 text-right font-bold text-ag-amber">
                    KSh {c.revenue.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-ag-surface rounded-full h-2">
                        <div className="h-full bg-ag-primary rounded-full"
                          style={{ width: `${(c.orders / COUNTY_DATA[0].orders * 100).toFixed(0)}%` }} />
                      </div>
                      <span className="text-xs text-ag-muted w-8 text-right">
                        {(c.orders / COUNTY_DATA[0].orders * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
