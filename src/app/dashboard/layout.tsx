'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/providers/AuthProvider';
import { Zap } from 'lucide-react';

const COLLAPSE_KEY = 'nexcart-sidebar-collapsed';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Restore collapse preference from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === 'true') setCollapsed(true);
    setHydrated(true);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }, []);

  /* Close mobile sidebar on large screens */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Auth guard */
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center bg-primary-accent text-white">
            <Zap className="h-7 w-7" />
            <span className="absolute inset-0 border-2 border-primary-accent animate-ping opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">NexCart</p>
            <p className="text-xs text-text-secondary mt-0.5">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-bg-sidebar">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
