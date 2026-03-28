'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, ShoppingCart, Trash2, Package,
  Check, Loader2, X,
} from 'lucide-react';
import { useWishlist } from '@/providers/WishlistProvider';
import { useCart } from '@/providers/CartProvider';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { IProduct } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ── Per-item card ────────────────────────────────────────────────────────────
function WishlistCard({ product }: { product: IProduct }) {
  const { removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const outOfStock = product.stock === 0;
  const imageUrl = product.images?.[0];
  const hasImage = imageUrl && !imgError;

  const handleAddToCart = async () => {
    if (adding || added || outOfStock) return;
    setAdding(true);
    try {
      await addItem(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { /* silent */ } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    await removeFromWishlist(product._id);
    // component unmounts after removal — no need to reset
  };

  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row border border-border bg-bg',
        'transition-all duration-200 hover:border-primary-accent/40',
        outOfStock && 'opacity-75'
      )}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-full sm:w-36 h-40 sm:h-auto shrink-0 bg-bg-card overflow-hidden"
      >
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-8 w-8 text-border" />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-error text-white text-[10px] font-bold">
            -{discount}%
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
            <span className="px-2 py-1 border border-border bg-bg text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-semibold text-text-primary hover:text-primary-accent transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-base font-bold text-text-primary">{formatPrice(displayPrice)}</span>
              {discount > 0 && (
                <span className="text-xs text-text-secondary line-through">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="shrink-0 h-8 w-8 flex items-center justify-center border border-border text-text-secondary hover:border-error/50 hover:text-error transition-all cursor-pointer disabled:opacity-50"
            aria-label="Remove from wishlist"
          >
            {removing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Low-stock warning */}
        {!outOfStock && product.stock <= 10 && (
          <p className="text-[11px] text-warning font-medium">Only {product.stock} left in stock</p>
        )}

        {/* Actions */}
        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={adding || added || outOfStock}
            className={cn(
              'flex items-center gap-1.5 h-9 px-4 text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed',
              outOfStock
                ? 'border border-border text-text-secondary/50'
                : added
                ? 'bg-success text-white'
                : 'bg-primary-accent text-white hover:bg-primary-accent/90',
              adding && 'opacity-80'
            )}
          >
            {adding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : added ? (
              <><Check className="h-3.5 w-3.5" /> Added</>
            ) : outOfStock ? (
              'Out of Stock'
            ) : (
              <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function WishlistSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex border border-border">
          <Skeleton className="w-36 h-36 shrink-0" />
          <div className="flex flex-col gap-3 p-4 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-9 w-28 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { wishlistItems, wishlistCount, isLoading, clearWishlist } = useWishlist();
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    setClearing(true);
    await clearWishlist();
    setClearing(false);
    setShowClearModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Wishlist</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {wishlistCount > 0
              ? `${wishlistCount} saved item${wishlistCount !== 1 ? 's' : ''}`
              : 'No saved items yet'}
          </p>
        </div>
        {wishlistCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setShowClearModal(true)}>
            Clear All
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <WishlistSkeleton />
      ) : wishlistItems.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <Heart className="h-12 w-12 text-text-secondary/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Save products you love and come back to them later.
          </p>
          <Link href="/products">
            <Button className="mt-6" size="sm">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlistItems.map((product) => (
            <WishlistCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Clear all confirmation modal */}
      {showClearModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowClearModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Clear Wishlist</h3>
                <button
                  onClick={() => setShowClearModal(false)}
                  className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Remove all {wishlistCount} item{wishlistCount !== 1 ? 's' : ''} from your wishlist?
                This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowClearModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={clearing} onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
