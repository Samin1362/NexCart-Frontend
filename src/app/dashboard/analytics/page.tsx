'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { ChartData } from '@/types';
import { formatPrice } from '@/lib/utils';

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#8B5CF6', '#EC4899'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data } = await api.get('/dashboard/chart-data');
        setChartData(data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="mt-2 text-text-secondary">You do not have access to this page.</p>
      </div>
    );
  }

  const revenueData = chartData?.revenueByMonth.map((item) => ({
    name: `${monthNames[parseInt(item.month) - 1]} ${item.year}`,
    revenue: item.revenue,
  })) || [];

  const statusData = chartData?.ordersByStatus.map((item) => ({
    name: item.status,
    value: item.count,
  })) || [];

  const categoryData = chartData?.topCategories.map((item) => ({
    name: item.category,
    count: item.count,
  })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
      <p className="mt-1 text-sm text-text-secondary">Store performance and insights.</p>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full lg:col-span-2" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="border border-border p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue (Last 12 Months)</h3>
              {revenueData.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-12">No revenue data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value) => [formatPrice(Number(value)), 'Revenue']}
                      contentStyle={{
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg)',
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Orders by Status Pie Chart */}
            <div className="border border-border p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Orders by Status</h3>
              {statusData.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-12">No order data yet.</p>
              ) : (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {statusData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg)',
                          borderRadius: 0,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* Legend */}
              {statusData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {statusData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <div className="h-2.5 w-2.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Categories Bar Chart */}
          <div className="border border-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Top Categories</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-12">No category data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
