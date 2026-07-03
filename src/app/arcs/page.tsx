import { and, eq } from 'drizzle-orm';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FadeIn, GridBackground, SpotlightCard } from '~/components/aceternity';
import { ActiveArcs } from '~/components/dashboard/active-arcs';
import { BehavioralInsights } from '~/components/dashboard/behavioral-insights';
import { RediscoveryQuests } from '~/components/timeline-view/rediscovery-quests';
import { habitLogs, habits, timelines, userQuests } from '~/db/schema';
import { getActiveArcs } from '~/lib/actions/arcs';
import { getCompletedQuests } from '~/lib/actions/user-quests';
import { computeBehavioralInsights } from '~/lib/behavioral-insights';
import { generateRediscoveryQuests } from '~/lib/quest-generator';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Arcs — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function ArcsPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const [activeArcs, completedQuests, rawTimelines, myHabits, allHabitLogs, abandonedQuestRows] =
    await Promise.all([
      getActiveArcs(),
      getCompletedQuests(),
      db.select().from(timelines).where(eq(timelines.userId, session.user.id)),
      db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active'))),
      db.select().from(habitLogs).where(eq(habitLogs.userId, session.user.id)),
      db
        .select()
        .from(userQuests)
        .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'abandoned'))),
    ]);

  // Flatten phases from all timelines for rediscovery + insights.
  const allPhases: Phase[] = [];
  let firstTimelineId: string | null = null;
  for (const raw of rawTimelines) {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], `arcs:timeline:${raw.id}`);
    if (phases.length > 0) {
      if (firstTimelineId === null) firstTimelineId = raw.id;
      allPhases.push(...phases);
    }
  }

  // Rediscovery quests — only show if the user has at least 2 phases.
  const rediscoveryQuests =
    allPhases.length >= 2 ? generateRediscoveryQuests(allPhases).slice(0, 4) : [];
  const showRediscovery = rediscoveryQuests.length > 0 && firstTimelineId !== null;

  // Behavioral insights — computed from real activity.
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
    activeQuests: activeArcs.flatMap((arc) =>
      arc.quests
        .filter((q) => q.status === 'active')
        .map((q) => ({
          id: q.id,
          questId: q.questId,
          type: arc.type,
          sourceHobby: q.sourceHobby,
          title: q.title,
          startedAt: q.startedAt,
        }))
    ),
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-16">
      {/* ─── Header ─── */}
      <FadeIn>
        <section className="relative space-y-6 overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
          <GridBackground size={24} />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-primary/80">Arcs</span>
            </div>
            <h1
              className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              The action center
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Where you start things, complete things, and see what&apos;s next. Arcs, side quests,
              and rediscovery — all in one place.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* ─── Section 1: Active arcs ─── */}
      <FadeIn delay={0.05}>
        <section className="space-y-4">
          <div>
            <h2
              className="font-serif text-2xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Your arcs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The chapters you&apos;re writing right now
            </p>
          </div>
          <ActiveArcs arcs={activeArcs} />
        </section>
      </FadeIn>

      {/* ─── Section 2: Rediscovery quests ─── */}
      {showRediscovery && firstTimelineId && (
        <FadeIn delay={0.05}>
          <section className="space-y-4">
            <div>
              <h2
                className="font-serif text-2xl font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                Rediscovery
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hobbies you&apos;ve left behind — pick one to revisit
              </p>
            </div>
            <RediscoveryQuests timelineId={firstTimelineId} phases={allPhases} />
            <Link
              href="/side-quests"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Browse all 50 side quests
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </FadeIn>
      )}

      {/* ─── Section 3: Insights ─── */}
      <FadeIn delay={0.05}>
        <section className="space-y-4">
          <div>
            <h2
              className="font-serif text-2xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Insights
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on what you&apos;ve actually done
            </p>
          </div>
          <BehavioralInsights insights={behavioralInsights} />
        </section>
      </FadeIn>

      {/* ─── Section 4: Hobbies directory + side quests links ─── */}
      <FadeIn delay={0.05}>
        <section className="space-y-4">
          <div>
            <h2
              className="font-serif text-2xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Explore
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Find your next thing</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/hobbies" className="group">
              <SpotlightCard
                className="h-full shadow-soft transition-transform duration-300 group-hover:scale-[1.01]"
                innerClassName="flex h-full flex-col gap-3 p-6"
                spotlightColor="oklch(0.82 0.13 88 / 0.10)"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    Browse 60+ hobbies
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The full catalog — creative arts, music, outdoor adventures, making, and more.
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
                  Explore the directory
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
            </Link>

            <Link href="/side-quests" className="group">
              <SpotlightCard
                className="h-full shadow-soft transition-transform duration-300 group-hover:scale-[1.01]"
                innerClassName="flex h-full flex-col gap-3 p-6"
                spotlightColor="oklch(0.82 0.13 88 / 0.10)"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    50 side quests
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Micro-adventures to spark momentum. Pick one and start in under a minute.
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open the quest board
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
            </Link>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
