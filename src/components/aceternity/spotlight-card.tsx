'use client';

import { useRef, type ReactNode } from 'react';

import { cn } from '~/lib/utils';

/**
 * Aceternity Spotlight Card — a card with a mouse-following spotlight glow.
 * The spotlight is a radial gradient that follows the cursor via CSS variables.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'oklch(0.82 0.13 88 / 0.08)',
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/30',
        className
      )}
    >
      {/* Mouse-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div className={cn('relative z-10', innerClassName)}>{children}</div>
    </div>
  );
}
