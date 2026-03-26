'use client';

import { motion } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  delay?: number;
  /** Applied to the outer overflow-hidden wrapper */
  className?: string;
}

/**
 * Wraps children in an overflow-hidden container and slides content up
 * from behind the clip mask — creating a "line reveal" effect.
 */
export default function RevealText({ children, delay = 0, className = '' }: RevealTextProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '105%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
