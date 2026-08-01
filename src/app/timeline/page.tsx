import { desc, eq } from 'drizzle-orm';
import { LayoutList, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CardHoverEffect, SpotlightCard } from '~/components/aceternity';
import { TimelineCard } from '~/components/timeline-card';
import { TimelineDeleteButton } from '~/components/timeline-delete-button';
import { Button } from '~/components/ui/button';
import { timelines } from '~/db/schema';
import { loginPath } from '~/lib/auth-routing';
import type { Phase, TimelineData, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { LocalWorkspaceHome } from '~/components/local-workspace-home';
import { db } from '~/server/db';

export const metadata = { title: 'My Timelines — SignificantHobbies' };

export default async function MyTimelinesPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return <LocalWorkspaceHome title="Your local timeline workspace" />;
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
      <div className="relative mb-8 flex items-center justify-between gap-4 rounded-[1.75rem] bg-[#b9dcf5] px-6 py-9 text-[#192a36] shadow-[0_14px_40px_rgba(39,74,97,0.10)] sm:px-9">
        <div className="relative">
          <p className="text-base font-bold">Your chapters</p>
          <h1 className="mt-3 font-serif text-5xl font-medium leading-none tracking-[-0.03em]">
            My Timelines
          </h1>
          <p className="mt-4 text-base text-[#405b6c]">
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
            <LayoutList className="h-6 w-6 text-subtle" />
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
                <TimelineDeleteButton timelineId={timeline.id} title={timeline.title} />
              </SpotlightCard>
            ))}
          </div>
        </CardHoverEffect>
      )}
    </div>
  );
}
