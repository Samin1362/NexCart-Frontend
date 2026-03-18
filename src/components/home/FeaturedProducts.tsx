'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setProducts(data.data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-accent">
                Curated Selection
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Featured Products</h2>
            <p className="mt-1.5 text-sm text-text-secondary">Handpicked products just for you.</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent hover:gap-2.5 transition-all duration-200"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border bg-bg flex flex-col">
                <Skeleton className="h-52 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-28" />
                  <div className="pt-2 flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
