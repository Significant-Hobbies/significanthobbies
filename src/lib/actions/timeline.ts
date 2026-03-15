"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Phase, TimelineVisibility, TimelinePin } from "~/lib/types";

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
      const existing = await db.timeline.findUnique({ where: { slug: baseSlug } });
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = SaveTimelineSchema.parse(data);
  const slug = await generateSlug(parsed.title);
  const timeline = await db.timeline.create({
    data: {
      userId: session.user.id,
      title: parsed.title ?? null,
      phases: JSON.stringify(parsed.phases),
      slug,
    },
  });
  revalidatePath("/timeline");
  if (session.user.username && slug) {
    revalidatePath(`/u/${session.user.username}/${slug}`);
  }
  return timeline;
}

export async function updateTimeline(
  id: string,
  data: { title?: string; phases: Phase[] },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.timeline.findUnique({ where: { id } });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  const parsed = SaveTimelineSchema.parse(data);
  const newPhasesJson = JSON.stringify(parsed.phases);

  // Snapshot current phases into versions if they changed
  let versions: { date: string; phases: string }[] = [];
  try { versions = JSON.parse(timeline.versions as string); } catch { /* ignore */ }

  if (timeline.phases !== newPhasesJson) {
    versions.push({ date: new Date().toISOString(), phases: timeline.phases as string });
    if (versions.length > 10) versions = versions.slice(-10);
  }

  // Auto-generate slug if missing
  let slug = timeline.slug;
  if (!slug) {
    slug = await generateSlug(parsed.title ?? timeline.title);
  }

  const updated = await db.timeline.update({
    where: { id },
    data: {
      title: parsed.title ?? null,
      phases: newPhasesJson,
      versions: JSON.stringify(versions),
      ...(slug && !timeline.slug ? { slug } : {}),
    },
  });
  revalidatePath(`/timeline/${id}`);
  // Also revalidate the new URL if applicable
  if (updated.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
  return updated;
}

export async function setTimelineVisibility(
  id: string,
  visibility: TimelineVisibility,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.timeline.findUnique({ where: { id } });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  let slug = timeline.slug;
  if ((visibility === "PUBLIC" || visibility === "UNLISTED") && !slug) {
    slug = nanoid(10);
  }

  const updated = await db.timeline.update({
    where: { id },
    data: { visibility, slug },
  });
  revalidatePath(`/timeline/${id}`);
  if (updated.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
  return updated;
}

export async function deleteTimeline(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.timeline.findUnique({ where: { id } });
  if (!timeline || timeline.userId !== session.user.id)
    throw new Error("Not found");

  await db.timeline.delete({ where: { id } });
  revalidatePath("/timeline");
}

export async function getLikeStatus(
  timelineId: string,
): Promise<{ liked: boolean; count: number }> {
  const session = await getServerSession(authOptions);

  const count = await db.like.count({ where: { timelineId } });

  if (!session?.user?.id) {
    return { liked: false, count };
  }

  const existing = await db.like.findUnique({
    where: { userId_timelineId: { userId: session.user.id, timelineId } },
  });

  return { liked: !!existing, count };
}

export async function toggleLike(
  timelineId: string,
): Promise<{ liked: boolean; count: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await db.like.findUnique({
    where: { userId_timelineId: { userId: session.user.id, timelineId } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({
      data: { userId: session.user.id, timelineId },
    });
  }

  const count = await db.like.count({ where: { timelineId } });
  revalidatePath(`/timeline/${timelineId}`);
  const tl = await db.timeline.findUnique({
    where: { id: timelineId },
    select: { slug: true, user: { select: { username: true } } },
  });
  if (tl?.slug && tl.user?.username) {
    revalidatePath(`/u/${tl.user.username}/${tl.slug}`);
  }
  return { liked: !existing, count };
}

export async function addComment(timelineId: string, body: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const trimmed = body.trim().slice(0, 280);
  if (!trimmed) throw new Error("Comment body is required");

  const comment = await db.comment.create({
    data: { userId: session.user.id, timelineId, body: trimmed },
    include: {
      user: { select: { name: true, username: true, image: true } },
    },
  });

  revalidatePath(`/timeline/${timelineId}`);
  const tl = await db.timeline.findUnique({
    where: { id: timelineId },
    select: { slug: true, user: { select: { username: true } } },
  });
  if (tl?.slug && tl.user?.username) {
    revalidatePath(`/u/${tl.user.username}/${tl.slug}`);
  }
  return comment;
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id)
    throw new Error("Not found");

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/timeline/${comment.timelineId}`);
  const tl = await db.timeline.findUnique({
    where: { id: comment.timelineId },
    select: { slug: true, user: { select: { username: true } } },
  });
  if (tl?.slug && tl.user?.username) {
    revalidatePath(`/u/${tl.user.username}/${tl.slug}`);
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.timeline.findUnique({ where: { id: timelineId } });
  if (!timeline || timeline.userId !== session.user.id) throw new Error("Not found");

  const parsed = PinSchema.parse(pin);
  let pins: TimelinePin[] = [];
  try { pins = JSON.parse(timeline.pins as string); } catch { /* ignore */ }
  pins.push(parsed as TimelinePin);

  const updated = await db.timeline.update({
    where: { id: timelineId },
    data: { pins: JSON.stringify(pins) },
  });
  revalidatePath(`/timeline/${timelineId}`);
  if (updated.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updated.slug}`);
  }
}

export async function removePin(timelineId: string, pinId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const timeline = await db.timeline.findUnique({ where: { id: timelineId } });
  if (!timeline || timeline.userId !== session.user.id) throw new Error("Not found");

  let pins: TimelinePin[] = [];
  try { pins = JSON.parse(timeline.pins as string); } catch { /* ignore */ }
  pins = pins.filter((p) => p.id !== pinId);

  const updatedTl = await db.timeline.update({
    where: { id: timelineId },
    data: { pins: JSON.stringify(pins) },
  });
  revalidatePath(`/timeline/${timelineId}`);
  if (updatedTl.slug && session.user.username) {
    revalidatePath(`/u/${session.user.username}/${updatedTl.slug}`);
  }
}
