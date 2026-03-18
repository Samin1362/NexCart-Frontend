'use client';

import { useRef } from 'react';
import { Search, X, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          'h-12 w-full border bg-bg pl-11 pr-24 text-sm text-text-primary',
          'placeholder:text-text-secondary/60',
          'focus:outline-none transition-all duration-200',
          value
            ? 'border-primary-accent ring-2 ring-primary-accent/10'
            : 'border-border focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/10'
        )}
      />

      {/* Right side: clear button or keyboard hint */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value ? (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="flex h-6 w-6 items-center justify-center bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-primary-accent transition-all duration-150 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-text-secondary/40 select-none">
            <span className="flex items-center gap-0.5 border border-border px-1.5 py-0.5 font-mono">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
