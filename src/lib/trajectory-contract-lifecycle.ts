import {
  normalizeContractInput,
  REVIEW_DECISIONS,
  type ReviewDecision,
  type TrajectoryContractInput,
  type TrajectoryContractRecord,
  type TrajectoryReviewRecord,
} from './trajectory-contract';

export interface TrajectoryLifecycleState {
  active: TrajectoryContractRecord | null;
  contracts: TrajectoryContractRecord[];
  reviews: TrajectoryReviewRecord[];
}

export function createContractTransition(
  state: TrajectoryLifecycleState,
  input: TrajectoryContractInput,
  id: string,
  now: Date
): TrajectoryLifecycleState {
  if (state.active) throw new Error('You already have an active trajectory.');
  const normalized = normalizeContractInput(input);
  if (!normalized) throw new Error('Complete all four parts.');
  const active: TrajectoryContractRecord = {
    id,
    previousContractId: null,
    ...normalized,
    status: 'active',
    openedAt: now,
    closedAt: null,
  };
  return { active, contracts: [active, ...state.contracts], reviews: state.reviews };
}

export function reviewContractTransition(
  state: TrajectoryLifecycleState,
  input: {
    contractId: string;
    signalText: string;
    decision: ReviewDecision;
    revision?: TrajectoryContractInput;
  },
  ids: { reviewId: string; revisionId: string },
  now: Date
): TrajectoryLifecycleState {
  if (!state.active || state.active.id !== input.contractId) {
    throw new Error('Active trajectory not found.');
  }
  const signalText = input.signalText.trim();
  if (!signalText || signalText.length > 2000 || !REVIEW_DECISIONS.includes(input.decision)) {
    throw new Error('Add a signal and complete the revision.');
  }
  const review: TrajectoryReviewRecord = {
    id: ids.reviewId,
    contractId: state.active.id,
    signalText,
    decision: input.decision,
    createdAt: now,
  };
  if (input.decision === 'continue') {
    return { ...state, reviews: [...state.reviews, review] };
  }
  const closed: TrajectoryContractRecord = {
    ...state.active,
    status:
      input.decision === 'adjust'
        ? 'adjusted'
        : input.decision === 'complete'
          ? 'completed'
          : 'released',
    closedAt: now,
  };
  const contracts = state.contracts.map((contract) =>
    contract.id === closed.id ? closed : contract
  );
  let active: TrajectoryContractRecord | null = null;
  if (input.decision === 'adjust') {
    const revision = normalizeContractInput(input.revision);
    if (!revision) throw new Error('An adjustment needs a revised contract.');
    active = {
      id: ids.revisionId,
      previousContractId: closed.id,
      ...revision,
      status: 'active',
      openedAt: now,
      closedAt: null,
    };
    contracts.unshift(active);
  }
  return { active, contracts, reviews: [...state.reviews, review] };
}
