export type HabitCommitmentChoice = {
  id: string;
  label: string;
  href: string;
};

const MAX_COMMITMENT_ID_LENGTH = 128;

export function parseHabitCommitmentValue(value: string): string | null {
  const id = value.trim();
  if (!id) return null;
  if (id.length > MAX_COMMITMENT_ID_LENGTH) {
    throw new Error('Invalid habit commitment');
  }
  return id;
}

export function habitCommitmentIdForVerifiedTarget(
  requestedId: string | null,
  verifiedId: string | null
): string | null {
  if (!requestedId) return null;
  if (!verifiedId || requestedId !== verifiedId) {
    throw new Error('Habit commitment not found');
  }
  return requestedId;
}

export function habitCommitmentLabel(hobbyName: string, goalDays: number): string {
  return `${hobbyName.trim() || 'Untitled hobby'} · ${goalDays}-day commitment`;
}
