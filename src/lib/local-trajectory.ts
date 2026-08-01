import type { TrajectoryContractState } from '~/lib/actions/trajectory-contract';
import {
  normalizeContractInput,
  REVIEW_DECISIONS,
  type ReviewDecision,
  type TrajectoryContractInput,
  type TrajectoryContractRecord,
  type TrajectoryReviewRecord,
} from '~/lib/trajectory-contract';
import {
  createContractTransition,
  reviewContractTransition,
} from '~/lib/trajectory-contract-lifecycle';
import {
  browserRecordAdapter,
  readLocalRecord,
  writeLocalRecord,
  type LocalRecordAdapter,
} from '~/lib/local-record-store';

const KEY = 'trajectory:state';
const DOMAIN = 'trajectory';
const ARCHIVE_KEY = 'trajectory:archive';

export async function readLocalTrajectory(
  adapter: LocalRecordAdapter = browserRecordAdapter()
): Promise<TrajectoryContractState> {
  return (
    (await readLocalRecord(adapter, KEY, DOMAIN, isTrajectoryState)) ?? {
      active: null,
      contracts: [],
      reviews: [],
    }
  );
}

export async function createLocalTrajectory(
  input: TrajectoryContractInput,
  adapter: LocalRecordAdapter = browserRecordAdapter()
): Promise<TrajectoryContractState> {
  const state = await readLocalTrajectory(adapter);
  const next = createContractTransition(state, input, makeId('contract'), new Date());
  await writeLocalRecord(adapter, KEY, DOMAIN, next);
  return next;
}

export async function reviewLocalTrajectory(
  input: {
    contractId: string;
    signalText: string;
    decision: ReviewDecision;
    revision?: TrajectoryContractInput;
  },
  adapter: LocalRecordAdapter = browserRecordAdapter()
): Promise<TrajectoryContractState> {
  const state = await readLocalTrajectory(adapter);
  const next = reviewContractTransition(
    state,
    input,
    { reviewId: makeId('review'), revisionId: makeId('contract') },
    new Date()
  );
  await writeLocalRecord(adapter, KEY, DOMAIN, next);
  return next;
}

export async function archiveLocalTrajectory(
  adapter: LocalRecordAdapter = browserRecordAdapter()
): Promise<void> {
  const state = await readLocalTrajectory(adapter);
  if (state.contracts.length === 0 && state.reviews.length === 0) return;
  await writeLocalRecord(adapter, ARCHIVE_KEY, DOMAIN, state);
  await adapter.remove(KEY);
}

function isTrajectoryState(value: unknown): value is TrajectoryContractState {
  if (!value || typeof value !== 'object') return false;
  const state = value as TrajectoryContractState;
  if (!Array.isArray(state.contracts) || !Array.isArray(state.reviews)) return false;
  if (state.active !== null && !isContract(state.active)) return false;
  return state.contracts.every(isContract) && state.reviews.every(isReview);
}

function isContract(value: unknown): value is TrajectoryContractRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as TrajectoryContractRecord;
  return (
    typeof record.id === 'string' &&
    (record.previousContractId === null || typeof record.previousContractId === 'string') &&
    normalizeContractInput(record) !== null &&
    ['active', 'adjusted', 'completed', 'released'].includes(record.status) &&
    record.openedAt instanceof Date &&
    (record.closedAt === null || record.closedAt instanceof Date)
  );
}

function isReview(value: unknown): value is TrajectoryReviewRecord {
  if (!value || typeof value !== 'object') return false;
  const review = value as TrajectoryReviewRecord;
  return (
    typeof review.id === 'string' &&
    typeof review.contractId === 'string' &&
    typeof review.signalText === 'string' &&
    REVIEW_DECISIONS.includes(review.decision) &&
    review.createdAt instanceof Date
  );
}

function makeId(kind: string): string {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `local-${kind}-${random}`;
}
