'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  ArrowRight,
  Package,
  Users,
  CheckCircle,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { IOrder, OrderStatus, DashboardStats } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'secondary' | 'default' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'secondary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // User stats
  const [userStats, setUserStats] = useState({ totalOrders: 0, pendingOrders: 0, totalSpent: 0 });
  // Admin stats
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [recentAdminOrders, setRecentAdminOrders] = useState<IOrder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [statsRes, ordersRes] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/recent-orders'),
          ]);
          setAdminStats(statsRes.data.data);
          setRecentAdminOrders(ordersRes.data.data || []);
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
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const userStatCards = [
    { label: 'Total Orders', value: userStats.totalOrders.toString(), icon: <ShoppingBag className="h-5 w-5 text-primary-accent" /> },
    { label: 'Pending Orders', value: userStats.pendingOrders.toString(), icon: <Clock className="h-5 w-5 text-warning" /> },
    { label: 'Total Spent', value: formatPrice(userStats.totalSpent), icon: <DollarSign className="h-5 w-5 text-success" /> },
  ];

  const adminStatCards = adminStats
    ? [
        { label: 'Total Users', value: adminStats.totalUsers.toString(), icon: <Users className="h-5 w-5 text-primary-accent" /> },
        { label: 'Total Products', value: adminStats.totalProducts.toString(), icon: <Package className="h-5 w-5 text-secondary" /> },
        { label: 'Total Orders', value: adminStats.totalOrders.toString(), icon: <ShoppingBag className="h-5 w-5 text-warning" /> },
        { label: 'Total Revenue', value: formatPrice(adminStats.totalRevenue), icon: <DollarSign className="h-5 w-5 text-success" /> },
        { label: 'Pending Orders', value: adminStats.pendingOrders.toString(), icon: <Clock className="h-5 w-5 text-error" /> },
        { label: 'Delivered Orders', value: adminStats.deliveredOrders.toString(), icon: <CheckCircle className="h-5 w-5 text-success" /> },
      ]
    : [];

  const statCards = isAdmin ? adminStatCards : userStatCards;
  const displayOrders = isAdmin ? recentAdminOrders : orders;
  const viewAllLink = isAdmin ? '/dashboard/manage-orders' : '/dashboard/orders';

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">
        Welcome back, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {isAdmin ? 'Here is an overview of your store.' : 'Here is a summary of your activity.'}
      </p>

      {/* Stat Cards */}
      <div className={`mt-6 grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-4`}>
        {loading
          ? [1, 2, 3, ...(isAdmin ? [4, 5, 6] : [])].map((i) => (
              <div key={i} className="border border-border bg-bg-card p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          : statCards.map((card) => (
              <div key={card.label} className="border border-border bg-bg-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary">{card.label}</span>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-text-primary">{card.value}</p>
              </div>
            ))}
      </div>

      {/* Charts Link for Admin */}
      {isAdmin && !loading && (
        <div className="mt-4">
          <Link
            href="/dashboard/analytics"
            className="text-sm text-primary-accent hover:underline inline-flex items-center gap-1"
          >
            View Analytics & Charts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {isAdmin ? 'Recent Orders (Last 10)' : 'Recent Orders'}
          </h2>
          <Link
            href={viewAllLink}
            className="text-sm text-primary-accent hover:underline inline-flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="border border-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="border border-border p-8 text-center">
            <Package className="h-10 w-10 text-text-secondary/30 mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No orders yet.</p>
          </div>
        ) : (
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-card">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Order #</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium text-text-secondary">Customer</th>}
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Items</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order) => {
                  const customer = typeof order.userId === 'object' ? order.userId : null;
                  return (
                    <tr key={order._id} className="border-b border-border last:border-b-0 hover:bg-bg-card/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{order.orderNumber}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-text-secondary">
                          {customer ? customer.name : '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-text-secondary">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-text-secondary">{order.items.length}</td>
                      <td className="px-4 py-3 text-text-primary font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant[order.orderStatus]}>{order.orderStatus}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
