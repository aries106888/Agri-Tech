import { TrendingUp, ShoppingBag, Users, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHLY_REVENUE = [
  { name: 'Jan', revenue: 420000,  orders: 120 },
  { name: 'Feb', revenue: 510000,  orders: 155 },
  { name: 'Mar', revenue: 680000,  orders: 198 },
  { name: 'Apr', revenue: 850000,  orders: 241 },
  { name: 'May', revenue: 1200000, orders: 360 },
  { name: 'Jun', revenue: 1540000, orders: 482 },
];

const CROP_SALES = [
  { name: 'Maize',    sales: 45 },
  { name: 'Tomatoes', sales: 25 },
  { name: 'Potatoes', sales: 15 },
  { name: 'Onions',   sales: 10 },
  { name: 'Cabbage',  sales: 5  },
];

const PIE_DATA = [
  { name: 'Farmers',   value: 38, color: '#3d6c38' },
  { name: 'Buyers',    value: 45, color: '#2563eb' },
  { name: 'Logistics', value: 17, color: '#d97706' },
];

const OverviewTab = () => (
  <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 bg-ag-canvas/30">

    {/* Revenue Trend */}
    <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
      <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-ag-primary" /> Platform Revenue Trend
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `KSh ${v/1000}k`} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
            />
            <Line type="monotone" dataKey="revenue" stroke="#3d6c38" strokeWidth={3} dot={{ r: 4, fill: '#3d6c38', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Top Selling Produce */}
    <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
      <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-ag-amber" /> Top Selling Produce
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CROP_SALES} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e5e7eb" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v) => [`${v}%`, 'Market Share']} />
            <Bar dataKey="sales" fill="#d97706" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* User Distribution Pie */}
    <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
      <h3 className="font-extrabold text-ag-body mb-4 text-sm flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600" /> User Role Distribution
      </h3>
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
    </div>

    {/* Monthly Orders */}
    <div className="border border-ag-border rounded-card p-5 bg-white hover:shadow-md transition-shadow">
      <h3 className="font-extrabold text-ag-body mb-6 text-sm flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-600" /> Monthly Orders
      </h3>
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
    </div>
  </div>
);

export default OverviewTab;
