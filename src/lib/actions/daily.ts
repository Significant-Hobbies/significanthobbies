'use server';

import { and, eq } from 'drizzle-orm';
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

export async function createHabit(name: string, targetFrequency?: string, icon?: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return;
  const trimmed = name.trim();
  if (!trimmed) return;

  const freq = ['daily', 'weekdays', '3x_week', '5x_week'].includes(targetFrequency ?? '')
    ? targetFrequency!
    : 'daily';
  const trimmedIcon = icon?.trim() || null;

  await db.insert(habits).values({
    userId: session.user.id,
    name: trimmed,
    targetFrequency: freq,
    icon: trimmedIcon,
  });
  revalidatePath('/daily');
}

export async function deleteHabit(id: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  await db
    .update(habits)
    .set({ status: 'archived' })
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)));
  revalidatePath('/daily');
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
}

// ── Profile ─────────────────────────────────────────────────────────────────

export async function getUserProfile() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const rows = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  return rows[0] ?? null;
}
