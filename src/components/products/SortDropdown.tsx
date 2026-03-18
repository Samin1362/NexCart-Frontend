'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronDown, ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { label: 'Newest First',       value: 'newest',     icon: '🆕' },
  { label: 'Price: Low → High',  value: 'price_asc',  icon: '↑' },
  { label: 'Price: High → Low',  value: 'price_desc', icon: '↓' },
  { label: 'Top Rated',          value: 'rating',     icon: '⭐' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = sortOptions.find((o) => o.value === value) ?? sortOptions[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-12 items-center gap-2 border px-4 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
          open
            ? 'border-primary-accent bg-primary-accent/5 text-primary-accent'
            : 'border-border bg-bg text-text-secondary hover:border-primary-accent hover:text-text-primary'
        )}
      >
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden text-xs">
          <span className="text-text-secondary/70">Sort: </span>
          {current.label.replace('Price: ', '').replace(' First', '').replace(' Rated', '')}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="animate-dropdown-in absolute right-0 top-full mt-1.5 z-50 w-52 border border-border bg-bg py-1 shadow-lg">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer',
                opt.value === value
                  ? 'bg-primary-accent/8 text-primary-accent font-semibold'
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              )}
            >
              <span className="text-base leading-none w-4 text-center">{opt.icon}</span>
              {opt.label}
              {opt.value === value && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
