'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * A faint radial gradient that follows the cursor across the entire page.
 * Automatically disabled on touch / mobile devices.
 */
export default function CursorSpotlight() {
  const [isTouch, setIsTouch] = useState(true); // safe default for SSR

  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);

  // Lagged spring so the spotlight trails the cursor slightly
  const springX = useSpring(cursorX, { damping: 28, stiffness: 180, mass: 0.6 });
  const springY = useSpring(cursorY, { damping: 28, stiffness: 180, mass: 0.6 });

  useEffect(() => {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(touch);
    if (touch) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cursorX, cursorY]);

  if (isTouch) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9997] overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px]"
        style={{
          left: springX,
          top: springY,
          background:
            'radial-gradient(circle at center, rgba(37,99,235,0.055) 0%, rgba(124,58,237,0.025) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}
