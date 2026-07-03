export const revalidate = 300;

import { count, desc, eq, inArray } from 'drizzle-orm';
import Link from 'next/link';

import { likes, timelines, users } from '~/db/schema';
import { getCategoryForHobby } from '~/lib/hobbies';
import type { Phase, TimelineData, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

import { ExploreClient } from './explore-client';

export const metadata = {
  title: 'Explore Hobby Timelines — SignificantHobbies',
  description:
    'Discover how people spend their time across life phases. Browse community hobby timelines, trending interests, and inspiring journeys.',
};

export default async function ExplorePage() {
  const rawTimelines = await db
    .select({
      id: timelines.id,
      title: timelines.title,
      visibility: timelines.visibility,
      slug: timelines.slug,
      phases: timelines.phases,
      createdAt: timelines.createdAt,
      updatedAt: timelines.updatedAt,
      userId: timelines.userId,
      userName: users.name,
      userUsername: users.username,
      userImage: users.image,
      userIdRef: users.id,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(eq(timelines.visibility, 'PUBLIC'))
    .orderBy(desc(timelines.updatedAt))
    .limit(100);

  // Get like counts for these timelines — single GROUP BY query instead of
  // one COUNT(*) per timeline (N+1 → 1).
  const timelineIds = rawTimelines.map((t) => t.id);
  const likeCounts: Record<string, number> = {};
  if (timelineIds.length > 0) {
    const likeCountRows = await db
      .select({ timelineId: likes.timelineId, count: count() })
      .from(likes)
      .where(inArray(likes.timelineId, timelineIds))
      .groupBy(likes.timelineId);
    for (const lc of likeCountRows) likeCounts[lc.timelineId] = lc.count;
    // timelines with no likes default to 0
  }

  const timelineList: (TimelineData & { likeCount: number })[] = rawTimelines.map((raw) => {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], 'explore:phases');
    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      likeCount: likeCounts[raw.id] ?? 0,
      user: raw.userIdRef
        ? {
            id: raw.userIdRef,
            name: raw.userName,
            username: raw.userUsername,
            image: raw.userImage,
          }
        : null,
    };
  });

  // Aggregate trending hobbies
  const hobbyCount: Record<string, number> = {};
  for (const t of timelineList) {
    for (const p of t.phases) {
      for (const h of p.hobbies) {
        hobbyCount[h.name] = (hobbyCount[h.name] ?? 0) + 1;
      }
    }
  }
  const trendingHobbies = Object.entries(hobbyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, emoji: getCategoryForHobby(name)?.emoji ?? '✨' }));
  const totalPhases = timelineList.reduce((sum, timeline) => sum + timeline.phases.length, 0);
  const totalUniqueHobbies = Object.keys(hobbyCount).length;
  const totalLikes = timelineList.reduce((sum, timeline) => sum + timeline.likeCount, 0);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-12 pb-16">
      {/* Page header */}
      <div className="scroll-reveal mb-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_22rem] md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explore timelines</h1>
          <p className="mt-2 text-muted-foreground">
            Discover how people spend their time — across life phases, hobbies, and chapters.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ExploreStat label="Public" value={String(timelineList.length)} />
          <ExploreStat label="Phases" value={String(totalPhases)} />
          <ExploreStat label="Signals" value={String(totalUniqueHobbies + totalLikes)} />
        </div>
      </div>

      {/* Trending hobbies */}
      {trendingHobbies.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-muted-foreground/60">Trending</p>
          <div className="flex flex-wrap gap-2">
            {trendingHobbies.map(({ name, count, emoji }) => (
              <Link
                key={name}
                href={`/hobbies/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
              >
                <span>{emoji}</span>
                <span>{name}</span>
                <span className="text-muted-foreground/60">({count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ExploreClient timelines={timelineList} />
    </div>
  );
}

function ExploreStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-semibold text-muted-foreground/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
