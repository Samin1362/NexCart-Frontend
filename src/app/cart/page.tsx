'use client';

import { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const router = useRouter();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setUpdatingId(productId);
    try {
      await updateItem(productId, quantity);
    } catch {
      // error handled in provider
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeItem(productId);
    } catch {
      // error handled in provider
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
    } catch {
      // error handled in provider
    } finally {
      setClearing(false);
    }
  };

  // Calculate order summary
  const subtotal = cart?.totalAmount || 0;
  const shippingCost = subtotal >= 100 ? 0 : subtotal > 0 ? 10 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border p-4 flex gap-4">
                  <Skeleton className="h-24 w-24 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-text-secondary/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary">Sign in to view your cart</h2>
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

  // Empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-text-secondary/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary">Your cart is empty</h2>
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

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text-primary">Shopping Cart</span>
          </nav>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Shopping Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
            </h1>
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="text-sm text-error hover:underline cursor-pointer disabled:opacity-50"
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.productId as IProduct;
                const productId = typeof item.productId === 'object' ? product._id : item.productId;
                const title = typeof item.productId === 'object' ? product.title : 'Product';
                const slug = typeof item.productId === 'object' ? product.slug : '';
                const stock = typeof item.productId === 'object' ? product.stock : 99;
                const isActive = typeof item.productId === 'object' ? product.isActive : true;
                const itemTotal = Math.round(item.price * item.quantity * 100) / 100;

                return (
                  <div
                    key={productId}
                    className={`border border-border p-4 sm:p-6 flex flex-col sm:flex-row gap-4 ${
                      !isActive ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Product Image Placeholder */}
                    <Link href={slug ? `/products/${slug}` : '#'} className="shrink-0">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 border border-border bg-bg-card flex items-center justify-center">
                        <span className="text-3xl font-bold text-text-secondary/10">
                          {title.charAt(0)}
                        </span>
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={slug ? `/products/${slug}` : '#'}
                            className="text-sm font-medium text-text-primary hover:text-primary-accent transition-colors line-clamp-2"
                          >
                            {title}
                          </Link>
                          <p className="mt-1 text-sm text-text-secondary">
                            Unit Price: {formatPrice(item.price)}
                          </p>
                          {!isActive && (
                            <p className="mt-1 text-xs text-error">This product is no longer available</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-text-primary whitespace-nowrap">
                          {formatPrice(itemTotal)}
                        </p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingId === productId}
                            className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="h-9 w-10 flex items-center justify-center text-sm font-medium text-text-primary border-x border-border">
                            {updatingId === productId ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            disabled={item.quantity >= stock || updatingId === productId}
                            className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(productId)}
                          disabled={removingId === productId}
                          className="flex items-center gap-1.5 text-sm text-error hover:underline cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {removingId === productId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-primary-accent hover:underline mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
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

                {subtotal < 100 && (
                  <p className="mt-3 text-xs text-text-secondary">
                    Add {formatPrice(100 - subtotal)} more for free shipping.
                  </p>
                )}

                <Button
                  className="w-full mt-6"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="flex flex-col items-center text-center gap-1">
                    <Truck className="h-4 w-4 text-text-secondary" />
                    <span className="text-[10px] text-text-secondary">Free Shipping $100+</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-text-secondary" />
                    <span className="text-[10px] text-text-secondary">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <Package className="h-4 w-4 text-text-secondary" />
                    <span className="text-[10px] text-text-secondary">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
