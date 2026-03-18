'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, ShoppingCart, Minus, Plus, ArrowLeft,
  Package, Truck, Shield, RotateCcw, Tag,
  ChevronLeft, ChevronRight, Zap, Check,
  Sparkles, BadgeCheck, Eye,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ReviewSection from '@/components/products/ReviewSection';
import { saveRecentlyViewed } from '@/components/products/RecentlyViewed';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { IProduct, ICategory } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

type TabId = 'description' | 'specs' | 'reviews';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgErrors, setImgErrors] = useState<boolean[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        const p = data.data as IProduct;
        setProduct(p);
        // Save to recently-viewed strip
        saveRecentlyViewed({
          slug,
          title: p.title,
          image: p.images?.[0] || '',
          price: p.discountPrice || p.price,
        });
        setQuantity(1);
        setSelectedImage(0);
        setImgErrors(new Array(p.images?.length || 0).fill(false));

        const categoryId = typeof p.category === 'object' ? (p.category as ICategory)._id : p.category;
        if (categoryId) {
          const categorySlug = typeof p.category === 'object' ? (p.category as ICategory).slug : '';
          if (categorySlug) {
            const { data: related } = await api.get(`/products?category=${categorySlug}&limit=5`);
            setRelatedProducts(
              (related.data || []).filter((rp: IProduct) => rp._id !== p._id).slice(0, 4)
            );
          }
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleImgError = (i: number) => {
    setImgErrors((prev) => { const next = [...prev]; next[i] = true; return next; });
  };

  const handleAddToCart = async () => {
    if (!user || adding || !product || product.stock === 0) return;
    setAdding(true);
    try {
      await addItem(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  const goImage = (dir: 1 | -1) => {
    if (!product) return;
    setSelectedImage((prev) =>
      Math.max(0, Math.min(product.images.length - 1, prev + dir))
    );
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-4 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Skeleton className="h-[420px] w-full" />
                <div className="flex gap-2">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-16" />)}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <Package className="h-20 w-20 text-border mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-text-primary">Product not found</h2>
            <p className="mt-2 text-text-secondary">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-accent hover:gap-3 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const category = typeof product.category === 'object' ? product.category : null;
  const inStock = product.stock > 0;
  const currentImageUrl = product.images?.[selectedImage];
  const currentImageValid = currentImageUrl && !imgErrors[selectedImage];

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications', count: product.specifications?.length },
    { id: 'reviews', label: 'Reviews', count: product.reviewCount },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-8 flex-wrap">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link href="/products" className="hover:text-text-primary transition-colors">Products</Link>
            {category && (
              <>
                <span className="text-border">/</span>
                <Link href={`/products?category=${category.slug}`} className="hover:text-text-primary transition-colors">
                  {category.name}
                </Link>
              </>
            )}
            <span className="text-border">/</span>
            <span className="text-text-primary font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

            {/* ── LEFT: Image Gallery ── */}
            <div className="space-y-3">

              {/* Main image */}
              <div className="group relative h-[380px] sm:h-[440px] border border-border bg-bg-card overflow-hidden">
                {currentImageValid ? (
                  <Image
                    src={currentImageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition-all duration-500"
                    priority
                    onError={() => handleImgError(selectedImage)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-card">
                    <Package className="h-16 w-16 text-border" />
                    <span className="text-xs text-text-secondary/50 uppercase tracking-widest">No Image</span>
                  </div>
                )}

                {/* Nav arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => goImage(-1)}
                      disabled={selectedImage === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center bg-bg border border-border text-text-secondary hover:text-text-primary hover:border-primary-accent opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => goImage(1)}
                      disabled={selectedImage === product.images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center bg-bg border border-border text-text-secondary hover:text-text-primary hover:border-primary-accent opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-10 bg-bg/80 border border-border px-2.5 py-1 text-[10px] font-semibold text-text-secondary">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-error text-white text-[11px] font-bold">
                    -{discount}% OFF
                  </div>
                )}

                {/* Featured badge */}
                {product.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-secondary text-white text-[11px] font-bold">
                    <Zap className="h-3 w-3" />
                    Featured
                  </div>
                )}

                {/* Out of stock overlay */}
                {!inStock && (
                  <div className="absolute inset-0 bg-bg/75 flex items-center justify-center z-10">
                    <span className="border border-border bg-bg px-4 py-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'relative h-16 w-16 shrink-0 border-2 overflow-hidden bg-bg-card transition-all duration-200 cursor-pointer',
                        selectedImage === i
                          ? 'border-primary-accent'
                          : 'border-border opacity-60 hover:opacity-100 hover:border-text-secondary/50'
                      )}
                      aria-label={`View image ${i + 1}`}
                    >
                      {img && !imgErrors[i] ? (
                        <Image
                          src={img}
                          alt={`${product.title} ${i + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          onError={() => handleImgError(i)}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-5 w-5 text-border" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Dot indicators on mobile */}
              {product.images.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:hidden">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'h-1.5 transition-all duration-200',
                        selectedImage === i ? 'w-5 bg-primary-accent' : 'w-1.5 bg-border'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className="flex flex-col gap-5">

              {/* Category + badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-[11px] font-bold uppercase tracking-widest text-primary-accent hover:underline"
                  >
                    {category.name}
                  </Link>
                )}
                {product.isFeatured && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wide">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                )}
                {inStock && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wide">
                    <BadgeCheck className="h-3 w-3" /> In Stock
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight">
                {product.title}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating)
                          ? 'fill-secondary text-secondary'
                          : i < product.rating
                          ? 'fill-secondary/40 text-secondary/40'
                          : 'fill-border text-border'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {product.rating > 0 ? product.rating.toFixed(1) : '—'}
                </span>
                <span className="text-sm text-text-secondary">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
                {product.sold > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className="text-sm text-text-secondary flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {product.sold.toLocaleString()} sold
                    </span>
                  </>
                )}
              </div>

              {/* Price block */}
              <div className="border-y border-border py-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-text-primary">
                    {formatPrice(displayPrice)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg text-text-secondary line-through font-medium">
                        {formatPrice(product.price)}
                      </span>
                      <span className="px-2.5 py-0.5 bg-error text-white text-xs font-bold">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
                {discount > 0 && (
                  <p className="mt-1 text-sm text-success font-medium">
                    You save {formatPrice(product.price - product.discountPrice)}
                  </p>
                )}
              </div>

              {/* Brand + Meta row */}
              <div className="flex items-center gap-5 flex-wrap text-sm">
                {product.brand && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-text-secondary">Brand:</span>
                    <span className="font-semibold text-text-primary">{product.brand}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="text-text-secondary">Stock:</span>
                  <span className={cn('font-semibold', inStock ? 'text-success' : 'text-error')}>
                    {inStock ? `${product.stock} units` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Quantity + CTA */}
              {inStock && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Qty */}
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-11 w-11 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="h-11 w-12 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="h-11 w-11 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* CTA */}
                    {user ? (
                      <button
                        onClick={handleAddToCart}
                        disabled={adding || added}
                        className={cn(
                          'btn-shimmer flex flex-1 min-w-[160px] items-center justify-center gap-2 h-11 text-sm font-bold text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed',
                          added ? 'bg-success' : 'bg-primary-accent hover:bg-primary-accent/90'
                        )}
                      >
                        {adding ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding…
                          </>
                        ) : added ? (
                          <>
                            <Check className="h-4 w-4" />
                            Added to Cart!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="flex flex-1 min-w-[160px] items-center justify-center gap-2 h-11 bg-primary-accent text-sm font-bold text-white hover:bg-primary-accent/90 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Login to Purchase
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Trust cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping', sub: 'Orders over $50' },
                  { icon: <Shield className="h-4 w-4" />, label: 'Secure Payment', sub: '256-bit SSL' },
                  { icon: <RotateCcw className="h-4 w-4" />, label: 'Easy Returns', sub: '30-day policy' },
                ].map((t, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1.5 border border-border bg-bg-card p-3">
                    <span className="text-primary-accent">{t.icon}</span>
                    <span className="text-[11px] font-semibold text-text-primary leading-tight">{t.label}</span>
                    <span className="text-[10px] text-text-secondary hidden sm:block leading-tight">{t.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-14 border-t border-border">
            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-b-2 -mb-px',
                    activeTab === tab.id
                      ? 'border-primary-accent text-primary-accent'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={cn(
                      'flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] font-bold',
                      activeTab === tab.id
                        ? 'bg-primary-accent text-white'
                        : 'bg-bg-card text-text-secondary'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div className="py-8">

              {/* Description */}
              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-text-secondary leading-relaxed text-[15px]">
                    {product.description}
                  </p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 border border-border text-xs text-text-secondary hover:border-primary-accent hover:text-primary-accent transition-colors cursor-default"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specs' && (
                <div className="max-w-2xl">
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="border border-border overflow-hidden">
                      {product.specifications.map((spec, i) => (
                        <div
                          key={i}
                          className={cn(
                            'grid grid-cols-5 gap-0',
                            i > 0 && 'border-t border-border',
                            i % 2 === 0 ? 'bg-bg' : 'bg-bg-card'
                          )}
                        >
                          <div className="col-span-2 px-5 py-3 text-sm font-semibold text-text-primary border-r border-border">
                            {spec.key}
                          </div>
                          <div className="col-span-3 px-5 py-3 text-sm text-text-secondary">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">No specifications available.</p>
                  )}
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <ReviewSection productId={product._id} />
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div className="mt-4 border-t border-border pt-10">
              <div className="flex items-end justify-between mb-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-accent mb-1">You may also like</p>
                  <h2 className="text-xl font-bold text-text-primary">Related Products</h2>
                </div>
                <Link
                  href={category ? `/products?category=${category.slug}` : '/products'}
                  className="text-sm font-semibold text-primary-accent hover:underline hidden sm:block"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedProducts.map((rp) => (
                  <ProductCard key={rp._id} product={rp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
