import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SpotlightCard } from '~/components/aceternity';
import { BucketItemControls } from '~/components/bucket-list/bucket-item-controls';
import { BucketInsights } from '~/components/bucket-list/bucket-insights';
import { QuestChainCard } from '~/components/bucket-list/quest-chain-card';
import { LiveMoreAtlas } from '~/components/life-atlas/live-more-atlas';
import { bucketListItems, timelines } from '~/db/schema';
import { getActiveQuests, getCompletedQuests } from '~/lib/actions/user-quests';
import { loginPath } from '~/lib/auth-routing';
import { computePersonality } from '~/lib/personality';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Life Plan — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function LifePlanPage() {
  const session = await getServerAuthSession();
  if (!session?.user)
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <LiveMoreAtlas />
      </main>
    );

  // Completed quests are fetched alongside active ones because QuestChainCard
  // already handles `status === 'completed'` but was only ever given active
  // rows — so a finished step silently reverted to looking un-started.
  const [rawTimelines, rawBucketItems, activeQuests, completedQuests] = await Promise.all([
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
    getActiveQuests(),
    getCompletedQuests(),
  ]);

  const chainQuests = [...activeQuests, ...completedQuests];

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

  const bucketDone = rawBucketItems.filter((i) => i.status === 'done');
  const bucketInProgress = rawBucketItems.filter((i) => i.status === 'in_progress');
  const bucketPlanned = rawBucketItems.filter((i) => i.status === 'planned');
  // "Ahead of you" means everything not finished. Before status was reachable
  // this could only ever be the planned set; now an in-progress item keeps its
  // quest chain and its controls instead of vanishing into a bare list.
  const bucketAhead = [...bucketInProgress, ...bucketPlanned];

  // Recent hobbies (present focus)
  const recentHobbies = [
    ...new Set(allPhases.slice(-3).flatMap((p) => p.hobbies.map((h) => h.name))),
  ].slice(0, 6);

  const totalDone = bucketDone.length;

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-8 sm:py-12">
      <LiveMoreAtlas
        name={session.user.name?.split(' ')[0]}
        currentHobbies={recentHobbies}
        nextThings={bucketAhead.map((item) => item.title)}
      />

      {personality && (
        <p className="text-sm text-muted-foreground">
          Your living pattern currently resembles{' '}
          <strong className="font-medium text-foreground">
            {personality.archetype.emoji} {personality.archetype.name}
          </strong>
          .
        </p>
      )}

      {/* ── What the list says about you ────────────────────────── */}
      <BucketInsights items={rawBucketItems} />

      {/* ── Future (bucket list as quest chains) ────────────────── */}
      {bucketAhead.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="ahead" className="scroll-mt-20 text-lg font-semibold text-foreground">
              Ahead of you
            </h2>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:text-lumi-600 transition-colors"
            >
              Manage bucket list →
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Each dream, broken into steps you can start today.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bucketAhead.map((item) => (
              <div key={item.id}>
                <QuestChainCard
                  bucketItemId={item.id}
                  title={item.title}
                  category={item.category}
                  activeQuests={chainQuests.map((q) => ({
                    id: q.id,
                    questId: q.questId,
                    status: q.status,
                    title: q.title,
                  }))}
                />
                <BucketItemControls
                  id={item.id}
                  status={item.status}
                  visibility={item.visibility}
                  title={item.title}
                  targetYear={item.targetYear}
                />
              </div>
            ))}
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
          <div className="space-y-3">
            {timelineList.map((tl) => (
              <div key={tl.id}>
                <Link href={`/timeline/${tl.id}`} prefetch={false}>
                  <SpotlightCard className="block rounded-xl border border-border bg-card p-4 shadow-soft transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{tl.title}</span>
                      <span className="text-xs text-subtle">
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
                        <span className="text-xs text-subtle self-center">
                          +{tl.phases.flatMap((p) => p.hobbies).length - 8} more
                        </span>
                      )}
                    </div>
                  </SpotlightCard>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <SpotlightCard className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center shadow-soft">
            <p className="text-muted-foreground mb-3">No timelines yet.</p>
            <Link
              href="/timeline/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Build your first timeline →
            </Link>
          </SpotlightCard>
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
