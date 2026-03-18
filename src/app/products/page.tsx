'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal, PackageSearch, X, Sparkles,
  TrendingUp, ShoppingBag, Star,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import SearchBar from '@/components/products/SearchBar';
import SortDropdown from '@/components/products/SortDropdown';
import FilterSidebar from '@/components/products/FilterSidebar';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { IProduct, PaginationMeta } from '@/types';
import { cn } from '@/lib/utils';

interface Filters {
  category: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
  });

  const debouncedSearch = useDebounce(search, 300);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.rating) params.set('rating', filters.rating);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    params.set('limit', '12');
    return params.toString();
  }, [debouncedSearch, filters, sort, page]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?${buildQuery()}`);
      setProducts(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.rating) params.set('rating', filters.rating);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [debouncedSearch, filters, sort, page, router]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters, sort]);

  const handleFiltersChange = (f: Filters) => setFilters(f);

  /* Active filter chips */
  const activeChips: { label: string; clear: () => void }[] = [];
  if (filters.category) activeChips.push({ label: `Category: ${filters.category}`, clear: () => setFilters((f) => ({ ...f, category: '' })) });
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `$${filters.minPrice} – $${filters.maxPrice}`
      : filters.minPrice ? `From $${filters.minPrice}` : `Up to $${filters.maxPrice}`;
    activeChips.push({ label, clear: () => setFilters((f) => ({ ...f, minPrice: '', maxPrice: '' })) });
  }
  if (filters.rating) activeChips.push({ label: `${filters.rating}+ Stars`, clear: () => setFilters((f) => ({ ...f, rating: '' })) });

  const totalActive = activeChips.length;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">

        {/* ── Page Hero Header ── */}
        <div className="relative overflow-hidden bg-bg-card border-b border-border">
          {/* background dots */}
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          {/* accent orb */}
          <div
            className="absolute -top-20 -right-20 h-64 w-64 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white">
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">
                    Explore
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  All Products
                </h1>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {loading
                    ? 'Loading products…'
                    : meta
                    ? `${meta.total.toLocaleString()} products available`
                    : 'Discover our full collection'}
                </p>
              </div>

              {/* Quick stats */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-text-secondary border border-border bg-bg px-3 py-2">
                  <TrendingUp className="h-4 w-4 text-primary-accent" />
                  <span>New arrivals weekly</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-text-secondary border border-border bg-bg px-3 py-2">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span>Top-rated brands</span>
                </div>
              </div>
            </div>

            {/* Search bar — full width in hero */}
            <div className="mt-6">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

          {/* Toolbar row */}
          <div className="flex items-center gap-3 mb-5">
            {/* Mobile filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              className={cn(
                'lg:hidden flex h-10 items-center gap-2 border px-4 text-sm font-medium transition-all duration-200 cursor-pointer',
                totalActive > 0
                  ? 'border-primary-accent bg-primary-accent/8 text-primary-accent'
                  : 'border-border bg-bg text-text-secondary hover:border-primary-accent hover:text-text-primary'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {totalActive > 0 && (
                <span className="flex h-5 w-5 items-center justify-center bg-primary-accent text-[10px] font-bold text-white">
                  {totalActive}
                </span>
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Results count */}
            <p className="hidden sm:block text-sm text-text-secondary">
              {!loading && meta && (
                <span>
                  <span className="font-semibold text-text-primary">{meta.total}</span> result{meta.total !== 1 ? 's' : ''}
                  {debouncedSearch && <span> for &ldquo;<span className="text-primary-accent">{debouncedSearch}</span>&rdquo;</span>}
                </span>
              )}
            </p>

            <SortDropdown value={sort} onChange={setSort} />
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Active:
              </span>
              {activeChips.map((chip, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 border border-primary-accent/40 bg-primary-accent/6 px-3 py-1 text-xs font-semibold text-primary-accent"
                >
                  {chip.label}
                  <button
                    onClick={chip.clear}
                    className="hover:text-error transition-colors cursor-pointer"
                    aria-label="Remove filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', rating: '' })}
                className="text-xs font-semibold text-error hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Content grid with sidebar */}
          <div className="flex gap-6">
            <FilterSidebar
              filters={filters}
              onChange={handleFiltersChange}
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
            />

            <div className="flex-1 min-w-0">
              {loading ? (
                /* Skeleton grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-border bg-bg flex flex-col">
                      <Skeleton className="h-52 w-full" />
                      <div className="p-4 space-y-2.5">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-5 w-28" />
                        <div className="pt-2 flex gap-2">
                          <Skeleton className="h-10 flex-1" />
                          <Skeleton className="h-10 flex-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              ) : products.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 text-center border border-border bg-bg-card">
                  <div className="h-20 w-20 flex items-center justify-center bg-bg border border-border mb-6">
                    <PackageSearch className="h-10 w-10 text-text-secondary/30" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">No products found</h3>
                  <p className="mt-2 text-sm text-text-secondary max-w-xs">
                    {debouncedSearch
                      ? `No results for "${debouncedSearch}". Try a different term or remove filters.`
                      : 'Try adjusting your filters to find what you\'re looking for.'}
                  </p>
                  {totalActive > 0 && (
                    <button
                      onClick={() => { setFilters({ category: '', minPrice: '', maxPrice: '', rating: '' }); setSearch(''); }}
                      className="mt-6 flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-semibold text-text-primary hover:border-primary-accent hover:text-primary-accent transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      Reset all filters
                    </button>
                  )}
                </div>

              ) : (
                <>
                  {/* Product grid with staggered animation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                    {products.map((product, i) => (
                      <div
                        key={product._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-2">
                      <p className="text-xs text-text-secondary">
                        Page {page} of {meta.totalPages} · {meta.total} products
                      </p>
                      <Pagination page={page} totalPages={meta.totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
