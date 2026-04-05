'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Smartphone,
  ShoppingCart,
  Loader2,
  Package,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  Zap,
  Truck,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import api from '@/lib/api';
import { IProduct, PaymentMethod } from '@/types';
import { formatPrice } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingForm {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface FormErrors {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  terms?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
  deliveryDays: [number, number];
}[] = [
  {
    value: 'COD',
    label: 'Cash on Delivery',
    icon: <Banknote className="h-4 w-4" />,
    description: 'Pay when you receive',
    deliveryDays: [7, 10],
  },
  {
    value: 'CARD',
    label: 'Credit / Debit Card',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Visa, Mastercard, Amex',
    deliveryDays: [5, 7],
  },
  {
    value: 'BKASH',
    label: 'bKash',
    icon: <Smartphone className="h-4 w-4" />,
    description: 'Mobile banking',
    deliveryDays: [5, 7],
  },
  {
    value: 'NAGAD',
    label: 'Nagad',
    icon: <Smartphone className="h-4 w-4" />,
    description: 'Mobile banking',
    deliveryDays: [5, 7],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeliveryDate(method: PaymentMethod): string {
  const config = paymentMethods.find((m) => m.value === method);
  const [minDays, maxDays] = config?.deliveryDays ?? [5, 7];
  const today = new Date();

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const start = new Date(today);
  start.setDate(today.getDate() + minDays);
  const end = new Date(today);
  end.setDate(today.getDate() + maxDays);

  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Progress Steps ───────────────────────────────────────────────────────────

const STEPS = ['Shipping', 'Payment', 'Confirm'] as const;

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`h-8 w-8 flex items-center justify-center text-xs font-bold border transition-colors ${
                  isCompleted
                    ? 'bg-success border-success text-white'
                    : isActive
                    ? 'bg-primary-accent border-primary-accent text-white'
                    : 'bg-bg border-border text-text-secondary/40'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest ${
                  isActive ? 'text-primary-accent' : isCompleted ? 'text-success' : 'text-text-secondary/40'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-2 mb-5">
                <div className="h-px w-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary-accent transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Card Mockup ──────────────────────────────────────────────────────────────

function CardMockup() {
  return (
    <div className="mt-4 border border-border bg-bg-card p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
          Card Details
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary/70">
          <Lock className="h-3 w-3" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* Card number */}
      <div>
        <label className="block text-xs font-medium text-text-primary mb-1.5">Card Number</label>
        <div className="flex items-center border border-border bg-bg px-3 h-11 gap-2">
          <CreditCard className="h-4 w-4 text-text-secondary/50 shrink-0" />
          <input
            type="text"
            disabled
            placeholder="1234  5678  9012  3456"
            className="flex-1 bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/40 focus:outline-none disabled:cursor-not-allowed"
          />
          {/* Card brand logos text */}
          <div className="flex items-center gap-1 shrink-0">
            {['VISA', 'MC', 'AMEX'].map((b) => (
              <span
                key={b}
                className="text-[8px] font-extrabold px-1 py-0.5 border border-border text-text-secondary/40 tracking-wider"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5">Expiry Date</label>
          <input
            type="text"
            disabled
            placeholder="MM / YY"
            className="h-11 w-full border border-border bg-bg px-3 text-sm text-text-secondary placeholder:text-text-secondary/40 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5">CVV</label>
          <input
            type="text"
            disabled
            placeholder="• • •"
            className="h-11 w-full border border-border bg-bg px-3 text-sm text-text-secondary placeholder:text-text-secondary/40 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1.5">Cardholder Name</label>
        <input
          type="text"
          disabled
          placeholder="Name on card"
          className="h-11 w-full border border-border bg-bg px-3 text-sm text-text-secondary placeholder:text-text-secondary/40 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      <p className="text-[10px] text-text-secondary/60 flex items-center gap-1.5">
        <Lock className="h-3 w-3" />
        Your card details are encrypted and never stored on our servers.
      </p>
    </div>
  );
}

// ─── Order Summary Item ───────────────────────────────────────────────────────

function OrderSummaryItem({
  item,
}: {
  item: { productId: IProduct | string; price: number; quantity: number };
}) {
  const [imgError, setImgError] = useState(false);
  const product = typeof item.productId === 'object' ? (item.productId as IProduct) : null;
  const title = product?.title ?? 'Product';
  const imageUrl = !imgError && product?.images?.[0] ? product.images[0] : null;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 border border-border bg-bg-card overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="48px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-5 w-5 text-border" />
          </div>
        )}
        {/* Quantity badge */}
        <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 flex items-center justify-center bg-primary-accent text-[9px] font-bold text-white">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">{title}</p>
        <p className="text-[11px] text-text-secondary mt-0.5">
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>
      <p className="text-xs font-bold text-text-primary shrink-0">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const router = useRouter();

  const [shipping, setShipping] = useState<ShippingForm>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false); // mobile collapsible
  const orderPlaced = useRef(false);

  // Step tracking: shipping=1, payment=2, confirm=3
  // On this page, we show step 2 (both shipping + payment filled before placing)
  const currentStep = 2;

  // Pre-fill shipping address from user profile
  useEffect(() => {
    if (user?.address) {
      setShipping({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipCode: user.address.zipCode || '',
        country: user.address.country || '',
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Redirect if cart is empty (skip if order was just placed)
  useEffect(() => {
    if (!orderPlaced.current && !cartLoading && user && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cartLoading, user, cart, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!shipping.street.trim()) newErrors.street = 'Street address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State / Province is required';
    if (!shipping.zipCode.trim()) newErrors.zipCode = 'Zip / Postal code is required';
    if (!shipping.country.trim()) newErrors.country = 'Country is required';
    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms & Conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacing(true);
    setApiError('');

    try {
      const { data } = await api.post('/orders', {
        shippingAddress: shipping,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      orderPlaced.current = true;
      await fetchCart();
      const order = data.data;
      router.push(
        `/dashboard/orders?success=true&orderNumber=${order.orderNumber}`
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(
        error.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  const updateField = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Calculations
  const subtotal = cart?.totalAmount || 0;
  const shippingCost = subtotal >= 100 ? 0 : 10;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
  const deliveryDate = getDeliveryDate(paymentMethod);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-primary-accent transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link href="/cart" className="hover:text-primary-accent transition-colors">Cart</Link>
            <span className="text-border">/</span>
            <span className="text-text-primary font-semibold">Checkout</span>
          </nav>

          {/* Progress bar */}
          <ProgressBar currentStep={currentStep} />

          {/* API error */}
          {apiError && (
            <div className="mb-6 border border-error bg-error/5 px-4 py-3 text-sm text-error flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-error shrink-0" />
              {apiError}
            </div>
          )}

          {/* ── Mobile: collapsible order summary ── */}
          <div className="lg:hidden mb-6 border border-border">
            <button
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-bg-card text-sm font-semibold text-text-primary"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary-accent" />
                Order Summary · {formatPrice(total)}
              </span>
              {summaryOpen ? (
                <ChevronUp className="h-4 w-4 text-text-secondary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              )}
            </button>
            {summaryOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                {cart.items.map((item) => {
                  const product =
                    typeof item.productId === 'object' ? (item.productId as IProduct) : null;
                  const productId = product?._id ?? (item.productId as string);
                  return <OrderSummaryItem key={productId} item={item} />;
                })}
                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span><span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-success' : 'text-text-primary'}`}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax (5%)</span><span className="font-medium text-text-primary">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-text-primary text-sm pt-1 border-t border-border">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left Column — Form ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Section 1: Shipping Address */}
              <div className="border border-border">
                <div className="px-6 py-4 border-b border-border bg-bg-card flex items-center gap-3">
                  <div className="h-6 w-6 flex items-center justify-center bg-primary-accent text-white text-xs font-bold shrink-0">
                    1
                  </div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                    Shipping Address
                  </h2>
                  {user?.address?.city && (
                    <span className="ml-auto text-[10px] text-primary-accent font-semibold uppercase tracking-wide">
                      Pre-filled from profile
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street, Apt 4"
                    value={shipping.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    error={errors.street}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="New York"
                      value={shipping.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      error={errors.city}
                    />
                    <Input
                      label="State / Province"
                      placeholder="NY"
                      value={shipping.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      error={errors.state}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Zip / Postal Code"
                      placeholder="10001"
                      value={shipping.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      error={errors.zipCode}
                    />
                    <Input
                      label="Country"
                      placeholder="USA"
                      value={shipping.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      error={errors.country}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="border border-border">
                <div className="px-6 py-4 border-b border-border bg-bg-card flex items-center gap-3">
                  <div className="h-6 w-6 flex items-center justify-center bg-primary-accent text-white text-xs font-bold shrink-0">
                    2
                  </div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                    Payment Method
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const isSelected = paymentMethod === method.value;
                      return (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`relative flex items-start gap-3 p-4 border cursor-pointer transition-all text-left ${
                            isSelected
                              ? 'border-primary-accent bg-primary-accent/5'
                              : 'border-border hover:border-text-secondary/50'
                          }`}
                        >
                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-4 w-4 bg-primary-accent flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          <div
                            className={`mt-0.5 ${
                              isSelected ? 'text-primary-accent' : 'text-text-secondary'
                            }`}
                          >
                            {method.icon}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isSelected ? 'text-primary-accent' : 'text-text-primary'
                              }`}
                            >
                              {method.label}
                            </p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {method.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card mockup — shown when CARD is selected */}
                  {paymentMethod === 'CARD' && <CardMockup />}
                </div>
              </div>

              {/* Section 3: Order Notes */}
              <div className="border border-border">
                <div className="px-6 py-4 border-b border-border bg-bg-card flex items-center gap-3">
                  <div className="h-6 w-6 flex items-center justify-center bg-border text-text-secondary/60 text-xs font-bold shrink-0">
                    3
                  </div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                    Order Notes
                    <span className="ml-2 text-[10px] font-normal text-text-secondary normal-case tracking-normal">
                      Optional
                    </span>
                  </h2>
                </div>
                <div className="p-6">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order or delivery…"
                    rows={3}
                    className="w-full border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className={`border p-4 ${errors.terms ? 'border-error bg-error/5' : 'border-border'}`}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="mt-0.5 shrink-0 relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
                      }}
                    />
                    <div
                      className={`h-4 w-4 border flex items-center justify-center transition-colors ${
                        agreedToTerms
                          ? 'bg-primary-accent border-primary-accent'
                          : errors.terms
                          ? 'border-error'
                          : 'border-border'
                      }`}
                    >
                      {agreedToTerms && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary leading-snug">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary-accent hover:underline font-medium"
                      target="_blank"
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary-accent hover:underline font-medium"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    . I confirm that the information provided is correct.
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-2 text-xs text-error ml-7">{errors.terms}</p>
                )}
              </div>
            </div>

            {/* ── Right Column — Order Summary (desktop) ── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="border border-border sticky top-24">

                {/* Header */}
                <div className="px-5 py-4 border-b border-border bg-bg-card">
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="px-5 py-4 space-y-3 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => {
                    const product =
                      typeof item.productId === 'object' ? (item.productId as IProduct) : null;
                    const productId = product?._id ?? (item.productId as string);
                    return <OrderSummaryItem key={productId} item={item} />;
                  })}
                </div>

                {/* Totals */}
                <div className="px-5 pb-4 border-t border-border space-y-2.5 text-sm pt-4">
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
                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Estimated delivery */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border px-3 py-2">
                    <Zap className="h-3 w-3 shrink-0 text-secondary" />
                    <span>
                      Est. delivery:{' '}
                      <span className="text-text-primary font-semibold">{deliveryDate}</span>
                    </span>
                  </div>
                </div>

                {/* Place order CTA */}
                <div className="px-5 pb-5 space-y-3">
                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    loading={placing}
                    disabled={placing}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-primary-accent transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Cart
                  </Link>
                </div>

                {/* Security note */}
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: Lock, label: 'SSL Encrypted Checkout' },
                      { icon: Truck, label: 'Free shipping over $100' },
                      { icon: ShoppingCart, label: 'Easy 30-day returns' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-[10px] text-text-secondary/60">
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="uppercase tracking-wider font-semibold">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: Place Order sticky bar ── */}
          <div className="lg:hidden mt-6 border border-border p-4 space-y-3 bg-bg">
            {/* Delivery estimate */}
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border px-3 py-2">
              <Zap className="h-3 w-3 shrink-0 text-secondary" />
              <span>
                Est. delivery:{' '}
                <span className="text-text-primary font-semibold">{deliveryDate}</span>
              </span>
            </div>

            <Button
              className="w-full"
              onClick={handlePlaceOrder}
              loading={placing}
              disabled={placing}
            >
              <Lock className="mr-2 h-4 w-4" />
              Place Order · {formatPrice(total)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-primary-accent transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Cart
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
