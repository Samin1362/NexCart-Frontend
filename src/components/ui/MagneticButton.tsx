'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum pixel offset toward cursor (default 8) */
  strength?: number;
  /** Mouse detection radius in px (default 80) */
  radius?: number;
}

/**
 * Wraps any button/link so it magnetically follows the cursor
 * when hovered within `radius` pixels, then springs back on leave.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 8,
  radius = 80,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 15, stiffness: 200, mass: 0.5 });
  const sy = useSpring(y, { damping: 15, stiffness: 200, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < radius) {
      const pull = (1 - dist / radius) * strength;
      x.set((dx / dist) * pull);
      y.set((dy / dist) * pull);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
