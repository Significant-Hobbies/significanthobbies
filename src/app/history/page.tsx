import { and, desc, eq } from 'drizzle-orm';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { GradientMesh, GridBackground, SpotlightCard } from '~/components/aceternity';
import { AmbientMusic } from '~/components/ambient-music';
import { Whale } from '~/components/whale';
import { LocalLookBack } from '~/components/local-look-back';
import { LocalOnboardingGate } from '~/components/local-onboarding-gate';
import { HistoryAtlas } from '~/components/life-atlas/history-atlas';
import { PhaseSwimlane } from '~/components/timeline-view/phase-swimlane';
import { bucketListItems, commitments, timelines, userQuests, users } from '~/db/schema';
import { loginPath } from '~/lib/auth-routing';
import { dayKeyIn } from '~/lib/day';
import { generateLookBack, type LookBackData } from '~/lib/look-back';
import { getTrajectoryContractState } from '~/lib/actions/trajectory-contract';
import { parseJSONColumn } from '~/lib/utils';
import type { Phase, TimelinePin } from '~/lib/types';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'History — Significant Hobbies',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LookBackPage() {
  const session = await getServerAuthSession();
  if (!session?.user)
    return (
      <LocalOnboardingGate>
        <LocalLookBack today={dayKeyIn(null)} />
      </LocalOnboardingGate>
    );

  const [
    me,
    rawTimelines,
    completedQuestRows,
    activeQuestRows,
    abandonedQuestRows,
    rawCommitments,
    trajectoryState,
  ] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        name: true,
        creed: true,
        birthYear: true,
        birthDate: true,
        timezone: true,
        // Stored since onboarding shipped, read here for the first time.
        onboardingData: true,
        onboardingCompletedAt: true,
      },
    }),
    db.select().from(timelines).where(eq(timelines.userId, session.user.id)),
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
    db.select().from(commitments).where(eq(commitments.userId, session.user.id)),
    getTrajectoryContractState(),
  ]);
  if (!me?.onboardingCompletedAt) redirect('/onboarding');

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
    // Malformed JSON must not take the page down — parseJSONColumn logs and
    // falls back, same as every other JSON column on this page.
    onboarding: parseJSONColumn<LookBackData['onboarding']>(
      me?.onboardingData,
      null,
      'look-back:onboardingData'
    ),
    onboardingCompletedAt: me?.onboardingCompletedAt ?? null,
    today: dayKeyIn(me?.timezone),
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
    habits: [],
    habitLogs: [],
    journalEntries: [],
    commitments: rawCommitments.map((c) => ({
      hobbyName: c.hobbyName,
      goalDays: c.goalDays,
      status: c.status,
      startDate: c.startDate,
      stamps: [], // Stamps are in a separate table — not fetched for simplicity
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

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <HistoryAtlas
          birthYear={me?.birthYear ?? null}
          birthDate={me?.birthDate ?? null}
          trajectory={trajectoryState.active}
        />

        <section
          id="personal-timeline"
          className="mt-8 scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-[#d9cfbd] bg-white"
        >
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="relative min-h-72 overflow-hidden bg-[#211e18]">
              <Image
                src="/categories/creative-1200.webp"
                alt="Hands making something as part of a lived hobby chapter"
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211e18] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-sm font-bold text-[#f7e957]">Your personal timeline</p>
                <h2 className="mt-2 font-serif text-4xl">The chapters that made you.</h2>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              {allPhases.length ? (
                <PhaseSwimlane phases={allPhases} pins={allPins} />
              ) : (
                <div className="flex min-h-64 flex-col justify-center">
                  <h2 className="font-serif text-3xl">Start with what you used to love.</h2>
                  <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">
                    Childhood obsessions, abandoned experiments, and quiet returns all belong here.
                  </p>
                </div>
              )}
              <Link
                href={rawTimelines[0] ? `/timeline/${rawTimelines[0].id}/edit` : '/timeline/new'}
                className="mt-6 inline-flex min-h-11 items-center border-b-2 border-current font-bold"
              >
                {allPhases.length ? 'Edit my timeline' : 'Build my timeline'} →
              </Link>
            </div>
          </div>
        </section>

        {/* Whale + back link */}
        <div className="mb-8 mt-14 flex items-center gap-3">
          <Whale size={40} float glow />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>

        {hasContent ? (
          <div className="mx-auto max-w-4xl space-y-5">
            {sections.map((section, index) => (
              <div key={section.id}>
                <SpotlightCard
                  className={`relative overflow-hidden rounded-2xl border-0 p-8 sm:p-10 ${
                    index % 3 === 0
                      ? 'bg-[#ffd0bd]'
                      : index % 3 === 1
                        ? 'bg-[#d8c8fa]'
                        : 'bg-white shadow-[0_10px_30px_rgba(66,55,22,0.08)]'
                  }`}
                >
                  {section.kind === 'opening' && <GradientMesh variant="gold" />}
                  <div className="relative">
                    {section.title && (
                      <h2 className="mb-5 font-serif text-3xl font-medium text-foreground sm:text-4xl">
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
              </div>
            ))}
          </div>
        ) : (
          <SpotlightCard className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-12 text-center shadow-soft">
            <GradientMesh variant="gold" />
            <div className="relative">
              <BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Your story is waiting to be written
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Build a timeline, start a quest, or complete a commitment. The more you live, the
                more your look-back has to say.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start with today →
              </Link>
            </div>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
}
