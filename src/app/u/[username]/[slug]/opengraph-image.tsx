import { eq } from 'drizzle-orm';

import { timelines, users } from '~/db/schema';
import { computePersonality } from '~/lib/personality';
import {
  fallbackTimelineImage,
  renderTimelineOgImage,
  timelineOgImageContentType,
  timelineOgImageSize,
} from '~/lib/timeline-og-image';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

export const runtime = 'nodejs';
export const size = timelineOgImageSize;
export const contentType = timelineOgImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.slug, slug),
  });

  if (!timeline) {
    return fallbackTimelineImage('Timeline not found');
  }

  // Never render private timeline content on this unauthenticated endpoint
  // (link unfurlers fetch it without cookies and cache the result).
  if (timeline.visibility === 'PRIVATE') {
    return fallbackTimelineImage('Significant Hobbies');
  }

  const timelineUser = timeline.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, timeline.userId),
        columns: { name: true, username: true },
      })
    : null;

  if (timelineUser?.username !== username) {
    return fallbackTimelineImage('Timeline not found');
  }

  const phases = parseJSONColumn<Phase[]>(timeline.phases, [], 'timeline-slug-og-image:phases');

  const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size;

  const personality = computePersonality(phases);
  const archetype = personality.archetype;

  return renderTimelineOgImage({
    title: timeline.title,
    username,
    phases,
    totalHobbies,
    archetype,
  });
}
