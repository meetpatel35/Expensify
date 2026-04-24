import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateShort } from '../lib/utils';
import { TrendingUp, ShoppingBag, Receipt, IndianRupee, Calendar, ChevronDown } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
} from 'recharts';

const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa', '#a78bfa'];

const RANGE_OPTIONS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState('monthly');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const { adminTargetUser } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [range, customFrom, customTo, adminTargetUser]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = { range };
      if (range === 'custom' && customFrom && customTo) {
        params.from = customFrom;
        params.to = customTo;
      }
      if (adminTargetUser) {
        params.targetUserId = adminTargetUser;
      }
      const { data } = await api.get('/analytics', { params });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = analytics?.categoryBreakdown?.map((cat) => ({
    name: cat.categoryName,
    value: cat.total,
    icon: cat.categoryIcon,
    percentage: cat.percentage,
  })) || [];

  const barData = analytics?.dailyBreakdown?.map((d) => ({
    date: formatDateShort(d.date),
    amount: d.total,
  })) || [];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="glass rounded-xl px-4 py-3 shadow-xl">
          <p className="text-sm font-semibold text-text-heading">{data.icon} {data.name}</p>
          <p className="text-sm text-primary-light font-bold">{formatCurrency(data.value)}</p>
          <p className="text-xs text-text-muted">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-xl px-4 py-3 shadow-xl">
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-sm font-bold text-primary-light">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Your expense overview</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setRange(opt.value);
                if (opt.value !== 'custom') {
                  setCustomFrom('');
                  setCustomTo('');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === opt.value
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'bg-surface/30 text-text-muted border border-border hover:bg-surface/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {range === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 stagger-children">
        <div className="glass rounded-2xl p-4 md:p-5 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary-light" />
            </div>
          </div>
          <p className="text-xs text-text-muted">Total Spent</p>
          <p className="text-xl md:text-2xl font-bold text-text-heading mt-1">
            {formatCurrency(analytics?.summary?.totalSpent || 0)}
          </p>
        </div>

        <div className="glass rounded-2xl p-4 md:p-5 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <p className="text-xs text-text-muted">Transactions</p>
          <p className="text-xl md:text-2xl font-bold text-text-heading mt-1">
            {analytics?.summary?.totalCount || 0}
          </p>
        </div>

        <div className="glass rounded-2xl p-4 md:p-5 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <p className="text-xs text-text-muted">Avg per Entry</p>
          <p className="text-xl md:text-2xl font-bold text-text-heading mt-1">
            {formatCurrency(analytics?.summary?.avgExpense || 0)}
          </p>
        </div>

        <div className="glass rounded-2xl p-4 md:p-5 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-warning" />
            </div>
          </div>
          <p className="text-xs text-text-muted">Top Category</p>
          <p className="text-lg md:text-xl font-bold text-text-heading mt-1 truncate">
            {analytics?.summary?.topCategory?.name || '—'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart */}
        <div className="glass rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-text-heading mb-4">Category Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-text-muted">{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-text-muted text-sm">
              No expenses to display
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="glass rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-text-heading mb-4">Daily Spending</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: 'rgba(99,102,241,0.2)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: 'rgba(99,102,241,0.2)' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <BarTooltip content={<CustomBarTooltip />} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-text-muted text-sm">
              No expenses to display
            </div>
          )}
        </div>
      </div>

      {/* Category List */}
      {pieData.length > 0 && (
        <div className="glass rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-text-heading mb-4">Expense Details</h2>
          <div className="space-y-3">
            {pieData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-text">{cat.icon} {cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-heading">{formatCurrency(cat.value)}</p>
                  <p className="text-xs text-text-muted">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
