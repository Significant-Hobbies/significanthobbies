import {
  BUCKET_ITEM_CATEGORIES,
  type BucketItemCategory,
  FAMOUS_BUCKET_LISTS,
} from '~/lib/famous-bucket-lists';
import { getOnboardingPossibilities } from '~/lib/onboarding-possibilities';

// ─── Personality Archetypes ───────────────────────────────────────────────────

export type BucketListArchetype = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string; // Tailwind bg class
  textColor: string;
};

const ARCHETYPES: Record<BucketItemCategory, BucketListArchetype> = {
  travel: {
    id: 'wanderer',
    name: 'The World Wanderer',
    emoji: '✈️',
    tagline: 'Home is everywhere',
    description:
      'You measure life in stamps, not steps. Every destination is a door to a new version of yourself.',
    color: 'bg-sky-500',
    textColor: 'text-sky-600',
  },
  adventure: {
    id: 'daredevil',
    name: 'The Thrill Seeker',
    emoji: '⛰️',
    tagline: 'Fear is just fuel',
    description:
      "You're most alive at the edge. Heights, speed, the unknown — these aren't risks, they're invitations.",
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
  creative: {
    id: 'creator',
    name: 'The Creative Soul',
    emoji: '🎨',
    tagline: 'Life as a canvas',
    description:
      'You see the world as raw material. Your bucket list reads like a portfolio — performance, craft, expression.',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
  },
  achievement: {
    id: 'achiever',
    name: 'The Relentless Achiever',
    emoji: '🏆',
    tagline: 'Every peak has a next one',
    description:
      "You set audacious goals because ordinary ones don't get you out of bed. Mastery is your love language.",
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
  },
  social: {
    id: 'connector',
    name: 'The Deep Connector',
    emoji: '❤️',
    tagline: 'People are the point',
    description:
      'For you, experiences only count when shared. Your bucket list is really a list of people you want to show up for.',
    color: 'bg-rose-500',
    textColor: 'text-rose-600',
  },
  humanitarian: {
    id: 'changemaker',
    name: 'The World Changer',
    emoji: '🌍',
    tagline: 'Leave it better than you found it',
    description:
      "You don't want to just witness history — you want to shape it. Your ambitions scale with the problems you see.",
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
  },
};

const MIXED_ARCHETYPE: BucketListArchetype = {
  id: 'renaissance',
  name: 'The Renaissance Soul',
  emoji: '✨',
  tagline: 'Everything, deeply',
  description:
    "You refuse to be put in a box. Explorer, creator, achiever, connector — you're all of these, and the world is your curriculum.",
  color: 'bg-violet-500',
  textColor: 'text-violet-600',
};

export function getBucketListArchetype(
  items: Array<{ category: string | null }>
): BucketListArchetype | null {
  if (items.length === 0) return null;

  const counts: Partial<Record<BucketItemCategory, number>> = {};
  for (const item of items) {
    if (item.category && item.category in BUCKET_ITEM_CATEGORIES) {
      const cat = item.category as BucketItemCategory;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }

  const entries = Object.entries(counts) as [BucketItemCategory, number][];
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  const topCount = entries[0]![1];
  const topTied = entries.filter(([, c]) => c === topCount);

  if (topTied.length >= 3) return MIXED_ARCHETYPE;

  return ARCHETYPES[entries[0]![0]] ?? null;
}

// ─── Celebrity Match ──────────────────────────────────────────────────────────

export type CelebrityMatch = {
  slug: string;
  name: string;
  emoji: string;
  knownFor: string;
  score: number; // 0–100
  sharedCategories: BucketItemCategory[];
};

export function getCelebrityMatch(
  items: Array<{ category: string | null }>
): CelebrityMatch | null {
  if (items.length === 0) return null;

  const userCats: Partial<Record<BucketItemCategory, number>> = {};
  for (const item of items) {
    if (item.category && item.category in BUCKET_ITEM_CATEGORIES) {
      const cat = item.category as BucketItemCategory;
      userCats[cat] = (userCats[cat] ?? 0) + 1;
    }
  }

  if (Object.keys(userCats).length === 0) return null;

  const userTotal = Object.values(userCats).reduce((s, v) => s + (v ?? 0), 0);

  const scored = FAMOUS_BUCKET_LISTS.map((person) => {
    const famCats: Partial<Record<BucketItemCategory, number>> = {};
    for (const item of person.items) {
      famCats[item.category] = (famCats[item.category] ?? 0) + 1;
    }

    let overlap = 0;
    const shared: BucketItemCategory[] = [];
    for (const [cat, cnt] of Object.entries(userCats) as [BucketItemCategory, number][]) {
      if (famCats[cat]) {
        overlap += Math.min(cnt, famCats[cat]);
        shared.push(cat);
      }
    }

    const famTotal = person.items.length;
    const score = (overlap / Math.sqrt(userTotal * famTotal)) * 100;

    return { person, score, shared };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  // Require a meaningful match: either a real cosine-style score (≥15) or at
  // least two shared categories. A single overlapping category produces a
  // near-zero score that reads as a broken "1% match".
  if (!top || top.score === 0) return null;
  if (top.score < 15 && top.shared.length < 2) return null;

  return {
    slug: top.person.slug,
    name: top.person.name,
    emoji: top.person.emoji,
    knownFor: top.person.knownFor,
    score: Math.round(Math.min(top.score, 100)),
    sharedCategories: top.shared,
  };
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

type SuggestionItem = {
  title: string;
  category: BucketItemCategory;
  emoji: string;
};

/**
 * Suggestions are drawn from the same 5,000+ path corpus used by onboarding
 * rather than a private list.
 *
 * This used to be 52 hand-written items — a near-duplicate of the 145 already
 * sitting in `/bucket-list-ideas`, which were unreachable because they lived
 * inside a page component. Live More now shares the combined experience and
 * hobby-path source so the product makes the same possibility promise before
 * and after onboarding.
 */
const SUGGESTION_POOL: SuggestionItem[] = getOnboardingPossibilities();

// ─── Token-based title similarity ────────────────────────────────────────────

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'in',
  'on',
  'at',
  'to',
  'of',
  'and',
  'or',
  'for',
  'with',
  'from',
  'your',
  'you',
  'it',
  'is',
  'that',
  'this',
]);

function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

// Jaccard similarity over meaningful tokens. Returns 0–1.
function titleSimilarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Deterministic seeded PRNG (mulberry32) so suggestions are stable for a given
// set of existing items + seed, instead of reshuffling on every render.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getBucketListSuggestions(
  existingItems: Array<{ title: string; category: string | null }>,
  count = 6,
  seed = 0
): SuggestionItem[] {
  const existingCats = new Set(existingItems.map((i) => i.category).filter(Boolean));

  // Filter out items too similar to one the user already has (Jaccard ≥ 0.5
  // over meaningful tokens). Catches "Run a marathon" vs "Run a half marathon"
  // while letting genuinely different suggestions through.
  const pool = SUGGESTION_POOL.filter(
    (s) => !existingItems.some((e) => titleSimilarity(s.title, e.title) >= 0.5)
  );

  // Separate into "gap categories" (user has none) vs "familiar" (user has some)
  const gaps = pool.filter((s) => !existingCats.has(s.category));
  const familiar = pool.filter((s) => existingCats.has(s.category));

  // Deterministic shuffle from a seed derived from existing titles + caller seed.
  const existingKey = existingItems
    .map((i) => i.title)
    .sort()
    .join('|');
  const rng = mulberry32(hashString(existingKey) + seed);
  const shuffle = <T>(arr: T[]): T[] =>
    [...arr]
      .map((v) => ({ v, k: rng() }))
      .sort((a, b) => a.k - b.k)
      .map(({ v }) => v);

  // Half from categories the user has nothing in, half from ones they do.
  const gapCount = Math.min(Math.ceil(count / 2), gaps.length);
  const famCount = Math.min(count - gapCount, familiar.length);
  const picked = [...shuffle(gaps).slice(0, gapCount), ...shuffle(familiar).slice(0, famCount)];

  // Backfill when one side runs short of its half, or the split silently
  // returns fewer than asked. An empty list is the worst case: every category
  // is a gap and `familiar` is empty, so a request for 4 returned 2 — the
  // brand-new user, who has the least to go on, got half as many ideas as
  // anyone else.
  if (picked.length < count) {
    const used = new Set(picked.map((p) => p.title));
    picked.push(
      ...shuffle(pool)
        .filter((p) => !used.has(p.title))
        .slice(0, count - picked.length)
    );
  }

  return picked.slice(0, count);
}
