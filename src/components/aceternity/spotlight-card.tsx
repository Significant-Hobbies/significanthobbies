import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

/**
 * Aceternity Spotlight Card — a card with a mouse-following spotlight glow.
 * The spotlight is a radial gradient that follows the cursor via CSS variables.
 */
export function SpotlightCard({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[#e5ddc4] bg-white shadow-[0_8px_24px_rgba(66,55,22,0.08)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:border-[#cfc29d] hover:shadow-[0_12px_30px_rgba(66,55,22,0.11)]',
        className
      )}
    >
      <div className={cn('relative z-10', innerClassName)}>{children}</div>
    </div>
  );
}
