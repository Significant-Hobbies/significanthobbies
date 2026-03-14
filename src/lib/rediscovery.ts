import type { Phase } from "./types";

export type RediscoveryItem = {
  name: string;
  lastSeenPhase: string; // phase label where it was last present
  totalPhases: number;   // how many phases it appeared in
  type: "dropped" | "dormant" | "rekindle";
};

export type RediscoveryResult = {
  dropped: RediscoveryItem[];
  dormant: RediscoveryItem[];
  rekindleCandidates: RediscoveryItem[];
};

export function findRediscoveryOpportunities(phases: Phase[]): RediscoveryResult {
  if (phases.length < 2) {
    return { dropped: [], dormant: [], rekindleCandidates: [] };
  }

  // Sort phases by order to ensure consistent iteration
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const lastPhase = sorted[sorted.length - 1]!;
  const secondLastPhase = sorted[sorted.length - 2]!;

  const lastPhaseNames = new Set(lastPhase.hobbies.map((h) => h.name.toLowerCase()));
  const lastTwoPhaseNames = new Set([
    ...lastPhaseNames,
    ...secondLastPhase.hobbies.map((h) => h.name.toLowerCase()),
  ]);

  // Collect all hobbies across all phases with per-phase presence
  const allHobbies = new Set(
    sorted.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  );

  // For each hobby, track which phases it appeared in (by index)
  const hobbyPhaseIndices = new Map<string, number[]>();
  for (const hobby of allHobbies) {
    hobbyPhaseIndices.set(hobby, []);
  }
  for (let i = 0; i < sorted.length; i++) {
    for (const h of sorted[i]!.hobbies) {
      const name = h.name.toLowerCase();
      hobbyPhaseIndices.get(name)!.push(i);
    }
  }

  // Helper: find the label of the last phase a hobby was seen in
  function lastSeenLabel(hobby: string): string {
    const indices = hobbyPhaseIndices.get(hobby)!;
    const lastIdx = indices[indices.length - 1]!;
    return sorted[lastIdx]!.label;
  }

  // Helper: check if a hobby appeared in non-consecutive phases
  function isNonConsecutive(hobby: string): boolean {
    const indices = hobbyPhaseIndices.get(hobby)!;
    if (indices.length < 2) return false;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i]! - indices[i - 1]! > 1) return true;
    }
    return false;
  }

  const dropped: RediscoveryItem[] = [];
  const dormant: RediscoveryItem[] = [];
  const rekindleCandidates: RediscoveryItem[] = [];

  for (const hobby of allHobbies) {
    const indices = hobbyPhaseIndices.get(hobby)!;
    const totalPhases = indices.length;
    const lastSeen = lastSeenLabel(hobby);

    // Dropped: present in any earlier phase, absent in last phase
    if (!lastPhaseNames.has(hobby)) {
      dropped.push({ name: hobby, lastSeenPhase: lastSeen, totalPhases, type: "dropped" });
    }

    // Dormant: absent in last 2 phases (stricter subset of dropped)
    if (!lastTwoPhaseNames.has(hobby)) {
      dormant.push({ name: hobby, lastSeenPhase: lastSeen, totalPhases, type: "dormant" });
    }

    // Rekindle candidate: appeared in non-consecutive phases
    if (isNonConsecutive(hobby)) {
      rekindleCandidates.push({ name: hobby, lastSeenPhase: lastSeen, totalPhases, type: "rekindle" });
    }
  }

  const byTotalPhasesDesc = (a: RediscoveryItem, b: RediscoveryItem) =>
    b.totalPhases - a.totalPhases;

  return {
    dropped: dropped.sort(byTotalPhasesDesc),
    dormant: dormant.sort(byTotalPhasesDesc),
    rekindleCandidates: rekindleCandidates.sort(byTotalPhasesDesc),
  };
}
