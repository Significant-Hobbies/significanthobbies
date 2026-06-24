'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Lumi } from '~/components/lumi';

const DISMISS_KEY = 'lumi-floating-dismissed';

const SHORTCUTS = [
  { label: '✨ My bucket list', href: '/dashboard' },
  { label: 'Browse famous lists', href: '/bucket-lists' },
  { label: '150+ ideas', href: '/bucket-list-ideas' },
];

export function FloatingLumi() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read sessionStorage only after mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
    }
  }, []);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  // Don't render before mount (prevents flash / hydration mismatch)
  if (!mounted || dismissed) return null;

  return (
    <div
      className="group fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      role="region"
      aria-label="Lumi bucket list guide"
    >
      {/* Expandable panel — slides in above the button on hover */}
      <div
        className="
          flex flex-col gap-1 rounded-2xl border border-[#f0a090]
          bg-white/95 backdrop-blur-sm shadow-xl
          overflow-hidden
          max-h-0 opacity-0 scale-95 origin-bottom-right
          group-hover:max-h-64 group-hover:opacity-100 group-hover:scale-100
          transition-all duration-300 ease-out
          pointer-events-none group-hover:pointer-events-auto
        "
      >
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-[#e05533] uppercase tracking-widest">
            Quick links
          </p>
        </div>
        {SHORTCUTS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="mx-2 mb-1 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-[#fff0ec] hover:text-[#e05533] transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="h-3" />
      </div>

      {/* Floating Lumi orb button */}
      <div className="relative flex items-center justify-center">
        {/* Coral glow ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#e05533]/20 blur-md scale-125 animate-pulse-soft"
          aria-hidden
        />
        <button
          type="button"
          className="relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e05533] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Open Lumi bucket list guide"
        >
          <Lumi size={48} float glow />
        </button>

        {/* Dismiss × button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Lumi"
          className="
            absolute -top-1.5 -right-1.5
            flex h-5 w-5 items-center justify-center
            rounded-full bg-stone-200 text-stone-500
            text-[10px] font-bold leading-none
            opacity-0 group-hover:opacity-100
            hover:bg-stone-300 hover:text-stone-700
            transition-opacity duration-200
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e05533]
          "
        >
          ×
        </button>
      </div>
    </div>
  );
}
