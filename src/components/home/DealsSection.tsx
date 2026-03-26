'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Flame, Package, ShoppingCart, Eye, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import RevealText from '@/components/ui/RevealText';
import { IProduct } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

function DealCard({ product }: { product: IProduct }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const imageUrl = product.images?.[0];
  const hasImage = imageUrl && !imgError;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || adding || added) return;
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
    <div className="group flex gap-0 border border-border bg-bg hover:border-primary-accent transition-all duration-300 hover:-translate-y-[2px] overflow-hidden">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-auto w-32 sm:w-36 shrink-0 bg-bg-card overflow-hidden"
      >
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="144px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-card">
            <Package className="h-8 w-8 text-border" />
          </div>
        )}

        {/* Discount badge on image */}
        <span className="absolute top-2 left-2 px-1.5 py-[2px] bg-error text-white text-[10px] font-bold">
          -{discount}%
        </span>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 p-3.5 gap-1.5">
        {/* Category */}
        {typeof product.category === 'object' && product.category.name && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-accent/70 truncate">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-accent transition-colors duration-200 line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-2.5 w-2.5',
                  i < Math.round(product.rating)
                    ? 'fill-secondary text-secondary'
                    : 'fill-border text-border'
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-text-secondary">({product.reviewCount})</span>
        </div>

        {/* Prices */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-bold text-text-primary">
            {formatPrice(product.discountPrice)}
          </span>
          <span className="text-xs text-text-secondary line-through">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Savings pill */}
        <div className="text-[10px] font-semibold text-success">
          You save {formatPrice(product.price - product.discountPrice)}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center gap-1 h-8 px-3 border border-border text-[11px] font-semibold text-text-secondary hover:border-primary-accent hover:text-primary-accent transition-all duration-200"
          >
            <Eye className="h-3 w-3" />
            View
          </Link>

          {user && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 h-8 text-[11px] font-semibold',
                'transition-all duration-200 cursor-pointer disabled:cursor-not-allowed',
                added
                  ? 'bg-success text-white'
                  : 'bg-primary-accent text-white hover:bg-primary-accent/90'
              )}
            >
              {adding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : added ? (
                <>
                  <Check className="h-3 w-3" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3" />
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

export default function DealsSection() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await api.get('/products?sort=price_asc&limit=12');
        const deals = (data.data || []).filter(
          (p: IProduct) => p.discountPrice > 0 && p.discountPrice < p.price
        );
        setProducts(deals.slice(0, 6));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center bg-error text-white">
                <Flame className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-error">
                Limited Time
              </span>
            </div>
            <RevealText delay={0.05}>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Hot Deals</h2>
            </RevealText>
            <RevealText delay={0.1}>
              <p className="mt-1.5 text-sm text-text-secondary">
                Unbeatable prices on top products — grab them before they&apos;re gone.
              </p>
            </RevealText>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent hover:gap-2.5 transition-all duration-200"
          >
            All Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex border border-border overflow-hidden">
                <Skeleton className="h-32 w-32 shrink-0" />
                <div className="flex-1 p-3.5 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-28" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -55 : 55 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
              >
                <DealCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent"
          >
            View All Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
