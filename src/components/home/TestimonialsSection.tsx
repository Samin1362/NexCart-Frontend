import { Star, Quote, MessageSquare } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Frequent Shopper',
    rating: 5,
    quote:
      'NexCart has completely changed how I shop online. The product quality is excellent, delivery is always on time, and the prices are unbeatable. Highly recommended!',
    initial: 'S',
    verified: true,
    orders: '47 orders',
  },
  {
    name: 'Michael Chen',
    role: 'Tech Enthusiast',
    rating: 5,
    quote:
      "I've been buying electronics from NexCart for months. Accurate descriptions, smooth checkout, and responsive customer support — everything you'd want.",
    initial: 'M',
    verified: true,
    orders: '31 orders',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Home Decorator',
    rating: 4,
    quote:
      'Great selection of home and kitchen products. I furnished my entire apartment through NexCart. The free shipping on orders over $100 is a huge bonus.',
    initial: 'E',
    verified: true,
    orders: '19 orders',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white">
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-accent">Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">What Our Customers Say</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Real feedback from verified shoppers who love NexCart.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group relative flex flex-col border border-border bg-bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary-accent/40 hover:shadow-md"
            >
              {/* Top strip */}
              <div className="h-[3px] w-full bg-border transition-colors duration-300 group-hover:bg-primary-accent" />

              {/* Quote icon */}
              <div className="px-5 pt-5">
                <Quote className="h-7 w-7 text-primary-accent opacity-15" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 px-5 pt-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-3.5 w-3.5 ${j < t.rating ? 'fill-secondary text-secondary' : 'fill-border text-border'}`}
                  />
                ))}
                <span className="ml-1.5 text-[10px] font-bold text-secondary">{t.rating}.0</span>
              </div>

              {/* Quote */}
              <p className="flex-1 px-5 pt-3 pb-5 text-sm text-text-secondary leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary-accent text-white text-xs font-bold rounded-full">
                    {t.initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                      {t.verified && (
                        <span className="text-[9px] font-bold bg-primary-accent text-white px-1.5 py-0.5">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-secondary/50 shrink-0">{t.orders}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border border-border bg-bg-card px-6 py-5">
          {[
            { label: '50,000+', sub: 'Happy Customers' },
            { label: '4.8 / 5',  sub: 'Average Rating' },
            { label: '99.1%',   sub: 'Satisfaction Rate' },
            { label: '12,000+', sub: 'Verified Reviews' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center min-w-[80px]">
              <span className="text-lg font-extrabold text-primary-accent">{stat.label}</span>
              <span className="text-[11px] text-text-secondary">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
