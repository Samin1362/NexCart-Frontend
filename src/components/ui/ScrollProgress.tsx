'use client';

import { useScroll, useTransform, motion } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)',
      }}
    />
  );
}
