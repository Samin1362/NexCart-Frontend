import { Search, CreditCard, Truck, ArrowRight, Zap } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Browse & Discover',
    description:
      "Explore thousands of curated products across every category. Use smart search and filters to find exactly what you're looking for — fast.",
    tag: 'Find Products',
  },
  {
    icon: CreditCard,
    step: '02',
    title: 'Checkout Securely',
    description:
      'Add to cart and pay your way — Card, COD, bKash, or Nagad. Our encrypted checkout makes every transaction safe and seamless.',
    tag: 'Pay & Confirm',
  },
  {
    icon: Truck,
    step: '03',
    title: 'Fast Delivery',
    description:
      'Sit back while we handle the rest. Real-time tracking, fast dispatch, and doorstep delivery — every time, without fail.',
    tag: 'Receive Order',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-bg-card border-y border-border overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-accent">Simple Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">How It Works</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            From browsing to your doorstep — shopping with NexCart takes just three effortless steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Connector (desktop) */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px border-t-2 border-dashed border-border z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative z-10 group flex flex-col border border-border bg-bg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary-accent/40 hover:shadow-md"
              >
                {/* Top accent strip */}
                <div className="h-[3px] w-full bg-border transition-colors duration-300 group-hover:bg-primary-accent" />

                {/* Icon + step number */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4">
                  <div className="flex h-13 w-13 items-center justify-center border border-border bg-bg-card text-primary-accent transition-all duration-300 group-hover:border-primary-accent/40 group-hover:bg-primary-accent/5 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-black leading-none select-none text-border transition-colors duration-300 group-hover:text-primary-accent/15">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 flex flex-col gap-2 flex-1">
                  <span className="w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-primary-accent/20 bg-primary-accent/5 text-primary-accent">
                    {step.tag}
                  </span>
                  <h3 className="text-base font-bold text-text-primary">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>

                {/* Bottom hover arrow */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-t border-border text-xs font-semibold text-primary-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Step {i + 1} of {steps.length} <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
