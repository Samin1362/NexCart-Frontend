'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, LabelList,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { motion } from 'framer-motion';
import {
  Download,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Package,
  Trophy,
  Zap,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { ChartData, TopProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#8B5CF6', '#EC4899'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RANGE_OPTIONS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
] as const;

type RangeValue = 3 | 6 | 12;

const CONTAINER_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } },
};

// ─── Export Helper ────────────────────────────────────────────────────────────

function exportChartAsPng(wrapperId: string, filename: string) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  const svg = wrapper.querySelector('svg');
  if (!svg) return;

  const w = svg.clientWidth || 640;
  const h = svg.clientHeight || 320;

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  canvas.width = w * 2;   // 2× for retina
  canvas.height = h * 2;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) { URL.revokeObjectURL(url); return; }

  const img = new window.Image();
  img.onload = () => {
    ctx.scale(2, 2);
    // Fill background with page bg colour
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function CustomRevenueTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-bg shadow-lg px-4 py-3 min-w-[140px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">{label}</p>
      <p className="text-sm font-extrabold text-primary-accent">
        {formatPrice(Number(payload[0].value))}
      </p>
    </div>
  );
}

function CustomPieTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const colorIndex = payload[0].payload?.index ?? 0;
  return (
    <div className="border border-border bg-bg shadow-lg px-4 py-3 min-w-[140px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: COLORS[colorIndex % COLORS.length] }} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{name}</p>
      </div>
      <p className="text-sm font-extrabold text-text-primary">{value} orders</p>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-bg shadow-lg px-4 py-3 min-w-[140px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">{label}</p>
      <p className="text-sm font-extrabold text-primary-accent">{payload[0].value} units</p>
    </div>
  );
}

// ─── Chart Section Wrapper ────────────────────────────────────────────────────

interface ChartCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  exportFilename: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

function ChartCard({ id, title, icon, exportFilename, children, headerRight }: ChartCardProps) {
  return (
    <motion.div variants={ITEM_VARIANTS} className="border border-border bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 border border-border bg-bg flex items-center justify-center text-text-secondary">
            {icon}
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          <button
            onClick={() => exportChartAsPng(id, exportFilename)}
            className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-[10px] font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent transition-colors cursor-pointer uppercase tracking-wide"
            title="Export as PNG"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
      </div>
      {/* Chart area */}
      <div id={id} className="p-5">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Range Tabs ───────────────────────────────────────────────────────────────

function RangeTabs({ value, onChange }: { value: RangeValue; onChange: (v: RangeValue) => void }) {
  return (
    <div className="flex border border-border">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            value === opt.value
              ? 'bg-primary-accent text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState<RangeValue>(12);
  const isFetched = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetched.current) return;
    isFetched.current = true;
    try {
      const [chartRes, topRes] = await Promise.all([
        api.get('/dashboard/chart-data'),
        api.get('/dashboard/top-products'),
      ]);
      setChartData(chartRes.data.data);
      setTopProducts(topRes.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-sm text-text-secondary">You do not have access to this page.</p>
      </div>
    );
  }

  // Build chart datasets
  const allRevenueData = (chartData?.revenueByMonth ?? []).map((item) => ({
    name: `${MONTH_NAMES[parseInt(item.month) - 1]} ${item.year}`,
    revenue: item.revenue,
  }));
  const revenueData = allRevenueData.slice(-revenueRange);

  const statusData = (chartData?.ordersByStatus ?? []).map((item, i) => ({
    name: item.status,
    value: item.count,
    index: i,
  }));

  const categoryData = (chartData?.topCategories ?? []).map((item) => ({
    name: item.category,
    count: item.count,
  }));

  // Summary stats from revenue data
  const totalRevenue = allRevenueData.reduce((s, d) => s + d.revenue, 0);
  const avgMonthly = allRevenueData.length > 0 ? totalRevenue / allRevenueData.length : 0;
  const peakMonth = allRevenueData.reduce((a, b) => (b.revenue > a.revenue ? b : a), allRevenueData[0] ?? { name: '—', revenue: 0 });

  return (
    <motion.div variants={CONTAINER_VARIANTS} initial="hidden" animate="show" className="space-y-6">

      {/* Page Header */}
      <motion.div variants={ITEM_VARIANTS} className="relative border border-border bg-bg overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-primary-accent" />
        <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />
        <div
          className="absolute -top-10 -right-10 h-40 w-40 pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
        />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 border border-border bg-bg-card flex items-center justify-center shrink-0">
              <BarChart2 className="h-5 w-5 text-primary-accent" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Analytics</h1>
              <p className="text-xs text-text-secondary mt-0.5">Store performance and insights</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary KPI Row */}
      {!loading && (
        <motion.div variants={ITEM_VARIANTS} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue (12m)', value: formatPrice(totalRevenue), icon: <TrendingUp className="h-4 w-4 text-success" />, accent: 'bg-success' },
            { label: 'Avg Monthly Revenue', value: formatPrice(avgMonthly), icon: <BarChart2 className="h-4 w-4 text-primary-accent" />, accent: 'bg-primary-accent' },
            { label: 'Peak Month', value: peakMonth.name, sub: formatPrice(peakMonth.revenue), icon: <Zap className="h-4 w-4 text-secondary" />, accent: 'bg-secondary' },
          ].map((kpi) => (
            <div key={kpi.label} className="relative border border-border bg-bg overflow-hidden">
              <div className={`absolute top-0 inset-x-0 h-0.5 ${kpi.accent}`} />
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{kpi.label}</p>
                  <p className="text-lg font-extrabold text-text-primary mt-1 tracking-tight">{kpi.value}</p>
                  {'sub' in kpi && kpi.sub && (
                    <p className="text-xs text-text-secondary mt-0.5">{kpi.sub}</p>
                  )}
                </div>
                <div className="h-8 w-8 border border-border bg-bg-card flex items-center justify-center shrink-0">
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border">
                <div className="px-5 py-4 border-b border-border bg-bg-card flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-72 w-full" />
                </div>
              </div>
            ))}
            <div className="border border-border lg:col-span-2">
              <div className="px-5 py-4 border-b border-border bg-bg-card">
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="p-5">
                <Skeleton className="h-72 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Revenue Line Chart ── */}
            <ChartCard
              id="chart-revenue"
              title="Revenue Over Time"
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              exportFilename="nexcart-revenue"
              headerRight={
                <RangeTabs value={revenueRange} onChange={setRevenueRange} />
              }
            >
              {revenueData.length === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-sm text-text-secondary">No revenue data for this range.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart data={revenueData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip content={<CustomRevenueTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: 'var(--bg)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* ── Orders Pie Chart ── */}
            <ChartCard
              id="chart-orders-status"
              title="Orders by Status"
              icon={<PieIcon className="h-3.5 w-3.5" />}
              exportFilename="nexcart-orders-status"
            >
              {statusData.length === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-sm text-text-secondary">No order data yet.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={96}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Styled legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 border-t border-border pt-4">
                    {statusData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* ── Top Categories Bar Chart (full width) ── */}
          <ChartCard
            id="chart-categories"
            title="Top Categories by Units Sold"
            icon={<BarChart2 className="h-3.5 w-3.5" />}
            exportFilename="nexcart-categories"
          >
            {categoryData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-sm text-text-secondary">No category data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" radius={0}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {/* Value labels on top of bars */}
                    <LabelList
                      dataKey="count"
                      position="top"
                      style={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-secondary)' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Top 5 Products by Revenue ── */}
          <motion.div variants={ITEM_VARIANTS} className="border border-border bg-bg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg-card">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 border border-border bg-bg flex items-center justify-center">
                  <Trophy className="h-3.5 w-3.5 text-secondary" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
                  Top 5 Products by Revenue
                </h3>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 border border-border bg-bg-card flex items-center justify-center mb-3">
                  <Package className="h-5 w-5 text-border" />
                </div>
                <p className="text-sm text-text-secondary">No sales data yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary w-8">
                        #
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                        Product
                      </th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                        Units Sold
                      </th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                        Revenue
                      </th>
                      <th className="px-5 py-3 w-28"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => {
                      const maxRevenue = topProducts[0]?.totalRevenue ?? 1;
                      const barWidth = Math.max((product.totalRevenue / maxRevenue) * 100, 4);
                      const rankColors = ['text-secondary', 'text-text-secondary', 'text-text-secondary/60'];

                      return (
                        <tr
                          key={product.productId}
                          className={`border-b border-border last:border-b-0 transition-colors ${
                            i % 2 === 0 ? 'bg-bg hover:bg-bg-card/60' : 'bg-bg-card/30 hover:bg-bg-card/60'
                          }`}
                        >
                          {/* Rank */}
                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-extrabold ${rankColors[Math.min(i, 2)]}`}>
                              {i + 1}
                            </span>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative h-9 w-9 border border-border bg-bg-card overflow-hidden shrink-0">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    sizes="36px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-border" />
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug max-w-[180px]">
                                {product.title}
                              </span>
                            </div>
                          </td>

                          {/* Units */}
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-xs font-bold text-text-primary tabular-nums">
                              {product.totalQty.toLocaleString()}
                            </span>
                          </td>

                          {/* Revenue */}
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-xs font-extrabold text-primary-accent tabular-nums">
                              {formatPrice(product.totalRevenue)}
                            </span>
                          </td>

                          {/* Revenue bar */}
                          <td className="px-5 py-3.5">
                            <div className="h-1.5 w-full bg-border overflow-hidden">
                              <div
                                className="h-full bg-primary-accent transition-all duration-700"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
