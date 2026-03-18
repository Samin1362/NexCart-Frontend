'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  Tag,
  ArrowRight,
  Home,
  Package,
  Info,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('nexcart-announcement-dismissed') !== 'true';
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const prevItemCount = useRef(itemCount);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (itemCount !== prevItemCount.current && itemCount > 0) {
      setBadgeKey((k) => k + 1);
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
    setProfileOpen(false);
    setMobileOpen(false);
    router.push('/');
  }, [logout, router]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full bg-bg/95 backdrop-blur-md transition-all duration-300',
        scrolled
          ? 'border-b border-border shadow-[0_2px_24px_rgba(0,0,0,0.08)]'
          : 'border-b border-transparent'
      )}>

        {/* ── Announcement bar ── */}
        {announcementVisible && (
          <div
            className="relative flex items-center justify-center gap-3 px-4 py-2 text-xs font-semibold text-white overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #1d4ed8, #6d28d9, #be185d)' }}
          >
            {/* animated shimmer sweep */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'shimmer-slide 3s ease-in-out infinite',
              }}
            />
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span>
              Free shipping on orders over <strong>$100</strong>
              &nbsp;&mdash;&nbsp;
              Use code <strong className="bg-white/20 px-1.5 py-0.5">NEXFREE</strong> at checkout
            </span>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline ml-1"
            >
              Shop now <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              onClick={() => {
                setAnnouncementVisible(false);
                localStorage.setItem('nexcart-announcement-dismissed', 'true');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── Gradient accent line ── */}
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)' }}
        />

        {/* ── Main nav row ── */}
        <nav className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 select-none"
            aria-label="NexCart home"
          >
            <span className="flex h-8 w-8 items-center justify-center bg-primary-accent text-white transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-text-primary">
              Nex<span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
              >
                Cart
              </span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-200 group',
                  isActive(link.href)
                    ? 'text-primary-accent'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300',
                    isActive(link.href)
                      ? 'w-4/5'
                      : 'w-0 group-hover:w-3/5'
                  )}
                  style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
                />
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-0.5">

            {/* Search */}
            <Link
              href="/products"
              className="hidden sm:flex h-9 w-9 items-center justify-center text-text-secondary hover:text-primary-accent hover:bg-primary-accent/8 transition-all duration-200"
              aria-label="Search"
            >
              <Search className="h-[17px] w-[17px]" />
            </Link>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-primary-accent hover:bg-primary-accent/8 transition-all duration-200 cursor-pointer"
                aria-label="Toggle theme"
              >
                <span
                  className="block transition-all duration-500"
                  style={{ transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(180deg) scale(1)' }}
                >
                  {theme === 'dark'
                    ? <Sun className="h-[17px] w-[17px]" />
                    : <Moon className="h-[17px] w-[17px]" />
                  }
                </span>
              </button>
            )}

            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Cart */}
                    <Link
                      href="/cart"
                      className="relative h-9 w-9 flex items-center justify-center text-text-secondary hover:text-primary-accent hover:bg-primary-accent/8 transition-all duration-200"
                      aria-label="Cart"
                    >
                      <ShoppingCart className="h-[17px] w-[17px]" />
                      {itemCount > 0 && (
                        <span
                          key={badgeKey}
                          className="animate-badge-pop absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center bg-primary-accent px-[3px] text-[9px] font-bold text-white rounded-full"
                        >
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </Link>

                    {/* Profile dropdown — desktop */}
                    <div className="relative hidden md:block ml-1" ref={profileRef}>
                      <button
                        onClick={() => setProfileOpen((o) => !o)}
                        className={cn(
                          'flex items-center gap-2 h-9 px-3 text-sm font-medium transition-all duration-200 cursor-pointer border',
                          profileOpen
                            ? 'border-primary-accent/40 bg-primary-accent/5 text-primary-accent'
                            : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
                        )}
                      >
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-6 w-6 items-center justify-center text-white text-[11px] font-bold rounded-full shrink-0"
                            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="max-w-[80px] truncate hidden lg:block text-xs">{user.name}</span>
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            profileOpen && 'rotate-180'
                          )}
                        />
                      </button>

                      {profileOpen && (
                        <div className="animate-dropdown-in absolute right-0 top-full mt-2 w-58 border border-border bg-bg shadow-xl z-50 min-w-[220px]">
                          {/* User header */}
                          <div className="px-4 py-3.5 border-b border-border bg-bg-card">
                            <div className="flex items-center gap-2.5">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.name}
                                  width={36}
                                  height={36}
                                  className="h-9 w-9 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center text-white text-sm font-bold rounded-full"
                                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                                >
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                                <p className="text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            <DropdownLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setProfileOpen(false)}>
                              Dashboard
                            </DropdownLink>
                            <DropdownLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} onClick={() => setProfileOpen(false)}>
                              Profile
                            </DropdownLink>
                            <DropdownLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} onClick={() => setProfileOpen(false)}>
                              Settings
                            </DropdownLink>
                          </div>

                          <div className="border-t border-border py-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-2 ml-2">
                    <Link
                      href="/login"
                      className="h-9 flex items-center px-4 text-sm font-medium border border-border text-text-secondary hover:border-primary-accent hover:text-primary-accent transition-all duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="btn-shimmer relative h-9 flex items-center px-5 text-sm font-semibold text-white overflow-hidden"
                      style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex md:hidden h-9 w-9 items-center justify-center text-text-primary hover:bg-bg-card border border-transparent hover:border-border transition-all duration-200 cursor-pointer ml-1"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={cn('transition-transform duration-300', mobileOpen ? 'rotate-90' : 'rotate-0')}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer panel ── */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[300px] md:hidden',
          'flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 100%)' }}
        aria-hidden={!mobileOpen}
      >
        {/* Gradient top accent */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #EC4899)' }}
        />

        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.08] shrink-0">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center bg-primary-accent text-white transition-transform duration-200 group-hover:scale-110">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-base font-extrabold tracking-tight text-white">
              Nex<span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}
              >
                Cart
              </span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 flex items-center justify-center text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info (if logged in) */}
        {user && (
          <div className="px-5 py-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-white text-sm font-bold rounded-full"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="py-3 shrink-0">
          <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-150 border-r-2',
                  isActive(link.href)
                    ? 'text-white bg-white/[0.06] border-primary-accent'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04] border-transparent'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive(link.href) ? 'text-primary-accent' : 'text-white/30')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Account section */}
        <div className="border-t border-white/[0.08] py-3 shrink-0">
          {user ? (
            <>
              <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
                Account
              </p>
              <MobileDarkLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setMobileOpen(false)}>
                Dashboard
              </MobileDarkLink>
              <MobileDarkLink href="/cart" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => setMobileOpen(false)}>
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center bg-primary-accent px-1.5 text-[10px] font-bold text-white rounded-full">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </MobileDarkLink>
              <MobileDarkLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} onClick={() => setMobileOpen(false)}>
                Profile
              </MobileDarkLink>
              <MobileDarkLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} onClick={() => setMobileOpen(false)}>
                Settings
              </MobileDarkLink>
              <div className="mt-1 border-t border-white/[0.08] pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="px-5 pt-2 pb-3 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-full items-center justify-center border border-white/15 text-sm font-medium text-white/70 hover:border-white/40 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-shimmer flex h-11 w-full items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
              >
                Get Started — It&apos;s Free
              </Link>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        {mounted && (
          <div className="mt-auto border-t border-white/[0.08] p-5 shrink-0">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex w-full items-center gap-3 text-sm font-medium text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              <span className="h-8 w-8 flex items-center justify-center border border-white/10">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Helpers ── */

function DropdownLink({
  href, icon, children, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileDarkLink({
  href, icon, children, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
    >
      <span className="text-white/30">{icon}</span>
      {children}
    </Link>
  );
}
