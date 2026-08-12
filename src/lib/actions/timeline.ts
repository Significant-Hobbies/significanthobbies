'use server';

import { count, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { timelines } from '~/db/schema';
import { trackActivated, trackCoreAction } from '~/lib/analytics';
import { firstTimelineDestination } from '~/lib/first-timeline';
import type { Phase, TimelinePin, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

const HobbySchema = z.object({
  name: z.string().min(1).max(100),
  intensity: z.number().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});

const PhaseSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  ageStart: z.number().optional(),
  ageEnd: z.number().optional(),
  yearStart: z.number().optional(),
  yearEnd: z.number().optional(),
  hobbies: z.array(HobbySchema),
  order: z.number(),
});

const SaveTimelineSchema = z.object({
  title: z.string().max(200).optional(),
  phases: z.array(PhaseSchema),
});

async function generateSlug(title: string | undefined | null): Promise<string> {
  if (title) {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (baseSlug) {
      const existing = await db.query.timelines.findFirst({
        where: eq(timelines.slug, baseSlug),
      });
      if (!existing) return baseSlug;
      const suffixed = `${baseSlug}-${nanoid(4)}`;
      return suffixed;
    }
  }
  return nanoid(8);
}

export async function saveTimeline(data: { title?: string; phases: Phase[] }) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = SaveTimelineSchema.parse(data);
  const slug = await generateSlug(parsed.title);

  // Whether this is the user's first-ever timeline — drives `activated`.
  const [{ value: priorCount }] = await db
    .select({ value: count() })
    .from(timelines)
    .where(eq(timelines.userId, session.user.id));

  const now = new Date();
  const [timeline] = await db
    .insert(timelines)
    .values({
      userId: session.user.id,
      title: parsed.title ?? null,
      phases: JSON.stringify(parsed.phases),
      slug,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  revalidatePath('/timeline');
  if (session.user.username && slug) {
    revalidatePath(`/u/${session.user.username}/${slug}`);
  }

  // Owner analytics: saving a timeline is the core action; the first save is
  // the user's `activated` milestone.
  trackCoreAction('timeline_saved', session.user.id);
  if (priorCount === 0) {
    trackActivated(session.user.id);
  }

  if (!timeline) throw new Error('Timeline was not saved');

  const isFirst = priorCount === 0;
  return {
    timeline,
    isFirst,
    destination: firstTimelineDestination({
      id: timeline.id,
      slug: timeline.slug,
      username: session.user.username,
      isFirst,
    }),
  };
}

export async function updateTimeline(id: string, data: { title?: string; phases: Phase[] }) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  if (!timeline || timeline.userId !== session.user.id) throw new Error('Not found');

  const parsed = SaveTimelineSchema.parse(data);
  const newPhasesJson = JSON.stringify(parsed.phases);

  // Snapshot current phases into versions if they changed
  const parsedVersions = parseJSONColumn<unknown>(
    timeline.versions,
    null,
    'timeline-action:update:versions'
  );
  let versions: { date: string; phases: string }[] = Array.isArray(parsedVersions)
    ? (parsedVersions as { date: string; phases: string }[])
    : [];

  if (timeline.phases !== newPhasesJson) {
    versions.push({ date: new Date().toISOString(), phases: timeline.phases });
    if (versions.length > 10) versions = versions.slice(-10);
  }

  // Auto-generate slug if missing
  let slug = timeline.slug;
  if (!slug) {
    slug = await generateSlug(parsed.title ?? timeline.title);
  }

  const [updated] = await db
    .update(timelines)
    .set({
      title: parsed.title ?? null,
      phases: newPhasesJson,
      versions: JSON.stringify(versions),
      updatedAt: new Date(),
      ...(slug && !timeline.slug ? { slug } : {}),
    })
    .where(eq(timelines.id, id))
    .returning();
  revalidatePath(`/timeline/${id}`);
  // Also revalidate the new URL if applicable
  if (updated?.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
  return updated;
}

const VisibilitySchema = z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']);

export async function setTimelineVisibility(id: string, visibility: TimelineVisibility) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const nextVisibility = VisibilitySchema.parse(visibility);

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  if (!timeline || timeline.userId !== session.user.id) throw new Error('Not found');

  let slug = timeline.slug;
  if ((nextVisibility === 'PUBLIC' || nextVisibility === 'UNLISTED') && !slug) {
    slug = nanoid(10);
  }

  const [updated] = await db
    .update(timelines)
    .set({ visibility: nextVisibility, slug, updatedAt: new Date() })
    .where(eq(timelines.id, id))
    .returning();
  revalidatePath(`/timeline/${id}`);
  if (updated?.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
  return updated;
}
