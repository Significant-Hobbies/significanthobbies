'use client';

import { CalendarHeart, CheckCircle2, Clock, Compass, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { BentoGrid, SpotlightCard } from '~/components/aceternity';
import { cn } from '~/lib/utils';

type PrimaryCta =
  | {
      kind: 'timeline';
      href: string;
      label: string;
      description: string;
    }
  | {
      kind: 'commitment';
      href: string;
      label: string;
      description: string;
    }
  | {
      kind: 'ritual';
      href: string;
      label: string;
      description: string;
    };

export function DashboardStats({
  weeksLived,
  weeksRemaining,
  totalWeeks,
  hasBirthYear,
  timelineCount,
  habitsDone,
  habitsTotal,
  activeCommitments,
  dueToday,
  primaryCta,
}: {
  weeksLived: number;
  weeksRemaining: number;
  totalWeeks: number;
  hasBirthYear: boolean;
  timelineCount: number;
  habitsDone: number;
  habitsTotal: number;
  activeCommitments: number;
  dueToday: number;
  primaryCta: PrimaryCta;
}) {
  const ctaIcon =
    primaryCta.kind === 'timeline' ? (
      <Compass className="h-5 w-5" />
    ) : primaryCta.kind === 'commitment' ? (
      <CalendarHeart className="h-5 w-5" />
    ) : (
      <Sparkles className="h-5 w-5" />
    );

  const habitPct = habitsTotal > 0 ? (habitsDone / habitsTotal) * 100 : 0;
  const lifePct = totalWeeks > 0 ? (weeksLived / totalWeeks) * 100 : 0;

  return (
    <div className="space-y-4">
      <BentoGrid className="auto-rows-[11rem]">
        {/* Weeks to stamp — the canvas frame, hero stat with progress bar */}
        {hasBirthYear && (
          <SpotlightCard
            className="shadow-soft sm:col-span-2 lg:col-span-1"
            innerClassName="flex h-full flex-col justify-between p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-medium text-foreground">Weeks to stamp</h3>
            </div>
            <div>
              <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
                {weeksRemaining.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                of ~{totalWeeks.toLocaleString()} · {weeksLived.toLocaleString()} stamped
              </p>
              {/* Life progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${lifePct}%` }}
                />
              </div>
            </div>
          </SpotlightCard>
        )}

        {/* Timelines */}
        <SpotlightCard
          className="shadow-soft"
          innerClassName="flex h-full flex-col justify-between p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-medium text-foreground">Timelines</h3>
          </div>
          <div>
            <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
              {timelineCount}
            </p>
            <Link
              href="/timeline/new"
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" /> New timeline
            </Link>
          </div>
        </SpotlightCard>

        {/* Habits today — with progress bar */}
        <SpotlightCard
          className="shadow-soft"
          innerClassName="flex h-full flex-col justify-between p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-medium text-foreground">Habits today</h3>
          </div>
          <div>
            <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
              {habitsDone}
              <span className="text-2xl text-muted-foreground"> / {habitsTotal}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {habitsTotal === 0
                ? 'No habits yet'
                : habitsDone === habitsTotal
                  ? 'All done'
                  : `${habitsTotal - habitsDone} to go`}
            </p>
            {/* Habit progress bar */}
            {habitsTotal > 0 && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-200',
                    habitsDone === habitsTotal ? 'bg-primary' : 'bg-primary/70'
                  )}
                  style={{ width: `${habitPct}%` }}
                />
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* Active commitments — with progress indicator */}
        <SpotlightCard
          className={cn('shadow-soft', hasBirthYear && 'sm:col-span-2')}
          innerClassName="flex h-full flex-col justify-between p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-medium text-foreground">Active commitments</h3>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
                {activeCommitments}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeCommitments === 0
                  ? 'None yet'
                  : dueToday > 0
                    ? `${dueToday} waiting for a stamp`
                    : 'All stamped today'}
              </p>
              {/* Commitment status bar — shows due vs done */}
              {activeCommitments > 0 && (
                <div className="mt-3 flex h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${((activeCommitments - dueToday) / activeCommitments) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <Link
              href="/commitments"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View →
            </Link>
          </div>
        </SpotlightCard>

        {/* Primary CTA */}
        <SpotlightCard
          className="relative shadow-soft sm:col-span-2 lg:col-span-3"
          innerClassName="flex h-full flex-col justify-between p-6"
          spotlightColor="oklch(0.82 0.13 88 / 0.12)"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {ctaIcon}
            </div>
            <h3 className="font-serif text-base font-medium text-foreground">
              {primaryCta.kind === 'timeline'
                ? 'Build your first timeline'
                : primaryCta.kind === 'commitment'
                  ? 'Start a commitment'
                  : 'Open today\u2019s ritual'}
            </h3>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {primaryCta.description}
            </p>
            <Link
              href={primaryCta.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {primaryCta.label}
            </Link>
          </div>
        </SpotlightCard>
      </BentoGrid>
    </div>
  );
}
