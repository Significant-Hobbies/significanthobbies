'use server';

import { and, asc, desc, eq, gte, lte, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { commitments, habitLogs, habits, journalEntries, timelines, users } from '~/db/schema';
import { DEFAULT_FREQUENCY, isValidFrequency } from '~/lib/habit-utils';
import {
  columnsForVerifiedJournalContext,
  journalContextFromColumns,
  type JournalContextChoice,
  type JournalContextRef,
} from '~/lib/journal-context';
import {
  habitCommitmentIdForVerifiedTarget,
  habitCommitmentLabel,
  type HabitCommitmentChoice,
} from '~/lib/habit-commitment';
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

export async function getHabitCommitmentChoices(): Promise<HabitCommitmentChoice[]> {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const rows = await db
    .select({
      id: commitments.id,
      hobbyName: commitments.hobbyName,
      goalDays: commitments.goalDays,
    })
    .from(commitments)
    .where(and(eq(commitments.userId, session.user.id), ne(commitments.status, 'abandoned')))
    .orderBy(desc(commitments.updatedAt));

  return rows.map((commitment) => ({
    id: commitment.id,
    label: habitCommitmentLabel(commitment.hobbyName, commitment.goalDays),
    href: '/commitments',
  }));
}

async function verifyOwnedHabitCommitment(
  userId: string,
  commitmentId: string
): Promise<string | null> {
  const [owned] = await db
    .select({ id: commitments.id })
    .from(commitments)
    .where(
      and(
        eq(commitments.id, commitmentId),
        eq(commitments.userId, userId),
        ne(commitments.status, 'abandoned')
      )
    )
    .limit(1);
  return owned?.id ?? null;
}

export async function createHabit(
  name: string,
  targetFrequency?: string,
  icon?: string,
  commitmentId?: string | null
): Promise<{ id: string; name: string } | null> {
  const session = await getServerAuthSession();
  if (!session?.user) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const freq = isValidFrequency(targetFrequency) ? targetFrequency! : DEFAULT_FREQUENCY;
  const trimmedIcon = icon?.trim() || null;
  const requestedCommitmentId = commitmentId?.trim() || null;
  const verifiedCommitmentId = requestedCommitmentId
    ? await verifyOwnedHabitCommitment(session.user.id, requestedCommitmentId)
    : null;

  const [habit] = await db
    .insert(habits)
    .values({
      userId: session.user.id,
      name: trimmed,
      targetFrequency: freq,
      icon: trimmedIcon,
      commitmentId: habitCommitmentIdForVerifiedTarget(requestedCommitmentId, verifiedCommitmentId),
    })
    .returning({ id: habits.id, name: habits.name });
  revalidatePath('/daily');
  revalidatePath('/dashboard');
  return habit ?? null;
}

export async function setHabitCommitment(
  habitId: string,
  commitmentId: string | null
): Promise<boolean> {
  const session = await getServerAuthSession();
  if (!session?.user) return false;

  const requestedCommitmentId = commitmentId?.trim() || null;
  const verifiedCommitmentId = requestedCommitmentId
    ? await verifyOwnedHabitCommitment(session.user.id, requestedCommitmentId)
    : null;
  const [updated] = await db
    .update(habits)
    .set({
      commitmentId: habitCommitmentIdForVerifiedTarget(requestedCommitmentId, verifiedCommitmentId),
    })
    .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
    .returning({ id: habits.id });

  if (!updated) return false;
  revalidatePath('/daily');
  return true;
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

export async function getJournalEntriesForRange(startDate: string, endDate: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  return db
    .select({
      id: journalEntries.id,
      dayDate: journalEntries.dayDate,
      amEntry: journalEntries.amEntry,
      pmEntry: journalEntries.pmEntry,
      timelineId: journalEntries.timelineId,
      commitmentId: journalEntries.commitmentId,
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

export async function getJournalContextChoices(): Promise<JournalContextChoice[]> {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const [ownedTimelines, ownedCommitments] = await Promise.all([
    db
      .select({
        id: timelines.id,
        title: timelines.title,
      })
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    db
      .select({
        id: commitments.id,
        hobbyName: commitments.hobbyName,
        goalDays: commitments.goalDays,
      })
      .from(commitments)
      .where(and(eq(commitments.userId, session.user.id), ne(commitments.status, 'abandoned')))
      .orderBy(desc(commitments.updatedAt)),
  ]);

  return [
    ...ownedTimelines.map((timeline) => ({
      kind: 'timeline' as const,
      id: timeline.id,
      label: timeline.title?.trim() || 'Untitled timeline',
      href: `/timeline/${timeline.id}`,
    })),
    ...ownedCommitments.map((commitment) => ({
      kind: 'commitment' as const,
      id: commitment.id,
      label: `${commitment.hobbyName} · ${commitment.goalDays}-day commitment`,
      href: '/commitments',
    })),
  ];
}

async function verifyOwnedJournalContext(
  userId: string,
  context: JournalContextRef
): Promise<JournalContextRef | null> {
  if (context.kind === 'timeline') {
    const [owned] = await db
      .select({ id: timelines.id })
      .from(timelines)
      .where(and(eq(timelines.id, context.id), eq(timelines.userId, userId)))
      .limit(1);
    return owned ? { kind: 'timeline', id: owned.id } : null;
  }

  const [owned] = await db
    .select({ id: commitments.id })
    .from(commitments)
    .where(
      and(
        eq(commitments.id, context.id),
        eq(commitments.userId, userId),
        ne(commitments.status, 'abandoned')
      )
    )
    .limit(1);
  return owned ? { kind: 'commitment', id: owned.id } : null;
}

export async function saveJournalEntry(
  dayDate: string,
  amEntry: string | null,
  pmEntry: string | null,
  context?: JournalContextRef | null
) {
  const session = await getServerAuthSession();
  if (!session?.user) return;

  const existing = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, dayDate)))
    .limit(1);

  const existingContext = journalContextFromColumns(
    existing[0]?.timelineId,
    existing[0]?.commitmentId
  );
  const contextIsUnchanged =
    context !== undefined &&
    context?.kind === existingContext?.kind &&
    context?.id === existingContext?.id;
  const contextColumns =
    context === undefined || contextIsUnchanged
      ? {
          timelineId: existing[0]?.timelineId ?? null,
          commitmentId: existing[0]?.commitmentId ?? null,
        }
      : columnsForVerifiedJournalContext(
          context,
          context ? await verifyOwnedJournalContext(session.user.id, context) : null
        );

  if (existing.length > 0) {
    await db
      .update(journalEntries)
      .set({ amEntry, pmEntry, ...contextColumns, updatedAt: new Date() })
      .where(eq(journalEntries.id, existing[0].id));
  } else {
    await db.insert(journalEntries).values({
      userId: session.user.id,
      dayDate,
      amEntry,
      pmEntry,
      ...contextColumns,
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
