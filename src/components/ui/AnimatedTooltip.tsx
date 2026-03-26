'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

/**
 * Wraps any element with an animated tooltip that springs in/out.
 * Uses spring physics instead of a CSS transition for a premium feel.
 */
export default function AnimatedTooltip({
  content,
  children,
  position = 'top',
}: AnimatedTooltipProps) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
  };
  const hide = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 80);
  };

  const isTop = position === 'top';
  const initY = isTop ? 6 : -6;
  const activeY = isTop ? -6 : 6;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: initY }}
            animate={{ opacity: 1, scale: 1, y: activeY }}
            exit={{ opacity: 0, scale: 0.82, y: initY }}
            transition={{ type: 'spring', damping: 22, stiffness: 420 }}
            className={[
              'absolute z-[9990] whitespace-nowrap pointer-events-none',
              'left-1/2 -translate-x-1/2',
              isTop ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            ].join(' ')}
          >
            <div className="relative bg-text-primary text-bg text-[10px] font-semibold px-2.5 py-1.5 tracking-wide leading-none">
              {content}
              {/* Arrow */}
              <span
                className={[
                  'absolute left-1/2 -translate-x-1/2 block w-0 h-0',
                  isTop
                    ? 'top-full border-x-[5px] border-x-transparent border-t-[5px] border-t-text-primary'
                    : 'bottom-full border-x-[5px] border-x-transparent border-b-[5px] border-b-text-primary',
                ].join(' ')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
