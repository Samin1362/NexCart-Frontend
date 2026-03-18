'use client';

import { useRef, useEffect } from 'react';
import { Search, X, Command, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, loading = false, resultCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /* Cmd+K / Ctrl+K focuses the search bar */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isSearching = loading && value.length > 0;
  const showCount = !loading && value.length > 0 && resultCount !== undefined;

  return (
    <div className="relative group">
      {/* Search icon */}
      <Search
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 pointer-events-none',
          value ? 'text-primary-accent' : 'text-text-secondary group-focus-within:text-primary-accent'
        )}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, brands, categories…"
        className={cn(
          'h-12 w-full border bg-bg pl-11 pr-32 text-sm text-text-primary',
          'placeholder:text-text-secondary/60',
          'focus:outline-none transition-all duration-200',
          value
            ? 'border-primary-accent ring-2 ring-primary-accent/10'
            : 'border-border focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/10'
        )}
      />

      {/* Right side: dynamic state indicators */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">

        {/* Live result count badge */}
        {showCount && (
          <span className="hidden sm:flex items-center text-[10px] font-bold text-primary-accent bg-primary-accent/10 border border-primary-accent/25 px-2 py-0.5 select-none">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Searching spinner */}
        {isSearching && (
          <Loader2 className="h-4 w-4 text-primary-accent animate-spin" />
        )}

        {/* Clear button */}
        {value && !isSearching ? (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="flex h-6 w-6 items-center justify-center bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-primary-accent transition-all duration-150 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : !value ? (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-text-secondary/40 select-none">
            <span className="flex items-center gap-0.5 border border-border px-1.5 py-0.5 font-mono">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
