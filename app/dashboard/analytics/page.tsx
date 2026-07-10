'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

// ── Tiny SVG sparkline renderer (no chart library needed) ──
function Sparkline({ data, color = '#3b82f6', height = 40, className = '' }: { data: number[]; color?: string; height?: number; className?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={`w-full ${className}`} style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Mini bar chart ──
function BarChart({ data, labels, color = '#3b82f6', height = 140 }: { data: number[]; labels: string[]; color?: string; height?: number }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer relative">
          <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[var(--d-surface-2)] text-[var(--d-text)] text-xs font-bold py-1 px-2 rounded-lg border border-[var(--d-border)] whitespace-nowrap z-10 shadow-lg pointer-events-none">
            {v.toLocaleString()}
          </div>
          <div
            className="w-full rounded-t-md transition-all duration-300 min-h-[4px] hover:brightness-110"
            style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: v > 0 ? 1 : 0.15 }}
          />
          {data.length <= 14 && (
            <span className="text-[9px] font-medium text-[var(--d-text-faint)] truncate w-full text-center">{labels[i]?.slice(5)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Donut chart ──
function DonutChart({ segments, size = 120 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="text-[var(--d-text-faint)] text-sm text-center py-4">No data</div>;

  const r = 42;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-lg">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-500 hover:stroke-opacity-80 cursor-pointer"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[var(--d-text)] text-[20px] font-black">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[var(--d-text-faint)] text-[8px] font-bold tracking-widest">TOTAL</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-[var(--d-text-muted)] font-medium">{seg.label}</span>
            <span className="font-bold text-[var(--d-text)] ml-0.5">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ──
function StatCard({ title, value, subtitle, icon, trend, color = '#3b82f6', sparkData }: {
  title: string; value: string | number; subtitle?: string; icon: React.ReactNode; trend?: string; color?: string; sparkData?: number[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-7 flex flex-col gap-4 group hover:border-[var(--d-border)] transition-all duration-300 shadow-sm hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)` }} />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-[var(--d-text)] tracking-tight truncate">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          </div>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${trend.startsWith('+') || trend.startsWith('↑') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : trend === '0' ? 'bg-gray-500/10 text-[var(--d-text-muted)] border border-gray-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-[var(--d-text-muted)] relative z-10 font-medium">{subtitle}</p>}
      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} color={color} height={40} className="mt-2 opacity-80 group-hover:opacity-100 transition-opacity relative z-10" />
      )}
    </div>
  );
}

// ── Types ──
interface AnalyticsData {
  overview: {
    total_views: number; total_cards: number; active_cards: number;
    total_leads: number; new_leads: number; leads_period: number;
    total_orders: number; orders_period: number;
    total_revenue: number; revenue_period: number; avg_order_value: number;
    total_appointments: number; appointments_period: number; pending_appointments: number;
    total_products: number; total_services: number;
    conversion_rate: number; order_conversion: number;
  };
  charts: { period: string[]; leads: number[]; orders: number[]; revenue: number[] };
  breakdowns: {
    leads_by_status: Record<string, number>;
    orders_by_status: Record<string, number>;
    appointments_by_status: Record<string, number>;
  };
  card_performance: { id: number; name: string; slug: string; views: number; leads: number; orders: number; appointments: number; status: string; conversion: number }[];
  top_products: { name: string; count: number; revenue: number }[];
  recent_leads: { id: number; name: string; email: string; phone: string; status: string; card_name: string; created_at: string }[];
  recent_orders: { id: number; customer: string; email: string; total: number; status: string; items_count: number; created_at: string }[];
  days: number;
}

const PERIODS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'leads' | 'orders'>('overview');

  const fetchData = useCallback(async (period: number) => {
    setLoading(true);
    try {
      const result = await apiFetch<AnalyticsData>(`/api/analytics/summary?days=${period}`, { method: 'GET' });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--d-text-muted)] text-sm font-medium">Gathering insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-[var(--d-text-muted)] font-medium">Failed to load analytics data.</p>
        <button onClick={() => fetchData(days)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20">Try Again</button>
      </div>
    );
  }

  const o = data.overview;
  const chartLabels = data.charts.period.map(d => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const statusColors: Record<string, string> = {
    new: '#3b82f6', read: '#8b5cf6', archived: '#6b7280',
    pending: '#f59e0b', confirmed: '#10b981', completed: '#22c55e',
    cancelled: '#ef4444', active: '#3b82f6', inactive: '#6b7280'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--d-text)] tracking-tight">Analytics</h1>
          <p className="text-[var(--d-text-muted)] mt-1 font-medium">Track your performance, leads, and revenue.</p>
        </div>
        
        {/* Modern Segmented Control for Period */}
        <div className="flex items-center p-1.5 bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl shadow-sm">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-colors duration-300 ${days === p.value ? 'text-white' : 'text-[var(--d-text-muted)] hover:text-[var(--d-text)]'}`}
            >
              {days === p.value && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-blue-600 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl overflow-x-auto shadow-sm w-max mb-8">
        {(['overview', 'cards', 'leads', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative min-w-[120px] px-6 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 capitalize z-10 ${activeTab === tab ? 'text-white' : 'text-[var(--d-text-muted)] hover:text-[var(--d-text)]'}`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-slate-800 dark:bg-white/10 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === 'overview' && (
        <motion.div 
          key="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Key metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Views"
              value={o.total_views}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              color="#3b82f6"
              subtitle={`${o.active_cards} active card${o.active_cards !== 1 ? 's' : ''}`}
            />
            <StatCard
              title="Total Leads"
              value={o.total_leads}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              trend={o.leads_period > 0 ? `+${o.leads_period}` : '0'}
              color="#8b5cf6"
              sparkData={data.charts.leads}
              subtitle={`${o.new_leads} unread`}
            />
            <StatCard
              title="Revenue"
              value={`₹${o.total_revenue.toLocaleString('en-IN')}`}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              trend={o.revenue_period > 0 ? `+₹${o.revenue_period.toLocaleString('en-IN')}` : '0'}
              color="#10b981"
              sparkData={data.charts.revenue}
              subtitle={`Avg ₹${o.avg_order_value.toLocaleString('en-IN')} / order`}
            />
            <StatCard
              title="Appointments"
              value={o.total_appointments}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2.5" /><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2.5" /><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2.5" /><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2.5" /></svg>}
              trend={o.appointments_period > 0 ? `+${o.appointments_period}` : '0'}
              color="#f59e0b"
              subtitle={`${o.pending_appointments} pending`}
            />
          </div>

          {/* Conversion funnel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-3">View → Lead</p>
              <p className="text-4xl font-black text-[var(--d-text)] tracking-tight">{o.conversion_rate}%</p>
              <div className="mt-5 w-full bg-[var(--d-surface-2)] rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500 transition-all shadow-[0_0_12px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(o.conversion_rate, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-3">Lead → Order</p>
              <p className="text-4xl font-black text-[var(--d-text)] tracking-tight">{o.order_conversion}%</p>
              <div className="mt-5 w-full bg-[var(--d-surface-2)] rounded-full h-2">
                <div className="h-2 rounded-full bg-emerald-500 transition-all shadow-[0_0_12px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(o.order_conversion, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-3">Catalog Size</p>
              <p className="text-4xl font-black text-[var(--d-text)] tracking-tight">{o.total_products + o.total_services}</p>
              <p className="text-sm font-medium text-[var(--d-text-muted)] mt-2">{o.total_products} products, {o.total_services} services</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads chart */}
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[var(--d-text)]">Leads Over Time</h3>
                <span className="text-xs font-bold text-[var(--d-text-faint)] tracking-widest uppercase">{days} days</span>
              </div>
              <BarChart data={data.charts.leads} labels={chartLabels} color="#8b5cf6" height={160} />
            </div>

            {/* Revenue chart */}
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[var(--d-text)]">Revenue Over Time</h3>
                <span className="text-xs font-bold text-[var(--d-text-faint)] tracking-widest uppercase">{days} days</span>
              </div>
              <BarChart data={data.charts.revenue} labels={chartLabels} color="#10b981" height={160} />
            </div>
          </div>

          {/* Breakdowns row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-[var(--d-text)] mb-6 text-center">Leads</h3>
              <DonutChart segments={Object.entries(data.breakdowns.leads_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={110} />
            </div>
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-[var(--d-text)] mb-6 text-center">Orders</h3>
              <DonutChart segments={Object.entries(data.breakdowns.orders_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={110} />
            </div>
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-[var(--d-text)] mb-6 text-center">Appointments</h3>
              <DonutChart segments={Object.entries(data.breakdowns.appointments_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={110} />
            </div>
          </div>

          {/* Top Products */}
          {data.top_products.length > 0 && (
            <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-[var(--d-text)] mb-6">Top Products by Revenue</h3>
              <div className="space-y-4">
                {data.top_products.map((p, i) => {
                  const maxRev = data.top_products[0]?.revenue || 1;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm text-[var(--d-text-faint)] w-6 text-right font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--d-text)] font-semibold truncate">{p.name}</span>
                          <span className="text-sm text-emerald-500 font-bold ml-3 shrink-0">₹{p.revenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-[var(--d-surface-2)] rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all shadow-sm" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--d-text-muted)] shrink-0 bg-[var(--d-surface-2)] px-2 py-1 rounded-md">{p.count} sold</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* ═══════════════ CARDS TAB ═══════════════ */}
      {activeTab === 'cards' && (
        <motion.div 
          key="cards"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] overflow-hidden shadow-sm">
            <div className="divide-y divide-[var(--d-border)]">
              {data.card_performance.map(card => {
                const initial = card.name ? card.name.charAt(0).toUpperCase() : '?';
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                const avatarBg = colors[card.name ? card.name.charCodeAt(0) % colors.length : 0];
                return (
                  <div key={card.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[var(--d-hover)] transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 w-12 h-12 ${avatarBg} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {initial}
                      </div>
                      <div>
                        <p className="text-base font-bold text-[var(--d-text)]">{card.name}</p>
                        <p className="text-xs font-medium text-[var(--d-text-muted)] mt-0.5">/{card.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Views</p>
                        <p className="text-sm font-bold text-[var(--d-text)]">{card.views.toLocaleString()}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Leads</p>
                        <p className="text-sm font-bold text-[var(--d-text)]">{card.leads}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Orders</p>
                        <p className="text-sm font-bold text-[var(--d-text)]">{card.orders}</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Conv.</p>
                        <p className={`text-sm font-black ${card.conversion > 5 ? 'text-emerald-500' : card.conversion > 0 ? 'text-yellow-500' : 'text-[var(--d-text-muted)]'}`}>
                          {card.conversion}%
                        </p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Status</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${card.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-500/10 text-[var(--d-text-muted)] border-gray-500/20'}`}>
                          {card.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.card_performance.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-[var(--d-surface-2)] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--d-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 </div>
                 <p className="text-[var(--d-text-muted)] font-medium">No cards found. Create your first card to see analytics.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════════ LEADS TAB ═══════════════ */}
      {activeTab === 'leads' && (
        <motion.div 
          key="leads"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard title="Total Leads" value={o.total_leads} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="#8b5cf6" />
            <StatCard title="New Leads" value={o.new_leads} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2.5" /><line x1="12" y1="8" x2="12" y2="16" strokeWidth="2.5" /><line x1="8" y1="12" x2="16" y2="12" strokeWidth="2.5" /></svg>} color="#3b82f6" />
            <StatCard title="This Period" value={o.leads_period} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="#10b981" sparkData={data.charts.leads} />
            <StatCard title="Conversion" value={`${o.conversion_rate}%`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} color="#f59e0b" />
          </div>

          <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[var(--d-border)]">
              <h3 className="text-base font-bold text-[var(--d-text)]">Recent Leads</h3>
            </div>
            <div className="divide-y divide-[var(--d-border)]">
              {data.recent_leads.map(lead => {
                const initial = lead.name ? lead.name.charAt(0).toUpperCase() : '?';
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                const avatarBg = colors[lead.name ? lead.name.charCodeAt(0) % colors.length : 0];
                return (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[var(--d-hover)] transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 w-12 h-12 ${avatarBg} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--d-text)]">{lead.name}</p>
                        <p className="text-xs font-medium text-[var(--d-text-muted)] mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {lead.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 text-sm">
                      <div className="hidden sm:block min-w-[100px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Source Card</p>
                        <p className="font-medium text-[var(--d-text-muted)] truncate">{lead.card_name}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Status</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : lead.status === 'read' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-gray-500/10 text-[var(--d-text-muted)] border-gray-500/20'}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="min-w-[100px] text-right">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Date</p>
                        <p className="font-medium text-[var(--d-text-muted)]">{new Date(lead.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.recent_leads.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-[var(--d-surface-2)] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--d-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                 <p className="text-[var(--d-text-muted)] font-medium">No recent leads found.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════════ ORDERS TAB ═══════════════ */}
      {activeTab === 'orders' && (
        <motion.div 
          key="orders"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard title="Total Orders" value={o.total_orders} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} color="#3b82f6" sparkData={data.charts.orders} />
            <StatCard title="Revenue" value={`₹${o.total_revenue.toLocaleString('en-IN')}`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="#10b981" />
            <StatCard title="This Period" value={o.orders_period} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="#f59e0b" />
            <StatCard title="Avg. Order" value={`₹${o.avg_order_value.toLocaleString('en-IN')}`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} color="#8b5cf6" />
          </div>

          <div className="rounded-3xl bg-[var(--d-elevate)] border border-[var(--d-border)] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[var(--d-border)]">
              <h3 className="text-base font-bold text-[var(--d-text)]">Recent Orders</h3>
            </div>
            <div className="divide-y divide-[var(--d-border)]">
              {data.recent_orders.map(order => {
                const initial = order.customer ? order.customer.charAt(0).toUpperCase() : '?';
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                const avatarBg = colors[order.customer ? order.customer.charCodeAt(0) % colors.length : 0];
                return (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[var(--d-hover)] transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 w-12 h-12 ${avatarBg} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--d-text)]">{order.customer}</p>
                        <p className="text-xs font-medium text-[var(--d-text-muted)] mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {order.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 text-sm">
                      <div className="text-right min-w-[80px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Amount</p>
                        <p className="font-black text-emerald-500">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center min-w-[60px] hidden sm:block">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Items</p>
                        <p className="font-bold text-[var(--d-text)]">{order.items_count}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Status</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="min-w-[100px] text-right">
                        <p className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Date</p>
                        <p className="font-medium text-[var(--d-text-muted)]">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.recent_orders.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-[var(--d-surface-2)] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--d-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 </div>
                 <p className="text-[var(--d-text-muted)] font-medium">No recent orders found.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
