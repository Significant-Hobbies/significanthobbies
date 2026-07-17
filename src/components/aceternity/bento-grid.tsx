import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

/**
 * Bento Grid — a responsive grid layout for showcasing features/stats.
 * Items can span multiple columns/rows via className.
 */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid auto-rows-[14rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className,
  title,
  description,
  icon,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/30',
        className
      )}
    >
      {/* Mouse-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), oklch(0.82 0.13 88 / 0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        {children ?? (
          <>
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>
              )}
              {title && <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>}
            </div>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
