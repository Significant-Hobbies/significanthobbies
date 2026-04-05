import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { computePersonality } from "~/lib/personality";
import { TimelineCard } from "~/components/timeline-card";
import { RediscoveryNudges } from "~/components/timeline-view/rediscovery-nudges";
import { RecommendationsPanel } from "~/components/timeline-view/recommendations-panel";
import { Button } from "~/components/ui/button";
import type { Phase, TimelineVisibility } from "~/lib/types";
import { Plus, Clock } from "lucide-react";
import { getTimelineUrl } from "~/lib/timeline-url";
import { eq, desc } from "drizzle-orm";
import { timelines } from "~/db/schema";

export const metadata = {
  title: "Dashboard — SignificantHobbies",
  robots: { index: false, follow: false },
};

function getStalenessInfo(updatedAt: Date): {
  label: string;
  colorClass: string;
  isStale: boolean;
} {
  const daysSince = Math.floor(
    (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSince < 7) {
    return { label: `${daysSince}d ago`, colorClass: "text-emerald-600", isStale: false };
  }
  if (daysSince < 30) {
    return { label: `${daysSince}d ago`, colorClass: "text-amber-500", isStale: false };
  }
  return { label: `${daysSince}d ago`, colorClass: "text-red-500", isStale: true };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const rawTimelines = await db
    .select()
    .from(timelines)
    .where(eq(timelines.userId, session.user.id))
    .orderBy(desc(timelines.updatedAt));

  const currentUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    username: session.user.username ?? null,
    image: session.user.image ?? null,
  };

  const timelineList = rawTimelines.map((raw) => {
    let phases: Phase[] = [];
    try {
      phases = JSON.parse(raw.phases) as Phase[];
    } catch {
      /* ignore */
    }
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

  // Aggregate all phases across all timelines for global insights
  const allPhases = timelineList.flatMap((t) => t.phases);
  const personality = allPhases.length > 0 ? computePersonality(allPhases) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">
          Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-stone-500">Your hobby dashboard</p>
      </div>

      {/* Personality summary */}
      {personality && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{personality.archetype.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                Your hobby archetype
              </p>
              <h2 className="text-xl font-bold text-stone-900">
                {personality.archetype.name}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {personality.archetype.description}
              </p>
              <p className="mt-2 text-xs text-stone-500 italic">
                {personality.narrative}
              </p>
            </div>
          </div>
          {Object.keys(personality.categoryBreakdown).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(personality.categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, pct]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-stone-700"
                  >
                    {cat}
                    <span className="text-emerald-600 font-medium">{pct}%</span>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Your timelines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Your timelines</h2>
          <Link href="/timeline/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Timeline
            </Button>
          </Link>
        </div>

        {timelineList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
            <p className="text-stone-500 mb-4">You haven&apos;t created any timelines yet.</p>
            <Link href="/timeline/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Create your first timeline
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timelineList.map((timeline) => {
              const staleness = getStalenessInfo(timeline.updatedAt);
              return (
                <div key={timeline.id} className="relative">
                  <TimelineCard timeline={timeline} showVisibility />
                  <div className="mt-1 flex items-center gap-1 px-1">
                    <Clock className="h-3 w-3 text-stone-400" />
                    <span className={`text-xs ${staleness.colorClass}`}>
                      {staleness.label}
                    </span>
                    {staleness.isStale && (
                      <Link
                        href={getTimelineUrl(timeline)}
                        className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Time to update?
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rediscovery nudges */}
      {allPhases.length >= 2 && <RediscoveryNudges phases={allPhases} />}

      {/* Recommendations */}
      {allPhases.length > 0 && <RecommendationsPanel phases={allPhases} />}

      {/* CTA: Create new timeline */}
      {timelineList.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-stone-800">Start a new chapter</h3>
            <p className="text-sm text-stone-500 mt-0.5">
              Create another timeline to track a different period of your life.
            </p>
          </div>
          <Link href="/timeline/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5">
              <Plus className="h-4 w-4" />
              New Timeline
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
