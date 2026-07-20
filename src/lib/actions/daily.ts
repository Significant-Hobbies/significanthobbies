'use server';

import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { dailyCheckins, habitLogs, habits, journalEntries, users } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

// ── Habits ──────────────────────────────────────────────────────────────────

export async function getHabits() {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active')));

  return rows;
}

export async function createHabit(
  name: string,
  targetFrequency?: string,
  icon?: string
): Promise<{ id: string; name: string } | null> {
  const session = await getServerAuthSession();
  if (!session?.user) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const freq = ['daily', 'weekdays', '3x_week', '5x_week'].includes(targetFrequency ?? '')
    ? targetFrequency!
    : 'daily';
  const trimmedIcon = icon?.trim() || null;

  const [habit] = await db
    .insert(habits)
    .values({
      userId: session.user.id,
      name: trimmed,
      targetFrequency: freq,
      icon: trimmedIcon,
    })
    .returning({ id: habits.id, name: habits.name });
  revalidatePath('/daily');
  revalidatePath('/dashboard');
  return habit ?? null;
}

export async function deleteHabit(id: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  await db
    .update(habits)
    .set({ status: 'archived' })
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)));
  revalidatePath('/daily');
  revalidatePath('/dashboard');
}

// ── Habit logs (check-ins) ──────────────────────────────────────────────────

export async function getHabitLogsForDate(dayDate: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const rows = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, session.user.id), eq(habitLogs.dayDate, dayDate)));

  return rows;
}

// Get all habit logs for the user (for streak computation + weekly progress).
export async function getAllHabitLogs() {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const rows = await db.select().from(habitLogs).where(eq(habitLogs.userId, session.user.id));

  return rows;
}

export async function toggleHabitLog(habitId: string, dayDate: string, completed: boolean) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  // Upsert: if a log exists for this habit+date, update it; otherwise insert.
  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.dayDate, dayDate)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(habitLogs).set({ completed }).where(eq(habitLogs.id, existing[0].id));
  } else {
    await db.insert(habitLogs).values({
      habitId,
      userId: session.user.id,
      dayDate,
      completed,
    });
  }
  revalidatePath('/daily');
  revalidatePath('/dashboard');
}

// ── Journal entries ─────────────────────────────────────────────────────────

export async function getJournalEntry(dayDate: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const rows = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, dayDate)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getJournalEntriesForRange(startDate: string, endDate: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  return db
    .select({
      id: journalEntries.id,
      dayDate: journalEntries.dayDate,
      amEntry: journalEntries.amEntry,
      pmEntry: journalEntries.pmEntry,
    })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, session.user.id),
        gte(journalEntries.dayDate, startDate),
        lte(journalEntries.dayDate, endDate)
      )
    )
    .orderBy(asc(journalEntries.dayDate));
}

export async function saveJournalEntry(
  dayDate: string,
  amEntry: string | null,
  pmEntry: string | null
) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  const existing = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, dayDate)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(journalEntries)
      .set({ amEntry, pmEntry, updatedAt: new Date() })
      .where(eq(journalEntries.id, existing[0].id));
  } else {
    await db.insert(journalEntries).values({
      userId: session.user.id,
      dayDate,
      amEntry,
      pmEntry,
    });
  }
  revalidatePath('/daily');
  revalidatePath('/dashboard');
}

// ── Daily check-in state ────────────────────────────────────────────────────

export async function getDailyCheckin(dayDate: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const rows = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, session.user.id), eq(dailyCheckins.dayDate, dayDate)))
    .limit(1);

  return rows[0] ?? null;
}

export async function saveDailyCheckin(
  dayDate: string,
  amCompleted: boolean,
  pmCompleted: boolean
) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  const existing = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, session.user.id), eq(dailyCheckins.dayDate, dayDate)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(dailyCheckins)
      .set({ amCompleted, pmCompleted, updatedAt: new Date() })
      .where(eq(dailyCheckins.id, existing[0].id));
  } else {
    await db.insert(dailyCheckins).values({
      userId: session.user.id,
      dayDate,
      amCompleted,
      pmCompleted,
    });
  }
  revalidatePath('/daily');
  revalidatePath('/dashboard');
}

// ── Profile ─────────────────────────────────────────────────────────────────

export async function getUserProfile() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const rows = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  return rows[0] ?? null;
}
