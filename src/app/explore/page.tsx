import Link from "next/link";
import { db } from "~/server/db";
import { ExploreClient } from "./explore-client";
import { getCategoryForHobby } from "~/lib/hobbies";
import type { Phase, TimelineData, TimelineVisibility } from "~/lib/types";

export const metadata = {
  title: "Explore Hobby Timelines — SignificantHobbies",
  description: "Discover how people spend their time across life phases. Browse community hobby timelines, trending interests, and inspiring journeys.",
};

export default async function ExplorePage() {
  const rawTimelines = await db.timeline.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const timelines: (TimelineData & { likeCount: number })[] = rawTimelines.map((raw) => {
    let phases: Phase[] = [];
    try {
      phases = JSON.parse(raw.phases as string) as Phase[];
    } catch { /* ignore */ }
    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      likeCount: raw._count.likes,
      user: raw.user
        ? {
            id: raw.user.id,
            name: raw.user.name,
            username: raw.user.username,
            image: raw.user.image,
          }
        : null,
    };
  });

  // Aggregate trending hobbies
  const hobbyCount: Record<string, number> = {};
  for (const t of timelines) {
    for (const p of t.phases) {
      for (const h of p.hobbies) {
        hobbyCount[h.name] = (hobbyCount[h.name] ?? 0) + 1;
      }
    }
  }
  const trendingHobbies = Object.entries(hobbyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, emoji: getCategoryForHobby(name)?.emoji ?? "✨" }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Page header */}
      <div className="scroll-reveal mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Explore timelines</h1>
        <p className="mt-2 text-stone-500">
          Discover how people spend their time — across life phases, hobbies, and chapters.
        </p>
      </div>

      {/* Trending hobbies */}
      {trendingHobbies.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Trending
          </p>
          <div className="flex flex-wrap gap-2">
            {trendingHobbies.map(({ name, count, emoji }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600"
              >
                <span>{emoji}</span>
                <span>{name}</span>
                <span className="text-stone-400">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <ExploreClient timelines={timelines} />
    </div>
  );
}
