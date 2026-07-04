'use client';

import { type LucideIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SpotlightCard } from '~/components/aceternity';
import { cn } from '~/lib/utils';

interface Props {
  /** Lucide icon rendered large as the visual element. */
  icon: LucideIcon;
  /** Headline — the thing to do. */
  title: string;
  /** Supporting copy in muted-foreground. */
  description: string;
  /** CTA button label. */
  ctaLabel: string;
  /** CTA destination. */
  href: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Empty State Card — a premium empty state with a SpotlightCard hover glow,
 * a large icon illustration, supporting text, and a gold-accent CTA. Used when
 * the user has no timelines, no commitments, or no habits.
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  ctaLabel,
  href,
  className,
  children,
}: Props) {
  return (
    <SpotlightCard
      className={cn('shadow-soft', className)}
      innerClassName="flex h-full flex-col items-center justify-between p-8 text-center"
      spotlightColor="oklch(0.82 0.13 88 / 0.10)"
    >
      {/* Icon illustration with gold glow */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-full blur-xl"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(circle, oklch(0.82 0.13 88 / 0.15), transparent 70%)',
          }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SpotlightCard>
  );
}
