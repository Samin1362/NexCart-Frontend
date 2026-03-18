# NexCart — Frontend

A modern, full-featured e-commerce storefront built with **Next.js**, **TypeScript**, and **Tailwind CSS**. NexCart offers a sharp, professional shopping experience with role-based dashboards, AI-powered chat, Google OAuth, and a fully responsive dark/light theme.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Auth (Email/Password + Google OAuth) |
| HTTP Client | Axios (with automatic token refresh interceptors) |
| Theme | next-themes (light / dark toggle) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | Inter (sans), JetBrains Mono (mono) |
| Deployment | Vercel |

---

## Design System

The UI follows a sharp, clean aesthetic with no border radius (`border-radius: 0`). All colors are driven by CSS custom properties for seamless theme switching.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--primary` | `#0F172A` | `#E2E8F0` | Headings, primary buttons |
| `--primary-accent` | `#2563EB` | `#3B82F6` | Links, active states, CTAs |
| `--secondary` | `#F59E0B` | `#FBBF24` | Badges, highlights, sale tags |
| `--bg` | `#FFFFFF` | `#0B1120` | Page background |
| `--bg-card` | `#F8FAFC` | `#1E293B` | Card backgrounds |
| `--bg-sidebar` | `#F1F5F9` | `#0F172A` | Sidebar, secondary surfaces |
| `--border` | `#E2E8F0` | `#334155` | Borders, dividers |
| `--text-primary` | `#0F172A` | `#F1F5F9` | Body text |
| `--text-secondary` | `#64748B` | `#94A3B8` | Muted text, labels |
| `--success` | `#16A34A` | `#22C55E` | Success states |
| `--error` | `#DC2626` | `#EF4444` | Error states |

---

## Features

### Public Storefront
- **Landing page** with 8 sections: Hero, Categories, Featured Products, Deals, Stats, How It Works, Testimonials, Newsletter
- **Product listing** with real-time debounced search, category/price/rating filters, sorting, and URL-synced query params
- **Product detail** with image gallery (thumbnails + zoom), specifications table, reviews, and related products
- **About** and **Contact** pages
- **404** not-found page

### Authentication
- Email/password login and registration with full client-side validation
- Google OAuth via Firebase popup
- Demo login buttons (User / Admin) for quick access
- Split-panel auth layout with animated brand panel
- JWT access token + refresh token flow — auto-refreshes on 401 responses

### Shopping Cart & Checkout
- Persistent cart synced to backend (add, update quantity, remove, clear)
- Cart badge with live item count in the Navbar
- Free shipping threshold logic ($100+), tax calculation (5%)
- Checkout form with shipping address, 4 payment methods (COD, Card, bKash, Nagad), and order notes
- Order confirmation page with full order summary and delivery estimate

### User Dashboard
- Overview with personal stats: total orders, pending orders, total spent
- **My Orders** — paginated order list with expandable details, cancel button (PENDING orders only), cancellation reason modal
- **My Reviews** page
- **Profile** and **Settings** pages

### Admin Dashboard
- Overview with 6 platform-wide stat cards + link to Analytics
- **Analytics** — charts powered by Recharts (revenue, orders, users)
- **Manage Products** — searchable, filterable table with add/edit/delete and pagination
- **Add / Edit Product** — full form with images, tags, specifications, featured toggle, and AI-assisted description generation
- **Manage Categories** — category CRUD
- **Manage Orders** — view and update all orders across the platform
- **Manage Users** — view and manage all registered users

### AI Chat Assistant
- Floating chat widget (bottom-right) powered by **Google Gemini** via the backend `/ai/chat` endpoint
- Animated bot icon, typing indicator, and auto-scroll
- Handles rate-limit (429), auth (401), and service errors gracefully
- Available on every page; requires login to send messages

### UX Details
- **Skeleton loaders** on all async content
- **Active filter chips** with individual clear buttons on the products page
- **Staggered animations** on product grids via Framer Motion
- **Dismissible announcement bar** in Navbar with free-shipping promo
- **Collapsible sidebar** on dashboard (state saved to localStorage)
- Mobile-first responsive design with full drawer navigation

---

## Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | Home / Landing page |
| `/products` | Product listing with search, filter, sort, pagination |
| `/products/[slug]` | Product detail page |
| `/about` | About NexCart |
| `/contact` | Contact form |
| `/login` | Login page |
| `/register` | Registration page |

### Protected Routes (requires login)

| Route | Description |
|---|---|
| `/cart` | Shopping cart |
| `/checkout` | Checkout form |
| `/checkout/confirmation` | Order confirmation |
| `/dashboard` | Dashboard overview (role-aware) |
| `/dashboard/orders` | User: my orders |
| `/dashboard/reviews` | User: my reviews |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Account settings |

### Admin-Only Routes

| Route | Description |
|---|---|
| `/dashboard/analytics` | Analytics charts and metrics |
| `/dashboard/products` | Product management table |
| `/dashboard/products/new` | Add new product |
| `/dashboard/products/new?edit=[id]` | Edit existing product |
| `/dashboard/categories` | Category management |
| `/dashboard/manage-orders` | All orders management |
| `/dashboard/users` | User management |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (providers + ChatWidget)
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles + CSS theme variables
│   │   ├── not-found.tsx           # 404 page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx            # Product listing
│   │   │   └── [slug]/page.tsx     # Product detail
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── confirmation/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx          # Dashboard shell (auth guard + sidebar)
│   │       ├── page.tsx            # Overview
│   │       ├── orders/page.tsx
│   │       ├── reviews/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── new/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── manage-orders/page.tsx
│   │       ├── users/page.tsx
│   │       └── analytics/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top nav (announcement bar, search, cart, profile menu)
│   │   │   ├── DashboardNavbar.tsx
│   │   │   ├── Sidebar.tsx         # Dashboard sidebar (collapsible, role-aware)
│   │   │   └── Footer.tsx
│   │   ├── home/                   # Landing page section components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── DealsSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── NewsletterSection.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx     # Card with add-to-cart, rating, discount badge
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SortDropdown.tsx
│   │   │   └── ReviewSection.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Variants: primary, secondary, danger, ghost
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Pagination.tsx
│   │   └── ChatWidget.tsx          # AI chat floating widget
│   ├── providers/
│   │   ├── AuthProvider.tsx        # Auth context (login, register, Google OAuth, logout)
│   │   ├── CartProvider.tsx        # Cart context (add, update, remove, clear)
│   │   └── ThemeProvider.tsx       # Light/dark theme
│   ├── firebase/
│   │   └── firebase.config.ts      # Firebase init (reads from env vars)
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── lib/
│   │   ├── api.ts                  # Axios instance with token refresh interceptor
│   │   ├── auth.ts                 # Token get/set/clear helpers
│   │   └── utils.ts                # formatPrice, formatDate, cn, truncate, getDiscountPercentage
│   └── types/
│       └── index.ts                # IUser, IProduct, ICategory, IOrder, ICart, IReview, etc.
├── .env.local                      # Local dev env vars (gitignored)
├── .env.production                 # Production env vars (gitignored)
├── .env.example                    # Reference template (committed)
├── next.config.ts
├── vercel.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- The backend server running (see `/Server/README.md`)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:3001/api`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

All Firebase values are found in **Firebase Console → Project Settings → Your Apps → SDK setup and configuration**.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start
```

---

## Deployment (Vercel)

1. Push the `frontend/` folder to GitHub.
2. Create a new project on [Vercel](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Add all environment variables from `.env.example` under **Project → Settings → Environment Variables** (select **Production**).
5. Add your Vercel deployment URL to **Firebase Console → Authentication → Authorized Domains** so Google OAuth works in production.
6. Deploy — Vercel auto-detects Next.js and runs `npm run build`.

> The `vercel.json` at the root of `frontend/` explicitly declares the framework, build command, and output directory.

---

## Key Patterns

- **Provider stack**: `ThemeProvider → AuthProvider → CartProvider` wraps the entire app in `layout.tsx`.
- **Axios interceptors**: Auto-attaches the JWT to every request. On a 401, it attempts a silent token refresh before redirecting to `/login`.
- **URL-synced filters**: All search/filter/sort/page state on the products page lives in the URL query string — shareable and bookmarkable.
- **Role-aware UI**: Admin dashboard pages and sidebar items render conditionally based on `user.role === 'ADMIN'`.
- **Auth guard**: `dashboard/layout.tsx` redirects unauthenticated users to `/login` before any dashboard page renders.
- **Optimistic UI**: Cart quantity updates and "Add to Cart" show immediate feedback while the API call completes in the background.
