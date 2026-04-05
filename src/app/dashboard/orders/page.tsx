'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  X,
  CheckCircle,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import api from '@/lib/api';
import { IOrder, OrderStatus, PaginationMeta } from '@/types';
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

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';
    const orderNumber = searchParams.get('orderNumber');
    if (isSuccess && orderNumber) {
      setSuccessBanner(orderNumber);
      router.replace('/dashboard/orders');
    }
  }, [searchParams, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`, {
        cancelReason: cancelReason.trim() || undefined,
      });
      setShowCancelModal(null);
      setCancelReason('');
      fetchOrders();
    } catch {
      // error
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedId(expandedId === orderId ? null : orderId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
      <p className="mt-1 text-sm text-text-secondary">View and manage your order history.</p>

      {successBanner && (
        <div className="mt-4 flex items-start gap-3 border border-green-500 bg-green-50 dark:bg-green-950/30 p-4">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Order placed successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Your order <span className="font-mono font-medium">#{successBanner}</span> has been confirmed and is now being processed.
            </p>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No orders yet</h2>
          <p className="mt-1 text-sm text-text-secondary">
            When you place orders, they will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="border border-border">
              {/* Order Row */}
              <button
                onClick={() => toggleExpand(order._id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-bg-card/50 transition-colors cursor-pointer text-left"
              >
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                  <div>
                    <p className="text-xs text-text-secondary">Order #</p>
                    <p className="text-sm font-medium text-text-primary">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Date</p>
                    <p className="text-sm text-text-primary">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Items</p>
                    <p className="text-sm text-text-primary">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Total</p>
                    <p className="text-sm font-medium text-text-primary">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <Badge variant={statusBadgeVariant[order.orderStatus]}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
                {expandedId === order._id ? (
                  <ChevronUp className="h-4 w-4 text-text-secondary shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-secondary shrink-0" />
                )}
              </button>

              {/* Expanded Details */}
              {expandedId === order._id && (
                <div className="border-t border-border p-4 bg-bg-card/30 space-y-6">
                  {/* Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 border border-border bg-bg-card flex items-center justify-center">
                            <span className="text-sm font-bold text-text-secondary/10">
                              {item.title.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{item.title}</p>
                            <p className="text-xs text-text-secondary">
                              {formatPrice(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping + Payment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                        <h4 className="text-sm font-semibold text-text-primary">Shipping Address</h4>
                      </div>
                      <div className="text-sm text-text-secondary space-y-0.5">
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-text-secondary" />
                        <h4 className="text-sm font-semibold text-text-primary">Payment</h4>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
                      </p>
                      <Badge
                        variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'REFUNDED' ? 'error' : 'warning'}
                        className="mt-1"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-border pt-4">
                    <div className="max-w-xs ml-auto space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Shipping</span>
                        <span className="text-text-primary">
                          {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Tax</span>
                        <span className="text-text-primary">{formatPrice(order.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-border pt-1">
                        <span className="text-text-primary">Total</span>
                        <span className="text-text-primary">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-success shrink-0" />
                        <span className="text-text-secondary">
                          Order placed — {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      {order.deliveredAt && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-success shrink-0" />
                          <span className="text-text-secondary">
                            Delivered — {formatDateTime(order.deliveredAt)}
                          </span>
                        </div>
                      )}
                      {order.orderStatus === 'CANCELLED' && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-error shrink-0" />
                          <span className="text-text-secondary">
                            Cancelled{order.cancelReason ? ` — ${order.cancelReason}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {order.orderStatus === 'PENDING' && (
                    <div className="border-t border-border pt-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowCancelModal(order._id)}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCancelModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Cancel Order</h3>
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                rows={3}
                className="w-full border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowCancelModal(null)}>
                  Keep Order
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancellingId === showCancelModal}
                  onClick={() => handleCancelOrder(showCancelModal)}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
