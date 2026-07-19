'use server';

import { and, asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { trajectoryEntries, trajectoryEras, users } from '~/db/schema';
import {
  isTrajectoryBucket,
  monthEndNudgeTargetMonth,
  parseEntryNumbers,
  serializeEntryNumbers,
  TRAJECTORY_BUCKETS,
  type EraStatus,
  type TrajectoryBucket,
  type TrajectoryEntryRow,
  type TrajectoryEraRow,
  type TrajectoryNumberInput,
} from '~/lib/trajectory';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

// ── Read ────────────────────────────────────────────────────────────────────

export interface TrajectoryEraWithEntries extends TrajectoryEraRow {
  entries: TrajectoryEntryRow[];
}

export interface TrajectoryState {
  /** All eras for the user, grouped by bucket, sorted openedAt desc within bucket. */
  erasByBucket: Record<TrajectoryBucket, TrajectoryEraWithEntries[]>;
}

/**
 * Single query bundle for the /trajectory page: all eras + all entries for
 * the user, grouped by bucket. One round trip per table (two total).
 */
export async function getTrajectoryState(): Promise<TrajectoryState> {
  const session = await getServerAuthSession();
  const empty: Record<TrajectoryBucket, TrajectoryEraWithEntries[]> = {
    health: [],
    finance: [],
    knowledge: [],
    relationships: [],
  };
  if (!session?.user?.id) return { erasByBucket: empty };

  const [eraRows, entryRows] = await Promise.all([
    db
      .select()
      .from(trajectoryEras)
      .where(eq(trajectoryEras.userId, session.user.id))
      .orderBy(desc(trajectoryEras.openedAt)),
    db
      .select()
      .from(trajectoryEntries)
      .where(eq(trajectoryEntries.userId, session.user.id))
      .orderBy(asc(trajectoryEntries.monthKey)),
  ]);

  const entriesByEraId = new Map<string, TrajectoryEntryRow[]>();
  for (const row of entryRows) {
    if (!isTrajectoryBucket(row.bucket)) continue;
    const list = entriesByEraId.get(row.eraId) ?? [];
    list.push({
      id: row.id,
      eraId: row.eraId,
      userId: row.userId,
      bucket: row.bucket as TrajectoryBucket,
      monthKey: row.monthKey,
      reflection: row.reflection,
      numbers: parseEntryNumbers(row.numbers),
    });
    entriesByEraId.set(row.eraId, list);
  }

  const erasByBucket = { ...empty };
  for (const row of eraRows) {
    if (!isTrajectoryBucket(row.bucket)) continue;
    const era: TrajectoryEraWithEntries = {
      id: row.id,
      userId: row.userId,
      bucket: row.bucket as TrajectoryBucket,
      idealText: row.idealText,
      status: row.status as EraStatus,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      entries: entriesByEraId.get(row.id) ?? [],
    };
    erasByBucket[row.bucket as TrajectoryBucket].push(era);
  }

  return { erasByBucket };
}

// ── Era mutations ───────────────────────────────────────────────────────────

const SetIdealSchema = z.object({
  bucket: z.enum(TRAJECTORY_BUCKETS),
  idealText: z.string().trim().min(1).max(500),
});

/**
 * Sets a new ideal for a bucket. Closes the current active era (if any) with
 * the user-declared outcome, then opens a new active era. Enforces the
 * one-active-era-per-bucket invariant in a transaction.
 *
 * If `previousOutcome` is omitted and an active era exists, the previous era
 * is marked 'abandoned' (the safe default — only an explicit 'completed'
 * marks it reached). First-ever ideal for a bucket skips the close step.
 */
export async function setIdeal(input: {
  bucket: string;
  idealText: string;
  previousOutcome?: 'completed' | 'abandoned';
}): Promise<{ success: boolean; eraId?: string; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = SetIdealSchema.safeParse({
    bucket: input.bucket,
    idealText: input.idealText,
  });
  if (!parsed.success) {
    return { success: false, error: 'Invalid ideal input' };
  }

  const now = new Date();
  const outcome: EraStatus = input.previousOutcome === 'completed' ? 'completed' : 'abandoned';

  return db.transaction(async (tx) => {
    // Close the current active era for this bucket, if one exists.
    const active = await tx.query.trajectoryEras.findFirst({
      where: and(
        eq(trajectoryEras.userId, session.user.id),
        eq(trajectoryEras.bucket, parsed.data.bucket),
        eq(trajectoryEras.status, 'active')
      ),
      columns: { id: true },
    });
    if (active) {
      await tx
        .update(trajectoryEras)
        .set({ status: outcome, closedAt: now, updatedAt: now })
        .where(eq(trajectoryEras.id, active.id));
    }

    const [created] = await tx
      .insert(trajectoryEras)
      .values({
        userId: session.user.id,
        bucket: parsed.data.bucket,
        idealText: parsed.data.idealText,
        status: 'active',
        openedAt: now,
      })
      .returning({ id: trajectoryEras.id });

    revalidatePath('/trajectory');
    revalidatePath('/daily');
    return { success: true, eraId: created?.id };
  });
}

/**
 * Closes an era without opening a new one. Used when the user wants to mark
 * an era completed/abandoned but hasn't authored the next ideal yet (the
 * bucket goes "ideal-less" until they set a new one).
 */
export async function closeEra(input: {
  eraId: string;
  outcome: 'completed' | 'abandoned';
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const era = await db.query.trajectoryEras.findFirst({
    where: and(eq(trajectoryEras.id, input.eraId), eq(trajectoryEras.userId, session.user.id)),
    columns: { id: true, status: true },
  });
  if (!era) return { success: false, error: 'Era not found' };
  if (era.status !== 'active') {
    return { success: false, error: 'Era is not active' };
  }

  await db
    .update(trajectoryEras)
    .set({ status: input.outcome, closedAt: new Date(), updatedAt: new Date() })
    .where(eq(trajectoryEras.id, input.eraId));

  revalidatePath('/trajectory');
  revalidatePath('/daily');
  return { success: true };
}

// ── Entry mutations ─────────────────────────────────────────────────────────

const NumberInputSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.number().finite(),
});

const SaveEntrySchema = z.object({
  eraId: z.string().min(1).max(40),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  reflection: z.string().trim().max(5000).default(''),
  numbers: z.array(NumberInputSchema).max(20).default([]),
});

/**
 * Upserts a monthly entry for an era. Validates ownership via the era's
 * userId. The unique index on (eraId, monthKey) enforces one entry per era
 * per month — we check first for a friendly error, then insert or update.
 */
export async function saveEntry(input: {
  eraId: string;
  monthKey: string;
  reflection: string;
  numbers: TrajectoryNumberInput[];
}): Promise<{ success: boolean; entryId?: string; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = SaveEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid entry input' };
  }

  // Verify the era belongs to the user and is active (no entries on closed
  // eras — closed eras are snapshots).
  const era = await db.query.trajectoryEras.findFirst({
    where: and(
      eq(trajectoryEras.id, parsed.data.eraId),
      eq(trajectoryEras.userId, session.user.id)
    ),
    columns: { id: true, bucket: true, status: true },
  });
  if (!era) return { success: false, error: 'Era not found' };
  if (era.status !== 'active') {
    return { success: false, error: 'Cannot add entries to a closed era' };
  }
  if (!isTrajectoryBucket(era.bucket)) {
    return { success: false, error: 'Invalid era bucket' };
  }

  const now = new Date();
  const numbersJson = serializeEntryNumbers(parsed.data.numbers);

  const existing = await db.query.trajectoryEntries.findFirst({
    where: and(
      eq(trajectoryEntries.eraId, parsed.data.eraId),
      eq(trajectoryEntries.monthKey, parsed.data.monthKey)
    ),
    columns: { id: true },
  });

  if (existing) {
    await db
      .update(trajectoryEntries)
      .set({
        reflection: parsed.data.reflection,
        numbers: numbersJson,
        updatedAt: now,
      })
      .where(eq(trajectoryEntries.id, existing.id));
    revalidatePath('/trajectory');
    revalidatePath('/daily');
    return { success: true, entryId: existing.id };
  }

  const [created] = await db
    .insert(trajectoryEntries)
    .values({
      eraId: parsed.data.eraId,
      userId: session.user.id,
      bucket: era.bucket,
      monthKey: parsed.data.monthKey,
      reflection: parsed.data.reflection,
      numbers: numbersJson,
    })
    .returning({ id: trajectoryEntries.id });

  revalidatePath('/trajectory');
  revalidatePath('/daily');
  return { success: true, entryId: created?.id };
}

// ── Month-end nudge (consumed by the daily ritual) ──────────────────────────

export interface MonthEndNudge {
  /** True if today is in the 2-day month-end window AND the user has at least one active era. */
  active: boolean;
  /** The month the nudge is asking the user to reflect on (YYYY-MM). */
  targetMonth: string | null;
  /** Buckets with an active era that don't yet have an entry for the target month. */
  bucketsPending: TrajectoryBucket[];
}

/**
 * Returns the month-end nudge state for the daily ritual. Cheap no-op
 * (returns `active: false`) outside the 2-day window — no DB query in that
 * case.
 */
export async function getActiveMonthEndNudge(now: Date = new Date()): Promise<MonthEndNudge> {
  const targetMonth = monthEndNudgeTargetMonth(now);
  if (!targetMonth) {
    return { active: false, targetMonth: null, bucketsPending: [] };
  }

  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return { active: false, targetMonth: null, bucketsPending: [] };
  }

  const activeEras = await db.query.trajectoryEras.findMany({
    where: and(eq(trajectoryEras.userId, session.user.id), eq(trajectoryEras.status, 'active')),
    columns: { id: true, bucket: true },
  });
  if (activeEras.length === 0) {
    return { active: false, targetMonth, bucketsPending: [] };
  }

  const eraIds = activeEras.map((e) => e.id);
  // Find entries for the target month across all active eras.
  const existingEntries = await db.query.trajectoryEntries.findMany({
    where: and(
      eq(trajectoryEntries.userId, session.user.id),
      eq(trajectoryEntries.monthKey, targetMonth)
    ),
    columns: { eraId: true },
  });
  const erasWithEntry = new Set(existingEntries.map((e) => e.eraId));

  const pending: TrajectoryBucket[] = [];
  for (const era of activeEras) {
    if (!erasWithEntry.has(era.id) && isTrajectoryBucket(era.bucket)) {
      pending.push(era.bucket as TrajectoryBucket);
    }
  }

  return {
    active: pending.length > 0,
    targetMonth,
    bucketsPending: pending,
  };
}

// ── Profile helper (for the /trajectory page header) ────────────────────────

export async function getUserBirthYear(): Promise<number | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;
  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { birthYear: true },
  });
  return me?.birthYear ?? null;
}
