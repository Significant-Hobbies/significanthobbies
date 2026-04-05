import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { TimelineCard } from "~/components/timeline-card";
import { Plus, LayoutList } from "lucide-react";
import type { Phase, TimelineData, TimelineVisibility } from "~/lib/types";
import { eq, desc } from "drizzle-orm";
import { timelines } from "~/db/schema";

export const metadata = { title: "My Timelines — SignificantHobbies" };

export default async function MyTimelinesPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rawTimelines = await db
    .select()
    .from(timelines)
    .where(eq(timelines.userId, session.user.id))
    .orderBy(desc(timelines.updatedAt));

  const timelineList: TimelineData[] = rawTimelines.map((raw) => {
    let phases: Phase[] = [];
    try {
      phases = JSON.parse(raw.phases) as Phase[];
    } catch { /* ignore */ }

    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Timelines</h1>
          <p className="mt-1 text-sm text-stone-500">
            {timelineList.length > 0
              ? `${timelineList.length} timeline${timelineList.length === 1 ? "" : "s"}`
              : "Track your hobbies across life phases"}
          </p>
        </div>
        <Link href="/timeline/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-1.5 h-4 w-4" />
            New Timeline
          </Button>
        </Link>
      </div>

      {timelineList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-6 py-20 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-stone-100">
            <LayoutList className="h-6 w-6 text-stone-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            No timelines yet
          </h2>
          <p className="mb-7 max-w-xs text-sm text-stone-500">
            Create your first timeline to start mapping the hobbies that defined
            each chapter of your life.
          </p>
          <Link href="/timeline/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-1.5 h-4 w-4" />
              Build your first timeline
            </Button>
          </Link>
        </div>
      ) : (
        /* Timeline grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timelineList.map((timeline) => (
            <TimelineCard
              key={timeline.id}
              timeline={timeline}
              showVisibility={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
