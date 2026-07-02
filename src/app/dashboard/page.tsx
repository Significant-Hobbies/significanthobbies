import { and, desc, eq } from 'drizzle-orm';
import { Check, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BucketListSection } from '~/components/bucket-list-section';
import { CommitmentCard } from '~/components/commitments/commitment-card';
import { LifeGrid } from '~/components/life-grid';
import { LumiWeeklyReview } from '~/components/lumi-weekly-review';
import { TimelineCard } from '~/components/timeline-card';
import { RecommendationsPanel } from '~/components/timeline-view/recommendations-panel';
import { RediscoveryNudges } from '~/components/timeline-view/rediscovery-nudges';
import { Button } from '~/components/ui/button';
import { bucketListItems, habitLogs, habits, journalEntries, timelines, users } from '~/db/schema';
import { getMyCommitments } from '~/lib/actions/commitments';
import { computeStreak, type StampRow } from '~/lib/commitments';
import { getWeeklyReflection } from '~/lib/lumi-coach';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
import { computePersonality } from '~/lib/personality';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Your roadmap — SignificantHobbies',
  robots: { index: false, follow: false },
};

function getStalenessInfo(updatedAt: Date): {
  label: string;
  colorClass: string;
  isStale: boolean;
} {
  const daysSince = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 7) {
    return { label: `${daysSince}d ago`, colorClass: 'text-growth', isStale: false };
  }
  if (daysSince < 30) {
    return { label: `${daysSince}d ago`, colorClass: 'text-lumi-400', isStale: false };
  }
  return { label: `${daysSince}d ago`, colorClass: 'text-destructive', isStale: true };
}

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const today = new Date().toISOString().slice(0, 10);
  const isMorning = new Date().getHours() < 12;

  const [rawTimelines, rawBucketItems, myCommitments, me, myHabits, myHabitLogs, myJournal] =
    await Promise.all([
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
      getMyCommitments(),
      db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { birthYear: true },
      }),
      db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active'))),
      db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.userId, session.user.id), eq(habitLogs.dayDate, today))),
      db
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, today)))
        .limit(1),
    ]);

  const todayJournal = myJournal[0] ?? null;
  const habitsDone = myHabitLogs.filter((l) => l.completed).length;
  const habitsTotal = myHabits.length;

  const activeCommitments = myCommitments.filter((c) => c.status === 'active');
  const dueToday = activeCommitments.filter((c) => {
    const info = computeStreak(c.stamps as StampRow[]);
    return !info.stampedToday;
  });

  // Life grid — the spine. Stamp weeks light up across the user's whole life.
  const birth = birthDateFromYear(me?.birthYear);
  const stampedWeeks = new Set<number>();
  for (const c of myCommitments) {
    for (const s of c.stamps) {
      const idx = weekIndexForDay(birth, s.dayDate);
      if (idx !== null) stampedWeeks.add(idx);
    }
  }
  const lifeGrid = buildLifeGrid(birth, stampedWeeks);
  const hasBirthYear = !!me?.birthYear;

  const currentUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    username: session.user.username ?? null,
    image: session.user.image ?? null,
  };

  const timelineList = rawTimelines.map((raw) => {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], `dashboard:timeline:${raw.id}`);
    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: currentUser,
    };
  });

  const allPhases = timelineList.flatMap((t) => t.phases);
  const personality = allPhases.length > 0 ? computePersonality(allPhases) : null;

  const weeklyReflection = await getWeeklyReflection().catch((err) => {
    console.error('[dashboard] weekly reflection failed', err);
    return null;
  });

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-16">
      {/* Life grid — the spine. Quiet, not preachy. */}
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{firstName}</h1>
          {hasBirthYear && (
            <p className="mt-1 text-sm text-muted-foreground">
              {lifeGrid.weeksLived.toLocaleString()} weeks lived ·{' '}
              {lifeGrid.weeksRemaining.toLocaleString()} remaining of ~
              {lifeGrid.totalWeeks.toLocaleString()}
            </p>
          )}
        </div>

        {hasBirthYear ? (
          <LifeGrid grid={lifeGrid} />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Add your birth year in{' '}
              <Link href="/settings" className="text-foreground underline underline-offset-2">
                settings
              </Link>{' '}
              to see your life in weeks.
            </p>
          </div>
        )}
      </section>

      {/* Today's practice */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s practice</h2>
          <Link href="/commitments" className="text-sm text-muted-foreground hover:text-foreground">
            All commitments →
          </Link>
        </div>

        {activeCommitments.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {dueToday.length > 0
                ? `${dueToday.length} waiting for today's stamp.`
                : 'All stamped for today.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeCommitments.slice(0, 4).map((c) => (
                <CommitmentCard
                  key={c.id}
                  id={c.id}
                  hobbyName={c.hobbyName}
                  goalDays={c.goalDays}
                  status={c.status}
                  startDate={c.startDate}
                  stamps={c.stamps as StampRow[]}
                  canAbandon
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-md">
              <p className="text-sm text-foreground font-medium">Start a commitment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a hobby, show up daily, stamp each day with proof. A 30-day commitment spends
                roughly 4 of your remaining weeks.
              </p>
            </div>
            <Link
              href="/commitments"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shrink-0"
            >
              Begin →
            </Link>
          </div>
        )}
      </section>

      {/* Daily ritual — the other dimension */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {isMorning ? 'This morning' : 'This evening'}
          </h2>
          <Link href="/daily" className="text-sm text-muted-foreground hover:text-foreground">
            Open ritual →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Habits summary */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-foreground">Habits</p>
            {habitsTotal > 0 ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  {habitsDone} of {habitsTotal} done today
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {myHabits.slice(0, 6).map((h) => {
                    const done = myHabitLogs.some((l) => l.habitId === h.id && l.completed);
                    return (
                      <span
                        key={h.id}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${
                          done
                            ? 'border-foreground/20 bg-foreground/5 text-foreground'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {done && <Check className="h-3 w-3" />}
                        {h.name}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No habits yet.{' '}
                <Link href="/daily" className="text-foreground underline underline-offset-2">
                  Add some →
                </Link>
              </p>
            )}
          </div>

          {/* Journal summary */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-foreground">Journal</p>
            {todayJournal ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                {isMorning
                  ? (todayJournal.pmEntry ?? todayJournal.amEntry ?? '—')
                  : (todayJournal.pmEntry ?? todayJournal.amEntry ?? '—')}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {isMorning ? 'What are you doing today?' : 'What happened today?'}
              </p>
            )}
            <Link
              href="/daily"
              className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {todayJournal ? 'Continue →' : 'Start writing →'}
            </Link>
          </div>
        </div>
      </section>

      {weeklyReflection && <LumiWeeklyReview initialReflection={weeklyReflection} />}

      {/* Archetype */}
      {personality && (
        <section className="space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{personality.archetype.emoji}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                {personality.archetype.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {personality.archetype.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70 italic">
                {personality.narrative}
              </p>
            </div>
          </div>
          {Object.keys(personality.categoryBreakdown).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(personality.categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, pct]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground"
                  >
                    {cat}
                    <span className="text-muted-foreground">{pct}%</span>
                  </span>
                ))}
            </div>
          )}
        </section>
      )}

      {/* Timelines */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Your timelines</h2>
          <Link href="/timeline/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </Link>
        </div>

        {timelineList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t mapped a chapter of your life yet.
            </p>
            <Link href="/timeline/new">
              <Button>Build your first timeline</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timelineList.map((timeline) => {
              const staleness = getStalenessInfo(timeline.updatedAt);
              return (
                <div key={timeline.id} className="relative">
                  <TimelineCard timeline={timeline} showVisibility />
                  <div className="mt-1.5 flex items-center gap-1.5 px-1">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <span className={`text-xs ${staleness.colorClass}`}>{staleness.label}</span>
                    {staleness.isStale && (
                      <Link
                        href={getTimelineUrl(timeline)}
                        className="ml-auto text-xs text-foreground hover:underline"
                      >
                        Update?
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <BucketListSection initialItems={rawBucketItems} />

      {allPhases.length >= 2 && <RediscoveryNudges phases={allPhases} />}
      {allPhases.length > 0 && <RecommendationsPanel phases={allPhases} />}
    </div>
  );
}
