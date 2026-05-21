"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { timelines, likes, comments, users } from "~/db/schema";
import type { Phase, TimelineVisibility, TimelinePin } from "~/lib/types";
import { trackActivated, trackCoreAction } from "~/lib/analytics";

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
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

export async function saveTimeline(data: {
  title?: string;
  phases: Phase[];
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  revalidatePath("/timeline");
  if (session.user.username && slug) {
    revalidatePath(`/u/${session.user.username}/${slug}`);
  }

  // Owner analytics: saving a timeline is the core action; the first save is
  // the user's `activated` milestone.
  trackCoreAction("timeline_saved", session.user.id);
  if (priorCount === 0) {
    trackActivated(session.user.id);
  }

  return timeline;
}

export async function updateTimeline(
  id: string,
  data: { title?: string; phases: Phase[] },
) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  const parsed = SaveTimelineSchema.parse(data);
  const newPhasesJson = JSON.stringify(parsed.phases);

  // Snapshot current phases into versions if they changed
  let versions: { date: string; phases: string }[] = [];
  try { versions = JSON.parse(timeline.versions); } catch { /* ignore */ }

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

export async function setTimelineVisibility(
  id: string,
  visibility: TimelineVisibility,
) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  let slug = timeline.slug;
  if ((visibility === "PUBLIC" || visibility === "UNLISTED") && !slug) {
    slug = nanoid(10);
  }

  const [updated] = await db
    .update(timelines)
    .set({ visibility, slug, updatedAt: new Date() })
    .where(eq(timelines.id, id))
    .returning();
  revalidatePath(`/timeline/${id}`);
  if (updated?.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
  return updated;
}

export async function deleteTimeline(id: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  await db.delete(timelines).where(eq(timelines.id, id));
  revalidatePath("/timeline");
}

export async function getLikeStatus(
  timelineId: string,
): Promise<{ liked: boolean; count: number }> {
  const session = await getServerAuthSession();

  const [result] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.timelineId, timelineId));

  const likeCount = result?.count ?? 0;

  if (!session?.user?.id) {
    return { liked: false, count: likeCount };
  }

  const existing = await db.query.likes.findFirst({
    where: and(
      eq(likes.userId, session.user.id),
      eq(likes.timelineId, timelineId),
    ),
  });

  return { liked: !!existing, count: likeCount };
}

export async function toggleLike(
  timelineId: string,
): Promise<{ liked: boolean; count: number }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await db.query.likes.findFirst({
    where: and(
      eq(likes.userId, session.user.id),
      eq(likes.timelineId, timelineId),
    ),
  });

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id));
  } else {
    await db.insert(likes).values({
      userId: session.user.id,
      timelineId,
    });
  }

  const [result] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.timelineId, timelineId));

  const likeCount = result?.count ?? 0;
  revalidatePath(`/timeline/${timelineId}`);

  const tl = await db.query.timelines.findFirst({
    where: eq(timelines.id, timelineId),
    columns: { slug: true, userId: true },
  });
  if (tl?.slug && tl.userId) {
    const tlUser = await db.query.users.findFirst({
      where: eq(users.id, tl.userId),
      columns: { username: true },
    });
    if (tlUser?.username) {
      revalidatePath(`/u/${tlUser.username}/${tl.slug}`);
    }
  }
  return { liked: !existing, count: likeCount };
}

export async function addComment(timelineId: string, body: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const trimmed = body.trim().slice(0, 280);
  if (!trimmed) throw new Error("Comment body is required");

  const [comment] = await db
    .insert(comments)
    .values({ userId: session.user.id, timelineId, body: trimmed })
    .returning();

  // Fetch the user info to return with the comment
  const commentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { name: true, username: true, image: true },
  });

  revalidatePath(`/timeline/${timelineId}`);
  const tl = await db.query.timelines.findFirst({
    where: eq(timelines.id, timelineId),
    columns: { slug: true, userId: true },
  });
  if (tl?.slug && tl.userId) {
    const tlUser = await db.query.users.findFirst({
      where: eq(users.id, tl.userId),
      columns: { username: true },
    });
    if (tlUser?.username) {
      revalidatePath(`/u/${tlUser.username}/${tl.slug}`);
    }
  }
  return { ...comment, user: commentUser };
}

export async function deleteComment(commentId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });
  if (!comment || comment.userId !== session.user.id)
    throw new Error("Not found");

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath(`/timeline/${comment.timelineId}`);
  const tl = await db.query.timelines.findFirst({
    where: eq(timelines.id, comment.timelineId),
    columns: { slug: true, userId: true },
  });
  if (tl?.slug && tl.userId) {
    const tlUser = await db.query.users.findFirst({
      where: eq(users.id, tl.userId),
      columns: { username: true },
    });
    if (tlUser?.username) {
      revalidatePath(`/u/${tlUser.username}/${tl.slug}`);
    }
  }
}

const PinSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(200),
  emoji: z.string().max(10),
  date: z.string().regex(/^\d{4}-\d{2}$/),
  questId: z.string().optional(),
  relatedHobby: z.string().max(100).optional(),
});

export async function addPin(timelineId: string, pin: TimelinePin) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, timelineId),
  });
  if (!timeline || timeline.userId !== session.user.id) throw new Error("Not found");

  const parsed = PinSchema.parse(pin);
  let pins: TimelinePin[] = [];
  try { pins = JSON.parse(timeline.pins); } catch { /* ignore */ }
  pins.push(parsed as TimelinePin);

  const [updated] = await db
    .update(timelines)
    .set({ pins: JSON.stringify(pins), updatedAt: new Date() })
    .where(eq(timelines.id, timelineId))
    .returning();
  revalidatePath(`/timeline/${timelineId}`);
  if (updated?.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
}

export async function removePin(timelineId: string, pinId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, timelineId),
  });
  if (!timeline || timeline.userId !== session.user.id) throw new Error("Not found");

  let pins: TimelinePin[] = [];
  try { pins = JSON.parse(timeline.pins); } catch { /* ignore */ }
  pins = pins.filter((p) => p.id !== pinId);

  const [updatedTl] = await db
    .update(timelines)
    .set({ pins: JSON.stringify(pins), updatedAt: new Date() })
    .where(eq(timelines.id, timelineId))
    .returning();
  revalidatePath(`/timeline/${timelineId}`);
  if (updatedTl?.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updatedTl.slug}`);
  }
}
