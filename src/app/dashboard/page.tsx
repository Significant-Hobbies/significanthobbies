import { and, desc, eq } from 'drizzle-orm';
import { Check, Clock, Compass, Plus, Sparkles, Sunrise, Sunset } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FadeIn, GradientMesh, GridBackground } from '~/components/aceternity';
import { ActiveQuests } from '~/components/dashboard/active-quests';
import { BehavioralInsights } from '~/components/dashboard/behavioral-insights';
import { BucketListSection } from '~/components/bucket-list-section';
import { CommitmentCard } from '~/components/commitments/commitment-card';
import { DashboardStats } from '~/components/dashboard/dashboard-stats';
import { EmptyStateCard } from '~/components/dashboard/empty-state-card';
import { HabitHeatmap } from '~/components/dashboard/habit-heatmap';
import { LifeGrid } from '~/components/life-grid';
import { LumiWeeklyReview } from '~/components/lumi-weekly-review';
import { TimelineCard } from '~/components/timeline-card';
import { RecommendationsPanel } from '~/components/timeline-view/recommendations-panel';
import { RediscoveryNudges } from '~/components/timeline-view/rediscovery-nudges';
import { Button } from '~/components/ui/button';
import {
  bucketListItems,
  habitLogs,
  habits,
  journalEntries,
  timelines,
  userQuests,
  users,
} from '~/db/schema';
import { getMyCommitments } from '~/lib/actions/commitments';
import { getActiveQuests, getCompletedQuests } from '~/lib/actions/user-quests';
import { computeBehavioralInsights } from '~/lib/behavioral-insights';
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
    return { label: `${daysSince}d ago`, colorClass: 'text-foreground', isStale: false };
  }
  return { label: `${daysSince}d ago`, colorClass: 'text-destructive', isStale: true };
}

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const today = new Date().toISOString().slice(0, 10);
  const isMorning = new Date().getHours() < 12;

  const [
    rawTimelines,
    rawBucketItems,
    myCommitments,
    me,
    myHabits,
    myHabitLogs,
    allHabitLogs,
    myJournal,
    activeQuests,
    completedQuests,
    abandonedQuestRows,
  ] = await Promise.all([
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
    // All habit logs for the heatmap + streak computation
    db.select().from(habitLogs).where(eq(habitLogs.userId, session.user.id)),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, today)))
      .limit(1),
    getActiveQuests(),
    getCompletedQuests(),
    db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'abandoned')))
      .orderBy(desc(userQuests.startedAt)),
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

  // ─── Behavioral insights — computed from real user activity ───
  const abandonedQuests = abandonedQuestRows.map((r) => ({
    id: r.id,
    questId: r.questId,
    type: r.type,
    sourceHobby: r.sourceHobby,
    title: r.title,
    startedAt: r.startedAt,
  }));
  const behavioralInsights = computeBehavioralInsights({
    completedQuests,
    activeQuests,
    abandonedQuests,
    habitLogs: allHabitLogs.map((l) => ({
      habitId: l.habitId,
      dayDate: l.dayDate,
      completed: l.completed,
    })),
    habits: myHabits.map((h) => ({
      id: h.id,
      name: h.name,
      sourceQuestId: h.sourceQuestId,
      status: h.status,
    })),
    timelinePhases: allPhases.map((p) => ({
      label: p.label,
      hobbies: (p.hobbies ?? []).map((h) => ({ name: h.name })),
    })),
  });

  const weeklyReflection = await getWeeklyReflection().catch((err) => {
    console.error('[dashboard] weekly reflection failed', err);
    return null;
  });

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  // Editorial date string
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Choose the primary CTA based on what the user is missing.
  const primaryCta =
    timelineList.length === 0
      ? {
          kind: 'timeline' as const,
          href: '/timeline/new',
          label: 'Build your first timeline →',
          description:
            'Sketch the arc of a hobby — phases, milestones, and proof. Your first timeline takes about two minutes.',
        }
      : activeCommitments.length === 0
        ? {
            kind: 'commitment' as const,
            href: '/commitments',
            label: 'Begin →',
            description:
              'Pick a hobby, show up daily, stamp each day with proof. A 30-day commitment spends roughly 4 of your remaining weeks.',
          }
        : {
            kind: 'ritual' as const,
            href: '/daily',
            label: 'Open ritual →',
            description:
              'A quiet AM/PM page with habit check-ins and a compulsory journal entry. The other dimension of a life well-lived.',
          };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-16">
      {/* ─── Hero header — gradient mesh + editorial greeting ─── */}
      <section className="relative space-y-6 overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant="gold" />
        <GridBackground size={24} />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
            {dateString}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {isMorning ? 'Good morning' : 'Good evening'}, {firstName}
          </h1>
          {hasBirthYear && (
            <p className="mt-2 text-sm text-muted-foreground">
              {lifeGrid.weeksLived.toLocaleString()} weeks lived ·{' '}
              <span className="text-primary">
                {lifeGrid.weeksRemaining.toLocaleString()} remaining
              </span>{' '}
              of ~{lifeGrid.totalWeeks.toLocaleString()}
            </p>
          )}
        </div>

        {/* Life grid — the visual centerpiece */}
        <FadeIn className="relative" delay={0.1}>
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
        </FadeIn>
      </section>

      {/* Stats bento grid — the premium product dashboard feel */}
      <DashboardStats
        weeksLived={lifeGrid.weeksLived}
        weeksRemaining={lifeGrid.weeksRemaining}
        totalWeeks={lifeGrid.totalWeeks}
        hasBirthYear={hasBirthYear}
        timelineCount={timelineList.length}
        habitsDone={habitsDone}
        habitsTotal={habitsTotal}
        activeCommitments={activeCommitments.length}
        dueToday={dueToday.length}
        primaryCta={primaryCta}
      />

      {/* ─── Active quests — the core Timeline→Quest loop ─── */}
      <FadeIn delay={0.1}>
        <ActiveQuests quests={activeQuests} />
      </FadeIn>

      {/* ─── Behavioral insights — honest patterns from real activity ─── */}
      <FadeIn delay={0.1}>
        <BehavioralInsights insights={behavioralInsights} />
      </FadeIn>

      {/* ─── Habit heatmap — visual streak display ─── */}
      {habitsTotal > 0 && (
        <FadeIn className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-foreground">Practice rhythm</h2>
            <span className="text-xs text-muted-foreground/60">Last 12 weeks</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <HabitHeatmap allHabitLogs={allHabitLogs} weeks={12} />
          </div>
        </FadeIn>
      )}

      {/* ─── Today's practice — commitments with progress ─── */}
      <FadeIn className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Today&apos;s practice
          </h2>
          {activeCommitments.length > 0 && (
            <Link
              href="/commitments"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              All commitments →
            </Link>
          )}
        </div>

        {activeCommitments.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {dueToday.length > 0
                ? `${dueToday.length} waiting for today's stamp.`
                : 'All stamped for today.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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
          <EmptyStateCard
            icon={Compass}
            title="Start a commitment"
            description="Pick a hobby, show up daily, stamp each day with proof. A 30-day commitment spends roughly 4 of your remaining weeks."
            ctaLabel="Begin"
            href="/commitments"
          />
        )}
      </FadeIn>

      {/* ─── Daily ritual — the other dimension ─── */}
      <FadeIn className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {isMorning ? 'This morning' : 'This evening'}
          </h2>
          <Link href="/daily" className="text-sm text-muted-foreground hover:text-foreground">
            Open ritual →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Habits summary */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Habits</p>
            </div>
            {habitsTotal > 0 ? (
              <>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(habitsDone / habitsTotal) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
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
                            ? 'border-primary/30 bg-primary/10 text-primary'
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
              <p className="mt-2 text-sm text-muted-foreground">
                No habits yet.{' '}
                <Link href="/daily" className="text-foreground underline underline-offset-2">
                  Add some →
                </Link>
              </p>
            )}
          </div>

          {/* Journal summary */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              {isMorning ? (
                <Sunrise className="h-4 w-4 text-primary" />
              ) : (
                <Sunset className="h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-medium text-foreground">Journal</p>
            </div>
            {todayJournal ? (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {isMorning
                  ? (todayJournal.pmEntry ?? todayJournal.amEntry ?? '—')
                  : (todayJournal.pmEntry ?? todayJournal.amEntry ?? '—')}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
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
      </FadeIn>

      {weeklyReflection && <LumiWeeklyReview initialReflection={weeklyReflection} />}

      {/* ─── Archetype ─── */}
      {personality && (
        <FadeIn className="space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{personality.archetype.emoji}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-semibold text-foreground">
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
        </FadeIn>
      )}

      {/* ─── Timelines ─── */}
      <FadeIn className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Your timelines</h2>
          <Link href="/timeline/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </Link>
        </div>

        {timelineList.length === 0 ? (
          <EmptyStateCard
            icon={Sparkles}
            title="No timelines yet"
            description="Sketch the arc of a hobby — phases, milestones, and proof. Your first timeline takes about two minutes."
            ctaLabel="Build your first timeline"
            href="/timeline/new"
          />
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
                        prefetch={false}
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
      </FadeIn>

      <BucketListSection initialItems={rawBucketItems} />

      {allPhases.length >= 2 && <RediscoveryNudges phases={allPhases} />}
      {allPhases.length > 0 && <RecommendationsPanel phases={allPhases} />}
    </div>
  );
}
