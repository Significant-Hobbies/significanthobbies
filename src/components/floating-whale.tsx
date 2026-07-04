'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Whale } from '~/components/whale';

const DISMISS_KEY = 'whale-floating-dismissed';

const SHORTCUTS = [
  { label: 'My bucket list', href: '/dashboard' },
  { label: 'Browse famous lists', href: '/bucket-lists' },
  { label: '150+ ideas', href: '/bucket-list-ideas' },
];

export function FloatingWhale() {
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
      aria-label="Whale bucket list guide"
    >
      {/* Expandable panel — slides in above the button on hover */}
      <div
        className="
          flex flex-col gap-1 rounded-2xl border border-lumi-200
          bg-card shadow-xl
          overflow-hidden
          max-h-0 opacity-0 scale-95 origin-bottom-right
          group-hover:max-h-64 group-hover:opacity-100 group-hover:scale-100
          transition-all duration-300 ease-out
          pointer-events-none group-hover:pointer-events-auto
        "
      >
        <div className="px-4 pt-3 pb-1">
          <p className="text-sm font-semibold text-primary">Quick links</p>
        </div>
        {SHORTCUTS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="mx-2 mb-1 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="h-3" />
      </div>

      {/* Floating Whale button */}
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          className="relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Open Whale bucket list guide"
        >
          <Whale size={48} float glow />
        </button>

        {/* Dismiss × button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Whale"
          className="
            absolute -top-1.5 -right-1.5
            flex h-5 w-5 items-center justify-center
            rounded-full bg-foreground/10 text-muted-foreground
            text-[10px] font-bold leading-none
            opacity-0 group-hover:opacity-100
            hover:bg-foreground/15 hover:text-foreground
            transition-opacity duration-200
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary
          "
        >
          ×
        </button>
      </div>
    </div>
  );
}
