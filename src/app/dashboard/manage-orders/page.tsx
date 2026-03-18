'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  X,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import api from '@/lib/api';
import { IOrder, IUser, OrderStatus, PaginationMeta } from '@/types';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'secondary' | 'default' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'secondary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const paymentMethodLabel: Record<string, string> = {
  COD: 'Cash on Delivery',
  CARD: 'Credit/Debit Card',
  BKASH: 'bKash',
  NAGAD: 'Nagad',
};

const statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const validTransitions: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status update
  const [showStatusModal, setShowStatusModal] = useState<{ orderId: string; currentStatus: OrderStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const { data } = await api.get(`/orders/all?${params.toString()}`);
      setOrders(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, startDate, endDate]);

  const handleUpdateStatus = async () => {
    if (!showStatusModal || !newStatus) return;
    setUpdatingStatus(true);
    setMessage(null);
    try {
      await api.patch(`/orders/${showStatusModal.orderId}/status`, { orderStatus: newStatus });
      setShowStatusModal(null);
      setNewStatus('');
      setMessage({ type: 'success', text: 'Order status updated successfully!' });
      fetchOrders();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update status.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusModal = (orderId: string, currentStatus: OrderStatus) => {
    setShowStatusModal({ orderId, currentStatus });
    setNewStatus('');
    setMessage(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Manage Orders</h1>
      <p className="mt-1 text-sm text-text-secondary">View and manage all customer orders.</p>

      {message && (
        <div className={`mt-4 border p-3 text-sm ${message.type === 'success' ? 'border-success bg-success/5 text-success' : 'border-error bg-error/5 text-error'}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 border border-border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none min-w-[160px]"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-11 border border-border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-11 border border-border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
          placeholder="End date"
        />
      </div>

      {/* Orders */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <ClipboardList className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No orders found</h2>
          <p className="mt-1 text-sm text-text-secondary">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => {
            const customer = typeof order.userId === 'object' ? (order.userId as IUser) : null;
            const transitions = validTransitions[order.orderStatus] || [];

            return (
              <div key={order._id} className="border border-border">
                {/* Order Row */}
                <button
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-bg-card/50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
                    <div>
                      <p className="text-xs text-text-secondary">Order #</p>
                      <p className="text-sm font-medium text-text-primary">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Customer</p>
                      <p className="text-sm text-text-primary">{customer?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Date</p>
                      <p className="text-sm text-text-primary">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Total</p>
                      <p className="text-sm font-medium text-text-primary">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div>
                      <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'REFUNDED' ? 'error' : 'warning'}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={statusBadgeVariant[order.orderStatus]}>{order.orderStatus}</Badge>
                    </div>
                  </div>
                  {expandedId === order._id ? (
                    <ChevronUp className="h-4 w-4 text-text-secondary shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-text-secondary shrink-0" />
                  )}
                </button>

                {/* Expanded */}
                {expandedId === order._id && (
                  <div className="border-t border-border p-4 bg-bg-card/30 space-y-6">
                    {/* Customer Info */}
                    {customer && (
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-1">Customer</h4>
                        <p className="text-sm text-text-secondary">{customer.name} — {customer.email}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 border border-border bg-bg-card flex items-center justify-center">
                              <span className="text-xs font-bold text-text-secondary/10">{item.title.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text-primary truncate">{item.title}</p>
                              <p className="text-xs text-text-secondary">{formatPrice(item.price)} x {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-text-primary">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping + Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                          <h4 className="text-sm font-semibold text-text-primary">Shipping</h4>
                        </div>
                        <div className="text-sm text-text-secondary space-y-0.5">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-text-secondary" />
                          <h4 className="text-sm font-semibold text-text-primary">Payment</h4>
                        </div>
                        <p className="text-sm text-text-secondary">{paymentMethodLabel[order.paymentMethod] || order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-border pt-4">
                      <div className="max-w-xs ml-auto space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span className="text-text-primary">{formatPrice(order.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span className="text-text-primary">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
                        <div className="flex justify-between"><span className="text-text-secondary">Tax</span><span className="text-text-primary">{formatPrice(order.tax)}</span></div>
                        <div className="flex justify-between font-semibold border-t border-border pt-1"><span className="text-text-primary">Total</span><span className="text-text-primary">{formatPrice(order.totalAmount)}</span></div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className="h-2 w-2 bg-success shrink-0" />
                        Order placed — {formatDateTime(order.createdAt)}
                      </div>
                      {order.deliveredAt && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                          <div className="h-2 w-2 bg-success shrink-0" />
                          Delivered — {formatDateTime(order.deliveredAt)}
                        </div>
                      )}
                    </div>

                    {/* Update Status */}
                    {transitions.length > 0 && (
                      <div className="border-t border-border pt-4">
                        <Button size="sm" onClick={() => openStatusModal(order._id, order.orderStatus)}>
                          Update Status
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {meta && meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowStatusModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Update Order Status</h3>
                <button onClick={() => setShowStatusModal(null)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                Current status: <Badge variant={statusBadgeVariant[showStatusModal.currentStatus]}>{showStatusModal.currentStatus}</Badge>
              </p>
              <div className="mt-4">
                <label className="text-sm font-medium text-text-primary mb-1.5 block">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="h-11 w-full border border-border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
                >
                  <option value="">Select status</option>
                  {(validTransitions[showStatusModal.currentStatus] || []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="secondary" size="sm" onClick={() => setShowStatusModal(null)}>Cancel</Button>
                <Button size="sm" loading={updatingStatus} disabled={!newStatus} onClick={handleUpdateStatus}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
