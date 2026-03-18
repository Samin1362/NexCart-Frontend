'use client';

import { useEffect, useState } from 'react';

export default function ServerWakeLoader() {
  const [visible, setVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const onWake = (e: Event) => {
      const active = (e as CustomEvent<{ active: boolean }>).detail.active;
      if (active) {
        setStartTime(Date.now());
        setElapsed(0);
        setVisible(true);
      } else {
        // Small delay so user sees "Connected!" briefly before hiding
        setTimeout(() => {
          setVisible(false);
          setStartTime(null);
          setElapsed(0);
        }, 1200);
      }
    };
    window.addEventListener('server-wake', onWake);
    return () => window.removeEventListener('server-wake', onWake);
  }, []);

  // Tick the elapsed counter every second while visible
  useEffect(() => {
    if (!visible || startTime === null) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, startTime]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.82)', backdropFilter: 'blur(12px)' }}
      aria-live="polite"
      aria-label="Server is starting up"
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #2563EB, transparent)', animation: 'pulseBlob 3s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)', animation: 'pulseBlob 3s ease-in-out infinite 1.5s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', animation: 'pulseBlob 4s ease-in-out infinite 0.8s' }}
      />

      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-6 px-10 py-10 max-w-sm w-full mx-4"
        style={{
          background: 'rgba(30, 41, 59, 0.75)',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '0px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(37, 99, 235, 0.15)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #2563EB, #F59E0B, transparent)' }}
        />

        {/* Spinner rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#2563EB',
              borderRightColor: 'rgba(37,99,235,0.3)',
              animation: 'spinRing 1.6s linear infinite',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-2.5 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#F59E0B',
              borderLeftColor: 'rgba(245,158,11,0.3)',
              animation: 'spinRing 2.2s linear infinite reverse',
            }}
          />
          {/* Inner ring */}
          <div
            className="absolute inset-5 rounded-full"
            style={{
              border: '1.5px solid transparent',
              borderTopColor: '#60A5FA',
              animation: 'spinRing 1s linear infinite',
            }}
          />
          {/* Center dot */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#2563EB', animation: 'pulseBlob 1.5s ease-in-out infinite', boxShadow: '0 0 12px #2563EB' }}
          />
        </div>

        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-lg font-bold tracking-widest uppercase"
            style={{ color: '#F1F5F9', letterSpacing: '0.2em' }}
          >
            Nex<span style={{ color: '#2563EB' }}>Cart</span>
          </span>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-base font-semibold" style={{ color: '#E2E8F0' }}>
            Server is waking up
            <AnimatedDots />
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
            We use a free server that sleeps when idle.
            <br />
            This usually takes <span style={{ color: '#F59E0B' }}>10–20 seconds</span>. Thanks for your patience!
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.75 overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.6)' }}>
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, #2563EB, #F59E0B)',
              animation: 'progressSweep 2.5s ease-in-out infinite',
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* Elapsed time */}
        <p className="text-xs tabular-nums" style={{ color: '#64748B' }}>
          Connecting… {elapsed}s
        </p>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }}
        />
      </div>

      <style>{`
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseBlob {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes progressSweep {
          0%   { transform: scaleX(0); margin-left: 0; }
          40%  { transform: scaleX(0.7); }
          60%  { transform: scaleX(0.7); }
          100% { transform: scaleX(0); margin-left: 100%; }
        }
        @keyframes dotBlink {
          0%, 20%   { opacity: 0; }
          50%       { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function AnimatedDots() {
  return (
    <span aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animation: `dotBlink 1.4s ease-in-out infinite`, animationDelay: `${i * 0.22}s` }}
        >
          .
        </span>
      ))}
    </span>
  );
}
