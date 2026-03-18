'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, LogIn, Zap, ShieldCheck, Truck, RotateCcw, Star, Loader2, ArrowLeft,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';

interface FormErrors {
  email?: string;
  password?: string;
}

const features = [
  { icon: ShieldCheck, text: 'Secure checkout with SSL encryption' },
  { icon: Truck,       text: 'Free shipping on orders over $100' },
  { icon: RotateCcw,  text: 'Easy 30-day returns, no questions asked' },
  { icon: Star,        text: '50,000+ verified products & reviews' },
];

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24/7', label: 'Support' },
];

export default function LoginPage() {
  const { user, login, googleLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [errors, setErrors]                 = useState<FormErrors>({});
  const [apiError, setApiError]             = useState('');
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError('');
    setGoogleLoading(true);
    try {
      await googleLogin();
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        setApiError(error.message || 'Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await login(demoEmail, '123456');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (lg+) ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #030712 0%, #0c1a4e 45%, #1e1b4b 100%)' }}
      >
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }} />

        {/* Logo — links back to homepage */}
        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit group">
          <span className="flex h-10 w-10 items-center justify-center bg-[#2563EB] text-white transition-transform duration-200 group-hover:scale-110">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Nex
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
              Cart
            </span>
          </span>
        </Link>

        {/* Headline + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15]">
              Shop smarter,<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
                live better.
              </span>
            </h1>
            <p className="mt-4 text-base text-white/50 leading-relaxed max-w-sm">
              Join thousands of happy shoppers discovering amazing products every day.
            </p>
          </div>

          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.07] border border-white/[0.10]">
                  <Icon className="h-4 w-4 text-[#60a5fa]" />
                </span>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2 border-t border-white/[0.08]">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/35">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/20">
          © {new Date().getFullYear()} NexCart — All rights reserved
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col bg-bg px-6 py-10 sm:px-10 lg:px-14 xl:px-20">

        {/* Top navigation bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Mobile logo — links to homepage */}
          <Link href="/" className="flex items-center gap-2 lg:hidden group">
            <span className="flex h-8 w-8 items-center justify-center bg-[#2563EB] text-white transition-transform duration-200 group-hover:scale-110">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              Nex
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}>
                Cart
              </span>
            </span>
          </Link>

          {/* Back to homepage — visible on all sizes */}
          <Link
            href="/"
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-accent transition-colors duration-200 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to homepage
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Sign in to your account to continue shopping.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 border border-error bg-error/5 px-4 py-3 text-sm text-error">
              {apiError}
            </div>
          )}

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="relative flex w-full h-12 items-center justify-center gap-3 border border-border bg-bg text-sm font-semibold text-text-primary hover:bg-bg-card hover:border-primary-accent/50 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary-accent" />
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-text-secondary/60 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </form>

          {/* Demo buttons */}
          <div className="mt-5">
            <p className="text-xs text-text-secondary/50 mb-3 text-center uppercase tracking-widest">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" size="sm"
                onClick={() => handleDemoLogin('john@nexcart.com')}
                disabled={loading || googleLoading}>
                Login as User
              </Button>
              <Button type="button" variant="secondary" size="sm"
                onClick={() => handleDemoLogin('admin@nexcart.com')}
                disabled={loading || googleLoading}>
                Login as Admin
              </Button>
            </div>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-accent font-semibold hover:underline">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
