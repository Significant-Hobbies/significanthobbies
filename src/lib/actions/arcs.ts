'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { arcs, userQuests } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ArcRow = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  sourceBucketItemId: string | null;
  sourceTimelineId: string | null;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
};

export type ArcWithQuests = ArcRow & {
  quests: Array<{
    id: string;
    questId: string;
    title: string;
    description: string | null;
    emoji: string | null;
    status: string;
    sourceHobby: string | null;
    startedAt: Date;
    completedAt: Date | null;
  }>;
};

// ─── Create an arc ──────────────────────────────────────────────────────────

export async function createArc(params: {
  title: string;
  description?: string;
  emoji?: string;
  type?: 'rediscovery' | 'bucket_chain' | 'custom';
  sourceBucketItemId?: string;
  sourceTimelineId?: string;
}): Promise<{ success: boolean; arcId?: string; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const [arc] = await db
    .insert(arcs)
    .values({
      userId: session.user.id,
      title: params.title,
      description: params.description ?? null,
      emoji: params.emoji ?? null,
      type: params.type ?? 'custom',
      sourceBucketItemId: params.sourceBucketItemId ?? null,
      sourceTimelineId: params.sourceTimelineId ?? null,
      status: 'active',
    })
    .returning({ id: arcs.id });

  revalidatePath('/dashboard');
  return { success: true, arcId: arc?.id };
}

// ─── Get or create a rediscovery arc ────────────────────────────────────────

export async function getOrCreateRediscoveryArc(sourceTimelineId: string): Promise<string | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  const [existing] = await db
    .select({ id: arcs.id })
    .from(arcs)
    .where(
      and(
        eq(arcs.userId, session.user.id),
        eq(arcs.type, 'rediscovery'),
        eq(arcs.sourceTimelineId, sourceTimelineId),
        eq(arcs.status, 'active')
      )
    )
    .limit(1);

  if (existing) return existing.id;

  const [arc] = await db
    .insert(arcs)
    .values({
      userId: session.user.id,
      title: 'The Rediscovery Arc',
      description: 'Picking up the hobbies you left behind.',
      emoji: '🔄',
      type: 'rediscovery',
      sourceTimelineId,
      status: 'active',
    })
    .returning({ id: arcs.id });

  return arc?.id ?? null;
}

// ─── Get or create a bucket chain arc ───────────────────────────────────────

export async function getOrCreateBucketChainArc(params: {
  bucketItemId: string;
  title: string;
  emoji?: string;
}): Promise<string | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  const [existing] = await db
    .select({ id: arcs.id })
    .from(arcs)
    .where(
      and(
        eq(arcs.userId, session.user.id),
        eq(arcs.type, 'bucket_chain'),
        eq(arcs.sourceBucketItemId, params.bucketItemId),
        eq(arcs.status, 'active')
      )
    )
    .limit(1);

  if (existing) return existing.id;

  const [arc] = await db
    .insert(arcs)
    .values({
      userId: session.user.id,
      title: params.title,
      description: 'Training arc — building toward the goal.',
      emoji: params.emoji ?? '🎯',
      type: 'bucket_chain',
      sourceBucketItemId: params.bucketItemId,
      status: 'active',
    })
    .returning({ id: arcs.id });

  return arc?.id ?? null;
}

// ─── Complete an arc ────────────────────────────────────────────────────────

export async function completeArc(arcId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  await db
    .update(arcs)
    .set({ status: 'completed', completedAt: new Date() })
    .where(and(eq(arcs.id, arcId), eq(arcs.userId, session.user.id)));

  revalidatePath('/dashboard');
  revalidatePath('/life-plan');
  revalidatePath('/timeline');

  return { success: true };
}

// ─── Abandon an arc ─────────────────────────────────────────────────────────

export async function abandonArc(arcId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  await db
    .update(arcs)
    .set({ status: 'abandoned' })
    .where(and(eq(arcs.id, arcId), eq(arcs.userId, session.user.id)));

  await db
    .update(userQuests)
    .set({ status: 'abandoned' })
    .where(and(eq(userQuests.arcId, arcId), eq(userQuests.status, 'active')));

  revalidatePath('/dashboard');
  revalidatePath('/life-plan');

  return { success: true };
}

// ─── Check if an arc is complete (all quests done) ──────────────────────────

export async function checkAndCompleteArc(arcId: string): Promise<boolean> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return false;

  const activeQuestsInArc = await db
    .select({ id: userQuests.id })
    .from(userQuests)
    .where(and(eq(userQuests.arcId, arcId), eq(userQuests.status, 'active')))
    .limit(1);

  if (activeQuestsInArc.length === 0) {
    await db
      .update(arcs)
      .set({ status: 'completed', completedAt: new Date() })
      .where(and(eq(arcs.id, arcId), eq(arcs.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/life-plan');
    revalidatePath('/timeline');
    return true;
  }

  return false;
}

// ─── Get active arcs with their quests ──────────────────────────────────────

export async function getActiveArcs(): Promise<ArcWithQuests[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];

  const activeArcs = await db
    .select()
    .from(arcs)
    .where(and(eq(arcs.userId, session.user.id), eq(arcs.status, 'active')))
    .orderBy(arcs.startedAt);

  if (activeArcs.length === 0) return [];

  const arcIds = activeArcs.map((a) => a.id);
  const allQuests = await db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.userId, session.user.id), inArray(userQuests.arcId, arcIds)));

  const questsByArc = new Map<string, typeof allQuests>();
  for (const q of allQuests) {
    if (!q.arcId) continue;
    const list = questsByArc.get(q.arcId) ?? [];
    list.push(q);
    questsByArc.set(q.arcId, list);
  }

  return activeArcs.map((arc) => ({
    id: arc.id,
    title: arc.title,
    description: arc.description,
    emoji: arc.emoji,
    type: arc.type,
    sourceBucketItemId: arc.sourceBucketItemId,
    sourceTimelineId: arc.sourceTimelineId,
    status: arc.status,
    startedAt: arc.startedAt,
    completedAt: arc.completedAt,
    quests: (questsByArc.get(arc.id) ?? [])
      .filter((q) => q.status !== 'abandoned')
      .map((q) => ({
        id: q.id,
        questId: q.questId,
        title: q.title,
        description: q.description,
        emoji: q.emoji,
        status: q.status,
        sourceHobby: q.sourceHobby,
        startedAt: q.startedAt,
        completedAt: q.completedAt,
      })),
  }));
}

// ─── Get completed arcs ─────────────────────────────────────────────────────

export async function getCompletedArcs(): Promise<ArcRow[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];

  const rows = await db
    .select()
    .from(arcs)
    .where(and(eq(arcs.userId, session.user.id), eq(arcs.status, 'completed')))
    .orderBy(arcs.completedAt);

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    emoji: a.emoji,
    type: a.type,
    sourceBucketItemId: a.sourceBucketItemId,
    sourceTimelineId: a.sourceTimelineId,
    status: a.status,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
  }));
}
