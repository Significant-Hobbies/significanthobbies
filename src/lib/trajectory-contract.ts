export const CONTRACT_CADENCES = ['weekly', 'monthly'] as const;
export const REVIEW_DECISIONS = ['continue', 'adjust', 'complete', 'release'] as const;
export const CONTRACT_FIELDS = [
  'constraintsText',
  'intentText',
  'decisionPolicyText',
  'feedbackLoopText',
] as const;

export type ContractCadence = (typeof CONTRACT_CADENCES)[number];
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];
export type ContractStatus = 'active' | 'adjusted' | 'completed' | 'released';
export type ContractField = (typeof CONTRACT_FIELDS)[number];

export interface TrajectoryContractRecord {
  id: string;
  previousContractId: string | null;
  constraintsText: string;
  intentText: string;
  decisionPolicyText: string;
  feedbackLoopText: string;
  cadence: ContractCadence;
  status: ContractStatus;
  openedAt: Date;
  closedAt: Date | null;
}

export interface TrajectoryReviewRecord {
  id: string;
  contractId: string;
  signalText: string;
  decision: ReviewDecision;
  createdAt: Date;
}

export const CONTRACT_FIELD_LABELS: Record<ContractField, string> = {
  constraintsText: 'Constraints',
  intentText: 'Intent',
  decisionPolicyText: 'Decision policy',
  feedbackLoopText: 'Feedback loop',
};

export function contractSummary(contract: Pick<TrajectoryContractRecord, ContractField>): string {
  return `${withPeriod(contract.intentText)} Given ${lowercaseFirst(withoutPeriod(contract.constraintsText))}, ${lowercaseFirst(withPeriod(contract.decisionPolicyText))}`;
}

export function changedContractFields(
  current: Pick<TrajectoryContractRecord, ContractField>,
  previous: Pick<TrajectoryContractRecord, ContractField> | null
): ContractField[] {
  if (!previous) return [];
  return CONTRACT_FIELDS.filter((field) => current[field].trim() !== previous[field].trim());
}

function lowercaseFirst(value: string): string {
  return value.length === 0 ? value : value[0]!.toLocaleLowerCase() + value.slice(1);
}

function withoutPeriod(value: string): string {
  return value.trim().replace(/[.!?]+$/, '');
}

function withPeriod(value: string): string {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
