'use client';

import { useEffect, useState } from 'react';
import { Star, X, SlidersHorizontal, Tag, DollarSign, LayoutGrid } from 'lucide-react';

const PRICE_MAX = 5000;
import api from '@/lib/api';
import { ICategory } from '@/types';
import { cn } from '@/lib/utils';

interface Filters {
  category: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  open: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ filters, onChange, open, onClose }: FilterSidebarProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]));
  }, []);

  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const clearAll = () =>
    onChange({ category: '', minPrice: '', maxPrice: '', rating: '' });

  const hasFilters = filters.category || filters.minPrice || filters.maxPrice || filters.rating;
  const activeCount = [filters.category, filters.minPrice || filters.maxPrice, filters.rating]
    .filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-accent" />
          <span className="text-sm font-bold text-text-primary">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center bg-primary-accent text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[11px] font-semibold text-error hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="h-3.5 w-3.5 text-text-secondary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Category</h4>
        </div>
        <div className="space-y-0.5">
          {/* All categories option */}
          <button
            onClick={() => update('category', '')}
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-sm transition-all duration-150 cursor-pointer border-l-2',
              !filters.category
                ? 'border-primary-accent bg-primary-accent/6 text-primary-accent font-semibold'
                : 'border-transparent text-text-secondary hover:bg-bg-card hover:text-text-primary'
            )}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => update('category', filters.category === cat.slug ? '' : cat.slug)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm transition-all duration-150 cursor-pointer border-l-2',
                filters.category === cat.slug
                  ? 'border-primary-accent bg-primary-accent/6 text-primary-accent font-semibold'
                  : 'border-transparent text-text-secondary hover:bg-bg-card hover:text-text-primary'
              )}
            >
              <span>{cat.name}</span>
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5',
                filters.category === cat.slug
                  ? 'bg-primary-accent text-white'
                  : 'bg-bg-card text-text-secondary'
              )}>
                {cat.productCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-3.5 w-3.5 text-text-secondary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Price Range</h4>
        </div>

        {/* Current range display */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-primary-accent bg-primary-accent/8 border border-primary-accent/20 px-2 py-0.5">
            ${(Number(filters.minPrice) || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-text-secondary">–</span>
          <span className="text-xs font-semibold text-primary-accent bg-primary-accent/8 border border-primary-accent/20 px-2 py-0.5">
            {filters.maxPrice ? `$${Number(filters.maxPrice).toLocaleString()}` : `$${PRICE_MAX.toLocaleString()}+`}
          </span>
        </div>

        {/* Dual range slider */}
        <div className="relative h-5 flex items-center mb-4 mx-1">
          {/* Track background */}
          <div className="absolute inset-x-0 h-1 bg-border" />
          {/* Active range highlight */}
          <div
            className="absolute h-1 bg-primary-accent"
            style={{
              left: `${((Number(filters.minPrice) || 0) / PRICE_MAX) * 100}%`,
              right: `${100 - ((Number(filters.maxPrice) || PRICE_MAX) / PRICE_MAX) * 100}%`,
            }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={50}
            value={Number(filters.minPrice) || 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              const maxVal = Number(filters.maxPrice) || PRICE_MAX;
              if (val < maxVal) update('minPrice', val === 0 ? '' : String(val));
            }}
            className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:border-radius-full [&::-moz-range-thumb]:bg-primary-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg [&::-moz-range-thumb]:cursor-grab"
            style={{ zIndex: (Number(filters.minPrice) || 0) > PRICE_MAX - 200 ? 5 : 3 }}
          />
          {/* Max thumb */}
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={50}
            value={Number(filters.maxPrice) || PRICE_MAX}
            onChange={(e) => {
              const val = Number(e.target.value);
              const minVal = Number(filters.minPrice) || 0;
              if (val > minVal) update('maxPrice', val === PRICE_MAX ? '' : String(val));
            }}
            className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:bg-primary-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg [&::-moz-range-thumb]:cursor-grab"
            style={{ zIndex: 4 }}
          />
        </div>
        {/* Quick price ranges */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[['0','50'],['50','150'],['150','500'],['500','']].map(([min, max], i) => {
            const label = max ? `$${min}–$${max}` : `$${min}+`;
            const active = filters.minPrice === min && filters.maxPrice === max;
            return (
              <button
                key={i}
                onClick={() => onChange({ ...filters, minPrice: active ? '' : min, maxPrice: active ? '' : max })}
                className={cn(
                  'px-2.5 py-1 text-[10px] font-semibold border transition-all duration-150 cursor-pointer',
                  active
                    ? 'border-primary-accent bg-primary-accent text-white'
                    : 'border-border text-text-secondary hover:border-primary-accent hover:text-primary-accent'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-3.5 w-3.5 text-text-secondary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Min Rating</h4>
        </div>
        <div className="space-y-0.5">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => update('rating', filters.rating === String(r) ? '' : String(r))}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-sm transition-all duration-150 cursor-pointer border-l-2',
                filters.rating === String(r)
                  ? 'border-primary-accent bg-primary-accent/6 text-primary-accent font-semibold'
                  : 'border-transparent text-text-secondary hover:bg-bg-card hover:text-text-primary'
              )}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn('h-3.5 w-3.5', i < r ? 'fill-secondary text-secondary' : 'fill-border text-border')}
                  />
                ))}
              </div>
              <span className="text-[12px]">{r}+ stars</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 border border-border bg-bg overflow-hidden">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-bg border-r border-border lg:hidden',
          'flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary-accent" />
            <span className="text-sm font-bold text-text-primary">Filters</span>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center bg-primary-accent text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary border border-border hover:border-primary-accent transition-all cursor-pointer"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FilterContent />
        </div>

        {/* Mobile apply button */}
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 bg-primary-accent text-white text-sm font-bold hover:bg-primary-accent/90 transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
