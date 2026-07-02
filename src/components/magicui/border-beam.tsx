'use client';

import { cn } from '~/lib/utils';

type Props = {
  className?: string;
  duration?: number; // seconds per revolution
  colorFrom?: string;
  colorTo?: string;
};

// Magic UI–style border beam, implemented as a rotating conic gradient masked
// to a 1px ring. Reliable across browsers; reduced-motion freezes the sweep.
// Parent must be `relative` and rounded; this fills inset-0.
export function BorderBeam({
  className,
  duration = 6,
  colorFrom = 'oklch(0.82 0.13 88)',
  colorTo = 'oklch(0.72 0.13 150)',
}: Props) {
  return (
    <div
      aria-hidden
      style={
        {
          '--bb-duration': `${duration}s`,
          '--bb-from': colorFrom,
          '--bb-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute -inset-px rounded-[inherit] z-0',
        'before:absolute before:inset-0 before:rounded-[inherit] before:p-px',
        'before:[background:conic-gradient(from_0deg,transparent_0deg,var(--bb-from)_60deg,var(--bb-to)_120deg,transparent_180deg,transparent_360deg)]',
        'before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude]',
        'before:animate-[border-beam_var(--bb-duration)_linear_infinite]',
        className
      )}
    />
  );
}
