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

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let timeline: Awaited<ReturnType<typeof db.query.timelines.findFirst>>;
  try {
    timeline = await db.query.timelines.findFirst({
      where: eq(timelines.id, id),
    });
  } catch (err) {
    console.error('opengraph-image: timeline lookup failed', err);
    return fallbackTimelineImage('Significant Hobbies');
  }

  if (!timeline) return fallbackTimelineImage('Timeline not found');

  // Never render private timeline content on this unauthenticated endpoint
  // (link unfurlers fetch it without cookies and cache the result).
  if (timeline.visibility === 'PRIVATE') {
    return fallbackTimelineImage('Significant Hobbies');
  }

  let timelineUser: { name: string | null; username: string | null } | null = null;
  if (timeline.userId) {
    try {
      timelineUser =
        (await db.query.users.findFirst({
          where: eq(users.id, timeline.userId),
          columns: { name: true, username: true },
        })) ?? null;
    } catch (err) {
      console.error('opengraph-image: user lookup failed', err);
    }
  }

  const phases = parseJSONColumn<Phase[]>(timeline.phases, [], 'timeline-og-image:phases');

  const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size;

  const personality = computePersonality(phases);
  const archetype = personality.archetype;

  return renderTimelineOgImage({
    title: timeline.title,
    username: timelineUser?.username ?? null,
    phases,
    totalHobbies,
    archetype,
  });
}
