'use client';

import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin, Mail, ArrowRight, MapPin, Phone, Shield, Truck, RotateCcw, HeadphonesIcon } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Best Sellers', href: '/products?sort=rating' },
    { label: 'Deals & Offers', href: '/products' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Track Order', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns', href: '#' },
  ],
};

const trust = [
  { icon: Shield, label: 'Secure Payments' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: HeadphonesIcon, label: '24/7 Support' },
];

const socials = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0e1a 100%)' }}
    >
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid opacity-[0.04] pointer-events-none" />

      {/* Gradient top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #EC4899)' }}
      />

      {/* Trust bar */}
      <div className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trust.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border border-white/[0.06] bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-white/60">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">

          {/* Brand column */}
          <div className="md:col-span-4 lg:col-span-3">
            <Link href="/" className="group inline-flex items-center gap-2 select-none">
              <span className="flex h-8 w-8 items-center justify-center bg-primary-accent text-white transition-transform duration-200 group-hover:scale-110">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Nex<span className="text-primary-accent">Cart</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
              Your one-stop destination for quality products, fast delivery, and an unmatched shopping experience.
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-white/40">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                Kuril Chowrasta, Vatara, Dhaka, Bangladesh
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/40">
                <Phone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                01757874416
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/40">
                <Mail className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                saminisrak1991@gmail.com
              </div>
            </div>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center border border-white/[0.1] text-white/40 hover:border-primary-accent hover:text-primary-accent transition-all duration-200"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-3 gap-6 sm:gap-8">
            {(
              [
                { title: 'Shop', links: footerLinks.shop },
                { title: 'Company', links: footerLinks.company },
                { title: 'Support', links: footerLinks.support },
              ] as { title: string; links: { label: string; href: string }[] }[]
            ).map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors duration-200"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-primary-accent shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} NexCart Inc. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Cookie Policy', href: '#' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-1.5">
            {['VISA', 'MC', 'AMEX', 'PayPal'].map((method) => (
              <span
                key={method}
                className="inline-flex items-center justify-center border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-white/40"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
