'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { fetchWishlist, toggleWishlistItem, removeWishlistItem, clearWishlistApi } from '@/lib/api';
import { IProduct, WishlistContextType } from '@/types';

const GUEST_KEY = 'nexcart-wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// ── localStorage helpers (guest mode) ──────────────────────────────────────
function loadGuestIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuestIds(ids: string[]): void {
  localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
}

// ── Provider ────────────────────────────────────────────────────────────────
export default function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<IProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch fresh wishlist from backend and sync state
  const fetchFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchWishlist();
      const items: IProduct[] = data.data.wishlist;
      setWishlistItems(items);
      setWishlistIds(new Set(items.map((p) => p._id)));
    } catch {
      setWishlistItems([]);
      setWishlistIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On auth state change — fetch backend data (and merge any guest items on login)
  useEffect(() => {
    if (!user) {
      // Guest mode: populate wishlistIds from localStorage; no product data available
      setWishlistItems([]);
      setWishlistIds(new Set(loadGuestIds()));
      return;
    }

    // Authenticated: fetch backend wishlist, then merge guest items if any
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await fetchWishlist();
        const items: IProduct[] = data.data.wishlist;
        const serverIds = new Set(items.map((p) => p._id));

        const guestIds = loadGuestIds();
        const toMerge = guestIds.filter((id) => !serverIds.has(id));

        if (toMerge.length > 0) {
          // Merge guest items into the backend (fire and forget failures)
          await Promise.allSettled(toMerge.map((id) => toggleWishlistItem(id)));
          localStorage.removeItem(GUEST_KEY);
          // Re-fetch to get the final accurate + populated state
          await fetchFromBackend();
        } else {
          localStorage.removeItem(GUEST_KEY);
          setWishlistItems(items);
          setWishlistIds(serverIds);
        }
      } catch {
        setWishlistItems([]);
        setWishlistIds(new Set());
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, fetchFromBackend]);

  // Toggle add/remove with optimistic update
  const toggleWishlist = async (product: IProduct): Promise<void> => {
    const id = product._id;
    const currentlyWishlisted = wishlistIds.has(id);

    // Optimistic update
    if (currentlyWishlisted) {
      setWishlistIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setWishlistItems((prev) => prev.filter((p) => p._id !== id));
    } else {
      setWishlistIds((prev) => new Set(prev).add(id));
      setWishlistItems((prev) => [...prev, product]);
    }

    if (!user) {
      // Guest mode: persist change to localStorage
      const ids = loadGuestIds();
      saveGuestIds(currentlyWishlisted ? ids.filter((i) => i !== id) : [...ids, id]);
      return;
    }

    // Authenticated: sync with backend; revert on failure
    try {
      await toggleWishlistItem(id);
    } catch {
      if (currentlyWishlisted) {
        setWishlistIds((prev) => new Set(prev).add(id));
        setWishlistItems((prev) => [...prev, product]);
      } else {
        setWishlistIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        setWishlistItems((prev) => prev.filter((p) => p._id !== id));
      }
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    // Optimistic update
    setWishlistIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    setWishlistItems((prev) => prev.filter((p) => p._id !== productId));

    if (!user) {
      saveGuestIds(loadGuestIds().filter((id) => id !== productId));
      return;
    }

    try {
      await removeWishlistItem(productId);
    } catch {
      // Re-fetch to restore accurate state on error
      await fetchFromBackend();
    }
  };

  const clearWishlist = async (): Promise<void> => {
    setWishlistItems([]);
    setWishlistIds(new Set());

    if (!user) {
      localStorage.removeItem(GUEST_KEY);
      return;
    }

    try {
      await clearWishlistApi();
    } catch {
      await fetchFromBackend();
    }
  };

  const isWishlisted = (productId: string): boolean => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        wishlistCount: wishlistIds.size,
        isLoading,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
