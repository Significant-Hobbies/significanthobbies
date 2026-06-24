'use server';

import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { follows, users } from '~/db/schema';
import { parseStringArray } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only');

export async function setUsername(username: string, birthYear?: number) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = UsernameSchema.parse(username.toLowerCase());

  const existing = await db.query.users.findFirst({
    where: eq(users.username, parsed),
  });
  if (existing && existing.id !== session.user.id) {
    throw new Error('Username already taken');
  }

  const [user] = await db
    .update(users)
    .set({ username: parsed, ...(birthYear ? { birthYear } : {}) })
    .where(eq(users.id, session.user.id))
    .returning();
  revalidatePath(`/u/${parsed}`);
  return user;
}

export async function getMyProfile() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  return db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, name: true, username: true, image: true },
  });
}

export async function toggleFollow(
  targetUserId: string
): Promise<{ following: boolean; followerCount: number }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)),
  });

  if (existing) {
    await db.delete(follows).where(eq(follows.id, existing.id));
  } else {
    await db.insert(follows).values({
      followerId: currentUserId,
      followingId: targetUserId,
    });
  }

  const [result] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, targetUserId));

  const followerCount = result?.count ?? 0;

  // Revalidate the target user's profile page
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: { username: true },
  });
  if (targetUser?.username) {
    revalidatePath(`/u/${targetUser.username}`);
  }

  return { following: !existing, followerCount };
}

const UpdateProfileSchema = z.object({
  name: z.string().max(60).optional(),
  bio: z.string().max(160).optional(),
  website: z
    .string()
    .max(200)
    .refine(
      (v) => !v || v.trim() === '' || /^https?:\/\/.+/.test(v.trim()),
      'Website must start with http:// or https://'
    )
    .optional(),
});

export async function updateProfile(data: {
  bio?: string;
  website?: string;
  name?: string;
}): Promise<void> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = UpdateProfileSchema.parse(data);
  const website = parsed.website?.trim() ?? undefined;

  await db
    .update(users)
    .set({
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      ...(website !== undefined ? { website: website || null } : {}),
    })
    .where(eq(users.id, session.user.id));

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { username: true },
  });
  if (user?.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath('/settings');
}

const QuestProgressArraySchema = z.array(z.string().max(100)).max(500);

export async function syncQuestProgress(completedQuests: string[], earnedBadges: string[]) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // Validate before persisting: a non-array payload here would corrupt the
  // JSON columns and break every later quest read for this user.
  const quests = QuestProgressArraySchema.parse(completedQuests);
  const badges = QuestProgressArraySchema.parse(earnedBadges);

  await db
    .update(users)
    .set({
      completedQuests: JSON.stringify(quests),
      earnedBadges: JSON.stringify(badges),
    })
    .where(eq(users.id, session.user.id));
}

export async function getQuestProgress(): Promise<{
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
