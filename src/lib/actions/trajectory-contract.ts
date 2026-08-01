'use server';

import { and, asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { trajectoryContracts, trajectoryReviews } from '~/db/schema';
import {
  CONTRACT_CADENCES,
  CONTRACT_FIELDS,
  REVIEW_DECISIONS,
  type ContractCadence,
  type ContractStatus,
  type ReviewDecision,
  type TrajectoryContractRecord,
  type TrajectoryReviewRecord,
} from '~/lib/trajectory-contract';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export interface TrajectoryContractState {
  active: TrajectoryContractRecord | null;
  contracts: TrajectoryContractRecord[];
  reviews: TrajectoryReviewRecord[];
}

const ContractSchema = z.object({
  constraintsText: z.string().trim().min(1).max(500),
  intentText: z.string().trim().min(1).max(500),
  decisionPolicyText: z.string().trim().min(1).max(500),
  feedbackLoopText: z.string().trim().min(1).max(500),
  cadence: z.enum(CONTRACT_CADENCES),
});

const ReviewSchema = z.object({
  contractId: z.string().min(1).max(40),
  signalText: z.string().trim().min(1).max(2000),
  decision: z.enum(REVIEW_DECISIONS),
  revision: ContractSchema.optional(),
});

export type ContractInput = z.input<typeof ContractSchema>;

export async function getTrajectoryContractState(): Promise<TrajectoryContractState> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return { active: null, contracts: [], reviews: [] };

  const [contractRows, reviewRows] = await Promise.all([
    db
      .select()
      .from(trajectoryContracts)
      .where(eq(trajectoryContracts.userId, session.user.id))
      .orderBy(desc(trajectoryContracts.openedAt)),
    db
      .select()
      .from(trajectoryReviews)
      .where(eq(trajectoryReviews.userId, session.user.id))
      .orderBy(asc(trajectoryReviews.createdAt)),
  ]);
  const contracts = contractRows.map(toContractRecord);
  return {
    active: contracts.find((contract) => contract.status === 'active') ?? null,
    contracts,
    reviews: reviewRows.map((row) => ({
      id: row.id,
      contractId: row.contractId,
      signalText: row.signalText,
      decision: row.decision as ReviewDecision,
      createdAt: row.createdAt,
    })),
  };
}

export async function createTrajectoryContract(
  input: ContractInput
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  const parsed = ContractSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Complete all four parts.' };

  const active = await db.query.trajectoryContracts.findFirst({
    where: and(
      eq(trajectoryContracts.userId, session.user.id),
      eq(trajectoryContracts.status, 'active')
    ),
    columns: { id: true },
  });
  if (active) return { success: false, error: 'You already have an active trajectory.' };

  try {
    await db.insert(trajectoryContracts).values({ userId: session.user.id, ...parsed.data });
  } catch {
    return { success: false, error: 'You already have an active trajectory.' };
  }
  revalidatePath('/trajectory');
  return { success: true };
}

export async function reviewTrajectoryContract(
  input: z.input<typeof ReviewSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Add a signal and complete the revision.' };
  if (parsed.data.decision === 'adjust' && !parsed.data.revision) {
    return { success: false, error: 'An adjustment needs a revised contract.' };
  }

  return db.transaction(async (tx) => {
    const active = await tx.query.trajectoryContracts.findFirst({
      where: and(
        eq(trajectoryContracts.id, parsed.data.contractId),
        eq(trajectoryContracts.userId, session.user.id),
        eq(trajectoryContracts.status, 'active')
      ),
    });
    if (!active) return { success: false, error: 'Active trajectory not found.' };

    await tx.insert(trajectoryReviews).values({
      contractId: active.id,
      userId: session.user.id,
      signalText: parsed.data.signalText,
      decision: parsed.data.decision,
    });

    if (parsed.data.decision !== 'continue') {
      const status: ContractStatus =
        parsed.data.decision === 'adjust'
          ? 'adjusted'
          : parsed.data.decision === 'complete'
            ? 'completed'
            : 'released';
      const now = new Date();
      await tx
        .update(trajectoryContracts)
        .set({ status, closedAt: now, updatedAt: now })
        .where(eq(trajectoryContracts.id, active.id));

      if (parsed.data.decision === 'adjust' && parsed.data.revision) {
        await tx.insert(trajectoryContracts).values({
          userId: session.user.id,
          previousContractId: active.id,
          ...parsed.data.revision,
        });
      }
    }

    revalidatePath('/trajectory');
    return { success: true };
  });
}

function toContractRecord(row: typeof trajectoryContracts.$inferSelect): TrajectoryContractRecord {
  const fields = Object.fromEntries(CONTRACT_FIELDS.map((field) => [field, row[field]])) as Pick<
    TrajectoryContractRecord,
    (typeof CONTRACT_FIELDS)[number]
  >;
  return {
    id: row.id,
    previousContractId: row.previousContractId,
    ...fields,
    cadence: row.cadence as ContractCadence,
    status: row.status as ContractStatus,
    openedAt: row.openedAt,
    closedAt: row.closedAt,
  };
}
