'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  Tag,
  X,
  Undo2,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { IProduct, ICartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.05;
const SHIPPING_COST = 10;

const PROMO_CODES: Record<string, { label: string; freeShipping?: boolean }> = {
  NEXFREE: { label: 'Free shipping applied!', freeShipping: true },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface UndoToast {
  productId: string;
  quantity: number;
  title: string;
  timerId: ReturnType<typeof setTimeout>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEstimatedDelivery(): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 6);
  const end = new Date(today);
  end.setDate(today.getDate() + 8);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)}–${fmt(end)}`;
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: ICartItem;
  updatingId: string | null;
  removingId: string | null;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string, item: ICartItem, title: string) => void;
}

function CartItemRow({ item, updatingId, removingId, onUpdateQty, onRemove }: CartItemRowProps) {
  const [imgError, setImgError] = useState(false);

  const product = typeof item.productId === 'object' ? (item.productId as IProduct) : null;
  const productId = product?._id ?? (item.productId as string);
  const title = product?.title ?? 'Product';
  const slug = product?.slug ?? '';
  const stock = product?.stock ?? 99;
  const isActive = product?.isActive ?? true;
  const imageUrl = !imgError && product?.images?.[0] ? product.images[0] : null;
  const itemTotal = Math.round(item.price * item.quantity * 100) / 100;

  const isUpdating = updatingId === productId;
  const isRemoving = removingId === productId;

  return (
    <div
      className={`group relative bg-bg border border-border hover:border-border/80 transition-colors ${
        !isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Discontinued banner */}
      {!isActive && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-error" />
      )}

      <div className="flex gap-0 sm:gap-0">
        {/* ── Image ── */}
        <Link
          href={slug ? `/products/${slug}` : '#'}
          className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 bg-bg-card border-r border-border overflow-hidden block"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-bg-card">
              <Package className="h-8 w-8 text-border" />
              <span className="text-[9px] text-text-secondary/40 uppercase tracking-widest px-2 text-center line-clamp-2 font-medium">
                {title}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white bg-primary-accent px-2 py-1 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              VIEW
            </span>
          </div>
        </Link>

        {/* ── Details ── */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
          {/* Top row: title + price */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                href={slug ? `/products/${slug}` : '#'}
                className="text-sm font-semibold text-text-primary hover:text-primary-accent transition-colors line-clamp-2 leading-snug"
              >
                {title}
              </Link>
              <p className="mt-1 text-xs text-text-secondary">
                {formatPrice(item.price)} / unit
              </p>
              {!isActive && (
                <p className="mt-1 text-[10px] font-semibold text-error uppercase tracking-wide">
                  Unavailable
                </p>
              )}
            </div>

            {/* Line total */}
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-text-primary">{formatPrice(itemTotal)}</p>
              {item.quantity > 1 && (
                <p className="text-[10px] text-text-secondary mt-0.5">
                  {item.quantity}× {formatPrice(item.price)}
                </p>
              )}
            </div>
          </div>

          {/* Bottom row: qty stepper + remove */}
          <div className="mt-3 flex items-center justify-between">
            {/* Quantity stepper */}
            <div className="flex items-center border border-border bg-bg-card">
              <button
                onClick={() => onUpdateQty(productId, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="h-8 w-10 flex items-center justify-center text-sm font-semibold text-text-primary border-x border-border select-none">
                {isUpdating ? (
                  <span className="text-xs text-text-secondary animate-pulse">…</span>
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() => onUpdateQty(productId, item.quantity + 1)}
                disabled={item.quantity >= stock || isUpdating}
                className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(productId, item, title)}
              disabled={isRemoving}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-error transition-colors disabled:opacity-40 cursor-pointer group/rm"
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5 group-hover/rm:scale-110 transition-transform" />
              <span className="hidden sm:inline">
                {isRemoving ? 'Removing…' : 'Remove'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem, addItem, clearCart } = useCart();
  const router = useRouter();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Undo toast
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const estimatedDelivery = getEstimatedDelivery();

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // ── Handlers ──

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setUpdatingId(productId);
    try {
      await updateItem(productId, quantity);
    } catch {
      // handled in provider
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: string, item: ICartItem, title: string) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setRemovingId(productId);
    try {
      await removeItem(productId);

      const timerId = setTimeout(() => setUndoToast(null), 5000);
      undoTimerRef.current = timerId;
      setUndoToast({ productId, quantity: item.quantity, title, timerId });
    } catch {
      // handled in provider
    } finally {
      setRemovingId(null);
    }
  };

  const handleUndo = async () => {
    if (!undoToast) return;
    clearTimeout(undoToast.timerId);
    const { productId, quantity } = undoToast;
    setUndoToast(null);
    try {
      await addItem(productId, quantity);
    } catch {
      // silent
    }
  };

  const dismissUndo = () => {
    if (undoToast) {
      clearTimeout(undoToast.timerId);
      setUndoToast(null);
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
    } catch {
      // handled in provider
    } finally {
      setClearing(false);
    }
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setTimeout(() => {
      const code = promoInput.trim().toUpperCase();
      if (PROMO_CODES[code]) {
        setAppliedPromo(code);
        setPromoInput('');
      } else {
        setPromoError('Invalid code. Try NEXFREE for free shipping.');
      }
      setPromoLoading(false);
    }, 400);
  };

  // ── Calculations ──

  const subtotal = cart?.totalAmount ?? 0;
  const promoFreeShipping = appliedPromo
    ? (PROMO_CODES[appliedPromo]?.freeShipping ?? false)
    : false;
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD || promoFreeShipping ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // ── Loading ──

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-7 w-56 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border flex overflow-hidden">
                  <Skeleton className="h-36 w-36 shrink-0" />
                  <div className="flex-1 p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-28 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-72 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not logged in ──

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-6 h-20 w-20 border border-border bg-bg-card flex items-center justify-center">
              <ShoppingCart className="h-9 w-9 text-border" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Sign in to view your cart</h2>
            <p className="mt-2 text-sm text-text-secondary">
              You need to be logged in to manage your cart.
            </p>
            <Link href="/login">
              <Button className="mt-6">Login to Continue</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Empty cart ──

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-6 h-20 w-20 border border-border bg-bg-card flex items-center justify-center">
              <ShoppingCart className="h-9 w-9 text-border" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Your cart is empty</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main ──

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      {/* ── Undo Toast ── */}
      {undoToast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-bg-card border border-border shadow-xl px-4 py-3 text-sm w-[calc(100%-2rem)] max-w-sm">
          <div className="h-1.5 w-1.5 bg-primary-accent shrink-0" />
          <span className="flex-1 text-text-primary truncate">
            <span className="text-text-secondary">Removed </span>
            <span className="font-semibold">{undoToast.title}</span>
          </span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-primary-accent font-bold hover:underline shrink-0 text-xs uppercase tracking-wide"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            onClick={dismissUndo}
            className="text-text-secondary hover:text-text-primary shrink-0 ml-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-primary-accent transition-colors">Home</Link>
            <span className="text-border">/</span>
            <span className="text-text-primary font-semibold">Cart</span>
          </nav>

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
                Shopping Cart
                <span className="ml-2 text-base font-semibold text-text-secondary">
                  ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
                </span>
              </h1>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm text-primary-accent hover:underline mt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Continue Shopping
              </Link>
            </div>
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="self-start sm:self-auto text-xs font-semibold text-text-secondary hover:text-error transition-colors disabled:opacity-40 cursor-pointer uppercase tracking-wide border border-transparent hover:border-error/30 px-2 py-1"
            >
              {clearing ? 'Clearing…' : 'Clear All'}
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="mb-6 border border-border bg-bg-card px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Truck className="h-3.5 w-3.5 shrink-0" />
                {promoFreeShipping ? (
                  <span className="text-success font-semibold">
                    Free shipping applied via promo code!
                  </span>
                ) : shippingRemaining > 0 ? (
                  <span>
                    Add{' '}
                    <span className="font-bold text-text-primary">
                      {formatPrice(shippingRemaining)}
                    </span>{' '}
                    more for free shipping
                  </span>
                ) : (
                  <span className="text-success font-semibold">
                    You qualify for free shipping!
                  </span>
                )}
              </div>
              {!promoFreeShipping && (
                <span className="text-[10px] font-bold text-primary-accent">
                  {Math.round(shippingProgress)}%
                </span>
              )}
            </div>
            {!promoFreeShipping && (
              <div className="h-1 w-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary-accent transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map((item) => {
                const product = typeof item.productId === 'object'
                  ? (item.productId as IProduct)
                  : null;
                const productId = product?._id ?? (item.productId as string);

                return (
                  <CartItemRow
                    key={productId}
                    item={item}
                    updatingId={updatingId}
                    removingId={removingId}
                    onUpdateQty={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="border border-border sticky top-24">

                {/* Summary header */}
                <div className="px-5 py-4 border-b border-border bg-bg-card">
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                    Order Summary
                  </h2>
                </div>

                <div className="px-5 py-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Subtotal ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-semibold text-text-primary">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-success' : 'text-text-primary'}`}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tax (5%)</span>
                    <span className="font-semibold text-text-primary">{formatPrice(tax)}</span>
                  </div>

                  {/* Estimated delivery */}
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border px-3 py-2">
                    <Zap className="h-3 w-3 shrink-0 text-secondary" />
                    <span>
                      Est. delivery:{' '}
                      <span className="text-text-primary font-semibold">{estimatedDelivery}</span>
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">Total</span>
                    <span className="text-xl font-extrabold text-text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Promo code */}
                <div className="px-5 pb-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-success/5 border border-success/30 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-success font-semibold">
                        <Tag className="h-3.5 w-3.5" />
                        {PROMO_CODES[appliedPromo].label}
                      </div>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-text-secondary hover:text-error transition-colors"
                        aria-label="Remove promo code"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-0">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          placeholder="Promo code"
                          className="flex-1 border border-border border-r-0 bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-accent uppercase tracking-widest font-semibold"
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || promoLoading}
                          className="px-4 py-2 text-xs font-bold bg-primary text-bg disabled:opacity-40 hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-wide border border-primary cursor-pointer"
                        >
                          {promoLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                      {promoError && (
                        <p className="mt-1.5 text-[11px] text-error">{promoError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Checkout CTA */}
                <div className="px-5 pb-5">
                  <Button
                    className="w-full"
                    onClick={() => router.push('/checkout')}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="px-5 pb-5 pt-1 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Truck, label: 'Free Ship $100+' },
                      { icon: ShieldCheck, label: 'Secure Pay' },
                      { icon: Package, label: 'Easy Returns' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center text-center gap-1.5 pt-3">
                        <Icon className="h-4 w-4 text-text-secondary/60" />
                        <span className="text-[9px] uppercase tracking-wider text-text-secondary/60 font-semibold leading-tight">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Mobile Sticky Checkout Bar ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg border-t border-border px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Total</p>
          <p className="text-lg font-extrabold text-text-primary leading-tight">{formatPrice(total)}</p>
        </div>
        <Button onClick={() => router.push('/checkout')} className="shrink-0">
          Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Footer />
    </div>
  );
}
