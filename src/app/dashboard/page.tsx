'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  ArrowRight,
  Package,
  Users,
  CheckCircle,
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Sun,
  Sunset,
  Moon,
  Zap,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { IOrder, OrderStatus, DashboardStats } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number;
  displayValue: string;
  icon: React.ReactNode;
  accentColor: string;
  trend: 'up' | 'down' | 'neutral';
  trendLabel: string;
  isCurrency?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<OrderStatus, 'warning' | 'secondary' | 'default' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'secondary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const CONTAINER_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): { text: string; Icon: React.ElementType } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', Icon: Sun };
  if (hour >= 12 && hour < 18) return { text: 'Good afternoon', Icon: Sunset };
  return { text: 'Good evening', Icon: Moon };
}

// ─── Count-Up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, enabled = true): number {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target === 0) { setCount(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [target, duration, enabled]);

  return count;
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCardItem({ card, index }: { card: StatCard; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const animated = useCountUp(card.value, 800 + index * 60, visible);
  const displayAnimated = card.isCurrency
    ? formatPrice(animated)
    : animated.toLocaleString();

  return (
    <motion.div
      ref={ref}
      variants={ITEM_VARIANTS}
      className="relative bg-bg border border-border overflow-hidden group hover:border-border/60 transition-colors"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${card.accentColor}`} />

      {/* Subtle dot-grid background */}
      <div className="absolute inset-0 dot-grid opacity-[0.025] pointer-events-none" />

      <div className="relative p-5">
        {/* Label + icon row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            {card.label}
          </span>
          <div className="h-9 w-9 border border-border bg-bg-card flex items-center justify-center group-hover:border-border/60 transition-colors">
            {card.icon}
          </div>
        </div>

        {/* Value */}
        <p className="text-2xl font-extrabold text-text-primary tracking-tight tabular-nums">
          {visible ? displayAnimated : '—'}
        </p>

        {/* Trend */}
        <div className="mt-2 flex items-center gap-1.5">
          {card.trend === 'up' && (
            <TrendingUp className="h-3 w-3 text-success shrink-0" />
          )}
          {card.trend === 'down' && (
            <TrendingDown className="h-3 w-3 text-error shrink-0" />
          )}
          {card.trend === 'neutral' && (
            <div className="h-0.5 w-3 bg-text-secondary/40 shrink-0" />
          )}
          <span
            className={`text-[10px] font-semibold ${
              card.trend === 'up'
                ? 'text-success'
                : card.trend === 'down'
                ? 'text-error'
                : 'text-text-secondary/60'
            }`}
          >
            {card.trendLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Low Stock Alert ──────────────────────────────────────────────────────────

function LowStockAlert({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <motion.div variants={ITEM_VARIANTS} className="flex items-center gap-3 border border-warning/40 bg-warning/5 px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
      <p className="text-sm text-text-primary flex-1">
        <span className="font-bold text-warning">{count} product{count !== 1 ? 's' : ''}</span>
        {' '}have stock below 10 units.
      </p>
      <Link
        href="/dashboard/products"
        className="text-xs font-bold text-warning hover:underline shrink-0 inline-flex items-center gap-1"
      >
        Manage <ArrowRight className="h-3 w-3" />
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardOverview() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalOrders: 0, pendingOrders: 0, totalSpent: 0 });
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [recentAdminOrders, setRecentAdminOrders] = useState<IOrder[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');

  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const requests: Promise<unknown>[] = [
            api.get('/dashboard/stats'),
            api.get('/dashboard/recent-orders'),
            api.get('/products?stock_lt=10&limit=100'),
          ];
          const [statsRes, ordersRes, lowStockRes] = await Promise.all(requests) as [
            { data: { data: DashboardStats } },
            { data: { data: IOrder[] } },
            { data: { meta: { total: number } } },
          ];
          setAdminStats(statsRes.data.data);
          setRecentAdminOrders(ordersRes.data.data || []);
          setLowStockCount(lowStockRes.data.meta?.total ?? 0);
        } else {
          const { data } = await api.get('/orders?limit=5');
          setOrders(data.data || []);
          const { data: allData } = await api.get('/orders?limit=999');
          const all: IOrder[] = allData.data || [];
          setUserStats({
            totalOrders: allData.meta?.total || all.length,
            pendingOrders: all.filter((o) => o.orderStatus === 'PENDING').length,
            totalSpent: all
              .filter((o) => o.orderStatus !== 'CANCELLED')
              .reduce((sum, o) => sum + o.totalAmount, 0),
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  // Build stat cards
  const statCards: StatCard[] = useMemo(() => {
    if (isAdmin && adminStats) {
      const deliveryRate = adminStats.totalOrders > 0
        ? Math.round((adminStats.deliveredOrders / adminStats.totalOrders) * 100)
        : 0;
      return [
        {
          label: 'Total Users',
          value: adminStats.totalUsers,
          displayValue: adminStats.totalUsers.toString(),
          icon: <Users className="h-4 w-4 text-primary-accent" />,
          accentColor: 'bg-primary-accent',
          trend: 'up',
          trendLabel: 'All registered users',
        },
        {
          label: 'Total Products',
          value: adminStats.totalProducts,
          displayValue: adminStats.totalProducts.toString(),
          icon: <Package className="h-4 w-4 text-secondary" />,
          accentColor: 'bg-secondary',
          trend: 'neutral',
          trendLabel: 'Active in catalogue',
        },
        {
          label: 'Total Orders',
          value: adminStats.totalOrders,
          displayValue: adminStats.totalOrders.toString(),
          icon: <ShoppingBag className="h-4 w-4 text-warning" />,
          accentColor: 'bg-warning',
          trend: adminStats.pendingOrders > 0 ? 'down' : 'up',
          trendLabel: `${adminStats.pendingOrders} pending`,
        },
        {
          label: 'Total Revenue',
          value: adminStats.totalRevenue,
          displayValue: formatPrice(adminStats.totalRevenue),
          icon: <DollarSign className="h-4 w-4 text-success" />,
          accentColor: 'bg-success',
          trend: 'up',
          trendLabel: 'Gross revenue',
          isCurrency: true,
        },
        {
          label: 'Pending Orders',
          value: adminStats.pendingOrders,
          displayValue: adminStats.pendingOrders.toString(),
          icon: <Clock className="h-4 w-4 text-error" />,
          accentColor: 'bg-error',
          trend: adminStats.pendingOrders > 0 ? 'down' : 'neutral',
          trendLabel: 'Requires attention',
        },
        {
          label: 'Delivered Orders',
          value: adminStats.deliveredOrders,
          displayValue: adminStats.deliveredOrders.toString(),
          icon: <CheckCircle className="h-4 w-4 text-success" />,
          accentColor: 'bg-success',
          trend: 'up',
          trendLabel: `${deliveryRate}% delivery rate`,
        },
      ];
    }
    return [
      {
        label: 'Total Orders',
        value: userStats.totalOrders,
        displayValue: userStats.totalOrders.toString(),
        icon: <ShoppingBag className="h-4 w-4 text-primary-accent" />,
        accentColor: 'bg-primary-accent',
        trend: userStats.totalOrders > 0 ? 'up' : 'neutral',
        trendLabel: 'All time',
      },
      {
        label: 'Pending Orders',
        value: userStats.pendingOrders,
        displayValue: userStats.pendingOrders.toString(),
        icon: <Clock className="h-4 w-4 text-warning" />,
        accentColor: 'bg-warning',
        trend: userStats.pendingOrders > 0 ? 'down' : 'neutral',
        trendLabel: userStats.pendingOrders > 0 ? 'Awaiting dispatch' : 'All caught up',
      },
      {
        label: 'Total Spent',
        value: userStats.totalSpent,
        displayValue: formatPrice(userStats.totalSpent),
        icon: <DollarSign className="h-4 w-4 text-success" />,
        accentColor: 'bg-success',
        trend: userStats.totalSpent > 0 ? 'up' : 'neutral',
        trendLabel: 'Lifetime value',
        isCurrency: true,
      },
    ];
  }, [isAdmin, adminStats, userStats]);

  // Client-side order search (admin)
  const displayOrders = useMemo(() => {
    const base = isAdmin ? recentAdminOrders : orders;
    if (!orderSearch.trim()) return base;
    const q = orderSearch.trim().toLowerCase();
    return base.filter((o) => {
      const customer = typeof o.userId === 'object' ? o.userId : null;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (customer && customer.name.toLowerCase().includes(q))
      );
    });
  }, [isAdmin, recentAdminOrders, orders, orderSearch]);

  const viewAllLink = isAdmin ? '/dashboard/manage-orders' : '/dashboard/orders';
  const pendingCount = isAdmin
    ? adminStats?.pendingOrders ?? 0
    : userStats.pendingOrders;

  return (
    <motion.div
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Welcome Banner ── */}
      <motion.div
        variants={ITEM_VARIANTS}
        className="relative border border-border bg-bg overflow-hidden"
      >
        {/* Accent top line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-primary-accent" />
        {/* Background dot grid */}
        <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />
        {/* Blue glow top-right */}
        <div
          className="absolute -top-10 -right-10 h-40 w-40 pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 border border-border bg-bg-card flex items-center justify-center shrink-0">
              <GreetingIcon className="h-5 w-5 text-primary-accent" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text-primary tracking-tight">
                {greeting},{' '}
                <span className="text-primary-accent">{user?.name?.split(' ')[0]}</span>!
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {isAdmin
                  ? pendingCount > 0
                    ? `You have ${pendingCount} pending order${pendingCount !== 1 ? 's' : ''} that need attention.`
                    : 'All orders are up to date. Great job!'
                  : pendingCount > 0
                  ? `You have ${pendingCount} pending order${pendingCount !== 1 ? 's' : ''} in progress.`
                  : "Here's a summary of your activity."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 border border-warning/40 bg-warning/5 px-3 py-1.5 text-xs font-semibold text-warning">
                <Clock className="h-3.5 w-3.5" />
                {pendingCount} Pending
              </div>
            )}
            {isAdmin && (
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-2 border border-border bg-bg-card px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary-accent hover:border-primary-accent transition-colors"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Analytics
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Low Stock Alert (admin only) ── */}
      {isAdmin && !loading && lowStockCount > 0 && (
        <LowStockAlert count={lowStockCount} />
      )}

      {/* ── Stat Cards ── */}
      <div>
        <motion.div variants={ITEM_VARIANTS} className="flex items-center gap-2 mb-4">
          <Zap className="h-3.5 w-3.5 text-text-secondary/50" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/70">
            {isAdmin ? 'Store Overview' : 'Your Activity'}
          </h2>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-4`}>
            {[1, 2, 3, ...(isAdmin ? [4, 5, 6] : [])].map((i) => (
              <div key={i} className="border border-border bg-bg p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-9" />
                </div>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-28 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-4`}>
            {statCards.map((card, i) => (
              <StatCardItem key={card.label} card={card} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div>
        <motion.div variants={ITEM_VARIANTS} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5 text-text-secondary/50" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/70">
              {isAdmin ? 'Recent Orders' : 'Order History'}
            </h2>
            <div className="h-px w-8 bg-border" />
          </div>
          <Link
            href={viewAllLink}
            className="text-xs font-semibold text-primary-accent hover:underline inline-flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Admin: search box */}
        {isAdmin && !loading && recentAdminOrders.length > 0 && (
          <motion.div variants={ITEM_VARIANTS} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary/50 pointer-events-none" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order number or customer…"
                className="w-full sm:w-80 border border-border bg-bg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-accent"
              />
            </div>
          </motion.div>
        )}

        {loading ? (
          <motion.div variants={ITEM_VARIANTS} className="border border-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-b-0">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </motion.div>
        ) : displayOrders.length === 0 ? (
          <motion.div variants={ITEM_VARIANTS} className="border border-border py-12 text-center bg-bg">
            <div className="mx-auto h-14 w-14 border border-border bg-bg-card flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-border" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {orderSearch ? 'No orders match your search' : 'No orders yet'}
            </p>
            {orderSearch && (
              <button
                onClick={() => setOrderSearch('')}
                className="mt-2 text-xs text-primary-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div variants={ITEM_VARIANTS} className="border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-border bg-bg-card">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Order #
                  </th>
                  {isAdmin && (
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                      Customer
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order, i) => {
                  const customer = typeof order.userId === 'object' ? order.userId : null;
                  // Highlight search match
                  const q = orderSearch.trim().toLowerCase();
                  const isMatch =
                    q &&
                    (order.orderNumber.toLowerCase().includes(q) ||
                      (customer && customer.name.toLowerCase().includes(q)));

                  return (
                    <tr
                      key={order._id}
                      className={`border-b border-border last:border-b-0 transition-colors ${
                        isMatch
                          ? 'bg-primary-accent/5'
                          : i % 2 === 0
                          ? 'bg-bg hover:bg-bg-card/60'
                          : 'bg-bg-card/30 hover:bg-bg-card/60'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-text-primary text-xs tracking-wide">
                        {order.orderNumber}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3.5 text-text-secondary text-xs">
                          {customer ? customer.name : '—'}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-text-secondary text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary text-xs">
                        {order.items.length}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-text-primary text-xs">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={STATUS_VARIANT[order.orderStatus]}>
                          {order.orderStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
