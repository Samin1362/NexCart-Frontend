'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Trash2, ArrowRight, Package, Truck } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeItem } = useCart();
  const items = cart?.items || [];
  const subtotal = cart?.totalAmount ?? 0;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  /* Notify ChatWidget to move out of the way */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('cart-drawer-toggle', { detail: { open } }));
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full flex flex-col',
          'w-full sm:max-w-100',
          'border-l border-border',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ background: 'var(--bg)' }}
      >
        {/* ── Top accent line ── */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-primary-accent via-indigo-400 to-purple-500 z-10" />

        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0f1f42 60%, #1e3a8a 100%)' }}
        >
          {/* Dot grid overlay */}
          <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
          {/* Blue glow */}
          <div
            className="absolute -top-6 -right-6 h-24 w-24 pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />

          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary-accent/20 border border-primary-accent/30 shrink-0">
              <ShoppingCart className="h-4 w-4 text-primary-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">Your Cart</span>
                {totalQty > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center bg-primary-accent text-[10px] font-bold text-white px-1.5">
                    {totalQty}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                {items.length === 0
                  ? 'No items yet'
                  : `${items.length} product${items.length > 1 ? 's' : ''} · ${formatPrice(subtotal)}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 h-8 w-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Free shipping progress ── */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-border shrink-0 bg-bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Truck className="h-3.5 w-3.5" />
                {remaining > 0 ? (
                  <span>
                    Add <span className="font-semibold text-text-primary">{formatPrice(remaining)}</span> for free shipping
                  </span>
                ) : (
                  <span className="text-success font-semibold">You qualify for free shipping!</span>
                )}
              </div>
              <span className="text-[10px] font-bold text-primary-accent">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="h-1 w-full bg-border overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary-accent to-indigo-400 transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Items list ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8 py-12">
              <div
                className="h-20 w-20 flex items-center justify-center border border-border"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.06))' }}
              >
                <ShoppingCart className="h-9 w-9 text-border" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Your cart is empty</p>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Discover our products and add something you love
                </p>
              </div>
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center gap-2 h-10 px-5 bg-primary-accent text-sm font-bold text-white hover:bg-primary-accent/90 transition-colors"
              >
                Browse Products
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const product = typeof item.productId === 'object' ? item.productId as IProduct : null;
                const image = product?.images?.[0];
                const title = product?.title ?? 'Product';
                const productSlug = product?.slug;
                const productId = product?._id ?? (item.productId as string);

                return (
                  <div key={productId} className="flex gap-4 px-5 py-4 hover:bg-bg-card/50 transition-colors">
                    {/* Image */}
                    <div className="relative h-18 w-18 shrink-0 border border-border bg-bg-card overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-6 w-6 text-border" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      {productSlug ? (
                        <Link
                          href={`/products/${productSlug}`}
                          onClick={onClose}
                          className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug hover:text-primary-accent transition-colors"
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">{title}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-secondary bg-bg border border-border px-2 py-0.5 font-medium">
                            ×{item.quantity}
                          </span>
                          <span className="text-sm font-bold text-primary-accent">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(productId)}
                          className="h-7 w-7 flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/8 border border-transparent hover:border-error/20 transition-all cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 shrink-0 bg-bg-card">
            {/* Subtotal row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Subtotal</span>
              <span className="text-lg font-extrabold text-text-primary">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-[11px] text-text-secondary/70">
              Taxes and shipping calculated at checkout
            </p>
            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 h-11 border border-border text-sm font-semibold text-text-primary hover:border-primary-accent hover:text-primary-accent transition-all"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="btn-shimmer flex items-center justify-center gap-1.5 h-11 bg-primary-accent text-sm font-bold text-white hover:bg-primary-accent/90 transition-colors"
                style={{ boxShadow: '0 0 16px rgba(37,99,235,0.25)' }}
              >
                Checkout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
