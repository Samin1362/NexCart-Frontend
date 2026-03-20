'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, UserPlus, Zap, Gift, Tag, CreditCard, HeartHandshake, Loader2, ArrowLeft,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const perks = [
  { icon: Gift,         text: 'Exclusive deals and early access to sales' },
  { icon: Tag,          text: 'Personalised recommendations just for you' },
  { icon: CreditCard,   text: 'One-click checkout, saved addresses' },
  { icon: HeartHandshake, text: 'Dedicated customer support, always' },
];

const stats = [
  { value: 'Free',  label: 'To Join' },
  { value: '50K+',  label: 'Members' },
  { value: '5 min', label: 'Setup Time' },
];

// ── Password strength helpers ──────────────────────────────────────────────
type StrengthLevel = 'weak' | 'medium' | 'strong';

function getPasswordStrength(pw: string): { level: StrengthLevel; score: number; label: string } {
  if (!pw) return { level: 'weak', score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 'weak',   score, label: 'Weak' };
  if (score <= 3) return { level: 'medium', score, label: 'Medium' };
  return           { level: 'strong', score, label: 'Strong' };
}

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak:   '#ef4444',
  medium: '#f59e0b',
  strong: '#22c55e',
};

function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label } = getPasswordStrength(password);
  if (!password) return null;

  const segments = 3;
  const filled = level === 'weak' ? 1 : level === 'medium' ? 2 : 3;
  const color = STRENGTH_COLORS[level];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 transition-all duration-300"
            style={{
              backgroundColor: i < filled ? color : 'var(--border)',
            }}
          />
        ))}
      </div>
      <p className="text-xs font-medium transition-colors" style={{ color }}>
        {label} password
        {level === 'weak' && ' — add uppercase, numbers or symbols'}
        {level === 'medium' && ' — add more variety to strengthen'}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const { user, register, googleLogin } = useAuth();
  const router = useRouter();

  const [name, setName]                               = useState('');
  const [email, setEmail]                             = useState('');
  const [password, setPassword]                       = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms]             = useState(false);
  const [errors, setErrors]                           = useState<FormErrors>({});
  const [apiError, setApiError]                       = useState('');
  const [loading, setLoading]                         = useState(false);
  const [googleLoading, setGoogleLoading]             = useState(false);
  const [success, setSuccess]                         = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the Terms & Privacy Policy to continue';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
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
        setApiError(error.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (lg+) ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #030712 0%, #0c2a1e 45%, #0f1e40 100%)' }}
      >
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #16A34A 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-[280px] w-[280px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />

        {/* Logo — links to homepage */}
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

        {/* Headline + perks */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15]">
              Start your<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #4ade80, #60a5fa)' }}>
                journey today.
              </span>
            </h1>
            <p className="mt-4 text-base text-white/50 leading-relaxed max-w-sm">
              Create a free account and unlock the full NexCart shopping experience.
            </p>
          </div>

          <div className="space-y-3.5">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.07] border border-white/[0.10]">
                  <Icon className="h-4 w-4 text-[#4ade80]" />
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
          {/* Mobile logo */}
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

          {/* Back to homepage */}
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
            <h2 className="text-2xl font-bold text-text-primary">Create an account</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Join NexCart and start shopping today — it&apos;s free.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 border border-success bg-success/5 px-4 py-3 text-sm text-success">
              Account created successfully! Redirecting…
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="mb-6 border border-error bg-error/5 px-4 py-3 text-sm text-error">
              {apiError}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading || success}
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
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-text-secondary/60 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Register form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password + strength meter */}
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary cursor-pointer"
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter — shown only when password is non-empty */}
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary cursor-pointer"
                tabIndex={-1} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Terms & Conditions checkbox */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => { setAcceptedTerms(e.target.checked); clearFieldError('terms'); }}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 border transition-colors duration-150 flex items-center justify-center ${
                      errors.terms
                        ? 'border-error bg-error/5'
                        : acceptedTerms
                        ? 'bg-primary-accent border-primary-accent'
                        : 'bg-bg border-border group-hover:border-primary-accent/60'
                    }`}
                  >
                    {acceptedTerms && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-secondary leading-snug group-hover:text-text-primary transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-error pl-6">{errors.terms}</p>
              )}
            </div>

            <Button type="submit" loading={loading} disabled={success} className="w-full !mt-5">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
