'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, Users, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

type StatItem = { icon: typeof Package; value: number; suffix: string; label: string; sub: string };

const defaultStats: StatItem[] = [
  { icon: Package,     value: 10,  suffix: 'K+', label: 'Products',       sub: 'Across all categories' },
  { icon: Users,       value: 50,  suffix: 'K+', label: 'Happy Customers', sub: 'Worldwide & growing' },
  { icon: ShoppingBag, value: 100, suffix: 'K+', label: 'Orders',          sub: 'Delivered on time' },
  { icon: Star,        value: 4.8, suffix: '/5', label: 'Average Rating',  sub: 'From verified buyers' },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const isDecimal = target % 1 !== 0;
    // Overshoot to 108% of target then settle back — spring feel
    const overshoot = target * 1.08;
    const totalSteps = 70;
    const duration = 1800;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      let value: number;

      if (progress < 0.72) {
        // Accelerate up to overshoot (ease-out cubic)
        const p = progress / 0.72;
        value = overshoot * (1 - Math.pow(1 - p, 3));
      } else {
        // Settle back to target
        const p = (progress - 0.72) / 0.28;
        value = overshoot - (overshoot - target) * p;
      }

      setCount(isDecimal ? parseFloat(Math.max(0, value).toFixed(1)) : Math.round(Math.max(0, value)));
      if (step >= totalSteps) { setCount(target); clearInterval(timer); }
    }, duration / totalSteps);

    return () => clearInterval(timer);
  }, [target, inView]);

  return <span>{count}{suffix}</span>;
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [stats, setStats] = useState<StatItem[]>(defaultStats);

  useEffect(() => {
    api.get('/products?limit=1')
      .then(({ data }) => {
        const total: number = data?.meta?.total ?? 0;
        if (total > 0) {
          setStats(prev => prev.map((s, i) =>
            i === 0
              ? { ...s, value: total, suffix: '', label: 'Products', sub: `In ${total} listings` }
              : s
          ));
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 sm:py-16 bg-bg border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                className="group flex flex-col items-center text-center bg-bg px-6 py-10 transition-colors duration-200 hover:bg-bg-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ type: 'spring', damping: 20, stiffness: 200, delay: i * 0.1 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border bg-bg-card text-primary-accent transition-all duration-300 group-hover:border-primary-accent/40 group-hover:bg-primary-accent/5">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-accent tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
                </p>
                <p className="mt-2 text-sm font-bold text-text-primary">{stat.label}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
