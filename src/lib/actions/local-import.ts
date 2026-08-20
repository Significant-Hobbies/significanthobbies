'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { commitments, habitLogs, habits, journalEntries, stamps, users } from '~/db/schema';
import { dayIndexFor, inferProofType } from '~/lib/commitments';
import { isValidFrequency } from '~/lib/habit-utils';
import { dailyNoveltyById } from '~/lib/daily-novelty';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

const ProfileSchema = z.object({
  name: z.string().max(60),
  bio: z.string().max(160),
  website: z.string().max(300),
  creed: z.string().max(500),
});
const OnboardingSchema = z.object({
  username: z
    .string()
    .regex(/^[a-z0-9-]{3,30}$/)
    .optional(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  droppedHobby: z.string().max(200),
  lastFinished: z.string().nullable(),
  nextYearFeeling: z.string().nullable(),
});
const HabitSchema = z.object({
  id: z.string().startsWith('local-habit-'),
  name: z.string().trim().min(1).max(100),
  status: z.string(),
  targetFrequency: z.string(),
  icon: z.string().nullable(),
  commitmentId: z.string().nullable().optional(),
});
const LogSchema = z.object({
  id: z.string().startsWith('local-log-'),
  habitId: z.string().startsWith('local-habit-'),
  dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
});
const JournalSchema = z.object({
  id: z.string().startsWith('local-journal-'),
  dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amEntry: z.string().max(10000).nullable(),
  pmEntry: z.string().max(10000).nullable(),
  noveltyId: z.string().nullable().optional(),
  noveltyText: z.string().trim().max(160).nullable().optional(),
  noveltyCompleted: z.boolean().optional(),
});
const StampSchema = z.object({
  id: z.string().startsWith('local-stamp-'),
  dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  proofUrl: z.string().trim().min(1).max(2000),
  note: z.string().max(500),
});
const CommitmentSchema = z.object({
  id: z.string().startsWith('local-commitment-'),
  hobbyName: z.string().trim().min(1).max(80),
  goalDays: z.number().int().min(1).max(1000),
  status: z.enum(['active', 'completed', 'abandoned']),
  startDate: z.string().datetime(),
  stamps: z.array(StampSchema),
});
const PayloadSchema = z.object({
  profile: ProfileSchema.nullable(),
  onboarding: OnboardingSchema.nullable(),
  daily: z
    .object({
      habits: z.array(HabitSchema),
      logs: z.array(LogSchema),
      journals: z.array(JournalSchema),
    })
    .nullable(),
  commitments: z.array(CommitmentSchema).nullable(),
});

export type LocalAccountImport = z.input<typeof PayloadSchema>;

export async function importLocalAccountData(
  input: LocalAccountImport
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  const parsed = PayloadSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: 'Some local records could not be validated.' };
  const userId = session.user.id;
  const { profile, onboarding, daily, commitments: localCommitments } = parsed.data;

  if (profile || onboarding) {
    if (onboarding?.username) {
      const taken = await db.query.users.findFirst({
        where: eq(users.username, onboarding.username),
        columns: { id: true },
      });
      if (taken && taken.id !== userId) {
        return { success: false, error: 'That locally chosen username is already taken.' };
      }
    }
    await db
      .update(users)
      .set({
        ...(profile
          ? {
              name: profile.name || null,
              bio: profile.bio || null,
              website: profile.website || null,
              creed: profile.creed || null,
            }
          : {}),
        ...(onboarding
          ? {
              username: onboarding.username,
              birthYear: onboarding.birthYear,
              onboardingData: JSON.stringify({
                droppedHobby: onboarding.droppedHobby || undefined,
                lastFinished: onboarding.lastFinished || undefined,
                nextYearFeeling: onboarding.nextYearFeeling || undefined,
              }),
              onboardingCompletedAt: new Date(),
            }
          : {}),
      })
      .where(eq(users.id, userId));
  }

  const commitmentIds = localCommitments?.map((item) => item.id) ?? [];
  const existingCommitments = commitmentIds.length
    ? await db
        .select({ id: commitments.id, userId: commitments.userId })
        .from(commitments)
        .where(inArray(commitments.id, commitmentIds))
    : [];
  if (existingCommitments.some((item) => item.userId !== userId))
    return { success: false, error: 'A local commitment identifier is already in use.' };
  const existingCommitmentIds = new Set(existingCommitments.map((item) => item.id));
  for (const item of localCommitments ?? []) {
    if (!existingCommitmentIds.has(item.id))
      await db.insert(commitments).values({
        id: item.id,
        userId,
        hobbyName: item.hobbyName,
        goalDays: item.goalDays,
        status: item.status,
        visibility: 'private',
        startDate: new Date(item.startDate),
        completedAt: item.status === 'completed' ? new Date() : null,
      });
    for (const stamp of item.stamps) {
      const existing = await db.query.stamps.findFirst({
        where: eq(stamps.id, stamp.id),
        columns: { userId: true },
      });
      if (existing && existing.userId !== userId)
        return { success: false, error: 'A local stamp identifier is already in use.' };
      if (!existing)
        await db.insert(stamps).values({
          id: stamp.id,
          commitmentId: item.id,
          userId,
          dayDate: stamp.dayDate,
          dayIndex: dayIndexFor(new Date(item.startDate), stamp.dayDate),
          proofUrl: stamp.proofUrl,
          proofType: inferProofType(stamp.proofUrl),
          note: stamp.note || null,
        });
    }
  }

  const validCommitmentIds = new Set(commitmentIds);
  for (const habit of daily?.habits ?? []) {
    const existing = await db.query.habits.findFirst({
      where: eq(habits.id, habit.id),
      columns: { userId: true },
    });
    if (existing && existing.userId !== userId)
      return { success: false, error: 'A local habit identifier is already in use.' };
    if (!existing)
      await db.insert(habits).values({
        id: habit.id,
        userId,
        name: habit.name,
        status: 'active',
        targetFrequency: isValidFrequency(habit.targetFrequency) ? habit.targetFrequency : 'daily',
        icon: habit.icon,
        commitmentId:
          habit.commitmentId && validCommitmentIds.has(habit.commitmentId)
            ? habit.commitmentId
            : null,
      });
  }
  for (const log of daily?.logs ?? []) {
    const existing = await db.query.habitLogs.findFirst({
      where: eq(habitLogs.id, log.id),
      columns: { userId: true },
    });
    if (existing && existing.userId !== userId)
      return { success: false, error: 'A local check-in identifier is already in use.' };
    if (!existing && (daily?.habits.some((habit) => habit.id === log.habitId) ?? false))
      await db.insert(habitLogs).values({
        id: log.id,
        habitId: log.habitId,
        userId,
        dayDate: log.dayDate,
        completed: log.completed,
      });
  }
  for (const journal of daily?.journals ?? []) {
    const existingDay = await db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.userId, userId), eq(journalEntries.dayDate, journal.dayDate)),
      columns: { id: true, noveltyId: true, noveltyText: true },
    });
    const validNoveltyId = dailyNoveltyById(journal.noveltyId)?.id ?? null;
    const validNoveltyText = validNoveltyId ? null : journal.noveltyText?.trim() || null;
    const hasNovelty = Boolean(validNoveltyId || validNoveltyText);
    if (!existingDay)
      await db.insert(journalEntries).values({
        id: journal.id,
        userId,
        dayDate: journal.dayDate,
        amEntry: journal.amEntry,
        pmEntry: journal.pmEntry,
        noveltyId: validNoveltyId,
        noveltyText: validNoveltyText,
        noveltyCompleted: hasNovelty ? (journal.noveltyCompleted ?? false) : false,
      });
    else if (!existingDay.noveltyId && !existingDay.noveltyText && hasNovelty)
      await db
        .update(journalEntries)
        .set({
          noveltyId: validNoveltyId,
          noveltyText: validNoveltyText,
          noveltyCompleted: journal.noveltyCompleted ?? false,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, existingDay.id));
  }
  for (const path of [
    '/',
    '/live-more',
    '/journal',
    '/habits',
    '/commitments',
    '/history',
    '/settings',
  ])
    revalidatePath(path);
  return { success: true };
}
