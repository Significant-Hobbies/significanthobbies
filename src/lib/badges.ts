import { SIDE_QUESTS } from './side-quests';

export type BadgeCategory = 'quest' | 'category' | 'hobby' | 'timeline' | 'secret';

export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  hidden: boolean;
};

export const BADGES: Badge[] = [
  // ── Quest progression ──────────────────────────────────────
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first side quest',
    emoji: '\uD83E\uDD7E',
    category: 'quest',
    hidden: false,
  },
  {
    id: 'curious-cat',
    name: 'Curious Cat',
    description: 'Complete 5 side quests',
    emoji: '\uD83D\uDC31',
    category: 'quest',
    hidden: false,
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Complete 10 side quests',
    emoji: '\uD83D\uDDFA\uFE0F',
    category: 'quest',
    hidden: false,
  },
  {
    id: 'renaissance-soul',
    name: 'Renaissance Soul',
    description: 'Complete quests in all 6 categories',
    emoji: '\uD83C\uDFAD',
    category: 'quest',
    hidden: false,
  },
  {
    id: 'quest-master',
    name: 'Side Quest Master',
    description: 'Complete all 50 side quests',
    emoji: '\uD83D\uDC51',
    category: 'quest',
    hidden: false,
  },

  // ── Category mastery ───────────────────────────────────────
  {
    id: 'sensor',
    name: 'Sensor',
    description: 'Complete 3 sensory quests',
    emoji: '\u{1F441}\uFE0F',
    category: 'category',
    hidden: false,
  },
  {
    id: 'maker',
    name: 'Maker',
    description: 'Complete 3 creative quests',
    emoji: '\uD83C\uDFA8',
    category: 'category',
    hidden: false,
  },
  {
    id: 'chefs-kiss',
    name: "Chef's Kiss",
    description: 'Complete 3 culinary quests',
    emoji: '\uD83D\uDC68\u200D\uD83C\uDF73',
    category: 'category',
    hidden: false,
  },
  {
    id: 'people-person',
    name: 'People Person',
    description: 'Complete 3 social quests',
    emoji: '\uD83E\uDD1D',
    category: 'category',
    hidden: false,
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'Complete 3 exploration quests',
    emoji: '\uD83E\uDDED',
    category: 'category',
    hidden: false,
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Complete 3 mindful quests',
    emoji: '\uD83E\uDDD8',
    category: 'category',
    hidden: false,
  },

  // ── Hobby / Timeline ──────────────────────────────────────
  {
    id: 'rekindler',
    name: 'Rekindler',
    description: 'Add a hobby from an earlier life phase',
    emoji: '\uD83D\uDD25',
    category: 'hobby',
    hidden: true,
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Have 5 or more life phases on your timeline',
    emoji: '\uD83D\uDCD6',
    category: 'timeline',
    hidden: false,
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Have hobbies in 5 or more categories',
    emoji: '\uD83E\uDDE0',
    category: 'hobby',
    hidden: false,
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Rate a hobby with intensity level 5',
    emoji: '\uD83E\uDD3F',
    category: 'hobby',
    hidden: true,
  },

  // ── Secret ─────────────────────────────────────────────────
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete the stargazing quest',
    emoji: '\uD83E\uDD89',
    category: 'secret',
    hidden: true,
  },
  {
    id: 'unplugged',
    name: 'Unplugged',
    description: 'Complete the 24-hour social media detox quest',
    emoji: '\uD83D\uDCF5',
    category: 'secret',
    hidden: true,
  },
  {
    id: 'full-circle',
    name: 'Full Circle',
    description: 'Discover a quest, pin it, then add its related hobby to your timeline',
    emoji: '\u2B55',
    category: 'secret',
    hidden: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/**
 * Evaluate which badges a user has earned based on completed quest IDs.
 * Note: hobby/timeline badges (rekindler, storyteller, polymath, deep-diver, full-circle)
 * require external data beyond quest completion and are not evaluated here.
 */
export function evaluateBadges(completedQuestIds: string[]): string[] {
  // Deduplicate IDs
  const uniqueIds = Array.from(new Set(completedQuestIds));
  const completed = new Set(completedQuestIds);
  const earned: string[] = [];

  const count = uniqueIds.length;

  // Quest progression badges
  if (count >= 1) earned.push('first-steps');
  if (count >= 5) earned.push('curious-cat');
  if (count >= 10) earned.push('adventurer');
  if (count >= 50) earned.push('quest-master');

  // Count completions per category
  const categoryCounts: Record<string, number> = {};
  for (const qId of uniqueIds) {
    const quest = SIDE_QUESTS.find((q) => q.id === qId);
    if (quest) {
      categoryCounts[quest.category] = (categoryCounts[quest.category] || 0) + 1;
    }
  }

  // Renaissance Soul — quests in all 6 categories
  const categoriesHit = Object.keys(categoryCounts).length;
  if (categoriesHit >= 6) earned.push('renaissance-soul');

  // Category mastery badges (3+ in a category)
  const categoryBadgeMap: Record<string, string> = {
    sensory: 'sensor',
    creative: 'maker',
    culinary: 'chefs-kiss',
    social: 'people-person',
    exploration: 'wanderer',
    mindful: 'zen-master',
  };

  for (const [cat, badgeId] of Object.entries(categoryBadgeMap)) {
    if ((categoryCounts[cat] || 0) >= 3) {
      earned.push(badgeId);
    }
  }

  // Secret badges (quest-based)
  if (completed.has('sq-03')) earned.push('night-owl');
  if (completed.has('sq-44')) earned.push('unplugged');

  return earned;
}
