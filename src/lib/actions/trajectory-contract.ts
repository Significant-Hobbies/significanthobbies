'use server';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';
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

type ImportMode = 'merge' | 'replace-account';

export async function importLocalTrajectory(
  input: TrajectoryContractState,
  mode: ImportMode = 'merge'
): Promise<{ success: boolean; conflict?: boolean; error?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  if (input.contracts.length === 0) return { success: true };

  const parsedContracts = input.contracts.map((contract) => ({
    source: contract,
    fields: ContractSchema.safeParse(contract),
  }));
  const validStatuses: ContractStatus[] = ['active', 'adjusted', 'completed', 'released'];
  if (
    parsedContracts.some(
      ({ source, fields }) =>
        !fields.success ||
        !source.id.startsWith('local-contract-') ||
        !validStatuses.includes(source.status) ||
        !(source.openedAt instanceof Date) ||
        (source.closedAt !== null && !(source.closedAt instanceof Date))
    ) ||
    input.contracts.filter((contract) => contract.status === 'active').length > 1
  ) {
    return { success: false, error: 'The local trajectory could not be validated.' };
  }
  if (
    input.reviews.some(
      (review) =>
        !review.id.startsWith('local-review-') ||
        !input.contracts.some((contract) => contract.id === review.contractId) ||
        !REVIEW_DECISIONS.includes(review.decision) ||
        review.signalText.trim().length < 1 ||
        review.signalText.trim().length > 2000 ||
        !(review.createdAt instanceof Date)
    )
  ) {
    return { success: false, error: 'The local review history could not be validated.' };
  }

  const ids = input.contracts.map((contract) => contract.id);
  const alreadyImported = await db
    .select({ id: trajectoryContracts.id, userId: trajectoryContracts.userId })
    .from(trajectoryContracts)
    .where(inArray(trajectoryContracts.id, ids));
  if (alreadyImported.some((contract) => contract.userId !== session.user.id)) {
    return { success: false, error: 'A local record identifier is already in use.' };
  }
  if (alreadyImported.length === ids.length) return { success: true };
  if (alreadyImported.length > 0) {
    return { success: false, error: 'A previous import was incomplete. Your local copy is safe.' };
  }

  const accountActive = await db.query.trajectoryContracts.findFirst({
    where: and(
      eq(trajectoryContracts.userId, session.user.id),
      eq(trajectoryContracts.status, 'active')
    ),
  });
  const localHasActive = input.contracts.some((contract) => contract.status === 'active');
  if (accountActive && localHasActive && mode === 'merge') {
    return {
      success: false,
      conflict: true,
      error: 'Your account and this device both have an active trajectory.',
    };
  }

  const now = new Date();
  const closeAccount =
    accountActive && localHasActive
      ? db
          .update(trajectoryContracts)
          .set({ status: 'released', closedAt: now, updatedAt: now })
          .where(
            and(
              eq(trajectoryContracts.id, accountActive.id),
              eq(trajectoryContracts.userId, session.user.id),
              eq(trajectoryContracts.status, 'active')
            )
          )
      : null;
  const contractInserts = parsedContracts.map(({ source, fields }) =>
    db.insert(trajectoryContracts).values({
      id: source.id,
      userId: session.user.id,
      previousContractId: source.previousContractId,
      ...fields.data!,
      status: source.status,
      openedAt: source.openedAt,
      closedAt: source.closedAt,
    })
  );
  const reviewInserts = input.reviews.map((review) =>
    db.insert(trajectoryReviews).values({
      id: review.id,
      contractId: review.contractId,
      userId: session.user.id,
      signalText: review.signalText.trim(),
      decision: review.decision,
      createdAt: review.createdAt,
    })
  );
  const statements = [
    ...(closeAccount ? [closeAccount] : []),
    ...contractInserts,
    ...reviewInserts,
  ];
  await db.batch(
    statements as [(typeof statements)[number], ...Array<(typeof statements)[number]>]
  );
  revalidatePath('/trajectory');
  return { success: true };
}

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

  const active = await db.query.trajectoryContracts.findFirst({
    where: and(
      eq(trajectoryContracts.id, parsed.data.contractId),
      eq(trajectoryContracts.userId, session.user.id),
      eq(trajectoryContracts.status, 'active')
    ),
  });
  if (!active) return { success: false, error: 'Active trajectory not found.' };

  const reviewInsert = db.insert(trajectoryReviews).values({
    contractId: active.id,
    userId: session.user.id,
    signalText: parsed.data.signalText,
    decision: parsed.data.decision,
  });

  if (parsed.data.decision === 'continue') {
    await db.batch([reviewInsert]);
  } else {
    const status: ContractStatus =
      parsed.data.decision === 'adjust'
        ? 'adjusted'
        : parsed.data.decision === 'complete'
          ? 'completed'
          : 'released';
    const now = new Date();
    const closeActive = db
      .update(trajectoryContracts)
      .set({ status, closedAt: now, updatedAt: now })
      .where(
        and(
          eq(trajectoryContracts.id, active.id),
          eq(trajectoryContracts.userId, session.user.id),
          eq(trajectoryContracts.status, 'active')
        )
      );

    if (parsed.data.decision === 'adjust' && parsed.data.revision) {
      await db.batch([
        reviewInsert,
        closeActive,
        db.insert(trajectoryContracts).values({
          userId: session.user.id,
          previousContractId: active.id,
          ...parsed.data.revision,
        }),
      ]);
    } else {
      await db.batch([reviewInsert, closeActive]);
    }
  }

  revalidatePath('/trajectory');
  return { success: true };
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
