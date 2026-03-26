'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X } from 'lucide-react';
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

  const removeItem = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const existing: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = existing.filter((i) => i.slug !== slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems((prev) => prev.filter((i) => i.slug !== slug));
    } catch {
      // ignore storage errors
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3.5 w-3.5 text-text-secondary" />
        <h3 className="text-sm font-bold text-text-primary">Recently Viewed</h3>
        <span className="text-xs text-text-secondary">({items.length})</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <div key={item.slug} className="group relative shrink-0 w-36 h-[168px] border border-border bg-bg-card hover:border-primary-accent transition-colors duration-200">
            {/* Remove button */}
            <button
              onClick={(e) => removeItem(e, item.slug)}
              aria-label={`Remove ${item.title} from recently viewed`}
              className="absolute top-1.5 right-1.5 z-10 h-5 w-5 flex items-center justify-center bg-bg border border-border text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-error hover:border-error hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>

            <Link href={`/products/${item.slug}`} className="flex flex-col h-full">
              {/* Image — fixed height */}
              <div className="relative h-24 w-full shrink-0 bg-bg overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="144px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary/20 text-2xl">
                    📦
                  </div>
                )}
              </div>

              {/* Text — fills remaining height */}
              <div className="flex flex-col justify-between flex-1 px-2.5 py-2">
                <p className="text-[11px] leading-tight text-text-secondary line-clamp-2">{item.title}</p>
                <p className="text-xs font-bold text-primary-accent">{formatPrice(item.price)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
