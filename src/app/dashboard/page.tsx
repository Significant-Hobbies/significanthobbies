import { and, desc, eq } from 'drizzle-orm';
import { BookOpen, Clock, Compass, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BehavioralInsights } from '~/components/dashboard/behavioral-insights';
import { TimezoneSync } from '~/components/timezone-sync';
import { EmptyStateCard } from '~/components/dashboard/empty-state-card';
import { HabitsSection } from '~/components/dashboard/habits-section';
import { JournalSection } from '~/components/dashboard/journal-section';
import { LifeGrid } from '~/components/life-grid';
import { TimelineCard } from '~/components/timeline-card';
import { Button } from '~/components/ui/button';
import { habitLogs, habits, journalEntries, timelines, users } from '~/db/schema';
import {
  createHabit,
  deleteHabit,
  getAllHabitLogs,
  getHabitLogsForDate,
  saveJournalEntry,
  toggleHabitLog,
} from '~/lib/actions/daily';
import { getMyCommitments } from '~/lib/actions/commitments';
import { getAbandonedQuests, getActiveQuests, getCompletedQuests } from '~/lib/actions/user-quests';
import { loginPath } from '~/lib/auth-routing';
import { computeBehavioralInsights } from '~/lib/behavioral-insights';
import { dayKeyIn, isMorningIn } from '~/lib/day';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { LocalWorkspaceHome } from '~/components/local-workspace-home';
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
  if (!session?.user) return <LocalWorkspaceHome />;

  // Resolve the user's zone first — every dayDate key below is user-local.
  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { birthYear: true, creed: true, name: true, timezone: true },
  });

  const today = dayKeyIn(me?.timezone);
  const isMorning = isMorningIn(me?.timezone);

  const [
    rawTimelines,
    myCommitments,
    myHabits,
    myHabitLogs,
    allHabitLogs,
    myJournal,
    completedQuests,
    activeQuests,
    abandonedQuests,
  ] = await Promise.all([
    db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    getMyCommitments(),
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active'))),
    db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, session.user.id), eq(habitLogs.dayDate, today))),
    // All habit logs for streak computation
    db.select().from(habitLogs).where(eq(habitLogs.userId, session.user.id)),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, today)))
      .limit(1),
    getCompletedQuests(),
    getActiveQuests(),
    getAbandonedQuests(),
  ]);

  const todayJournal = myJournal[0] ?? null;

  // Life grid — stamp weeks light up across the user's whole life.
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

  const hasCreed = me?.creed && me.creed.trim().length > 0;

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

  // Map habit rows to the shape HabitsSection expects.
  const habitsForSection = myHabits.map((h) => ({
    id: h.id,
    name: h.name,
    status: h.status,
    targetFrequency: h.targetFrequency,
    icon: h.icon,
    sourceQuestId: h.sourceQuestId,
  }));

  const habitLogsForSection = myHabitLogs.map((l) => ({
    id: l.id,
    habitId: l.habitId,
    dayDate: l.dayDate,
    completed: l.completed,
  }));

  const allHabitLogsForSection = allHabitLogs.map((l) => ({
    id: l.id,
    habitId: l.habitId,
    dayDate: l.dayDate,
    completed: l.completed,
  }));

  // Behavioral insights — computed from real activity. Quest rows come straight
  // from userQuests; the previous home for this panel read active quests through
  // the arcs table, which nothing ever wrote to, so "active" was always empty
  // and every rate it derived was wrong.
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
    timelinePhases: timelineList
      .flatMap((t) => t.phases)
      .map((p) => ({
        label: p.label,
        hobbies: (p.hobbies ?? []).map((h) => ({ name: h.name })),
      })),
    today,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:py-14">
      <TimezoneSync storedTimezone={me?.timezone ?? null} />

      {/* ════════════════════════════════════════════════════════════════════════
          1. LIFE GRID + TIMELINE (merged, top)
          The zoomed-out view: creed heading, life grid, then timelines below.
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative space-y-6 overflow-hidden rounded-[1.75rem] bg-[#f7e957] p-6 text-[#201f18] shadow-[0_16px_44px_rgba(66,55,22,0.10)] sm:p-10">
        <div className="relative space-y-6">
          {/* Section heading — creed or default */}
          {hasCreed ? (
            <div className="text-center">
              <blockquote className="font-serif text-3xl italic leading-relaxed sm:text-4xl">
                {me!.creed}
              </blockquote>
              {me?.name && <p className="mt-3 text-sm text-muted-foreground">— {me.name}</p>}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="font-serif text-5xl font-medium tracking-[-0.03em] sm:text-6xl">
                Your life
              </h1>
            </div>
          )}

          {/* Life grid — the visual centerpiece */}
          <div className="relative">
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
          </div>

          {/* Weeks stats */}
          {hasBirthYear && (
            // "Stamped" means a week you logged practice in. These are weeks
            // *lived*, which is a different and much larger number — the old
            // copy credited a 71-year-old with 3,734 practice sessions.
            <p className="text-center text-sm text-muted-foreground">
              {lifeGrid.weeksLived.toLocaleString()} weeks lived ·{' '}
              <span className="text-primary">
                {lifeGrid.weeksRemaining.toLocaleString()} ahead of you
              </span>{' '}
              of ~{lifeGrid.totalWeeks.toLocaleString()}
            </p>
          )}

          {/* Timelines — the list below the grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-3xl font-medium">Timelines</h2>
              <Link href="/timeline/new">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  New timeline
                </Button>
              </Link>
            </div>

            {timelineList.length === 0 ? (
              <EmptyStateCard
                icon={<Sparkles className="h-7 w-7 text-primary" />}
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
                        <Clock className="h-3 w-3 text-subtle" />
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
          </div>

          {/* Link to side quests */}
          <Link
            href="/side-quests"
            className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div>
              <p className="font-serif text-sm font-medium text-foreground">Side quests →</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Micro-adventures to spark momentum — pick one and start
              </p>
            </div>
            <Compass className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>

          {/* Link to look-back */}
          <Link
            href="/look-back"
            className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <div>
              <p className="font-serif text-sm font-medium text-foreground">
                Read your life back →
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your story, told back to you as a narrative
              </p>
            </div>
            <BookOpen className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          2. HABITS (middle)
          Always visible, always checkable. Interactive habit toggles.
          ════════════════════════════════════════════════════════════════════════ */}
      <HabitsSection
        today={today}
        habits={habitsForSection}
        habitLogs={habitLogsForSection}
        allHabitLogs={allHabitLogsForSection}
        actions={{
          createHabit,
          deleteHabit,
          toggleHabitLog,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════════
          3. INSIGHTS
          Patterns read back from real activity — quests, habits, hobbies.
          Renders nothing until there is enough history to say anything.
          ════════════════════════════════════════════════════════════════════════ */}
      <BehavioralInsights insights={behavioralInsights} />

      {/* ════════════════════════════════════════════════════════════════════════
          4. JOURNAL (bottom, first-class)
          The quiet moment at the end. AM/PM entries, writable directly.
          ════════════════════════════════════════════════════════════════════════ */}
      <JournalSection
        today={today}
        isMorning={isMorning}
        journalEntry={todayJournal}
        actions={{
          saveJournalEntry,
        }}
      />
    </div>
  );
}
