import { getCategoryForHobby, HOBBY_CATEGORIES } from "./hobbies";
import type { Phase } from "./types";

export type Archetype = {
  name: string;
  emoji: string;
  description: string;
};

export type PersonalityResult = {
  archetype: Archetype;
  categoryBreakdown: Record<string, number>; // percentages summing to 100
  traits: { breadth: number; depth: number; consistency: number; variety: number };
  narrative: string;
};

const ARCHETYPES: Record<string, Archetype> = {
  blankCanvas: {
    name: "Blank Canvas",
    emoji: "🎭",
    description: "Your journey is just beginning — every path is open to you.",
  },
  renaissanceExplorer: {
    name: "Renaissance Explorer",
    emoji: "🌍",
    description: "You roam across many worlds, sampling widely and leaving no stone unturned.",
  },
  deepSpecialist: {
    name: "Deep Specialist",
    emoji: "🔬",
    description: "You go deep rather than wide, mastering your chosen domain with dedication.",
  },
  creativeSoul: {
    name: "Creative Soul",
    emoji: "🎨",
    description: "You express yourself through creativity and music, bringing art into everyday life.",
  },
  actionHero: {
    name: "Action Hero",
    emoji: "⚡",
    description: "You live in your body — outdoors, active, and always seeking the next physical challenge.",
  },
  mindBuilder: {
    name: "Mind Builder",
    emoji: "🧠",
    description: "You feed your intellect with games, ideas, and the joy of learning.",
  },
  socialButterfly: {
    name: "Social Butterfly",
    emoji: "🦋",
    description: "You thrive through connection — gathering, hosting, and sharing experiences with others.",
  },
  maker: {
    name: "Maker",
    emoji: "🔧",
    description: "You build and collect with purpose, finding satisfaction in creating tangible things.",
  },
  balancedExplorer: {
    name: "Balanced Explorer",
    emoji: "⚖️",
    description: "You maintain a healthy mix of interests, exploring several areas without overcommitting to any one.",
  },
};

/** Returns a map of category name → count of (non-deduplicated) hobby entries across all phases. */
function buildCategoryCounts(phases: Phase[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const phase of phases) {
    for (const entry of phase.hobbies) {
      const cat = getCategoryForHobby(entry.name);
      const key = cat?.name ?? "Other";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

/** Returns all unique hobby names (lowercase) across all phases. */
function uniqueHobbies(phases: Phase[]): Set<string> {
  const set = new Set<string>();
  for (const phase of phases) {
    for (const entry of phase.hobbies) {
      set.add(entry.name.toLowerCase());
    }
  }
  return set;
}

/** Returns a map of category name → count of unique hobbies in that category. */
function buildUniqueCategoryCounts(phases: Phase[]): Map<string, number> {
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const phase of phases) {
    for (const entry of phase.hobbies) {
      const key = entry.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const cat = getCategoryForHobby(entry.name);
      const catName = cat?.name ?? "Other";
      counts.set(catName, (counts.get(catName) ?? 0) + 1);
    }
  }
  return counts;
}

function computeArchetype(
  phases: Phase[],
  categoryCounts: Map<string, number>,
  totalHobbies: number,
): Archetype {
  if (phases.length === 0 || totalHobbies === 0) {
    return ARCHETYPES.blankCanvas!;
  }

  const uniqueCategories = categoryCounts.size;

  // Renaissance Explorer: 5+ unique categories
  if (uniqueCategories >= 5) {
    return ARCHETYPES.renaissanceExplorer!;
  }

  // Check dominant category groups (50%+) before Deep Specialist
  // so that e.g. "Creative Soul" wins over "Deep Specialist" when a thematic group dominates
  const get = (names: string[]) =>
    names.reduce((s, n) => s + (categoryCounts.get(n) ?? 0), 0);

  const creativeCount = get(["Creative", "Music"]);
  const physicalCount = get(["Physical", "Outdoor"]);
  const intellectualCount = get(["Intellectual", "Gaming"]);
  const socialCount = get(["Social", "Culinary"]);
  const makerCount = get(["Making", "Collecting"]);

  const threshold = totalHobbies * 0.5;

  if (creativeCount >= threshold) return ARCHETYPES.creativeSoul!;
  if (physicalCount >= threshold) return ARCHETYPES.actionHero!;
  if (intellectualCount >= threshold) return ARCHETYPES.mindBuilder!;
  if (socialCount >= threshold) return ARCHETYPES.socialButterfly!;
  if (makerCount >= threshold) return ARCHETYPES.maker!;

  // Deep Specialist: top-2 individual categories make up 70%+ of all hobby entries
  const topTwo = [...categoryCounts.values()]
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((s, v) => s + v, 0);
  if (topTwo / totalHobbies >= 0.7) {
    return ARCHETYPES.deepSpecialist!;
  }

  // Balanced Explorer: 3-4 categories, none dominating
  return ARCHETYPES.balancedExplorer!;
}

function computeCategoryBreakdown(
  categoryCounts: Map<string, number>,
  totalHobbies: number,
): Record<string, number> {
  if (totalHobbies === 0) return {};
  const breakdown: Record<string, number> = {};
  let assigned = 0;
  const entries = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  entries.forEach(([cat, count], i) => {
    if (i === entries.length - 1) {
      // Give remainder to last to ensure sum = 100
      breakdown[cat] = 100 - assigned;
    } else {
      const pct = Math.round((count / totalHobbies) * 100);
      breakdown[cat] = pct;
      assigned += pct;
    }
  });
  return breakdown;
}

function computeTraits(phases: Phase[]): PersonalityResult["traits"] {
  const totalCategories = HOBBY_CATEGORIES.length; // 10

  const unique = uniqueHobbies(phases);
  const totalUnique = unique.size;

  if (totalUnique === 0) {
    return { breadth: 0, depth: 0, consistency: 0, variety: 0 };
  }

  const uniqueCatCounts = buildUniqueCategoryCounts(phases);
  const uniqueCategoryCount = uniqueCatCounts.size;

  // breadth: unique categories covered / total categories
  const breadth = Math.min(uniqueCategoryCount / totalCategories, 1);

  // depth: max unique hobbies in one category / total unique hobbies
  const maxInCategory = Math.max(...uniqueCatCounts.values());
  const depth = maxInCategory / totalUnique;

  // consistency: hobbies present in 50%+ of phases / total unique hobbies
  let consistentCount = 0;
  if (phases.length > 0) {
    const threshold = phases.length * 0.5;
    for (const hobby of unique) {
      const presenceCount = phases.filter((p) =>
        p.hobbies.some((h) => h.name.toLowerCase() === hobby),
      ).length;
      if (presenceCount >= threshold) consistentCount++;
    }
  }
  const consistency = consistentCount / totalUnique;
  const variety = 1 - consistency;

  return {
    breadth: Math.round(breadth * 100) / 100,
    depth: Math.round(depth * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    variety: Math.round(variety * 100) / 100,
  };
}

/** Returns the dominant category name for a given phase (most hobby entries). */
function dominantCategoryForPhase(phase: Phase): string | null {
  const counts = new Map<string, number>();
  for (const entry of phase.hobbies) {
    const cat = getCategoryForHobby(entry.name);
    const key = cat?.name ?? "Other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

function computeNarrative(phases: Phase[]): string {
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const dominants = sorted
    .map((p) => dominantCategoryForPhase(p))
    .filter(Boolean) as string[];

  if (dominants.length === 0) return "Your hobby journey is waiting to be written.";
  if (dominants.length === 1) return `Your journey is rooted in ${dominants[0]} pursuits.`;

  // Deduplicate consecutive same categories to highlight actual transitions
  const transitions: string[] = [dominants[0]!];
  for (let i = 1; i < dominants.length; i++) {
    if (dominants[i] !== dominants[i - 1]) {
      transitions.push(dominants[i]!);
    }
  }

  if (transitions.length === 1) {
    return `Your journey is consistently rooted in ${transitions[0]} pursuits across all phases.`;
  }
  if (transitions.length === 2) {
    return `Started with ${transitions[0]} pursuits and shifted into ${transitions[1]} territory.`;
  }

  const middle = transitions.slice(1, -1).join(", then ");
  return `Started with ${transitions[0]} pursuits, explored ${middle} interests, and settled into ${transitions[transitions.length - 1]} territory.`;
}

export function computePersonality(phases: Phase[]): PersonalityResult {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  const categoryCounts = buildCategoryCounts(sorted);
  const totalHobbies = [...categoryCounts.values()].reduce((s, v) => s + v, 0);

  const archetype = computeArchetype(sorted, categoryCounts, totalHobbies);
  const categoryBreakdown = computeCategoryBreakdown(categoryCounts, totalHobbies);
  const traits = computeTraits(sorted);
  const narrative = computeNarrative(sorted);

  return { archetype, categoryBreakdown, traits, narrative };
}
