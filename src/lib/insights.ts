import { getCategoryForHobby } from "./hobbies";
import type { Phase } from "./types";

export function getAddedPerPhase(phases: Phase[]): string[][] {
  return phases.map((phase, i) => {
    if (i === 0) return [];
    const prev = new Set(
      phases[i - 1]!.hobbies.map((h) => h.name.toLowerCase()),
    );
    return phase.hobbies
      .map((h) => h.name.toLowerCase())
      .filter((name) => !prev.has(name));
  });
}

export function getDroppedPerPhase(phases: Phase[]): string[][] {
  return phases.map((phase, i) => {
    if (i === 0) return [];
    const curr = new Set(phase.hobbies.map((h) => h.name.toLowerCase()));
    return phases[i - 1]!.hobbies
      .map((h) => h.name.toLowerCase())
      .filter((name) => !curr.has(name));
  });
}

export function getRekindledHobbies(phases: Phase[]): string[] {
  const allHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  );
  const rekindled: string[] = [];

  for (const hobby of allHobbies) {
    let wasPresent = false;
    let wasAbsent = false;
    for (const phase of phases) {
      const present = phase.hobbies.some(
        (h) => h.name.toLowerCase() === hobby,
      );
      if (present && !wasPresent && !wasAbsent) {
        wasPresent = true;
      } else if (!present && wasPresent) {
        wasAbsent = true;
      } else if (present && wasAbsent) {
        rekindled.push(hobby);
        break;
      }
    }
  }
  return rekindled;
}

export function getMostPersistent(
  phases: Phase[],
): { hobby: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const phase of phases) {
    for (const h of phase.hobbies) {
      const name = h.name.toLowerCase();
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([hobby, count]) => ({ hobby, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCoOccurrencePairs(
  phases: Phase[],
): { pair: string[]; count: number }[] {
  const pairCounts = new Map<string, number>();
  for (const phase of phases) {
    const names = phase.hobbies
      .map((h) => h.name.toLowerCase())
      .sort();
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = `${names[i]}|||${names[j]}`;
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }
  return Array.from(pairCounts.entries())
    .map(([key, count]) => ({ pair: key.split("|||"), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export function getCategoryDiversity(phases: Phase[]): number {
  const categories = new Set<string>();
  for (const phase of phases) {
    for (const h of phase.hobbies) {
      const cat = getCategoryForHobby(h.name);
      if (cat) categories.add(cat.name);
    }
  }
  return categories.size;
}

export function getHobbyVelocity(
  phases: Phase[],
): { phase: string; added: number; dropped: number; net: number }[] {
  return phases.slice(1).map((phase, i) => {
    const prev = new Set(phases[i]!.hobbies.map((h) => h.name.toLowerCase()));
    const curr = new Set(phase.hobbies.map((h) => h.name.toLowerCase()));
    const added = [...curr].filter((h) => !prev.has(h)).length;
    const dropped = [...prev].filter((h) => !curr.has(h)).length;
    return { phase: phase.label, added, dropped, net: added - dropped };
  });
}

export function getLongestStreak(
  phases: Phase[],
): { hobby: string; streak: number; startPhase: string; endPhase: string }[] {
  const allHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  );
  const results: { hobby: string; streak: number; startPhase: string; endPhase: string }[] = [];

  for (const hobby of allHobbies) {
    let bestStreak = 0;
    let bestStart = "";
    let bestEnd = "";
    let currentStreak = 0;
    let currentStart = "";

    for (const phase of phases) {
      const present = phase.hobbies.some((h) => h.name.toLowerCase() === hobby);
      if (present) {
        if (currentStreak === 0) currentStart = phase.label;
        currentStreak++;
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          bestStart = currentStart;
          bestEnd = phase.label;
        }
      } else {
        currentStreak = 0;
      }
    }

    if (bestStreak >= 2) {
      results.push({ hobby, streak: bestStreak, startPhase: bestStart, endPhase: bestEnd });
    }
  }

  return results.sort((a, b) => b.streak - a.streak).slice(0, 5);
}

export function getPhaseTransitions(
  phases: Phase[],
): { fromPhase: string; toPhase: string; majorChange: string }[] {
  return phases.slice(1).map((phase, i) => {
    const prev = phases[i]!;
    const prevSet = new Set(prev.hobbies.map((h) => h.name.toLowerCase()));
    const currSet = new Set(phase.hobbies.map((h) => h.name.toLowerCase()));
    const added = [...currSet].filter((h) => !prevSet.has(h)).length;
    const dropped = [...prevSet].filter((h) => !currSet.has(h)).length;
    const net = added - dropped;

    let majorChange: string;
    if (net > 0) {
      majorChange = `gained ${net}`;
    } else if (net < 0) {
      majorChange = `lost ${Math.abs(net)}`;
    } else if (added === 0 && dropped === 0) {
      majorChange = "stable";
    } else {
      majorChange = "shifted focus";
    }

    return { fromPhase: prev.label, toPhase: phase.label, majorChange };
  });
}

export type Insights = {
  addedPerPhase: string[][];
  droppedPerPhase: string[][];
  rekindled: string[];
  mostPersistent: { hobby: string; count: number }[];
  coOccurrencePairs: { pair: string[]; count: number }[];
  categoryDiversity: number;
  hobbyVelocity: { phase: string; added: number; dropped: number; net: number }[];
  longestStreaks: { hobby: string; streak: number; startPhase: string; endPhase: string }[];
  phaseTransitions: { fromPhase: string; toPhase: string; majorChange: string }[];
};

export function computeInsights(phases: Phase[]): Insights {
  return {
    addedPerPhase: getAddedPerPhase(phases),
    droppedPerPhase: getDroppedPerPhase(phases),
    rekindled: getRekindledHobbies(phases),
    mostPersistent: getMostPersistent(phases),
    coOccurrencePairs: getCoOccurrencePairs(phases),
    categoryDiversity: getCategoryDiversity(phases),
    hobbyVelocity: getHobbyVelocity(phases),
    longestStreaks: getLongestStreak(phases),
    phaseTransitions: getPhaseTransitions(phases),
  };
}
