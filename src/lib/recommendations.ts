import { getCategoryForHobby,HOBBY_CATEGORIES } from "./hobbies";
import type { Phase } from "./types";

export type RecommendedHobby = {
  name: string;
  category: string;
  categoryEmoji: string;
  reason: string;
  score: number;
};

export function getRecommendations(phases: Phase[], limit = 8): RecommendedHobby[] {
  if (limit <= 0) return [];

  // Collect all unique hobbies (case-insensitive)
  const userHobbiesLower = new Set<string>();
  for (const phase of phases) {
    for (const entry of phase.hobbies) {
      userHobbiesLower.add(entry.name.toLowerCase());
    }
  }

  // Empty phases: return top hobby from each category with starter reason
  if (userHobbiesLower.size === 0) {
    const results: RecommendedHobby[] = [];
    for (const cat of HOBBY_CATEGORIES) {
      if (cat.hobbies.length > 0) {
        results.push({
          name: cat.hobbies[0],
          category: cat.name,
          categoryEmoji: cat.emoji,
          reason: `Start your journey with ${cat.name.toLowerCase()}`,
          score: 0.5,
        });
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  // Compute category affinity: weighted by phase recency (phase index + 1)
  const categoryRawScore: Record<string, number> = {};
  for (let i = 0; i < phases.length; i++) {
    const weight = i + 1;
    for (const entry of phases[i].hobbies) {
      const cat = getCategoryForHobby(entry.name);
      if (cat) {
        categoryRawScore[cat.name] = (categoryRawScore[cat.name] ?? 0) + weight;
      }
    }
  }

  // Normalize affinity scores to 0-1
  const maxScore = Math.max(...Object.values(categoryRawScore), 1);
  const categoryAffinity: Record<string, number> = {};
  for (const [name, score] of Object.entries(categoryRawScore)) {
    categoryAffinity[name] = score / maxScore;
  }

  // Determine top 3 categories by affinity
  const sortedCategories = Object.entries(categoryAffinity)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  const topCategories = new Set(sortedCategories.slice(0, 3));

  // Build candidate hobbies not already in user's collection
  const candidates: RecommendedHobby[] = [];

  for (const cat of HOBBY_CATEGORIES) {
    const affinity = categoryAffinity[cat.name] ?? 0;

    // Check if user has exhausted all hobbies in this category
    const remainingInCat = cat.hobbies.filter(
      (h) => !userHobbiesLower.has(h.toLowerCase()),
    );
    if (remainingInCat.length === 0) continue;

    for (const hobby of remainingInCat) {
      let score: number;
      let reason: string;

      if (topCategories.has(cat.name)) {
        score = affinity * 0.8;
        reason = `Matches your ${cat.name.toLowerCase()} streak`;
      } else if (affinity > 0) {
        score = affinity * 0.5;
        reason = `Builds on your ${cat.name.toLowerCase()} interest`;
      } else {
        score = 0.3;
        reason = `Try something new — expand into ${cat.name}`;
      }

      candidates.push({
        name: hobby,
        category: cat.name,
        categoryEmoji: cat.emoji,
        reason,
        score,
      });
    }
  }

  // Sort by score descending, then return limited results
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}
