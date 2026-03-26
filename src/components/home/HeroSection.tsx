'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ShoppingCart,
  CheckCircle2,
  Zap,
  TrendingUp,
  Package,
  Headphones,
  Watch,
  Laptop,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '@/components/ui/MagneticButton';

const trustItems = [
  { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping', sub: 'On orders over $50' },
  { icon: <Shield className="h-4 w-4" />, label: 'Secure Payments', sub: '256-bit encryption' },
  { icon: <RotateCcw className="h-4 w-4" />, label: 'Easy Returns', sub: '30-day guarantee' },
];

const mockProducts = [
  {
    icon: <Headphones className="h-5 w-5" />,
    title: 'Wireless Headphones',
    price: '$89.99',
    was: '$129.99',
    rating: 4.8,
    reviews: 312,
    badge: '-31%',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: <Watch className="h-5 w-5" />,
    title: 'Smart Watch Pro',
    price: '$199.99',
    was: '$249.99',
    rating: 4.6,
    reviews: 198,
    badge: '-20%',
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: <Laptop className="h-5 w-5" />,
    title: 'Ultra-thin Laptop',
    price: '$799.00',
    was: '$999.00',
    rating: 4.9,
    reviews: 87,
    badge: '-20%',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
];

const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Dell', 'LG', 'Canon', 'Bose', 'Logitech'];

// "Shop Smarter." split into chars for individual animation
const LINE_1 = 'Shop Smarter.'.split('');
const LINE_1_TOTAL_DELAY = 0.15 + LINE_1.length * 0.025;

// Subtext words for word-by-word animation
const SUBTEXT_WORDS =
  'Discover thousands of premium products from top brands — all in one place. Unbeatable prices, fast delivery, and an experience that feels effortless.'.split(
    ' '
  );

export default function HeroSection() {
  // Global scroll Y for parallax
  const { scrollY } = useScroll();

  // Front orb moves up faster → strong depth feeling
  const orb1Y = useTransform(scrollY, [0, 600], [0, -90]);
  // Back orb moves up slower
  const orb2Y = useTransform(scrollY, [0, 600], [0, -45]);
  // Dot grid moves slightly opposite → counter-parallax
  const dotGridY = useTransform(scrollY, [0, 600], [0, 28]);

  return (
    <section className="relative overflow-hidden bg-bg">

      {/* ── Background layers ── */}

      {/* Dot grid with counter-parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: dotGridY }}
      >
        <div className="h-full w-full dot-grid opacity-[0.4]" />
      </motion.div>

      {/* Front orb — blue, moves faster */}
      <motion.div
        className="absolute -top-32 -right-32 pointer-events-none"
        style={{ y: orb1Y }}
      >
        <div
          className="animate-orb-drift h-[600px] w-[600px] opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
        />
      </motion.div>

      {/* Back orb — violet, moves slower */}
      <motion.div
        className="absolute -bottom-40 -left-40 pointer-events-none"
        style={{ y: orb2Y }}
      >
        <div
          className="animate-orb-drift h-[500px] w-[500px] opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', animationDelay: '4s' }}
        />
      </motion.div>

      {/* Center accent orb — static depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 60%)' }}
      />

      {/* Top accent line gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #2563EB 30%, #7C3AED 70%, transparent)' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 items-center min-h-[88vh] py-16 lg:py-0">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pr-12">

            {/* Announcement pill — CSS animation (fast, lightweight) */}
            <div
              className="animate-slide-left mb-7 inline-flex items-center gap-2.5 border border-border bg-bg-card px-4 py-2"
              style={{ animationDelay: '0.05s' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-soft absolute inline-flex h-full w-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-success" />
              </span>
              <span className="text-xs font-medium text-text-secondary">
                Free shipping on orders over <span className="text-text-primary font-semibold">$50</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 border-l border-border pl-2.5 text-[10px] font-semibold text-primary-accent uppercase tracking-wider">
                <Zap className="h-3 w-3" /> New arrivals weekly
              </span>
            </div>

            {/* ── Heading — character-by-character spring animation ── */}
            <h1
              className="max-w-xl text-[2.6rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight text-text-primary"
              style={{ perspective: '600px' }}
            >
              {/* Line 1: each character springs in individually */}
              <span className="block" aria-label="Shop Smarter.">
                {LINE_1.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 24, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 14,
                      stiffness: 280,
                      delay: 0.15 + i * 0.025,
                    }}
                    style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </span>

              {/* Line 2: gradient text animates as a single unit */}
              <motion.span
                className="gradient-text block"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  damping: 14,
                  stiffness: 280,
                  delay: LINE_1_TOTAL_DELAY + 0.05,
                }}
              >
                Live Better.
              </motion.span>
            </h1>

            {/* ── Subtext — word-by-word fade-up ── */}
            <p className="mt-6 max-w-lg text-base sm:text-lg text-text-secondary leading-relaxed">
              {SUBTEXT_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.38 + i * 0.028,
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ display: 'inline-block', marginRight: '0.3em' }}
                >
                  {word}
                </motion.span>
              ))}
            </p>

            {/* CTA buttons */}
            <div
              className="animate-slide-left mt-9 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
              style={{ animationDelay: '0.35s' }}
            >
              <MagneticButton>
                <Link
                  href="/products?sort=-createdAt"
                  className="btn-shimmer group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 px-9 text-sm font-bold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}
                >
                  Browse Products
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/products?discounted=true"
                  className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2 border border-border bg-bg px-9 text-sm font-bold text-text-primary hover:border-primary-accent hover:text-primary-accent transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Deals
                </Link>
              </MagneticButton>
            </div>

            {/* Social proof row */}
            <div
              className="animate-slide-left mt-9 flex items-center gap-5"
              style={{ animationDelay: '0.45s' }}
            >
              {/* Avatar stack */}
              <div className="flex items-center">
                {['#2563EB', '#7C3AED', '#EC4899', '#16A34A'].map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-bg text-[10px] font-bold text-white"
                    style={{ backgroundColor: color, marginLeft: i > 0 ? '-10px' : '0', zIndex: 4 - i }}
                  >
                    {['JD', 'AM', 'SK', 'LR'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                  <span className="ml-1 font-semibold text-text-primary">4.9</span>
                </div>
                <span className="text-text-secondary text-xs">Trusted by 50,000+ shoppers</span>
              </div>
            </div>

            {/* Trust badges with micro-parallax */}
            <div
              className="animate-slide-left mt-10 grid grid-cols-3 gap-3 w-full max-w-lg"
              style={{ animationDelay: '0.55s' }}
            >
              {trustItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center sm:items-start gap-1.5 border border-border bg-bg-card p-3"
                >
                  <span className="text-primary-accent">{item.icon}</span>
                  <span className="text-[11px] font-semibold text-text-primary leading-none">{item.label}</span>
                  <span className="text-[10px] text-text-secondary leading-none hidden sm:block">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Visual Showcase ── */}
          <div
            className="animate-slide-right relative hidden lg:flex items-center justify-center"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Background glow behind card */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, #2563EB 0%, transparent 65%)' }}
            />

            {/* ── Main product panel ── */}
            <div className="animate-float relative w-[340px] border border-border bg-bg shadow-2xl z-10">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center bg-primary-accent text-white">
                    <Zap className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">NexCart Store</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping-soft absolute inline-flex h-full w-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-success" />
                  </span>
                  <span className="text-[10px] text-success font-medium">Live</span>
                </div>
              </div>

              {/* Products list */}
              <div className="divide-y divide-border">
                {mockProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-card transition-colors">
                    <div className={`h-10 w-10 shrink-0 flex items-center justify-center ${p.color}`}>
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{p.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            className={`h-2.5 w-2.5 ${si < Math.round(p.rating) ? 'fill-secondary text-secondary' : 'fill-border text-border'}`}
                          />
                        ))}
                        <span className="text-[9px] text-text-secondary ml-0.5">({p.reviews})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-text-primary">{p.price}</p>
                      <p className="text-[9px] text-text-secondary line-through">{p.was}</p>
                      <span className="mt-0.5 inline-block px-1.5 py-[1px] bg-error text-white text-[8px] font-bold">
                        {p.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-bg-card">
                <span className="text-[10px] text-text-secondary">10,000+ products available</span>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-accent">
                  <Package className="h-3 w-3" />
                  Browse All
                </div>
              </div>
            </div>

            {/* ── Floating: Order Confirmed toast ── */}
            <div
              className="animate-pop-in animate-float-reverse absolute -top-4 -right-6 flex items-center gap-2.5 border border-border bg-bg px-3.5 py-2.5 shadow-lg z-20 w-[190px]"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-success/10 text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-primary">Order Confirmed!</p>
                <p className="text-[9px] text-text-secondary">Ships in 24 hours</p>
              </div>
            </div>

            {/* ── Floating: Cart summary chip ── */}
            <div
              className="animate-pop-in animate-float absolute -bottom-4 -left-8 flex items-center gap-2.5 border border-border bg-bg px-3.5 py-2.5 shadow-lg z-20"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-text-secondary" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-primary-accent text-[8px] font-bold text-white rounded-full">3</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-primary">3 items in cart</p>
                <p className="text-[9px] text-text-secondary">$389.97 total</p>
              </div>
            </div>

            {/* ── Floating: Rating chip ── */}
            <div
              className="animate-pop-in animate-float-slow absolute top-1/2 -right-10 -translate-y-1/2 flex items-center gap-2 border border-border bg-bg px-3 py-2 shadow-lg z-20"
              style={{ animationDelay: '1.0s' }}
            >
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <div>
                <p className="text-[10px] font-bold text-text-primary">4.9 / 5.0</p>
                <p className="text-[9px] text-text-secondary">50K+ reviews</p>
              </div>
            </div>

            {/* ── Floating: Discount badge ── */}
            <div
              className="animate-pop-in animate-float absolute top-12 -left-6 z-20 border border-border bg-bg px-3 py-2 shadow-lg"
              style={{ animationDelay: '1.1s' }}
            >
              <p className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Today&apos;s deal</p>
              <p className="text-sm font-extrabold" style={{ color: '#DC2626' }}>Up to 70% off</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand ticker ── */}
      <div className="relative border-t border-border overflow-hidden bg-bg-card">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
          style={{ background: 'linear-gradient(to right, var(--bg-card), transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
          style={{ background: 'linear-gradient(to left, var(--bg-card), transparent)' }} />

        {/* Row 1 — scrolls left */}
        <div className="flex overflow-hidden border-b border-border/50 py-3">
          <div className="animate-ticker flex shrink-0 items-center">
            {[...brands, ...brands, ...brands].map((brand, i) => (
              <span key={i} className="shrink-0 flex items-center gap-4 px-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/50 whitespace-nowrap hover:text-primary-accent transition-colors duration-300 cursor-default">
                  {brand}
                </span>
                <span className="h-1 w-1 bg-border flex-shrink-0" />
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right (reverse) */}
        <div className="flex overflow-hidden py-3">
          <div
            className="animate-ticker flex shrink-0 items-center"
            style={{ animationDirection: 'reverse', animationDuration: '22s' }}
          >
            {[...brands, ...brands, ...brands].map((brand, i) => (
              <span key={i} className="shrink-0 flex items-center gap-4 px-4">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em] whitespace-nowrap cursor-default"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    opacity: 0.35,
                  }}
                >
                  {brand}
                </span>
                <span className="h-1 w-1 bg-primary-accent/20 flex-shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
