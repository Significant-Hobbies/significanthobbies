'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { habits, userQuests, timelines } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import type { TimelinePin } from '~/lib/types';

// ─── Types ─────────────────────────────────────────────────────────────────

export type UserQuestRow = {
  id: string;
  questId: string;
  type: string;
  sourceHobby: string | null;
  sourceTimelineId: string | null;
  sourceBucketItemId: string | null;
  title: string;
  description: string | null;
  emoji: string | null;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
};

// ─── Start a quest ──────────────────────────────────────────────────────────
// Creates a UserQuest row with status='active'. If the user already has an
// active quest with the same questId, it's a no-op (idempotent).

export async function startQuest(params: {
  questId: string;
  type: 'rediscovery' | 'static';
  title: string;
  description?: string;
  emoji?: string;
  sourceHobby?: string;
  sourceTimelineId?: string;
  sourceBucketItemId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  // Check if user already has an active quest with this questId
  const existing = await db
    .select()
    .from(userQuests)
    .where(
      and(
        eq(userQuests.userId, session.user.id),
        eq(userQuests.questId, params.questId),
        eq(userQuests.status, 'active')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: true }; // Already started — idempotent
  }

  await db.insert(userQuests).values({
    userId: session.user.id,
    questId: params.questId,
    type: params.type,
    title: params.title,
    description: params.description ?? null,
    emoji: params.emoji ?? null,
    sourceHobby: params.sourceHobby ?? null,
    sourceTimelineId: params.sourceTimelineId ?? null,
    sourceBucketItemId: params.sourceBucketItemId ?? null,
    status: 'active',
  });

  // Auto-create a daily habit for this quest (best-effort — quest still starts if this fails).
  try {
    // Fetch the just-created UserQuest row to get its PK id.
    const [createdQuest] = await db
      .select({ id: userQuests.id })
      .from(userQuests)
      .where(
        and(
          eq(userQuests.userId, session.user.id),
          eq(userQuests.questId, params.questId),
          eq(userQuests.status, 'active')
        )
      )
      .limit(1);

    if (createdQuest) {
      // Avoid duplicate habits for the same quest (idempotent).
      const existingHabit = await db
        .select({ id: habits.id })
        .from(habits)
        .where(eq(habits.sourceQuestId, createdQuest.id))
        .limit(1);

      if (existingHabit.length === 0) {
        await db.insert(habits).values({
          userId: session.user.id,
          name: params.title,
          targetFrequency: 'daily',
          icon: params.emoji ?? null,
          sourceQuestId: createdQuest.id,
          status: 'active',
        });
      }
    }
  } catch {
    // Habit creation is best-effort; the quest should still start.
  }

  revalidatePath('/dashboard');
  revalidatePath('/side-quests');
  revalidatePath('/timeline');
  revalidatePath('/life-plan');

  return { success: true };
}

// ─── Complete a quest ───────────────────────────────────────────────────────
// Marks the quest as completed AND auto-adds a pin to the source timeline.
// This is the loop-closing moment: quest completion → timeline pin.

export async function completeUserQuest(
  userQuestPkId: string
): Promise<{ success: boolean; error?: string; pinAdded?: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  // Fetch the quest
  const [quest] = await db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.id, userQuestPkId), eq(userQuests.userId, session.user.id)))
    .limit(1);

  if (!quest) return { success: false, error: 'Quest not found' };
  if (quest.status === 'completed') return { success: true }; // Already done

  // Mark as completed
  await db
    .update(userQuests)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(userQuests.id, userQuestPkId));

  // Archive the auto-created daily habit for this quest (best-effort).
  try {
    await db
      .update(habits)
      .set({ status: 'archived' })
      .where(and(eq(habits.sourceQuestId, userQuestPkId), eq(habits.userId, session.user.id)));
  } catch {
    // Best-effort; quest completion should still succeed.
  }

  // Auto-add a pin to the source timeline (the loop!)
  let pinAdded = false;
  if (quest.sourceTimelineId) {
    // Fetch the timeline to append the pin
    const [timeline] = await db
      .select()
      .from(timelines)
      .where(eq(timelines.id, quest.sourceTimelineId))
      .limit(1);

    if (timeline && timeline.userId === session.user.id) {
      // Parse existing pins
      let pins: TimelinePin[] = [];
      try {
        pins = JSON.parse(timeline.pins ?? '[]');
      } catch {
        pins = [];
      }

      // Create the pin
      const pin: TimelinePin = {
        id: `pin-${quest.questId}-${Date.now()}`,
        label: quest.title,
        emoji: quest.emoji ?? '🔄',
        date: new Date().toISOString().slice(0, 7), // YYYY-MM
        questId: quest.questId,
        relatedHobby: quest.sourceHobby ?? undefined,
      };

      pins.push(pin);

      await db
        .update(timelines)
        .set({ pins: JSON.stringify(pins), updatedAt: new Date() })
        .where(eq(timelines.id, quest.sourceTimelineId));

      pinAdded = true;
      revalidatePath(`/timeline/${quest.sourceTimelineId}`);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/side-quests');
  revalidatePath('/timeline');

  return { success: true, pinAdded };
}

// ─── Abandon a quest ────────────────────────────────────────────────────────

export async function abandonQuest(
  userQuestPkId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  await db
    .update(userQuests)
    .set({ status: 'abandoned' })
    .where(and(eq(userQuests.id, userQuestPkId), eq(userQuests.userId, session.user.id)));

  // Archive the auto-created daily habit for this quest (best-effort).
  try {
    await db
      .update(habits)
      .set({ status: 'archived' })
      .where(and(eq(habits.sourceQuestId, userQuestPkId), eq(habits.userId, session.user.id)));
  } catch {
    // Best-effort; quest abandonment should still succeed.
  }

  revalidatePath('/dashboard');
  revalidatePath('/side-quests');

  return { success: true };
}

// ─── Get active quests ──────────────────────────────────────────────────────

export async function getActiveQuests(): Promise<UserQuestRow[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];

  const rows = await db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'active')))
    .orderBy(userQuests.startedAt);

  return rows.map((r) => ({
    id: r.id,
    questId: r.questId,
    type: r.type,
    sourceHobby: r.sourceHobby,
    sourceTimelineId: r.sourceTimelineId,
    sourceBucketItemId: r.sourceBucketItemId,
    title: r.title,
    description: r.description,
    emoji: r.emoji,
    status: r.status,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
  }));
}

// ─── Get completed quests ───────────────────────────────────────────────────

export async function getCompletedQuests(): Promise<UserQuestRow[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];

  const rows = await db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, 'completed')))
    .orderBy(userQuests.completedAt);

  return rows.map((r) => ({
    id: r.id,
    questId: r.questId,
    type: r.type,
    sourceHobby: r.sourceHobby,
    sourceTimelineId: r.sourceTimelineId,
    sourceBucketItemId: r.sourceBucketItemId,
    title: r.title,
    description: r.description,
    emoji: r.emoji,
    status: r.status,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
  }));
}
