'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { users } from '~/db/schema';
import { SIDE_QUEST_BADGE_IDS } from '~/lib/badges';
import { isValidTimeZone } from '~/lib/day';
import { parseStringArray } from '~/lib/utils';
import { parseBirthDate } from '~/lib/life-in-weeks';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export async function saveBirthDate(raw: string): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false };
  const birthDate = parseBirthDate(raw);
  if (!birthDate) return { success: false };
  await db
    .update(users)
    .set({ birthDate, birthYear: Number(birthDate.slice(0, 4)) })
    .where(eq(users.id, session.user.id));
  revalidatePath('/life-in-weeks');
  revalidatePath('/');
  return { success: true };
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

// ─── Timezone ───────────────────────────────────────────────────────────────
// Every `dayDate` key is user-local, so the server has to know the user's zone.
// The browser reports it; this stores it. Silent no-op when unchanged, so the
// client can call it on every mount without churning writes.

export async function saveTimezone(timeZone: string): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false };

  const candidate = timeZone.trim();
  if (!candidate || candidate.length > 64 || !isValidTimeZone(candidate)) {
    return { success: false };
  }

  const current = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { timezone: true },
  });
  if (current?.timezone === candidate) return { success: true };

  await db.update(users).set({ timezone: candidate }).where(eq(users.id, session.user.id));

  revalidatePath('/daily');
  revalidatePath('/');

  return { success: true };
}

// ─── Creed ──────────────────────────────────────────────────────────────────
// The user's personal declaration — "I am someone who..."
// This is the emotional anchor of the product. It sits at the top of the
// dashboard and on the public profile. It's the user's stamp.

export async function updateCreed(creed: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const trimmed = creed.trim().slice(0, 500); // Max 500 chars

  await db
    .update(users)
    .set({ creed: trimmed || null })
    .where(eq(users.id, session.user.id));

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { username: true },
  });
  if (user?.username) {
    revalidatePath(`/u/${user.username}`);
  }
  revalidatePath('/');
  // /settings renders the creed back into its textarea, so it belongs in this
  // action's own revalidation set. Currently redundant in practice — the only
  // caller runs `updateProfile` first, which already revalidates /settings —
  // but this action should not depend on that to be correct on its own.
  revalidatePath('/settings');

  return { success: true };
}

const QuestProgressArraySchema = z.array(z.string().max(100)).max(500);

/**
 * Persists side-quest progress from the browser into the user's row.
 *
 * Side-quest state lives in localStorage (`sh-side-quests`) so the quest board
 * works signed-out. This mirrors it to the database so clearing site data does
 * not erase it and the badges can reach the public profile.
 *
 * `earnedBadges` is shared with commitment streak badges written by `logStamp`,
 * so only the side-quest-derived ids are replaced here — everything else on the
 * row is preserved. Returns instead of throwing: the client calls this on every
 * change, including while signed out, where it must be a silent no-op.
 */
export async function syncQuestProgress(
  completedQuests: string[],
  earnedBadges: string[]
): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false };

  // Validate before persisting: a non-array payload here would corrupt the
  // JSON columns and break every later quest read for this user.
  const quests = QuestProgressArraySchema.safeParse(completedQuests);
  const badges = QuestProgressArraySchema.safeParse(earnedBadges);
  if (!quests.success || !badges.success) return { success: false };

  const current = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { earnedBadges: true },
  });
  const existing = parseStringArray(current?.earnedBadges);
  const preserved = existing.filter((id) => !SIDE_QUEST_BADGE_IDS.includes(id));
  const mergedBadges = Array.from(new Set([...preserved, ...badges.data]));

  await db
    .update(users)
    .set({
      completedQuests: JSON.stringify(quests.data),
      earnedBadges: JSON.stringify(mergedBadges),
    })
    .where(eq(users.id, session.user.id));

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { username: true },
  });
  if (me?.username) revalidatePath(`/u/${me.username}`);

  return { success: true };
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
