// Quest generator — turns rediscovery data from a user's timeline into
// actionable personalized quests. This is the core of the Timeline→Quest loop.
//
// The flow:
//   1. User has a timeline with phases (Childhood: photography, Teen: guitar, ...)
//   2. Rediscovery finds dropped hobbies (photography was in college but not since)
//   3. This generator creates a concrete quest: "Rediscover photography — take 5 photos this week"
//   4. User starts the quest → it appears on their dashboard
//   5. User completes the quest → a pin is auto-added to their timeline (the loop closes)

import { SIDE_QUESTS, type SideQuest } from './side-quests';
import { findRediscoveryOpportunities, type RediscoveryItem } from './rediscovery';
import type { Phase } from './types';

export type GeneratedQuest = {
  // Stable ID: "rq-{slugified-hobby}" so the same hobby always generates the same quest ID
  questId: string;
  type: 'rediscovery';
  sourceHobby: string;
  title: string;
  description: string;
  emoji: string;
  // Which rediscovery category this came from
  rediscoveryType: 'dropped' | 'dormant' | 'rekindle';
  // How many phases this hobby appeared in (priority signal)
  totalPhases: number;
  // The last phase label where this hobby was seen
  lastSeenPhase: string;
};

// ─── Quest templates per rediscovery type ──────────────────────────────────
// These are the concrete actions we suggest. They're specific enough to be
// actionable but generic enough to work for any hobby.

const DROPPED_TEMPLATES = [
  {
    title: (hobby: string) => `Rediscover ${hobby.toLowerCase()}`,
    desc: (hobby: string, phase: string) =>
      `You loved ${hobby.toLowerCase()} back in ${phase}. Try it once this week — no commitment, just curiosity. See if the spark is still there.`,
  },
  {
    title: (hobby: string) => `Reconnect with ${hobby.toLowerCase()}`,
    desc: (hobby: string, phase: string) =>
      `${hobby} shaped you during ${phase}. Spend 30 minutes with it this week. You don't have to pick it up again — just revisit it honestly.`,
  },
];

const DORMANT_TEMPLATES = [
  {
    title: (hobby: string) => `Wake up ${hobby.toLowerCase()}`,
    desc: (hobby: string, phase: string) =>
      `${hobby} has been quiet since ${phase}. It's been a while. Try one small session this week and notice what feels different now.`,
  },
  {
    title: (hobby: string) => `Check in with ${hobby.toLowerCase()}`,
    desc: (hobby: string, phase: string) =>
      `You haven't touched ${hobby.toLowerCase()} since ${phase}. That's okay. But check — is the absence intentional, or did life just get busy? Spend 20 minutes finding out.`,
  },
];

const REKINDLE_TEMPLATES = [
  {
    title: (hobby: string) => `Pick ${hobby.toLowerCase()} back up`,
    desc: (hobby: string, phase: string) =>
      `${hobby} keeps coming back — it's appeared across multiple phases of your life. That's not coincidence. Commit to it properly this week.`,
  },
  {
    title: (hobby: string) => `Go deeper with ${hobby.toLowerCase()}`,
    desc: (hobby: string, phase: string) =>
      `You've returned to ${hobby.toLowerCase()} before. Last seen in ${phase}. This time, try something harder — a new technique, a class, a project that scares you.`,
  },
];

// ─── Hobby → emoji mapping ─────────────────────────────────────────────────
// Try to find an emoji from the static quest definitions that match this hobby.
// Falls back to a generic rediscovery emoji.

function findHobbyEmoji(hobby: string): string {
  const lower = hobby.toLowerCase();
  // Check if any static quest has this as a related hobby
  const matchingQuest = SIDE_QUESTS.find((q) =>
    q.relatedHobbies.some((h) => h.toLowerCase() === lower)
  );
  if (matchingQuest) return matchingQuest.emoji;

  // Common hobby → emoji fallbacks
  const EMOJI_MAP: Record<string, string> = {
    photography: '📷',
    guitar: '🎸',
    piano: '🎹',
    drawing: '✏️',
    painting: '🎨',
    writing: '✍️',
    coding: '💻',
    hiking: '🥾',
    running: '🏃',
    cooking: '🍳',
    baking: '🧁',
    reading: '📚',
    chess: '♟️',
    yoga: '🧘',
    gardening: '🌱',
    fishing: '🎣',
    cycling: '🚲',
    swimming: '🏊',
    climbing: '🧗',
    music: '🎵',
    singing: '🎤',
    pottery: '🏺',
    knitting: '🧶',
    woodworking: '🪚',
    gaming: '🎮',
    lego: '🧱',
    skateboarding: '🛹',
    skiing: '⛷️',
    tennis: '🎾',
    dance: '💃',
    meditation: '🧘',
  };
  return EMOJI_MAP[lower] ?? '🔄';
}

// ─── Slugify ───────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Pick a template deterministically ──────────────────────────────────────
// Use the hobby name length to pick a template so the same hobby always
// gets the same quest text (stable across regenerations).
function pickTemplate<T>(templates: T[], hobby: string): T {
  const idx = hobby.length % templates.length;
  return templates[idx]!;
}

// ─── Main generator ─────────────────────────────────────────────────────────

export function generateRediscoveryQuests(
  phases: Phase[],
  options?: { excludeHobbies?: string[] }
): GeneratedQuest[] {
  if (phases.length < 2) return [];

  const rediscovery = findRediscoveryOpportunities(phases);
  const exclude = new Set((options?.excludeHobbies ?? []).map((h) => h.toLowerCase()));

  const allItems: (RediscoveryItem & { category: 'dropped' | 'dormant' | 'rekindle' })[] = [
    ...rediscovery.rekindleCandidates.map((i) => ({ ...i, category: 'rekindle' as const })),
    ...rediscovery.dormant.map((i) => ({ ...i, category: 'dormant' as const })),
    ...rediscovery.dropped.map((i) => ({ ...i, category: 'dropped' as const })),
  ];

  // Deduplicate by hobby name (rekindle takes priority, then dormant, then dropped)
  const seen = new Set<string>();
  const unique: (typeof allItems)[number][] = [];
  for (const item of allItems) {
    if (seen.has(item.name) || exclude.has(item.name)) continue;
    seen.add(item.name);
    unique.push(item);
  }

  // Sort by priority: rekindle first (most likely to stick), then by totalPhases
  unique.sort((a, b) => {
    if (a.category !== b.category) {
      const order = { rekindle: 0, dormant: 1, dropped: 2 };
      return order[a.category] - order[b.category];
    }
    return b.totalPhases - a.totalPhases;
  });

  return unique.map((item) => {
    const templates =
      item.category === 'rekindle'
        ? REKINDLE_TEMPLATES
        : item.category === 'dormant'
          ? DORMANT_TEMPLATES
          : DROPPED_TEMPLATES;

    const template = pickTemplate(templates, item.name);

    return {
      questId: `rq-${slugify(item.name)}`,
      type: 'rediscovery' as const,
      sourceHobby: item.name,
      title: template.title(item.name),
      description: template.desc(item.name, item.lastSeenPhase),
      emoji: findHobbyEmoji(item.name),
      rediscoveryType: item.category,
      totalPhases: item.totalPhases,
      lastSeenPhase: item.lastSeenPhase,
    };
  });
}

// ─── Match static quests to timeline hobbies ────────────────────────────────
// Find static side-quests whose relatedHobbies overlap with the user's
// timeline hobbies. These can be suggested alongside rediscovery quests.

export function suggestStaticQuestsForTimeline(phases: Phase[]): SideQuest[] {
  const timelineHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase()))
  );

  return SIDE_QUESTS.filter((q) =>
    q.relatedHobbies.some((h) => timelineHobbies.has(h.toLowerCase()))
  );
}
