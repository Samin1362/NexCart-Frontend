'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

// Exponential-decay easing: accelerates instantly, decelerates naturally.
function easeExpoOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Routes where Lenis should NOT run.
// These pages use an internal scroll container (overflow-y-auto on a child),
// not window scroll. Lenis intercepts wheel events at window level and
// prevents them from reaching the inner container, breaking scroll entirely.
const LENIS_DISABLED_PREFIXES = ['/dashboard'];

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  const isDisabled = LENIS_DISABLED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  useEffect(() => {
    // Destroy any existing instance when navigating to a disabled route
    if (isDisabled) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: easeExpoOut,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isDisabled]);

  // Scroll to top on every public route change
  useEffect(() => {
    if (isDisabled) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, isDisabled]);

  return <>{children}</>;
}
