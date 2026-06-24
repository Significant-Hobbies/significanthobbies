'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { users } from '~/db/schema';
import { evaluateBadges } from '~/lib/badges';
import { parseStringArray } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export async function completeQuest(
  questId: string
): Promise<{ success: boolean; newBadges?: string[] }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { completedQuests: true, earnedBadges: true, username: true },
  });
  if (!user) throw new Error('User not found');

  const completedQuests = parseStringArray(user.completedQuests);
  const earnedBadges = parseStringArray(user.earnedBadges);

  // Already completed — no-op
  if (completedQuests.includes(questId)) {
    return { success: true, newBadges: [] };
  }

  const updatedQuests = [...completedQuests, questId];

  // Evaluate which badges should now be earned
  const shouldEarn = evaluateBadges(updatedQuests);
  const newBadges = shouldEarn.filter((b) => !earnedBadges.includes(b));
  const updatedBadges = [...earnedBadges, ...newBadges];

  await db
    .update(users)
    .set({
      completedQuests: JSON.stringify(updatedQuests),
      earnedBadges: JSON.stringify(updatedBadges),
    })
    .where(eq(users.id, session.user.id));

  if (user.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath('/side-quests');

  return { success: true, newBadges };
}

export async function uncompleteQuest(questId: string): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { completedQuests: true, earnedBadges: true, username: true },
  });
  if (!user) throw new Error('User not found');

  const completedQuests = parseStringArray(user.completedQuests);

  if (!completedQuests.includes(questId)) {
    return { success: true };
  }

  const updatedQuests = completedQuests.filter((id) => id !== questId);

  // Badges are permanent — do not revoke
  await db
    .update(users)
    .set({
      completedQuests: JSON.stringify(updatedQuests),
    })
    .where(eq(users.id, session.user.id));

  if (user.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath('/side-quests');

  return { success: true };
}

export async function getUserQuestProgress(): Promise<{
  completedQuests: string[];
  earnedBadges: string[];
}> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { completedQuests: [], earnedBadges: [] };

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { completedQuests: true, earnedBadges: true },
  });

  if (!user) return { completedQuests: [], earnedBadges: [] };

  return {
    completedQuests: parseStringArray(user.completedQuests),
    earnedBadges: parseStringArray(user.earnedBadges),
  };
}
