import { and, desc, eq } from 'drizzle-orm';
import { BookOpen, Clock, Compass, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { GradientMesh, GridBackground } from '~/components/aceternity';
import { EmptyStateCard } from '~/components/dashboard/empty-state-card';
import { HabitsSection } from '~/components/dashboard/habits-section';
import { JournalSection } from '~/components/dashboard/journal-section';
import { LifeGrid } from '~/components/life-grid';
import { TimelineCard } from '~/components/timeline-card';
import { Button } from '~/components/ui/button';
import { dailyCheckins, habitLogs, habits, journalEntries, timelines, users } from '~/db/schema';
import {
  createHabit,
  deleteHabit,
  getAllHabitLogs,
  getDailyCheckin,
  getHabitLogsForDate,
  saveDailyCheckin,
  saveJournalEntry,
  toggleHabitLog,
} from '~/lib/actions/daily';
import { getMyCommitments } from '~/lib/actions/commitments';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
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
    myCommitments,
    me,
    myHabits,
    myHabitLogs,
    allHabitLogs,
    myJournal,
    myCheckin,
  ] = await Promise.all([
    db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    getMyCommitments(),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { birthYear: true, creed: true, name: true },
    }),
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
    db
      .select()
      .from(dailyCheckins)
      .where(and(eq(dailyCheckins.userId, session.user.id), eq(dailyCheckins.dayDate, today)))
      .limit(1),
  ]);

  const todayJournal = myJournal[0] ?? null;
  const todayCheckin = myCheckin[0] ?? null;

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-16">
      {/* ════════════════════════════════════════════════════════════════════════
          1. LIFE GRID + TIMELINE (merged, top)
          The zoomed-out view: creed heading, life grid, then timelines below.
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative space-y-6 overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant="gold" />
        <GridBackground size={24} />

        <div className="relative space-y-6">
          {/* Section heading — creed or default */}
          {hasCreed ? (
            <div className="text-center">
              <blockquote className="font-serif text-2xl italic leading-relaxed text-foreground sm:text-3xl">
                {me!.creed}
              </blockquote>
              {me?.name && <p className="mt-3 text-sm text-muted-foreground">— {me.name}</p>}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
            <p className="text-center text-sm text-muted-foreground">
              {lifeGrid.weeksLived.toLocaleString()} weeks stamped ·{' '}
              <span className="text-primary">
                {lifeGrid.weeksRemaining.toLocaleString()} to stamp
              </span>{' '}
              of ~{lifeGrid.totalWeeks.toLocaleString()}
            </p>
          )}

          {/* Timelines — the list below the grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">Timelines</h2>
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
          </div>

          {/* Link to arcs page */}
          <Link
            href="/arcs"
            className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div>
              <p className="font-serif text-sm font-medium text-foreground">Arcs & side quests →</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your active chapters, rediscovery quests, and insights
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
          3. JOURNAL (bottom, first-class)
          The quiet moment at the end. AM/PM entries, writable directly.
          ════════════════════════════════════════════════════════════════════════ */}
      <JournalSection
        today={today}
        isMorning={isMorning}
        journalEntry={todayJournal}
        checkin={todayCheckin}
        actions={{
          saveJournalEntry,
          saveDailyCheckin,
        }}
      />
    </div>
  );
}
