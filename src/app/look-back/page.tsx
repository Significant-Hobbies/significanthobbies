import { and, desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  FadeIn,
  GradientMesh,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { AmbientMusic } from '~/components/ambient-music';
import { Whale } from '~/components/whale';
import {
  arcs,
  bucketListItems,
  commitments,
  habitLogs,
  habits,
  journalEntries,
  timelines,
  userQuests,
  users,
} from '~/db/schema';
import { generateLookBack, type LookBackData } from '~/lib/look-back';
import { parseJSONColumn } from '~/lib/utils';
import type { Phase, TimelinePin } from '~/lib/types';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Your look-back — SignificantHobbies',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LookBackPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const [
    me,
    rawTimelines,
    rawHabits,
    allHabitLogs,
    allJournal,
    completedQuestRows,
    activeQuestRows,
    abandonedQuestRows,
    allArcs,
    rawCommitments,
  ] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { name: true, creed: true, birthYear: true },
    }),
    db.select().from(timelines).where(eq(timelines.userId, session.user.id)),
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active'))),
    db.select().from(habitLogs).where(eq(habitLogs.userId, session.user.id)),
    db.select().from(journalEntries).where(eq(journalEntries.userId, session.user.id)),
    db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'completed'))),
    db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'active'))),
    db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'abandoned'))),
    db.select().from(arcs).where(eq(arcs.userId, session.user.id)),
    db.select().from(commitments).where(eq(commitments.userId, session.user.id)),
  ]);

  // Flatten all phases across timelines
  const allPhases: Phase[] = [];
  const allPins: TimelinePin[] = [];
  for (const t of rawTimelines) {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], `lookback:timeline:${t.id}`);
    allPhases.push(...phases);
    const pins = parseJSONColumn<TimelinePin[]>(t.pins, [], `lookback:pins:${t.id}`);
    allPins.push(...pins);
  }

  // Sort phases by order
  allPhases.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const lookBackData: LookBackData = {
    name: me?.name ?? session.user.name ?? null,
    creed: null, // Don't repeat the creed in the look-back — it's on the dashboard
    birthYear: me?.birthYear ?? null,
    phases: allPhases,
    pins: allPins,
    completedQuests: completedQuestRows.map((q) => ({
      title: q.title,
      sourceHobby: q.sourceHobby,
      type: q.type,
      startedAt: q.startedAt,
      completedAt: q.completedAt,
    })),
    activeQuests: activeQuestRows.map((q) => ({
      title: q.title,
      sourceHobby: q.sourceHobby,
      startedAt: q.startedAt,
    })),
    abandonedQuests: abandonedQuestRows.map((q) => ({
      title: q.title,
      sourceHobby: q.sourceHobby,
      startedAt: q.startedAt,
    })),
    habits: rawHabits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      createdAt: h.createdAt,
    })),
    habitLogs: allHabitLogs.map((l) => ({
      habitId: l.habitId,
      dayDate: l.dayDate,
      completed: l.completed,
    })),
    journalEntries: allJournal.map((j) => ({
      dayDate: j.dayDate,
      amEntry: j.amEntry,
      pmEntry: j.pmEntry,
    })),
    commitments: rawCommitments.map((c) => ({
      hobbyName: c.hobbyName,
      goalDays: c.goalDays,
      status: c.status,
      startDate: c.startDate,
      stamps: [], // Stamps are in a separate table — not fetched for simplicity
    })),
    arcs: allArcs.map((a) => ({
      title: a.title,
      emoji: a.emoji,
      type: a.type,
      status: a.status,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
    })),
  };

  const sections = generateLookBack(lookBackData);
  const hasContent = sections.length > 1; // More than just opening + closing

  return (
    <div className="relative min-h-screen">
      <GridBackground size={32} />

      {/* Ambient music toggle — top right */}
      <div className="fixed right-4 top-4 z-50">
        <AmbientMusic />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-20">
        {/* Whale + back link */}
        <div className="mb-8 flex items-center gap-3">
          <Whale size={40} float glow />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>

        {hasContent ? (
          <StaggerContainer className="space-y-12">
            {sections.map((section) => (
              <StaggerItem key={section.id}>
                <SpotlightCard className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-soft sm:p-10">
                  {section.kind === 'opening' && <GradientMesh variant="gold" />}
                  <div className="relative">
                    {section.emoji && <span className="mb-4 block text-3xl">{section.emoji}</span>}
                    {section.title && (
                      <h2 className="mb-5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                        {section.title}
                      </h2>
                    )}
                    <div className="space-y-4">
                      {section.paragraphs.map((para, i) => (
                        <p
                          key={i}
                          className={
                            section.kind === 'closing' || section.kind === 'opening'
                              ? 'font-serif text-lg leading-relaxed text-foreground'
                              : 'text-base leading-relaxed text-muted-foreground'
                          }
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <SpotlightCard className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-12 text-center shadow-soft">
            <GradientMesh variant="gold" />
            <div className="relative">
              <span className="mb-4 block text-4xl">📖</span>
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Your story is waiting to be written
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Build a timeline, start a quest, check a habit, write a journal entry. The more you
                do, the more your look-back has to say.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start on your dashboard →
              </Link>
            </div>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
}
