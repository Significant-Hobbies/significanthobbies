'use client';

import { motion } from 'motion/react';

import { cn } from '~/lib/utils';

/**
 * Animated Tabs — tabs with a sliding indicator that animates between
 * the active tab using layout animations.
 */
export function AnimatedTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            active === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {active === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-md bg-card shadow-sm"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
