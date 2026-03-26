'use client';

import { useState } from 'react';
import { Send, Mail, Tag, Zap, Bell, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import MagneticButton from '@/components/ui/MagneticButton';

const perks = [
  { icon: Tag, text: 'Exclusive member-only discounts' },
  { icon: Bell, text: 'First access to new arrivals' },
  { icon: Zap, text: 'Flash sale early alerts' },
  { icon: Shield, text: 'No spam. Unsubscribe anytime.' },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }, 800);
  };

  return (
    <section className="relative overflow-hidden border-t border-border">
      {/* Main gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #312e81 40%, #581c87 80%, #1e1b4b 100%)',
        }}
      />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-[0.08] pointer-events-none" />

      {/* Orb accents */}
      <div
        className="absolute -top-24 -right-24 h-72 w-72 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-16 -left-16 h-56 w-56 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy — slides in from left */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center bg-white/20 text-white">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Newsletter
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Get deals before{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #c084fc)' }}>
                everyone else.
              </span>
            </h2>
            <p className="mt-3 text-sm text-blue-200 leading-relaxed max-w-md">
              Join over 50,000 savvy shoppers who receive our weekly digest of exclusive discounts,
              new arrivals, and flash sales — directly to their inbox.
            </p>

            {/* Perks list */}
            <ul className="mt-6 space-y-2.5">
              {perks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white/10 text-blue-300">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-blue-100">{perk.text}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Right: form card — slides in from right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 sm:p-8"
          >
            {subscribed ? (
              <div className="flex flex-col items-center text-center py-6">
                {/* Success icon */}
                <div className="flex h-16 w-16 items-center justify-center bg-green-500/20 text-green-400 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">You&apos;re in!</h3>
                <p className="mt-1.5 text-sm text-blue-200">
                  Welcome to the NexCart insider club. Check your inbox for a welcome gift.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-white mb-1">Subscribe today</h3>
                <p className="text-xs text-blue-300 mb-5">
                  Enter your email and get 10% off your first order.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-12 w-full border border-white/20 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all"
                    />
                  </div>

                  <MagneticButton strength={5}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-shimmer w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-bold text-white transition-opacity disabled:opacity-70 cursor-pointer"
                    style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Subscribing…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Subscribe & Get 10% Off
                      </>
                    )}
                  </button>
                  </MagneticButton>
                </form>

                {/* Trust note */}
                <p className="mt-4 text-center text-[11px] text-blue-300/70">
                  🔒 &nbsp;Your data is safe. We never share it with third parties.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
