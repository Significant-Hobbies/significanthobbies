import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  FadeIn,
  GridBackground,
  NumberTicker,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { Lumi } from '~/components/lumi';
import { bucketListItems, timelines } from '~/db/schema';
import { BUCKET_ITEM_CATEGORIES, type BucketItemCategory } from '~/lib/famous-bucket-lists';
import { computePersonality } from '~/lib/personality';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Life Plan — SignificantHobbies',
  robots: { index: false, follow: false },
};

const CATEGORY_COLORS: Record<
  BucketItemCategory,
  { bg: string; border: string; text: string; dot: string }
> = {
  travel: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-400' },
  adventure: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  creative: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  achievement: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-lumi-600',
    dot: 'bg-primary',
  },
  social: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
  humanitarian: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-400',
  },
};

export default async function LifePlanPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const [rawTimelines, rawBucketItems] = await Promise.all([
    db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    db
      .select()
      .from(bucketListItems)
      .where(eq(bucketListItems.userId, session.user.id))
      .orderBy(desc(bucketListItems.createdAt)),
  ]);

  // Parse all phases
  const allPhases: Phase[] = [];
  const timelineList = rawTimelines.map((raw) => {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], `life-plan:timeline:${raw.id}`);
    allPhases.push(...phases);
    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      updatedAt: raw.updatedAt,
    };
  });

  const personality = allPhases.length > 0 ? computePersonality(allPhases) : null;

  // Categorize bucket list items
  const bucketByCategory: Record<string, typeof rawBucketItems> = {};
  const bucketDone = rawBucketItems.filter((i) => i.status === 'done');
  const bucketInProgress = rawBucketItems.filter((i) => i.status === 'in_progress');
  const bucketPlanned = rawBucketItems.filter((i) => i.status === 'planned');

  for (const item of rawBucketItems) {
    const cat = item.category ?? 'uncategorized';
    if (!bucketByCategory[cat]) bucketByCategory[cat] = [];
    bucketByCategory[cat].push(item);
  }

  // Life wheel: count items per category (excluding uncategorized)
  const wheelData = (Object.keys(BUCKET_ITEM_CATEGORIES) as BucketItemCategory[]).map((cat) => ({
    category: cat,
    label: BUCKET_ITEM_CATEGORIES[cat].label,
    emoji: BUCKET_ITEM_CATEGORIES[cat].emoji,
    count: (bucketByCategory[cat] ?? []).length,
    done: (bucketByCategory[cat] ?? []).filter((i) => i.status === 'done').length,
  }));
  const maxCount = Math.max(...wheelData.map((d) => d.count), 1);

  // Recent hobbies (present focus)
  const recentHobbies = [
    ...new Set(allPhases.slice(-3).flatMap((p) => p.hobbies.map((h) => h.name))),
  ].slice(0, 6);

  const totalBucket = rawBucketItems.length;
  const totalDone = bucketDone.length;
  const totalInProgress = bucketInProgress.length;
  const totalPlanned = bucketPlanned.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="relative">
        <GridBackground className="absolute inset-0 -z-10" />
        <FadeIn>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Lumi size={52} glow />
              <div>
                <h1 className="text-3xl font-bold text-foreground font-serif">Your life plan</h1>
                <p className="mt-1 text-muted-foreground">
                  {session.user.name?.split(' ')[0] ?? 'Your'} past, present, and future — one view.
                </p>
              </div>
            </div>
            {personality && (
              <SpotlightCard className="rounded-xl border border-border bg-card/50 px-4 py-2.5 shadow-soft">
                <p className="text-xs text-foreground font-medium">Your archetype</p>
                <p className="text-sm font-bold text-foreground">
                  {personality.archetype.emoji} {personality.archetype.name}
                </p>
              </SpotlightCard>
            )}
          </div>
        </FadeIn>
      </div>

      {/* ── Summary stats ───────────────────────────────────────── */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StaggerItem>
          <StatCard
            label="Life phases"
            value={allPhases.length}
            sub={`${timelineList.length} timeline${timelineList.length !== 1 ? 's' : ''}`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Bucket list"
            value={totalBucket}
            sub={`${totalDone} done`}
            accent="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="In progress"
            value={totalInProgress}
            sub="right now"
            accent="text-foreground"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Planned"
            value={totalPlanned}
            sub="ahead of you"
            accent="text-muted-foreground"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* ── Life wheel ──────────────────────────────────────────── */}
      {totalBucket > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Life balance</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wheelData.map((d) => {
              const colors = CATEGORY_COLORS[d.category];
              const pct = d.count > 0 ? (d.done / d.count) * 100 : 0;
              const barWidth = (d.count / maxCount) * 100;
              return (
                <div
                  key={d.category}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {d.emoji} {d.label}
                    </span>
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      {d.done}/{d.count}
                    </span>
                  </div>
                  {/* Balance bar (relative to max category) */}
                  <div className="h-1.5 rounded-full bg-card/60 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${colors.dot} transition-all duration-700`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {/* Completion bar */}
                  <div className="h-1 rounded-full bg-card/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground/20 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Present ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <FadeIn>
          <h2 className="text-lg font-semibold text-foreground font-serif">Right now</h2>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Active hobbies */}
          <FadeIn delay={0.1}>
            <SpotlightCard className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <p className="text-sm font-medium text-muted-foreground mb-3">Active hobbies</p>
              {recentHobbies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recentHobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">
                  No recent hobbies.{' '}
                  <Link href="/timeline/new" className="text-foreground hover:underline">
                    Start a timeline →
                  </Link>
                </p>
              )}
            </SpotlightCard>
          </FadeIn>

          {/* In-progress bucket items */}
          <FadeIn delay={0.2}>
            <SpotlightCard className="rounded-xl border border-primary/30 bg-primary/10/60 p-5 shadow-soft">
              <p className="text-sm font-medium text-muted-foreground mb-3">In progress</p>
              {bucketInProgress.length > 0 ? (
                <ul className="space-y-2">
                  {bucketInProgress.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.targetYear && (
                        <span className="text-xs text-muted-foreground/60 shrink-0">
                          by {item.targetYear}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground/60">
                  Nothing in progress yet.{' '}
                  <Link href="/dashboard" className="text-foreground hover:underline">
                    Move something forward →
                  </Link>
                </p>
              )}
            </SpotlightCard>
          </FadeIn>
        </div>
      </section>

      {/* ── Future (bucket list by domain) ──────────────────────── */}
      {totalPlanned > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Ahead of you</h2>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:text-lumi-600 transition-colors"
            >
              Manage bucket list →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(BUCKET_ITEM_CATEGORIES) as BucketItemCategory[]).map((cat) => {
              const items = (bucketByCategory[cat] ?? []).filter((i) => i.status !== 'done');
              if (items.length === 0) return null;
              const colors = CATEGORY_COLORS[cat];
              return (
                <div key={cat} className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
                  <p className={`text-sm font-semibold ${colors.text} mb-3`}>
                    {BUCKET_ITEM_CATEGORIES[cat].emoji} {BUCKET_ITEM_CATEGORIES[cat].label}
                  </p>
                  <ul className="space-y-1.5">
                    {items.slice(0, 6).map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-sm text-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} shrink-0`} />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.targetYear && (
                          <span className="text-xs text-muted-foreground/60 shrink-0">
                            {item.targetYear}
                          </span>
                        )}
                      </li>
                    ))}
                    {items.length > 6 && (
                      <li className="text-xs text-muted-foreground/60 pl-3.5">
                        +{items.length - 6} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Past (timeline arc) ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Where you&apos;ve been</h2>
          <Link
            href="/timeline/new"
            className="text-sm text-foreground hover:opacity-80 transition-opacity"
          >
            Add a phase →
          </Link>
        </div>
        {timelineList.length > 0 ? (
          <StaggerContainer className="space-y-3">
            {timelineList.map((tl) => (
              <StaggerItem key={tl.id}>
                <Link href={`/timeline/${tl.id}`} prefetch={false}>
                  <SpotlightCard className="block rounded-xl border border-border bg-card p-4 shadow-soft transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{tl.title}</span>
                      <span className="text-xs text-muted-foreground/60">
                        {tl.phases.length} phase{tl.phases.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tl.phases
                        .flatMap((p) => p.hobbies.map((h) => h.name))
                        .slice(0, 8)
                        .map((hobby, i) => (
                          <span
                            key={`${hobby}-${i}`}
                            className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {hobby}
                          </span>
                        ))}
                      {tl.phases.flatMap((p) => p.hobbies).length > 8 && (
                        <span className="text-xs text-muted-foreground/60 self-center">
                          +{tl.phases.flatMap((p) => p.hobbies).length - 8} more
                        </span>
                      )}
                    </div>
                  </SpotlightCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <SpotlightCard className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center shadow-soft">
              <p className="text-muted-foreground mb-3">No timelines yet.</p>
              <Link
                href="/timeline/new"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Build your first timeline →
              </Link>
            </SpotlightCard>
          </FadeIn>
        )}
      </section>

      {/* ── Completed (the archive) ─────────────────────────────── */}
      {totalDone > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Done &amp; dusted</h2>
          <div className="rounded-xl border border-lumi-200 bg-primary/10 p-5">
            <ul className="grid gap-2 sm:grid-cols-2">
              {bucketDone.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-foreground text-[9px] font-bold">
                    ✓
                  </span>
                  <span className="truncate">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = 'text-foreground',
}: {
  label: string;
  value: number;
  sub: string;
  accent?: string;
}) {
  return (
    <SpotlightCard className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold ${accent} mt-1`}>
        <NumberTicker value={value} />
      </p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>
    </SpotlightCard>
  );
}
