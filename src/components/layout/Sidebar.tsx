'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Star, User, Settings,
  BarChart3, Package, FolderTree, ClipboardList, Users,
  X, Zap, ChevronLeft, ChevronRight, LogOut, Heart,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/* ── Types ── */
interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup { label: string; items: NavItem[] }

/* ── Nav definitions ── */
const userNavGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview',   href: '/dashboard',           Icon: LayoutDashboard },
      { label: 'My Orders',  href: '/dashboard/orders',    Icon: ShoppingBag },
      { label: 'My Reviews', href: '/dashboard/reviews',   Icon: Star },
      { label: 'Wishlist',   href: '/dashboard/wishlist',  Icon: Heart },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',  href: '/dashboard/profile',  Icon: User },
      { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard',           Icon: LayoutDashboard },
      { label: 'Analytics', href: '/dashboard/analytics', Icon: BarChart3 },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Products',   href: '/dashboard/products',      Icon: Package },
      { label: 'Categories', href: '/dashboard/categories',    Icon: FolderTree },
      { label: 'Orders',     href: '/dashboard/manage-orders', Icon: ClipboardList },
      { label: 'Users',      href: '/dashboard/users',         Icon: Users },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
    ],
  },
];

export interface SidebarProps {
  /** mobile overlay open state */
  open: boolean;
  onClose: () => void;
  /** desktop collapse state */
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  const groups = user?.role === 'ADMIN' ? adminNavGroups : userNavGroups;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push('/');
  };

  /* ── Shared inner content ── */
  const SidebarInner = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">

      {/* Logo + collapse toggle */}
      <div className={cn(
        'flex h-16 shrink-0 items-center border-b border-border transition-all duration-300',
        collapsed && !mobile ? 'justify-center px-0' : 'justify-between px-4'
      )}>
        {/* Logo */}
        {(!collapsed || mobile) && (
          <Link href="/" onClick={mobile ? onClose : undefined} className="group flex items-center gap-2 select-none">
            <span className="flex h-7 w-7 items-center justify-center bg-primary-accent text-white transition-transform duration-200 group-hover:scale-110 shrink-0">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-base font-extrabold tracking-tight text-text-primary">
              Nex<span className="text-primary-accent">Cart</span>
            </span>
          </Link>
        )}
        {collapsed && !mobile && (
          <Link href="/" className="group flex h-7 w-7 items-center justify-center bg-primary-accent text-white transition-transform duration-200 group-hover:scale-110">
            <Zap className="h-4 w-4" />
          </Link>
        )}

        {/* Close (mobile) or Collapse toggle (desktop) */}
        {mobile ? (
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary border border-border hover:border-primary-accent/40 transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'h-7 w-7 flex items-center justify-center border border-border text-text-secondary hover:text-primary-accent hover:border-primary-accent/40 transition-all duration-200 cursor-pointer shrink-0',
              collapsed && 'mt-0'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft className="h-3.5 w-3.5" />
            }
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            {(!collapsed || mobile) && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary/50 select-none">
                {group.label}
              </p>
            )}
            {collapsed && !mobile && (
              <div className="mb-1 flex justify-center">
                <div className="h-px w-5 bg-border" />
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={mobile ? onClose : undefined}
                    title={collapsed && !mobile ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 text-sm font-medium transition-all duration-150',
                      collapsed && !mobile
                        ? 'h-10 w-10 mx-auto justify-center'
                        : 'h-10 px-3',
                      active
                        ? 'bg-primary-accent/8 text-primary-accent border border-primary-accent/20'
                        : 'text-text-secondary border border-transparent hover:bg-bg-card hover:text-text-primary hover:border-border'
                    )}
                  >
                    {/* Active indicator bar */}
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-accent" />
                    )}

                    <item.Icon className={cn(
                      'shrink-0 transition-colors duration-150',
                      collapsed && !mobile ? 'h-4.5 w-4.5' : 'h-4 w-4',
                      active ? 'text-primary-accent' : 'text-text-secondary group-hover:text-text-primary'
                    )} />

                    {(!collapsed || mobile) && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.href === '/dashboard/wishlist' && wishlistCount > 0 && (
                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center bg-primary-accent/10 border border-primary-accent/20 px-1 text-[10px] font-bold text-primary-accent">
                            {wishlistCount}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className={cn(
          'shrink-0 border-t border-border transition-all duration-300',
          collapsed && !mobile ? 'p-2' : 'p-3'
        )}>
          {collapsed && !mobile ? (
            /* Collapsed: just avatar */
            <div className="flex justify-center">
              <div
                className="flex h-9 w-9 items-center justify-center bg-primary-accent text-white text-xs font-bold rounded-full cursor-default"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            /* Expanded: full user card */
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary-accent text-white text-xs font-bold rounded-full">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                <span className={cn(
                  'inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 mt-0.5',
                  user.role === 'ADMIN'
                    ? 'bg-primary-accent/10 text-primary-accent border border-primary-accent/20'
                    : 'bg-bg-card text-text-secondary border border-border'
                )}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-7 w-7 shrink-0 items-center justify-center text-text-secondary hover:text-error hover:bg-error/5 border border-transparent hover:border-error/20 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-bg-sidebar shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-[64px]' : 'w-[240px]'
        )}
      >
        <SidebarInner />
      </aside>

      {/* ── Mobile overlay backdrop ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[240px] bg-bg-sidebar border-r border-border lg:hidden',
          'flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarInner mobile />
      </aside>
    </>
  );
}
