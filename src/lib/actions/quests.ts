"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { evaluateBadges } from "~/lib/badges";

export async function completeQuest(
  questId: string,
): Promise<{ success: boolean; newBadges?: string[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { completedQuests: true, earnedBadges: true, username: true },
  });
  if (!user) throw new Error("User not found");

  const completedQuests: string[] = JSON.parse(
    (user.completedQuests as string) ?? "[]",
  );
  const earnedBadges: string[] = JSON.parse(
    (user.earnedBadges as string) ?? "[]",
  );

  // Already completed — no-op
  if (completedQuests.includes(questId)) {
    return { success: true, newBadges: [] };
  }

  const updatedQuests = [...completedQuests, questId];

  // Evaluate which badges should now be earned
  const shouldEarn = evaluateBadges(updatedQuests);
  const newBadges = shouldEarn.filter((b) => !earnedBadges.includes(b));
  const updatedBadges = [...earnedBadges, ...newBadges];

  await db.user.update({
    where: { id: session.user.id },
    data: {
      completedQuests: JSON.stringify(updatedQuests),
      earnedBadges: JSON.stringify(updatedBadges),
    },
  });

  if (user.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath("/side-quests");

  return { success: true, newBadges };
}

export async function uncompleteQuest(
  questId: string,
): Promise<{ success: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { completedQuests: true, earnedBadges: true, username: true },
  });
  if (!user) throw new Error("User not found");

  const completedQuests: string[] = JSON.parse(
    (user.completedQuests as string) ?? "[]",
  );

  if (!completedQuests.includes(questId)) {
    return { success: true };
  }

  const updatedQuests = completedQuests.filter((id) => id !== questId);

  // Badges are permanent — do not revoke
  await db.user.update({
    where: { id: session.user.id },
    data: {
      completedQuests: JSON.stringify(updatedQuests),
    },
  });

  if (user.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath("/side-quests");

  return { success: true };
}

export async function getUserQuestProgress(): Promise<{
  completedQuests: string[];
  earnedBadges: string[];
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { completedQuests: [], earnedBadges: [] };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { completedQuests: true, earnedBadges: true },
  });

  if (!user) return { completedQuests: [], earnedBadges: [] };

  return {
    completedQuests: JSON.parse(
      (user.completedQuests as string) ?? "[]",
    ) as string[],
    earnedBadges: JSON.parse(
      (user.earnedBadges as string) ?? "[]",
    ) as string[],
  };
}
