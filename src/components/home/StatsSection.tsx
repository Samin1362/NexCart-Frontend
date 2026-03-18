'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, Users, ShoppingBag, Star } from 'lucide-react';

const stats = [
  { icon: Package,     value: 10,  suffix: 'K+', label: 'Products',      sub: 'Across all categories' },
  { icon: Users,       value: 50,  suffix: 'K+', label: 'Customers',     sub: 'Worldwide & growing' },
  { icon: ShoppingBag, value: 100, suffix: 'K+', label: 'Orders',        sub: 'Delivered on time' },
  { icon: Star,        value: 4.8, suffix: '/5', label: 'Average Rating', sub: 'From verified buyers' },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const isDecimal = target % 1 !== 0;
    const steps = 50;
    const duration = 1600;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(target, increment * step);
      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (step >= steps) { setCount(target); clearInterval(timer); }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, inView]);

  return <span>{count}{suffix}</span>;
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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
              <div
                key={i}
                className="group flex flex-col items-center text-center bg-bg px-6 py-10 transition-colors duration-200 hover:bg-bg-card"
              >
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border bg-bg-card text-primary-accent transition-all duration-300 group-hover:border-primary-accent/40 group-hover:bg-primary-accent/5">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Number */}
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-accent tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
                </p>

                {/* Label */}
                <p className="mt-2 text-sm font-bold text-text-primary">{stat.label}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{stat.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
