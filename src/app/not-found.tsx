import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-accent">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-text-primary">Page Not Found</h2>
        <p className="mt-2 text-text-secondary">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center bg-primary-accent px-8 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
