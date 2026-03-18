'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RecentlyViewedItem {
  slug: string;
  title: string;
  image: string;
  price: number;
}

const STORAGE_KEY = 'nexcart-recently-viewed';
const MAX_ITEMS = 6;

export function saveRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === 'undefined') return;
  try {
    const existing: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((i) => i.slug !== item.slug);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export default function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentlyViewedItem[];
      const filtered = excludeSlug ? stored.filter((i) => i.slug !== excludeSlug) : stored;
      setItems(filtered.slice(0, MAX_ITEMS));
    } catch {
      // ignore
    }
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3.5 w-3.5 text-text-secondary" />
        <h3 className="text-sm font-bold text-text-primary">Recently Viewed</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="group shrink-0 w-28 border border-border bg-bg hover:border-primary-accent transition-all duration-200 overflow-hidden"
          >
            <div className="relative h-20 w-full bg-bg-card overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="112px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-bg-card text-text-secondary/20 text-2xl">
                  📦
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-[10px] text-text-secondary line-clamp-2 leading-tight">{item.title}</p>
              <p className="text-[11px] font-bold text-primary-accent mt-1">{formatPrice(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
