'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Mini bar chart ──
function BarChart({ data, labels, color = '#3b82f6', height = 120 }: { data: number[]; labels: string[]; color?: string; height?: number }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all duration-300 min-h-[2px]"
            style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: v > 0 ? 1 : 0.15 }}
            title={`${labels[i]}: ${v}`}
          />
          {data.length <= 14 && (
            <span className="text-[8px] text-[var(--d-text-faint)] truncate w-full text-center">{labels[i]?.slice(5)}</span>
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
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 100" width={size} height={size}>
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
              className="transition-all duration-500"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-[18px] font-bold">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-400 text-[8px]">TOTAL</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[var(--d-text-muted)]">{seg.label}</span>
            <span className="font-semibold text-[var(--d-text)]">{seg.value}</span>
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
    <div className="relative overflow-hidden rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 flex flex-col gap-4 group hover:border-[var(--d-border)] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style={{ boxShadow: `0 10px 40px -10px ${color}15` }}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)` }} />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15`, boxShadow: `0 4px 20px -2px ${color}40` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[var(--d-text-muted)] font-medium mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--d-text)] tracking-tight truncate">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          </div>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-sm ${trend.startsWith('+') || trend.startsWith('↑') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : trend === '0' ? 'bg-gray-500/10 text-[var(--d-text-muted)] border border-gray-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[var(--d-text-faint)] relative z-10">{subtitle}</p>}
      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} color={color} height={36} className="mt-2 opacity-70 group-hover:opacity-100 transition-opacity relative z-10" />
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--d-text-muted)] text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--d-text-muted)]">Failed to load analytics data.</p>
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
    cancelled: '#ef4444', active: '#3b82f6',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--d-text)] tracking-tight">Analytics</h1>
          <p className="text-[var(--d-text-muted)] mt-2">Track your card performance, leads, and revenue in real-time.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] rounded-2xl p-1.5 shadow-lg">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${days === p.value ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-[var(--d-text-muted)] hover:text-white hover:bg-[var(--d-hover)]'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] rounded-2xl p-2 overflow-x-auto shadow-lg">
        {(['overview', 'cards', 'leads', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[100px] px-5 py-3 text-sm font-bold rounded-xl transition-all duration-300 capitalize ${activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'text-[var(--d-text-muted)] hover:text-white hover:bg-[var(--d-hover)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Total Views"
              value={o.total_views}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              color="#3b82f6"
              subtitle={`${o.active_cards} active card${o.active_cards !== 1 ? 's' : ''}`}
            />
            <StatCard
              title="Total Leads"
              value={o.total_leads}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              trend={o.leads_period > 0 ? `+${o.leads_period}` : '0'}
              color="#8b5cf6"
              sparkData={data.charts.leads}
              subtitle={`${o.new_leads} unread`}
            />
            <StatCard
              title="Revenue"
              value={`₹${o.total_revenue.toLocaleString('en-IN')}`}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              trend={o.revenue_period > 0 ? `+₹${o.revenue_period.toLocaleString('en-IN')}` : '0'}
              color="#10b981"
              sparkData={data.charts.revenue}
              subtitle={`Avg ₹${o.avg_order_value.toLocaleString('en-IN')} per order`}
            />
            <StatCard
              title="Appointments"
              value={o.total_appointments}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" /><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" /><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" /><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" /></svg>}
              trend={o.appointments_period > 0 ? `+${o.appointments_period}` : '0'}
              color="#f59e0b"
              subtitle={`${o.pending_appointments} pending`}
            />
          </div>

          {/* Conversion funnel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl flex flex-col justify-center">
              <p className="text-sm text-[var(--d-text-muted)] font-medium mb-2">View → Lead</p>
              <p className="text-4xl font-bold text-[var(--d-text)] tracking-tight">{o.conversion_rate}%</p>
              <div className="mt-4 w-full bg-[var(--d-elevate)] rounded-full h-2 border border-[var(--d-border)]">
                <div className="h-2 rounded-full bg-blue-500 transition-all shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${Math.min(o.conversion_rate, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl flex flex-col justify-center">
              <p className="text-sm text-[var(--d-text-muted)] font-medium mb-2">Lead → Order</p>
              <p className="text-4xl font-bold text-[var(--d-text)] tracking-tight">{o.order_conversion}%</p>
              <div className="mt-4 w-full bg-[var(--d-elevate)] rounded-full h-2 border border-[var(--d-border)]">
                <div className="h-2 rounded-full bg-emerald-500 transition-all shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${Math.min(o.order_conversion, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl flex flex-col justify-center">
              <p className="text-sm text-[var(--d-text-muted)] font-medium mb-2">Catalog</p>
              <p className="text-4xl font-bold text-[var(--d-text)] tracking-tight">{o.total_products + o.total_services}</p>
              <p className="text-sm text-[var(--d-text-faint)] mt-2">{o.total_products} products, {o.total_services} services</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Leads chart */}
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--d-text)]">Leads Over Time</h3>
                <span className="text-xs text-[var(--d-text-faint)]">{days} days</span>
              </div>
              <BarChart data={data.charts.leads} labels={chartLabels} color="#8b5cf6" height={140} />
            </div>

            {/* Revenue chart */}
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--d-text)]">Revenue Over Time</h3>
                <span className="text-xs text-[var(--d-text-faint)]">{days} days</span>
              </div>
              <BarChart data={data.charts.revenue} labels={chartLabels} color="#10b981" height={140} />
            </div>
          </div>

          {/* Breakdowns row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <h3 className="text-sm font-semibold text-[var(--d-text)] mb-4">Leads by Status</h3>
              <DonutChart segments={Object.entries(data.breakdowns.leads_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={100} />
            </div>
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <h3 className="text-sm font-semibold text-[var(--d-text)] mb-4">Orders by Status</h3>
              <DonutChart segments={Object.entries(data.breakdowns.orders_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={100} />
            </div>
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <h3 className="text-sm font-semibold text-[var(--d-text)] mb-4">Appointments</h3>
              <DonutChart segments={Object.entries(data.breakdowns.appointments_by_status).map(([k, v]) => ({ label: k, value: v, color: statusColors[k] || '#6b7280' }))} size={100} />
            </div>
          </div>

          {/* Top Products */}
          {data.top_products.length > 0 && (
            <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] p-6 sm:p-8 shadow-xl">
              <h3 className="text-sm font-semibold text-[var(--d-text)] mb-4">Top Products by Revenue</h3>
              <div className="space-y-3">
                {data.top_products.map((p, i) => {
                  const maxRev = data.top_products[0]?.revenue || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--d-text-faint)] w-5 text-right font-mono">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[var(--d-text)] font-medium truncate">{p.name}</span>
                          <span className="text-xs text-emerald-400 font-semibold ml-2 shrink-0">₹{p.revenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-[var(--d-surface-2)] rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--d-text-faint)] shrink-0">{p.count} sold</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ CARDS TAB ═══════════════ */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--d-border)]">
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Card</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-right">Views</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-right">Leads</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-right">Orders</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-right">Conversion</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.card_performance.map(card => (
                    <tr key={card.id} className="border-b border-[var(--d-border)] hover:bg-[var(--d-hover)] transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-[var(--d-text)]">{card.name}</p>
                          <p className="text-xs text-[var(--d-text-faint)]">/{card.slug}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-[var(--d-text)] font-medium">{card.views.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-sm text-[var(--d-text)] font-medium">{card.leads}</td>
                      <td className="px-5 py-4 text-right text-sm text-[var(--d-text)] font-medium">{card.orders}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-sm font-bold ${card.conversion > 5 ? 'text-emerald-400' : card.conversion > 0 ? 'text-yellow-400' : 'text-[var(--d-text-faint)]'}`}>
                          {card.conversion}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${card.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-[var(--d-text-muted)]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${card.status === 'active' ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          {card.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.card_performance.length === 0 && (
              <div className="py-12 text-center text-[var(--d-text-faint)] text-sm">No cards found. Create your first card to see analytics.</div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ LEADS TAB ═══════════════ */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Total Leads" value={o.total_leads} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="#8b5cf6" />
            <StatCard title="New" value={o.new_leads} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="16" strokeWidth="2" /><line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" /></svg>} color="#3b82f6" />
            <StatCard title="This Period" value={o.leads_period} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="#10b981" sparkData={data.charts.leads} />
            <StatCard title="Conversion" value={`${o.conversion_rate}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} color="#f59e0b" />
          </div>

          <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-[var(--d-border)]">
              <h3 className="text-sm font-semibold text-[var(--d-text)]">Recent Leads</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--d-border)]">
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Contact</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Card</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_leads.map(lead => (
                    <tr key={lead.id} className="border-b border-[var(--d-border)] hover:bg-[var(--d-hover)] transition-colors">
                      <td className="px-5 py-3 text-sm text-[var(--d-text)] font-medium">{lead.name}</td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-[var(--d-text-muted)]">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-[var(--d-text-faint)]">{lead.phone}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--d-text-muted)]">{lead.card_name}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' : lead.status === 'read' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-[var(--d-text-muted)]'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--d-text-faint)]">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.recent_leads.length === 0 && (
              <div className="py-12 text-center text-[var(--d-text-faint)] text-sm">No leads yet.</div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ ORDERS TAB ═══════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Total Orders" value={o.total_orders} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} color="#3b82f6" sparkData={data.charts.orders} />
            <StatCard title="Revenue" value={`₹${o.total_revenue.toLocaleString('en-IN')}`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="#10b981" />
            <StatCard title="This Period" value={o.orders_period} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="#f59e0b" />
            <StatCard title="Avg. Order" value={`₹${o.avg_order_value.toLocaleString('en-IN')}`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} color="#8b5cf6" />
          </div>

          <div className="rounded-3xl bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-[var(--d-border)]">
              <h3 className="text-sm font-semibold text-[var(--d-text)]">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--d-border)]">
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-right">Amount</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider text-center">Items</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map(order => (
                    <tr key={order.id} className="border-b border-[var(--d-border)] hover:bg-[var(--d-hover)] transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm text-[var(--d-text)] font-medium">{order.customer}</p>
                        <p className="text-xs text-[var(--d-text-faint)]">{order.email}</p>
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-emerald-400 font-bold">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-center text-xs text-[var(--d-text-muted)]">{order.items_count}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--d-text-faint)]">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.recent_orders.length === 0 && (
              <div className="py-12 text-center text-[var(--d-text-faint)] text-sm">No orders yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
