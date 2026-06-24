import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import { TimelineBuilder } from '~/components/timeline-builder/builder';
import { timelines, users } from '~/db/schema';
import type { Phase, TimelineData, TimelineVisibility } from '~/lib/types';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit Timeline — SignificantHobbies' };

export default async function EditTimelinePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerAuthSession();

  if (!session?.user?.id) redirect('/login');

  const raw = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });

  if (!raw || raw.userId !== session.user.id) notFound();

  const timelineUser = raw.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, raw.userId),
        columns: { id: true, name: true, username: true, image: true },
      })
    : null;

  let phases: Phase[] = [];
  try {
    phases = JSON.parse(raw.phases) as Phase[];
  } catch {
    /* ignore */
  }

  const timeline: TimelineData = {
    id: raw.id,
    title: raw.title,
    visibility: raw.visibility as TimelineVisibility,
    slug: raw.slug,
    phases,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    user: timelineUser,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Edit timeline</h1>
        <p className="mt-1 text-stone-500">Update phases and hobbies, then save.</p>
      </div>
      <TimelineBuilder existing={timeline} />
    </div>
  );
}
