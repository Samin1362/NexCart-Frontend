'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, LayoutGrid,
  Laptop, Smartphone, Shirt, Dumbbell, BookOpen, Home,
  Sparkles, Gamepad2, Car, Camera, Watch, PawPrint,
  ShoppingBag, HeadphonesIcon, Utensils, Gem,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import api from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import RevealText from '@/components/ui/RevealText';
import { ICategory } from '@/types';

/* ── Category icon lookup ── */
type LucideIcon = React.ComponentType<{ className?: string }>;

const ICON_MAP: Array<{ keys: string[]; Icon: LucideIcon }> = [
  { keys: ['electronic', 'laptop', 'computer', 'pc'],   Icon: Laptop },
  { keys: ['phone', 'mobile', 'smartphone'],             Icon: Smartphone },
  { keys: ['fashion', 'cloth', 'shirt', 'wear', 'apparel'], Icon: Shirt },
  { keys: ['sport', 'fitness', 'gym', 'exercise'],       Icon: Dumbbell },
  { keys: ['book', 'education', 'study'],                Icon: BookOpen },
  { keys: ['home', 'furniture', 'decor'],                Icon: Home },
  { keys: ['kitchen', 'cook', 'food', 'dining'],         Icon: Utensils },
  { keys: ['beauty', 'cosmetic', 'makeup', 'skincare'],  Icon: Sparkles },
  { keys: ['gaming', 'game', 'console', 'video'],        Icon: Gamepad2 },
  { keys: ['auto', 'car', 'vehicle', 'motor'],           Icon: Car },
  { keys: ['camera', 'photo', 'photography'],            Icon: Camera },
  { keys: ['watch', 'clock', 'timepiece'],               Icon: Watch },
  { keys: ['jewelry', 'jewel', 'gem', 'accessory'],      Icon: Gem },
  { keys: ['audio', 'headphone', 'speaker', 'music'],    Icon: HeadphonesIcon },
  { keys: ['pet', 'animal', 'dog', 'cat'],               Icon: PawPrint },
];

function getCategoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const { keys, Icon } of ICON_MAP) {
    if (keys.some((k) => lower.includes(k))) return Icon;
  }
  return ShoppingBag;
}

/* ── 3-D tilt card ── */
function CategoryCard({ category, index }: { category: ICategory; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useTransform(my, [-0.5, 0.5], [9, -9]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-9, 9]);
  const gx      = useTransform(mx, [-0.5, 0.5], ['20%', '80%']);
  const gy      = useTransform(my, [-0.5, 0.5], ['20%', '80%']);

  const springCfg = { damping: 22, stiffness: 320 };
  const srx = useSpring(rotateX, springCfg);
  const sry = useSpring(rotateY, springCfg);
  const sgx = useSpring(gx, springCfg);
  const sgy = useSpring(gy, springCfg);

  const Icon = getCategoryIcon(category.name);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  // Each card flies in from a different compass direction
  const directions = [
    { x: -60, y: -40 }, { x: 0, y: -60 }, { x: 60, y: -40 }, { x: 60, y: 0 },
    { x: 60, y: 40 },   { x: 0, y: 60 },  { x: -60, y: 40 }, { x: -60, y: 0 },
  ];
  const dir = directions[index % directions.length];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: dir.x, y: dir.y, scale: 0.88 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, delay: index * 0.06 }}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <Link
        href={`/products?category=${category.slug}`}
        className="relative flex flex-col items-center text-center overflow-hidden border border-border bg-bg-card transition-all duration-300 group-hover:border-primary-accent/50 group-hover:shadow-[0_8px_32px_rgba(37,99,235,0.12)]"
      >
        {/* Top accent strip */}
        <div className="h-[3px] w-full bg-border transition-all duration-300 group-hover:bg-primary-accent" />

        {/* Dynamic shine overlay — follows mouse */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${sgx}px ${sgy}px, rgba(37,99,235,0.08), transparent 65%)`,
          }}
        />

        {/* Icon */}
        <div className="mt-6 mb-4 flex h-16 w-16 items-center justify-center border border-border bg-bg transition-all duration-300 group-hover:border-primary-accent/40 group-hover:bg-primary-accent/5"
          style={{ transform: 'translateZ(20px)' }}
        >
          <Icon className="h-7 w-7 text-text-secondary transition-colors duration-300 group-hover:text-primary-accent" />
        </div>

        {/* Name */}
        <h3
          className="px-4 text-sm font-bold text-text-primary leading-tight transition-colors duration-200 group-hover:text-primary-accent"
          style={{ transform: 'translateZ(12px)' }}
        >
          {category.name}
        </h3>

        {/* Product count */}
        <p className="mt-1 mb-4 text-xs text-text-secondary">
          {category.productCount.toLocaleString()}{' '}
          {category.productCount === 1 ? 'product' : 'products'}
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-1 mb-5 text-[11px] font-semibold text-primary-accent opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          Shop now <ArrowRight className="h-3 w-3" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Section ── */
export default function CategoriesSection() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white">
                <LayoutGrid className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-accent">Browse</span>
            </div>
            <RevealText delay={0.05}>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Shop by Category</h2>
            </RevealText>
            <RevealText delay={0.1}>
              <p className="mt-1.5 text-sm text-text-secondary">
                Find exactly what you need across our curated collections.
              </p>
            </RevealText>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent hover:gap-2.5 transition-all duration-200"
          >
            All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category, i) => (
              <CategoryCard key={category._id} category={category} index={i} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-accent"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
