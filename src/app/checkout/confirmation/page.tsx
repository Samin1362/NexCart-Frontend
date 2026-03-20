'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Loader2,
  Truck,
  MapPin,
  CreditCard,
  Printer,
  Star,
  ShoppingCart,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { IOrder, IProduct } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  CARD: 'Credit / Debit Card',
  BKASH: 'bKash',
  NAGAD: 'Nagad',
};

const DELIVERY_DAYS: Record<string, [number, number]> = {
  COD: [7, 10],
  CARD: [5, 7],
  BKASH: [5, 7],
  NAGAD: [5, 7],
};

const CONFETTI_COLORS = [
  '#2563EB', // primary-accent blue
  '#F59E0B', // secondary amber
  '#16A34A', // success green
  '#7C3AED', // purple
  '#EC4899', // pink
  '#0EA5E9', // sky
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeliveryRange(paymentMethod: string, orderDate: string): string {
  const [min, max] = DELIVERY_DAYS[paymentMethod] ?? [5, 7];
  const base = new Date(orderDate);
  const start = new Date(base);
  start.setDate(base.getDate() + min);
  const end = new Date(base);
  end.setDate(base.getDate() + max);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Confetti ────────────────────────────────────────────────────────────────

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  y: number;
  rotate: number;
  size: number;
  isRect: boolean;
}

function generateConfetti(count = 48): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: (Math.random() - 0.5) * 700,
    y: -(Math.random() * 500 + 100),
    rotate: Math.random() * 720 - 360,
    size: Math.random() * 8 + 5,
    isRect: Math.random() > 0.5,
  }));
}

function Confetti({ active }: { active: boolean }) {
  const pieces = useRef(generateConfetti()).current;

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x,
                y: p.y,
                rotate: p.rotate,
                scale: [1, 1.2, 0.8],
              }}
              transition={{
                duration: 1.4 + Math.random() * 0.6,
                ease: [0.22, 0.61, 0.36, 1],
                delay: Math.random() * 0.3,
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.isRect ? p.size * 0.5 : p.size,
                backgroundColor: p.color,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Suggested Product Card ───────────────────────────────────────────────────

function SuggestedCard({ product }: { product: IProduct }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = !imgError && product.images?.[0] ? product.images[0] : null;
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group border border-border bg-bg hover:border-primary-accent transition-all duration-200 hover:-translate-y-[2px] flex flex-col"
    >
      {/* Image */}
      <div className="relative h-36 bg-bg-card overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-8 w-8 text-border" />
          </div>
        )}
        {product.discountPrice > 0 && (
          <div className="absolute top-2 left-2 bg-error text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wide">
            SALE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-primary-accent transition-colors">
          {product.title}
        </p>
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span className="text-[10px] text-text-secondary">{product.rating.toFixed(1)}</span>
          </div>
        )}
        <p className="text-sm font-bold text-text-primary mt-auto">{formatPrice(displayPrice)}</p>
      </div>
    </Link>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data);
        // Fire confetti after a brief delay so the page has rendered
        setTimeout(() => setConfettiActive(true), 200);
        setTimeout(() => setConfettiActive(false), 2500);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fetch suggested products
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const { data } = await api.get('/products?limit=4&isFeatured=true');
        setSuggestedProducts(data.data || []);
      } catch {
        // silent
      }
    };
    fetchSuggested();
  }, []);

  const handlePrint = () => window.print();

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
          <div className="mx-auto mb-6 h-20 w-20 border border-border bg-bg-card flex items-center justify-center">
            <Package className="h-9 w-9 text-border" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Order not found</h2>
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

  const deliveryRange = getDeliveryRange(order.paymentMethod, order.createdAt);

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; inset: 0; padding: 2rem; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Confetti active={confettiActive} />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Success Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            className="text-center mb-10"
          >
            {/* Animated check circle */}
            <div className="relative inline-flex mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="h-20 w-20 bg-success/10 border-2 border-success flex items-center justify-center"
              >
                <CheckCircle className="h-10 w-10 text-success" strokeWidth={1.5} />
              </motion.div>
              {/* Pulse ring */}
              <span className="absolute inset-0 border-2 border-success animate-ping-soft opacity-40" />
            </div>

            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Thank you for your purchase. Your order number is{' '}
              <span className="font-bold text-text-primary">
                {orderNumber || order.orderNumber}
              </span>
            </p>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="no-print mt-4 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-primary-accent border border-border hover:border-primary-accent px-3 py-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Order
            </button>
          </motion.div>

          {/* ── Order Details ── */}
          <motion.div
            id="print-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
            className="border border-border"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold mb-1">
                    Order Number
                  </p>
                  <p className="text-lg font-extrabold text-text-primary tracking-tight">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold mb-1">
                    Order Date
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge variant={order.orderStatus === 'PENDING' ? 'warning' : 'default'}>
                  {order.orderStatus}
                </Badge>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Items */}
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {/* Product image from order snapshot */}
                    <div className="relative h-12 w-12 shrink-0 border border-border bg-bg-card overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-5 w-5 text-border" />
                        </div>
                      )}
                      <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 flex items-center justify-center bg-primary-accent text-[9px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                      <p className="text-xs text-text-secondary">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-text-primary shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping + Payment */}
            <div className="px-6 py-5 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
                    Shipping Address
                  </h3>
                </div>
                <div className="text-sm text-text-secondary space-y-0.5 leading-relaxed">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-3.5 w-3.5 text-text-secondary" />
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
                    Payment
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Status:{' '}
                  <span
                    className={
                      order.paymentStatus === 'PAID' ? 'text-success font-semibold' : 'text-warning font-semibold'
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="px-6 py-5">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium text-text-primary">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className={`font-medium ${order.shippingCost === 0 ? 'text-success' : 'text-text-primary'}`}>
                    {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tax</span>
                  <span className="font-medium text-text-primary">{formatPrice(order.tax)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
                    Total
                  </span>
                  <span className="text-xl font-extrabold text-text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Delivery Estimate (dynamic) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-5 border border-border bg-bg-card px-5 py-4 flex items-center gap-3"
          >
            <div className="h-9 w-9 border border-border bg-bg flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4 text-primary-accent" />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
                Estimated Delivery
              </p>
              <p className="text-sm font-bold text-text-primary mt-0.5">{deliveryRange}</p>
            </div>
          </motion.div>

          {/* ── Action Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="no-print mt-6 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/dashboard/orders" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
            <Link href="/products" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* ── Suggested Products ── */}
          {suggestedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="no-print mt-14"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5 text-text-secondary" />
                  <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    You Might Also Like
                  </h2>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {suggestedProducts.map((product) => (
                  <SuggestedCard key={product._id} product={product} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
