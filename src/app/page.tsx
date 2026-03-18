'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealsSection from '@/components/home/DealsSection';
import StatsSection from '@/components/home/StatsSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BackToTop from '@/components/ui/BackToTop';

// Lazy-load below-fold sections for faster initial page load
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
  loading: () => (
    <div className="py-16 sm:py-24 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 border border-border bg-bg-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  ),
});

const NewsletterSection = dynamic(() => import('@/components/home/NewsletterSection'), {
  loading: () => <div className="h-72 border-t border-border animate-pulse" style={{ background: 'linear-gradient(135deg, #1e3a8a, #312e81)' }} />,
});

// Reusable fade-up animation config
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  } as const;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero loads immediately — no animation wrapper needed */}
        <HeroSection />

        {/* Each below-fold section fades up as user scrolls to it */}
        <motion.div {...fadeUp(0)}>
          <CategoriesSection />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <FeaturedProducts />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <DealsSection />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <StatsSection />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <HowItWorksSection />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <TestimonialsSection />
        </motion.div>

        <motion.div {...fadeUp(0)}>
          <NewsletterSection />
        </motion.div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
