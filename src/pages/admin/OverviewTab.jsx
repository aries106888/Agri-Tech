/* ── Admin: Overview Tab ─────────────────────────────────── */
import { TrendingUp, ShoppingBag, Users, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MONTHLY_REVENUE, CROP_SALES, PIE_DATA } from '../../data/adminData';

const ChartCard = ({ title, icon: Icon, iconColor, children }) => (
  <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
    <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
      <Icon className={`w-4 h-4 ${iconColor}`} /> {title}
    </h3>
    {children}
  </div>
);

const OverviewTab = ({ stats }) => (
  <div className="p-6 flex flex-col gap-6 bg-ag-canvas/30">

    {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color, border }) => (
        <div
          key={label}
          className={`ag-card flex flex-col gap-3 border-l-4 ${border}`}
        >
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

    {/* Charts grid */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <ChartCard title="Platform Revenue Trend" icon={TrendingUp} iconColor="text-ag-primary">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `KSh ${v / 1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={3}
                dot={{ r: 4, fill: '#1B4332', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top Selling Produce" icon={ShoppingBag} iconColor="text-ag-amber">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CROP_SALES} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e5e7eb" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v) => [`${v}%`, 'Market Share']} />
              <Bar dataKey="sales" fill="#D97706" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="User Role Distribution" icon={Users} iconColor="text-blue-600">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '10px' }} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Monthly Orders" icon={Activity} iconColor="text-blue-600">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v) => [v, 'Orders']} />
              <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

    </div>
  </div>
);

export default OverviewTab;
