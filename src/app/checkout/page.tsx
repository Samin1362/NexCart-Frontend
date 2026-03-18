'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Smartphone,
  ShoppingCart,
  Loader2,
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
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'COD', label: 'Cash on Delivery', icon: <Banknote className="h-5 w-5" />, description: 'Pay when you receive' },
  { value: 'CARD', label: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" />, description: 'Visa, Mastercard' },
  { value: 'BKASH', label: 'bKash', icon: <Smartphone className="h-5 w-5" />, description: 'Mobile payment' },
  { value: 'NAGAD', label: 'Nagad', icon: <Smartphone className="h-5 w-5" />, description: 'Mobile payment' },
];

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

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && user && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cartLoading, user, cart, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!shipping.street.trim()) newErrors.street = 'Street address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State is required';
    if (!shipping.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!shipping.country.trim()) newErrors.country = 'Country is required';

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

      // Cart is cleared on backend, refresh frontend
      await fetchCart();

      // Redirect to confirmation page with order data
      const order = data.data;
      router.push(`/checkout/confirmation?orderId=${order._id}&orderNumber=${order.orderNumber}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const updateField = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Calculate summary
  const subtotal = cart?.totalAmount || 0;
  const shippingCost = subtotal >= 100 ? 0 : 10;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

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
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-text-primary transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-text-primary">Checkout</span>
          </nav>

          <h1 className="text-2xl font-bold text-text-primary mb-8">Checkout</h1>

          {apiError && (
            <div className="mb-6 border border-error bg-error/5 p-4 text-sm text-error">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Shipping Address</h2>
                <div className="space-y-4">
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

              {/* Payment Method */}
              <div className="border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors text-left ${
                        paymentMethod === method.value
                          ? 'border-primary-accent bg-primary-accent/5'
                          : 'border-border hover:border-text-secondary'
                      }`}
                    >
                      <div
                        className={`${
                          paymentMethod === method.value ? 'text-primary-accent' : 'text-text-secondary'
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            paymentMethod === method.value ? 'text-primary-accent' : 'text-text-primary'
                          }`}
                        >
                          {method.label}
                        </p>
                        <p className="text-xs text-text-secondary">{method.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                  className="w-full border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Right Column — Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h2>

                {/* Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.items.map((item) => {
                    const product = item.productId as IProduct;
                    const productId = typeof item.productId === 'object' ? product._id : item.productId;
                    const title = typeof item.productId === 'object' ? product.title : 'Product';

                    return (
                      <div key={productId} className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 border border-border bg-bg-card flex items-center justify-center">
                          <span className="text-lg font-bold text-text-secondary/10">
                            {title.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{title}</p>
                          <p className="text-xs text-text-secondary">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="text-text-primary font-medium">
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tax (5%)</span>
                    <span className="text-text-primary font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-text-primary font-semibold">Total</span>
                    <span className="text-text-primary font-bold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handlePlaceOrder}
                  loading={placing}
                  disabled={placing}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Place Order
                </Button>

                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2 mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
