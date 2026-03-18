import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatsSection from '@/components/home/StatsSection';
import {
  Zap,
  Shield,
  Truck,
  HeadphonesIcon,
  Target,
  Heart,
  Globe,
  Lightbulb,
} from 'lucide-react';

const values = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Customer First',
    description:
      'Every decision we make starts with one question — how does this benefit our customers?',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Quality Matters',
    description:
      'We partner with trusted brands and rigorously vet every product that enters our catalog.',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Accessibility',
    description:
      'Great products should be available to everyone, everywhere. We deliver across the country.',
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: 'Innovation',
    description:
      'From AI-powered recommendations to seamless checkout, we leverage technology to improve shopping.',
  },
];

const features = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Fast & Reliable',
    description: 'Lightning-fast platform with 99.9% uptime.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Secure Payments',
    description: 'Industry-standard encryption on every transaction.',
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: 'Free Shipping',
    description: 'Free delivery on orders above $50.',
  },
  {
    icon: <HeadphonesIcon className="h-5 w-5" />,
    title: '24/7 Support',
    description: 'Our team is always here to help you.',
  },
];

const team = [
  { name: 'Sarah Chen', role: 'CEO & Co-founder', initial: 'S' },
  { name: 'James Rivera', role: 'CTO & Co-founder', initial: 'J' },
  { name: 'Priya Sharma', role: 'Head of Product', initial: 'P' },
  { name: 'Marcus Lee', role: 'Head of Operations', initial: 'M' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
              About NexCart
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              We&apos;re on a mission to make online shopping faster, smarter, and more enjoyable
              for everyone. Founded in 2024, NexCart has grown from a small idea into a platform
              trusted by thousands of customers.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Our Story</h2>
                <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
                  <p>
                    NexCart was born out of frustration with the existing e-commerce landscape.
                    We believed shopping online should be as intuitive and enjoyable as walking
                    into your favorite store — without the clutter, confusion, or slow load times.
                  </p>
                  <p>
                    Starting with just a handful of products and a commitment to exceptional
                    user experience, we built a platform from the ground up using cutting-edge
                    technology. Today, we serve customers across the country with thousands of
                    products spanning electronics, fashion, home &amp; living, and more.
                  </p>
                  <p>
                    What sets us apart is our integration of AI-powered features — from smart
                    product recommendations to an intelligent shopping assistant that helps you
                    find exactly what you need. We&apos;re not just another online store; we&apos;re
                    the future of e-commerce.
                  </p>
                </div>
              </div>
              <div className="border border-border bg-bg-card p-8">
                <div className="grid grid-cols-2 gap-6">
                  {features.map((feature, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-10 w-10 flex items-center justify-center bg-primary-accent/10 text-primary-accent">
                        {feature.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary">{feature.title}</h3>
                      <p className="text-xs text-text-secondary">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 sm:py-20 bg-bg-card border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Our Mission &amp; Values
              </h2>
              <p className="mt-3 text-text-secondary max-w-xl mx-auto">
                We believe in building a platform that puts people first — honest pricing,
                quality products, and technology that genuinely helps.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <div key={i} className="border border-border bg-bg p-6 space-y-3">
                  <div className="h-11 w-11 flex items-center justify-center bg-primary-accent text-white">
                    {value.icon}
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">{value.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <StatsSection />

        {/* Team */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Meet the Team</h2>
              <p className="mt-3 text-text-secondary max-w-xl mx-auto">
                A small, passionate team building the future of online shopping.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div key={i} className="border border-border p-6 text-center">
                  <div className="h-16 w-16 mx-auto flex items-center justify-center bg-primary-accent text-white text-xl font-bold">
                    {member.initial}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">{member.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
