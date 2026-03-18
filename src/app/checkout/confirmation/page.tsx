'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Loader2,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { IOrder } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary">Order not found</h2>
          <p className="mt-2 text-sm text-text-secondary">
            We couldn&apos;t find this order. Please check your order history.
          </p>
          <Link href="/dashboard/orders">
            <Button className="mt-6">View My Orders</Button>
          </Link>
        </div>
      </main>
    );
  }

  const paymentMethodLabel: Record<string, string> = {
    COD: 'Cash on Delivery',
    CARD: 'Credit/Debit Card',
    BKASH: 'bKash',
    NAGAD: 'Nagad',
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Order Placed Successfully!</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Thank you for your order. Your order number is{' '}
            <span className="font-semibold text-text-primary">{orderNumber || order.orderNumber}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="border border-border">
          {/* Order Info Header */}
          <div className="p-6 border-b border-border bg-bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-text-secondary">Order Number</p>
                <p className="text-lg font-semibold text-text-primary">{order.orderNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-text-secondary">Order Date</p>
                <p className="text-sm text-text-primary">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant={order.orderStatus === 'PENDING' ? 'warning' : 'default'}>
                {order.orderStatus}
              </Badge>
              <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 border border-border bg-bg-card flex items-center justify-center">
                    <span className="text-lg font-bold text-text-secondary/10">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{item.title}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping + Payment Info */}
          <div className="p-6 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-text-secondary" />
                <h3 className="text-sm font-semibold text-text-primary">Shipping Address</h3>
              </div>
              <div className="text-sm text-text-secondary space-y-0.5">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-text-secondary" />
                <h3 className="text-sm font-semibold text-text-primary">Payment</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Order Totals */}
          <div className="p-6">
            <div className="space-y-2 text-sm">
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
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-text-primary font-semibold">Total</span>
                <span className="text-text-primary font-bold text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="mt-6 border border-border p-4 flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary-accent shrink-0" />
          <p className="text-sm text-text-secondary">
            Estimated delivery: <span className="font-medium text-text-primary">3-7 business days</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/orders">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Package className="mr-2 h-4 w-4" />
              View My Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full sm:w-auto">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
          </main>
        }
      >
        <OrderConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
