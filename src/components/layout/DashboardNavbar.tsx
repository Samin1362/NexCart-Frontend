'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Menu, User, LogOut,
  ChevronDown, Settings, Home, ChevronRight,
  LayoutDashboard, ShoppingBag, Star, BarChart3,
  Package, FolderTree, ClipboardList, Users,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

/* ── Page title map ── */
const PAGE_TITLES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  '/dashboard':               { label: 'Overview',          icon: LayoutDashboard },
  '/dashboard/orders':        { label: 'My Orders',         icon: ShoppingBag },
  '/dashboard/reviews':       { label: 'My Reviews',        icon: Star },
  '/dashboard/profile':       { label: 'Profile',           icon: User },
  '/dashboard/settings':      { label: 'Settings',          icon: Settings },
  '/dashboard/analytics':     { label: 'Analytics',         icon: BarChart3 },
  '/dashboard/products':      { label: 'Manage Products',   icon: Package },
  '/dashboard/products/new':  { label: 'Add Product',       icon: Package },
  '/dashboard/categories':    { label: 'Manage Categories', icon: FolderTree },
  '/dashboard/manage-orders': { label: 'Manage Orders',     icon: ClipboardList },
  '/dashboard/users':         { label: 'Manage Users',      icon: Users },
};

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push('/');
  };

  /* Determine current page */
  const currentPage = PAGE_TITLES[pathname] ?? { label: 'Dashboard', icon: LayoutDashboard };
  const PageIcon = currentPage.icon;

  /* Breadcrumb: Home > Current */
  const isRoot = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-sm">
      {/* Thin gradient top accent */}
      <div
        className="h-[2px] w-full"
        style={{ background: 'linear-gradient(90deg, var(--primary-accent) 0%, #7C3AED 100%)' }}
      />

      <div className="flex h-14 items-center justify-between px-4 sm:px-6">

        {/* ── Left ── */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex h-9 w-9 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-border transition-all cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-primary-accent transition-colors duration-150 font-medium"
            >
              Dashboard
            </Link>
            {!isRoot && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-border" />
                <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                  <PageIcon className="h-3.5 w-3.5 text-primary-accent" />
                  {currentPage.label}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-0.5">

          {/* Back to store */}
          <Link
            href="/"
            className="hidden sm:flex h-9 items-center gap-1.5 px-3 text-xs font-semibold text-text-secondary border border-border hover:border-primary-accent/40 hover:text-primary-accent transition-all duration-200"
          >
            <Home className="h-3.5 w-3.5" />
            Store
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-primary-accent hover:bg-primary-accent/8 transition-all duration-200 cursor-pointer ml-1"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>
          )}

          {/* Profile dropdown */}
          {user && (
            <div className="relative ml-1" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-2 h-9 px-2.5 text-sm font-medium transition-all duration-200 cursor-pointer border',
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
                  <div className="flex h-6 w-6 items-center justify-center bg-primary-accent text-white text-[11px] font-bold rounded-full shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block max-w-[80px] truncate text-xs">{user.name}</span>
                <ChevronDown className={cn('hidden sm:block h-3.5 w-3.5 transition-transform duration-200', profileOpen && 'rotate-180')} />
              </button>

              {profileOpen && (
                <div className="animate-dropdown-in absolute right-0 top-full mt-1.5 w-56 border border-border bg-bg shadow-xl z-50">
                  {/* User header */}
                  <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-bg-card">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary-accent text-white text-sm font-bold rounded-full">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-secondary truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <DropdownBtn icon={<User className="h-4 w-4" />} onClick={() => { router.push('/dashboard/profile'); setProfileOpen(false); }}>
                      Profile
                    </DropdownBtn>
                    <DropdownBtn icon={<Settings className="h-4 w-4" />} onClick={() => { router.push('/dashboard/settings'); setProfileOpen(false); }}>
                      Settings
                    </DropdownBtn>
                    <DropdownBtn icon={<Home className="h-4 w-4" />} onClick={() => { router.push('/'); setProfileOpen(false); }}>
                      Back to Store
                    </DropdownBtn>
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
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownBtn({
  icon, children, onClick,
}: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors cursor-pointer"
    >
      {icon}
      {children}
    </button>
  );
}
