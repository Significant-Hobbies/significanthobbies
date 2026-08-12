'use server';

import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { bucketListItems, habits, userQuests, timelines, users } from '~/db/schema';
import { generateQuestChain } from '~/lib/quest-chains';
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

  revalidatePath('/');
  revalidatePath('/side-quests');
  revalidatePath('/timeline');
  revalidatePath('/live-more');

  return { success: true };
}

// ─── Complete a quest ───────────────────────────────────────────────────────
// Marks the quest as completed AND auto-adds a pin to the source timeline.
// This is the loop-closing moment: quest completion → timeline pin.

export async function completeUserQuest(userQuestPkId: string): Promise<{
  success: boolean;
  error?: string;
  pinAdded?: boolean;
  /** True when this completion finished the last quest of a bucket item's chain. */
  bucketItemCompleted?: boolean;
}> {
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
      // Pins render on the public timeline too. `addPin` used to revalidate that
      // path and has been deleted (quest completion is now the only writer, so
      // pins are earned rather than hand-authored) — so this has to carry it.
      if (timeline.slug) {
        const owner = await db.query.users.findFirst({
          where: eq(users.id, session.user.id),
          columns: { username: true },
        });
        if (owner?.username) revalidatePath(`/u/${owner.username}/${timeline.slug}`);
      }
    }
  }

  // Close the bucket-item loop. `sourceBucketItemId` was written when the quest
  // chain was generated and then never read back, so you could finish every
  // quest decomposed from "Learn to sail" and the bucket item stayed `planned` —
  // the chain led nowhere. Marking the item done only once its last active quest
  // is gone keeps the item honest for multi-quest chains.
  let bucketItemCompleted = false;
  if (quest.sourceBucketItemId) {
    const [item] = await db
      .select({
        id: bucketListItems.id,
        status: bucketListItems.status,
        title: bucketListItems.title,
        category: bucketListItems.category,
      })
      .from(bucketListItems)
      .where(
        and(
          eq(bucketListItems.id, quest.sourceBucketItemId),
          eq(bucketListItems.userId, session.user.id)
        )
      )
      .limit(1);

    if (item && item.status !== 'done') {
      const [{ remaining } = { remaining: 0 }] = await db
        .select({ remaining: count() })
        .from(userQuests)
        .where(
          and(
            eq(userQuests.userId, session.user.id),
            eq(userQuests.sourceBucketItemId, quest.sourceBucketItemId),
            eq(userQuests.status, 'active')
          )
        );

      // "Nothing active" is NOT "chain finished" — it is also true after the
      // very first step of a five-step chain, which would have marked a whole
      // life goal done on one step. Compare completed steps against the chain
      // this item actually generates; the generator is a pure function of
      // (id, title, category), so the server can rebuild it exactly.
      const [{ finished } = { finished: 0 }] = await db
        .select({ finished: count() })
        .from(userQuests)
        .where(
          and(
            eq(userQuests.userId, session.user.id),
            eq(userQuests.sourceBucketItemId, quest.sourceBucketItemId),
            eq(userQuests.status, 'completed')
          )
        );

      const chainLength = generateQuestChain({
        bucketItemId: item.id,
        title: item.title,
        category: item.category,
      }).length;

      if (remaining === 0 && finished >= chainLength) {
        await db
          .update(bucketListItems)
          .set({ status: 'done', completedAt: new Date(), updatedAt: new Date() })
          .where(eq(bucketListItems.id, item.id));
        bucketItemCompleted = true;
        revalidatePath('/bucket-list');
        revalidatePath('/live-more');
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/side-quests');
  revalidatePath('/timeline');

  return { success: true, pinAdded, bucketItemCompleted };
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

  revalidatePath('/');
  revalidatePath('/side-quests');

  return { success: true };
}

// ─── Get active quests ──────────────────────────────────────────────────────

/**
 * Loads the signed-in user's quests in one status, oldest first.
 *
 * 'active' and 'abandoned' order by startedAt (completedAt is null for both);
 * 'completed' orders by completedAt.
 */
async function getQuestsByStatus(
  status: 'active' | 'completed' | 'abandoned'
): Promise<UserQuestRow[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];

  const rows = await db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.userId, session.user.id), eq(userQuests.status, status)))
    .orderBy(status === 'completed' ? userQuests.completedAt : userQuests.startedAt);

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

export async function getActiveQuests(): Promise<UserQuestRow[]> {
  return await getQuestsByStatus('active');
}

// ─── Get completed quests ───────────────────────────────────────────────────

export async function getCompletedQuests(): Promise<UserQuestRow[]> {
  return await getQuestsByStatus('completed');
}

// ─── Profile visibility ─────────────────────────────────────────────────────

/**
 * Opt a quest in or out of "The evidence" on the owner's public profile.
 *
 * Quests are private by default, so this is the only way one becomes visible
 * to visitors.
 */
export async function setQuestVisibility(
  questRowId: string,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const owned = await db.query.userQuests.findFirst({
    where: and(eq(userQuests.id, questRowId), eq(userQuests.userId, session.user.id)),
    columns: { id: true },
  });
  if (!owned) return { success: false, error: 'Quest not found' };

  await db
    .update(userQuests)
    .set({ visibility: isPublic ? 'public' : 'private' })
    .where(eq(userQuests.id, questRowId));

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { username: true },
  });
  if (me?.username) revalidatePath(`/u/${me.username}`);

  return { success: true };
}
