'use server';

import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { bucketListItems, habits, timelines, trajectoryContracts, users } from '~/db/schema';
import { parseBirthDate } from '~/lib/life-in-weeks';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

const categories = [
  'travel',
  'adventure',
  'creative',
  'achievement',
  'relationships',
  'contribution',
  'food',
  'health',
  'mindfulness',
  'reflection',
] as const;

const ActivationSchema = z.object({
  name: z.string().trim().min(1).max(60),
  birthDate: z.string().refine((value) => parseBirthDate(value) !== null, 'Invalid birth date'),
  pastHobbies: z.array(z.string().trim().min(1).max(100)).min(1).max(12),
  desiredExperiences: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        category: z.enum(categories).optional(),
      })
    )
    .min(1)
    .max(50),
  annualGoals: z.array(z.string().trim().min(1).max(200)).min(1).max(8),
  habit: z.string().trim().max(100),
  trajectoryIntent: z.string().trim().min(1).max(500),
  trajectoryConstraint: z.string().trim().min(1).max(500),
});

export type ActivationInput = z.input<typeof ActivationSchema>;

export async function completeOnboarding(
  input: ActivationInput
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { success: false, error: 'Sign in to save this journey.' };
  const parsed = ActivationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: 'Complete each part of your starting point.' };

  const data = parsed.data;
  const userId = session.user.id;
  const birthDate = parseBirthDate(data.birthDate);
  if (!birthDate) return { success: false, error: 'Add a valid date of birth.' };

  await db
    .update(users)
    .set({
      name: data.name,
      birthDate,
      birthYear: Number(birthDate.slice(0, 4)),
      onboardingData: JSON.stringify({
        activationVersion: 2,
        pastHobbies: data.pastHobbies,
        desiredExperiences: data.desiredExperiences,
        annualFocus: data.annualGoals[0],
        annualGoals: data.annualGoals,
        trajectoryIntent: data.trajectoryIntent,
        trajectoryConstraint: data.trajectoryConstraint,
      }),
      onboardingCompletedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const existingTimeline = await db.query.timelines.findFirst({
    where: and(eq(timelines.userId, userId), eq(timelines.title, 'My life so far')),
    columns: { id: true },
  });
  if (!existingTimeline) {
    await db.insert(timelines).values({
      userId,
      title: 'My life so far',
      visibility: 'PRIVATE',
      slug: `life-so-far-${nanoid(7)}`,
      phases: JSON.stringify([
        {
          id: `onboarding-earlier-${nanoid(6)}`,
          label: 'Earlier chapters',
          hobbies: data.pastHobbies.map((name) => ({ name })),
          order: 0,
        },
      ]),
    });
  }

  const existingBucketItems = await db
    .select({ title: bucketListItems.title })
    .from(bucketListItems)
    .where(eq(bucketListItems.userId, userId));
  const existingTitles = new Set(
    existingBucketItems.map((item) => item.title.trim().toLowerCase())
  );
  const desired = [...data.desiredExperiences];
  for (const goal of [...data.annualGoals].reverse()) {
    if (!desired.some((item) => item.title.toLowerCase() === goal.toLowerCase())) {
      desired.unshift({ title: goal });
    }
  }
  for (const item of desired) {
    const key = item.title.trim().toLowerCase();
    if (existingTitles.has(key)) continue;
    const isFocus = data.annualGoals.some((goal) => key === goal.trim().toLowerCase());
    await db.insert(bucketListItems).values({
      userId,
      title: item.title,
      category: item.category ?? null,
      status: isFocus ? 'in_progress' : 'planned',
      visibility: 'private',
      targetYear: isFocus ? new Date().getFullYear() : null,
    });
    existingTitles.add(key);
  }

  const allHabits = await db
    .select({ name: habits.name })
    .from(habits)
    .where(eq(habits.userId, userId));

  if (data.habit) {
    if (!allHabits.some((habit) => habit.name.trim().toLowerCase() === data.habit.toLowerCase())) {
      await db.insert(habits).values({ userId, name: data.habit, status: 'active' });
    }
  }

  const activeTrajectory = await db.query.trajectoryContracts.findFirst({
    where: and(eq(trajectoryContracts.userId, userId), eq(trajectoryContracts.status, 'active')),
    columns: { id: true },
  });
  if (!activeTrajectory) {
    await db.insert(trajectoryContracts).values({
      userId,
      constraintsText: data.trajectoryConstraint,
      intentText: data.trajectoryIntent,
      decisionPolicyText:
        'When time, energy, or money opens up, choose the next feasible step toward any current goal.',
      feedbackLoopText: 'Once a month, notice what created energy and adjust the next choice.',
      cadence: 'monthly',
      status: 'active',
    });
  }

  for (const path of ['/', '/live-more', '/daily', '/history', '/bucket-list', '/timeline']) {
    revalidatePath(path);
  }
  return { success: true };
}
