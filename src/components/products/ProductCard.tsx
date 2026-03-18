'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Package, Eye, Zap, Check, Loader2 } from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const categoryName = typeof product.category === 'object' ? product.category.name : '';
  const imageUrl = product.images?.[0];
  const hasImage = imageUrl && !imgError;
  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || adding || added || outOfStock) return;
    setAdding(true);
    try {
      await addItem(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col h-full bg-bg border border-border',
        'transition-all duration-300 hover:border-primary-accent hover:-translate-y-[3px]',
        outOfStock && 'opacity-75'
      )}
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="block relative h-52 overflow-hidden bg-bg-card flex-shrink-0">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg-card">
            <Package className="h-10 w-10 text-border" />
            <span className="text-[10px] text-text-secondary/40 font-medium uppercase tracking-widest px-4 text-center line-clamp-1">
              {product.title}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="inline-flex items-center px-2 py-[3px] bg-error text-white text-[10px] font-bold tracking-wide leading-none">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-[3px] bg-secondary text-white text-[10px] font-bold tracking-wide leading-none">
              <Zap className="h-2.5 w-2.5" />
              Hot
            </span>
          )}
        </div>

        {/* Out of stock */}
        {outOfStock && (
          <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
            <span className="border border-border bg-bg px-3 py-1 text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Category */}
        {categoryName && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-accent/80 truncate">
            {categoryName}
          </span>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-accent transition-colors duration-200 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.floor(product.rating)
                    ? 'fill-secondary text-secondary'
                    : i < product.rating
                    ? 'fill-secondary/40 text-secondary/40'
                    : 'fill-border text-border'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-text-secondary">
            {product.rating > 0 ? product.rating.toFixed(1) : '—'}
          </span>
          {product.reviewCount > 0 && (
            <span className="text-[11px] text-text-secondary/50">({product.reviewCount})</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-text-primary">{formatPrice(displayPrice)}</span>
          {discount > 0 && (
            <span className="text-xs text-text-secondary line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Low stock bar */}
        {!outOfStock && product.stock <= 10 && (
          <div className="space-y-0.5">
            <span className="text-[10px] text-warning font-medium">Only {product.stock} left</span>
            <div className="h-[3px] w-full bg-border overflow-hidden">
              <div
                className="h-full bg-warning"
                style={{ width: `${(product.stock / 10) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="mt-auto pt-3 border-t border-border flex gap-2">
          {/* View Details */}
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              'flex items-center justify-center gap-1.5 h-10 text-xs font-semibold border border-border',
              'text-text-secondary hover:border-primary-accent hover:text-primary-accent',
              'transition-all duration-200',
              user && !outOfStock ? 'flex-1' : 'flex-1'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>

          {/* Add to Cart */}
          {user && !outOfStock && (
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 h-10 text-xs font-semibold',
                'transition-all duration-200 cursor-pointer disabled:cursor-not-allowed',
                added
                  ? 'bg-success text-white'
                  : 'bg-primary-accent text-white hover:bg-primary-accent/90 active:scale-[0.98]',
                adding && 'opacity-80'
              )}
              aria-label="Add to cart"
            >
              {adding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : added ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
