import { desc, eq } from 'drizzle-orm';
import { LayoutList, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CardHoverEffect, GridBackground, SpotlightCard } from '~/components/aceternity';
import { TimelineCard } from '~/components/timeline-card';
import { Button } from '~/components/ui/button';
import { timelines } from '~/db/schema';
import type { Phase, TimelineData, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = { title: 'My Timelines — SignificantHobbies' };

export default async function MyTimelinesPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const rawTimelines = await db
    .select()
    .from(timelines)
    .where(eq(timelines.userId, session.user.id))
    .orderBy(desc(timelines.updatedAt));

  const timelineList: TimelineData[] = rawTimelines.map((raw) => {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], 'my-timelines:phases');

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
      {/* Page header with grid background */}
      <div className="relative mb-8 flex items-center justify-between gap-4">
        <GridBackground />
        <div className="relative">
          <h1 className="text-2xl font-bold text-foreground">My Timelines</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {timelineList.length > 0
              ? `${timelineList.length} timeline${timelineList.length === 1 ? '' : 's'}`
              : 'Track your hobbies across life phases'}
          </p>
        </div>
        <Link href="/timeline/new" className="relative">
          <Button className="bg-primary hover:opacity-90 text-primary-foreground">
            <Plus className="mr-1.5 h-4 w-4" />
            New Timeline
          </Button>
        </Link>
      </div>

      {timelineList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 px-6 py-20 text-center shadow-soft">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-foreground/5">
            <LayoutList className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">No timelines yet</h2>
          <p className="mb-7 max-w-xs text-sm text-muted-foreground">
            Create your first timeline to start mapping the hobbies that defined each chapter of
            your life.
          </p>
          <Link href="/timeline/new">
            <Button className="bg-primary hover:opacity-90 text-primary-foreground">
              <Plus className="mr-1.5 h-4 w-4" />
              Build your first timeline
            </Button>
          </Link>
        </div>
      ) : (
        /* Timeline grid with hover spotlight */
        <CardHoverEffect className="border-transparent bg-transparent">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timelineList.map((timeline) => (
              <SpotlightCard key={timeline.id} className="shadow-soft">
                <TimelineCard timeline={timeline} showVisibility={true} />
              </SpotlightCard>
            ))}
          </div>
        </CardHoverEffect>
      )}
    </div>
  );
}
