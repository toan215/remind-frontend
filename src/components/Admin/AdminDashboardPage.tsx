import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { statsCards, revenueData, allOrders, type Order } from './mockData';
import '../../admin/tailwind.css';

interface LayoutContext {
  isDark: boolean;
}

const ROWS_PER_PAGE = 8;

// ===== Status Badge =====
function StatusBadge({ status, isDark }: { status: Order['status']; isDark: boolean }) {
  const config = {
    completed: { label: 'Completed', bg: 'bg-admin-success-light', text: 'text-admin-success', dot: 'bg-admin-success' },
    processing: { label: 'Processing', bg: 'bg-admin-info-light', text: 'text-admin-info', dot: 'bg-admin-info' },
    pending: { label: 'Pending', bg: 'bg-admin-warning-light', text: 'text-admin-warning', dot: 'bg-admin-warning' },
    cancelled: { label: 'Cancelled', bg: 'bg-admin-danger-light', text: 'text-admin-danger', dot: 'bg-admin-danger' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ===== Stat Card =====
function StatCard({ card, index, isDark }: { card: typeof statsCards[0]; index: number; isDark: boolean }) {
  const colorMap = {
    primary: { bg: 'bg-admin-primary-light', text: 'text-admin-primary', border: 'border-admin-primary/20' },
    success: { bg: 'bg-admin-success-light', text: 'text-admin-success', border: 'border-admin-success/20' },
    warning: { bg: 'bg-admin-warning-light', text: 'text-admin-warning', border: 'border-admin-warning/20' },
    danger: { bg: 'bg-admin-danger-light', text: 'text-admin-danger', border: 'border-admin-danger/20' },
  };
  const colors = colorMap[card.color];
  const isPositive = card.change >= 0;

  return (
    <div
      className={`admin-fade-in admin-fade-in-delay-${index + 1} rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-default group ${isDark ? 'bg-admin-surface border-admin-border hover:border-admin-border-light' : 'bg-admin-light-surface border-admin-light-border hover:border-admin-light-border-light hover:shadow-gray-200/50'}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>
            {card.title}
          </p>
          <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>
            {card.value}
          </p>
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-admin-success' : 'text-admin-danger'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPositive ? 'M7 17l5-5 5 5' : 'M17 7l-5 5-5-5'} />
            </svg>
            {Math.abs(card.change)}% from last month
          </div>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
          {card.icon}
        </div>
      </div>
    </div>
  );
}

// ===== Skeleton Loaders =====
function StatSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="admin-skeleton h-4 w-24 rounded" />
          <div className="admin-skeleton h-8 w-32 rounded" />
          <div className="admin-skeleton h-3 w-36 rounded" />
        </div>
        <div className="admin-skeleton w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

function ChartSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
      <div className="admin-skeleton h-5 w-40 rounded mb-6" />
      <div className="admin-skeleton h-72 w-full rounded-xl" />
    </div>
  );
}

function TableSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
      <div className="admin-skeleton h-5 w-40 rounded mb-6" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="admin-skeleton w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="admin-skeleton h-4 w-3/4 rounded" />
            <div className="admin-skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="admin-skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ===== Custom Tooltip =====
function ChartTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl p-3 border shadow-xl text-sm ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border shadow-gray-200/50'}`}>
      <p className={`font-semibold mb-1.5 ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className={`flex items-center gap-2 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className={`font-medium ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>{entry.name === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ===== Main Dashboard Page =====
export default function AdminDashboardPage() {
  const { isDark } = useOutletContext<LayoutContext>();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.ceil(allOrders.length / ROWS_PER_PAGE);
  const paginatedOrders = allOrders.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} isDark={isDark} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3"><ChartSkeleton isDark={isDark} /></div>
          <div className="xl:col-span-2"><ChartSkeleton isDark={isDark} /></div>
        </div>
        <TableSkeleton isDark={isDark} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <StatCard key={card.id} card={card} index={i} isDark={isDark} />
        ))}
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Revenue Bar Chart */}
        <div className={`xl:col-span-3 admin-fade-in rounded-2xl p-5 border transition-colors ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-base font-semibold ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>Revenue Overview</h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>Monthly revenue for 2026</p>
            </div>
            <div className={`text-xs font-medium px-3 py-1.5 rounded-lg ${isDark ? 'bg-admin-bg text-admin-text-muted' : 'bg-admin-light-surface-hover text-admin-light-text-muted'}`}>
              This Year
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#e2e8f0'}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Area Chart */}
        <div className={`xl:col-span-2 admin-fade-in rounded-2xl p-5 border transition-colors ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-base font-semibold ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>Orders Trend</h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>Monthly orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#e2e8f0'}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} fill="url(#orderGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== ORDERS TABLE ===== */}
      <div className={`admin-fade-in rounded-2xl border transition-colors ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}`}>
        {/* Table Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-admin-border' : 'border-admin-light-border'}`}>
          <div>
            <h3 className={`text-base font-semibold ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>Recent Orders</h3>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>{allOrders.length} total orders</p>
          </div>
          <button className="text-sm font-medium text-admin-primary hover:text-admin-primary-hover transition-colors">
            View All →
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-admin-border' : 'border-admin-light-border'}`}>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className={`text-left px-5 py-3 font-medium text-xs uppercase tracking-wider ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b last:border-b-0 transition-colors ${isDark ? 'border-admin-border/50 hover:bg-admin-surface-hover/50' : 'border-admin-light-border/50 hover:bg-admin-light-surface-hover'}`}
                >
                  <td className={`px-5 py-3.5 font-mono text-xs font-medium ${isDark ? 'text-admin-primary' : 'text-admin-primary'}`}>
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {order.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>{order.customer}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`}>{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-3.5 ${isDark ? 'text-admin-text-muted' : 'text-admin-light-text-muted'}`}>
                    {order.product}
                  </td>
                  <td className={`px-5 py-3.5 font-semibold ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>
                    ${order.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} isDark={isDark} />
                  </td>
                  <td className={`px-5 py-3.5 ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`}>
                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex items-center justify-between px-5 py-4 border-t ${isDark ? 'border-admin-border' : 'border-admin-light-border'}`}>
          <p className={`text-sm ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`}>
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, allOrders.length)} of {allOrders.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-admin-surface-hover text-admin-text-muted' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted'}`}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === currentPage
                      ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/25'
                      : `${isDark ? 'hover:bg-admin-surface-hover text-admin-text-muted' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted'}`
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-admin-surface-hover text-admin-text-muted' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted'}`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
