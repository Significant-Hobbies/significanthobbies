export type HobbyCategory = {
  name: string;
  emoji: string;
  hobbies: string[];
};

export const HOBBY_CATEGORIES: HobbyCategory[] = [
  {
    name: 'Creative',
    emoji: '🎨',
    hobbies: [
      'Drawing',
      'Painting',
      'Photography',
      'Writing',
      'Sculpting',
      'Ceramics',
      'Knitting',
      'Crochet',
      'Quilting',
      'Embroidery',
      'Sewing',
      'Origami',
      'Calligraphy',
      'Graphic design',
      'Music production',
      'Songwriting',
      'Poetry',
      'Filmmaking',
      'Cosplay',
    ],
  },
  {
    name: 'Music',
    emoji: '🎵',
    hobbies: [
      'Guitar',
      'Piano',
      'Drums',
      'Violin',
      'Bass',
      'Singing',
      'DJing',
      'Ukulele',
      'Saxophone',
      'Flute',
      'Music theory',
    ],
  },
  {
    name: 'Physical',
    emoji: '💪',
    hobbies: [
      'Walking',
      'Running',
      'Cycling',
      'Swimming',
      'Hiking',
      'Climbing',
      'Yoga',
      'Tai chi',
      'Pilates',
      'Gym',
      'Martial arts',
      'Dance',
      'Golf',
      'Bowling',
      'Lawn bowls',
      'Basketball',
      'Football',
      'Tennis',
      'Table tennis',
      'Skiing',
      'Skateboarding',
      'Surfing',
      'Rowing',
      'Badminton',
      'Scuba diving',
      'Fencing',
      'Pickleball',
    ],
  },
  {
    name: 'Intellectual',
    emoji: '📚',
    hobbies: [
      'Reading',
      'Crosswords',
      'Chess',
      'Bridge',
      'Genealogy',
      'Coding',
      'Language learning',
      'Puzzles',
      'Sudoku',
      'Philosophy',
      'History',
      'Astronomy',
      'Mathematics',
      'Science',
    ],
  },
  {
    name: 'Gaming',
    emoji: '🎮',
    hobbies: [
      'Video games',
      'Board games',
      'Tabletop RPGs',
      'Speedrunning',
      'Esports',
      'Card games',
      'Dungeon Master',
    ],
  },
  {
    name: 'Outdoor',
    emoji: '🌿',
    hobbies: [
      'Gardening',
      'Bird watching',
      'Camping',
      'Fishing',
      'Foraging',
      'Stargazing',
      'Rock collecting',
      'Beekeeping',
      'Geocaching',
      'Mushroom hunting',
    ],
  },
  {
    name: 'Culinary',
    emoji: '🍳',
    hobbies: [
      'Cooking',
      'Baking',
      'Coffee brewing',
      'Wine tasting',
      'Cocktail making',
      'Fermentation',
      'BBQ',
      'Food photography',
    ],
  },
  {
    name: 'Collecting',
    emoji: '🗂️',
    hobbies: [
      'Vinyl records',
      'Books',
      'Stamps',
      'Coins',
      'Art',
      'Sneakers',
      'Vintage clothing',
      'Watches',
    ],
  },
  {
    name: 'Making',
    emoji: '🔧',
    hobbies: [
      'Woodworking',
      '3D printing',
      'Electronics',
      'Leatherworking',
      'Blacksmithing',
      'Candle making',
      'Soap making',
      'Jewelry making',
      'LEGO building',
    ],
  },
  {
    name: 'Social',
    emoji: '🤝',
    hobbies: [
      'Volunteering',
      'Hosting dinners',
      'Book club',
      'Choir',
      'Mahjong',
      'Improv comedy',
      'Theater',
      'Debate club',
      'Travel',
    ],
  },
];

export const ALL_HOBBIES = HOBBY_CATEGORIES.flatMap((c) => c.hobbies);

const CATEGORY_BY_HOBBY = new Map(
  HOBBY_CATEGORIES.flatMap((category) =>
    category.hobbies.map((hobby) => [hobby.toLowerCase(), category] as const)
  )
);

/**
 * Hobbies that ask a lot of the body. Used to keep a set of suggestions from
 * being uniformly strenuous — not to hide anything from anyone.
 *
 * The quiz has no idea how old you are or what your knees are like, and it
 * never asks. It used to answer with `hobbies.slice(0, 3)`, so everyone whose
 * top category was Physical got Running, Cycling, Swimming — the first three
 * array entries, presented as a personalised result. For a 70-year-old the
 * first instruction after the mortality page was "Do one tiny running session
 * today."
 */
const STRENUOUS = new Set([
  'Running',
  'Climbing',
  'Martial arts',
  'Basketball',
  'Football',
  'Skiing',
  'Skateboarding',
  'Surfing',
  'Rowing',
  'Scuba diving',
  'Fencing',
  'Gym',
  'Tennis',
  'Hiking',
  'Dance',
]);

export function isStrenuous(hobby: string): boolean {
  return STRENUOUS.has(hobby);
}

/**
 * Up to `limit` hobbies from a category, never all-strenuous.
 *
 * At most one demanding option makes the cut, and it is never first — so a set
 * always opens with something anyone could start this afternoon while still
 * offering a stretch. Categories with nothing strenuous in them are unaffected
 * and keep their authored order.
 */
export function pickAcrossEffort(hobbies: string[], limit = 3): string[] {
  const gentle = hobbies.filter((h) => !isStrenuous(h));
  const strenuous = hobbies.filter((h) => isStrenuous(h));
  if (strenuous.length === 0) return hobbies.slice(0, limit);

  const picked = gentle.slice(0, Math.max(1, limit - 1));
  if (picked.length < limit && strenuous.length > 0) picked.push(strenuous[0]);
  // Backfill from whatever is left if the category was mostly strenuous.
  for (const h of hobbies) {
    if (picked.length >= limit) break;
    if (!picked.includes(h)) picked.push(h);
  }
  return picked.slice(0, limit);
}

export function getCategoryForHobby(hobby: string): HobbyCategory | undefined {
  return CATEGORY_BY_HOBBY.get(hobby.toLowerCase());
}

export function getSuggestedHobbies(existingHobbies: string[], limit = 6): string[] {
  const existing = new Set(existingHobbies.map((h) => h.toLowerCase()));

  // Find categories the user is already in
  const userCategories = new Set(
    existingHobbies.map((h) => getCategoryForHobby(h)?.name).filter(Boolean) as string[]
  );

  const suggestions: string[] = [];

  // First pass: hobbies from same categories
  for (const cat of HOBBY_CATEGORIES) {
    if (!userCategories.has(cat.name)) continue;
    for (const hobby of cat.hobbies) {
      if (!existing.has(hobby.toLowerCase())) {
        suggestions.push(hobby);
      }
    }
  }

  // Second pass: hobbies from other categories to fill up
  for (const cat of HOBBY_CATEGORIES) {
    if (userCategories.has(cat.name)) continue;
    for (const hobby of cat.hobbies) {
      if (!existing.has(hobby.toLowerCase())) {
        suggestions.push(hobby);
      }
    }
  }

  // Deduplicate and limit
  return [...new Set(suggestions)].slice(0, limit);
}

// ─── Facets ──────────────────────────────────────────────────────────────────

/**
 * Cross-cutting tags, orthogonal to the ten categories.
 *
 * A category answers "what kind of thing is this"; a facet answers "would this
 * fit my life". Those are different questions, and the catalogue could only
 * answer the first — so someone who wanted something gentle, cheap and doable
 * alone had no way to ask.
 *
 * `gentle` carries the most weight. It is the one that lets a person with
 * limited mobility, an injury, or eighty years behind them find something, so
 * it is assigned strictly: anything involving kneeling, carrying, or standing
 * for hours is `active`, Gardening included.
 */
export type HobbyFacet =
  | 'solo'
  | 'group'
  | 'indoor'
  | 'outdoor'
  | 'travel'
  | 'low-cost'
  | 'gentle'
  | 'active'
  | 'makes-something'
  | 'learn-a-skill'
  | 'quiet'
  | 'screen-free';

export const HOBBY_FACET_LABELS: Record<HobbyFacet, string> = {
  solo: 'On your own',
  group: 'With others',
  indoor: 'Indoors',
  outdoor: 'Outdoors',
  travel: 'Involves going somewhere',
  'low-cost': 'Cheap to start',
  gentle: 'Gentle on the body',
  active: 'Physically active',
  'makes-something': 'You end up with something',
  'learn-a-skill': 'Gets better with practice',
  quiet: 'Quiet',
  'screen-free': 'No screen',
};

export const HOBBY_FACETS: Record<string, HobbyFacet[]> = {
  Drawing: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Painting: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Photography: ['solo', 'indoor', 'outdoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Writing: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Sculpting: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  Ceramics: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  Knitting: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Crochet: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Quilting: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  Embroidery: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Sewing: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  Origami: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Calligraphy: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'Graphic design': ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  'Music production': ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Songwriting: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Poetry: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'quiet'],
  Filmmaking: ['group', 'indoor', 'outdoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Cosplay: ['solo', 'group', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Guitar: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Piano: ['solo', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  Drums: ['solo', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  Violin: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  Bass: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  Singing: ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill'],
  DJing: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill'],
  Ukulele: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Saxophone: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  Flute: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  'Music theory': ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  Walking: ['solo', 'group', 'outdoor', 'low-cost', 'gentle', 'screen-free'],
  Running: ['solo', 'group', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Cycling: ['solo', 'group', 'outdoor', 'active', 'learn-a-skill', 'screen-free'],
  Swimming: ['solo', 'indoor', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Hiking: ['solo', 'group', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Climbing: ['solo', 'group', 'indoor', 'outdoor', 'active', 'learn-a-skill'],
  Yoga: ['solo', 'group', 'indoor', 'outdoor', 'low-cost', 'gentle'],
  'Tai chi': ['solo', 'group', 'indoor', 'outdoor', 'low-cost', 'gentle'],
  Pilates: ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill'],
  Gym: ['solo', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  'Martial arts': ['group', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  Dance: ['solo', 'group', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  Golf: ['solo', 'group', 'outdoor', 'active', 'learn-a-skill', 'screen-free'],
  Bowling: ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'screen-free'],
  'Lawn bowls': ['group', 'outdoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Basketball: ['group', 'indoor', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Football: ['group', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Tennis: ['group', 'outdoor', 'active', 'learn-a-skill', 'screen-free'],
  'Table tennis': ['group', 'indoor', 'low-cost', 'active', 'learn-a-skill', 'screen-free'],
  Skiing: ['group', 'outdoor', 'travel', 'active', 'learn-a-skill', 'screen-free'],
  Skateboarding: ['solo', 'outdoor', 'active', 'learn-a-skill', 'screen-free'],
  Surfing: ['solo', 'outdoor', 'travel', 'active', 'learn-a-skill', 'screen-free'],
  Rowing: ['solo', 'group', 'outdoor', 'active', 'learn-a-skill', 'screen-free'],
  Badminton: ['group', 'indoor', 'low-cost', 'active', 'learn-a-skill', 'screen-free'],
  'Scuba diving': ['group', 'outdoor', 'travel', 'active', 'learn-a-skill', 'screen-free'],
  Fencing: ['group', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  Pickleball: ['group', 'indoor', 'outdoor', 'low-cost', 'active', 'screen-free'],
  Reading: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Crosswords: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Chess: ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill'],
  Bridge: ['group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Genealogy: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  Coding: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'Language learning': ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill'],
  Puzzles: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Sudoku: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Philosophy: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  History: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  Astronomy: ['solo', 'outdoor', 'gentle', 'learn-a-skill', 'quiet', 'screen-free'],
  Mathematics: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  Science: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'quiet'],
  'Video games': ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill'],
  'Board games': ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  'Tabletop RPGs': ['group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Speedrunning: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Esports: ['group', 'indoor', 'gentle', 'learn-a-skill'],
  'Card games': ['solo', 'group', 'indoor', 'low-cost', 'gentle', 'screen-free'],
  'Dungeon Master': ['group', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Gardening: ['solo', 'outdoor', 'low-cost', 'active', 'makes-something', 'learn-a-skill'],
  'Bird watching': ['solo', 'group', 'outdoor', 'low-cost', 'gentle', 'quiet'],
  Camping: ['solo', 'group', 'outdoor', 'travel', 'active', 'screen-free'],
  Fishing: ['solo', 'outdoor', 'travel', 'gentle', 'quiet', 'screen-free'],
  Foraging: ['solo', 'outdoor', 'travel', 'low-cost', 'active', 'screen-free'],
  Stargazing: ['solo', 'outdoor', 'travel', 'low-cost', 'gentle', 'quiet'],
  'Rock collecting': ['solo', 'outdoor', 'low-cost', 'active', 'learn-a-skill', 'screen-free'],
  Beekeeping: ['solo', 'outdoor', 'active', 'makes-something', 'learn-a-skill', 'screen-free'],
  Geocaching: ['solo', 'group', 'outdoor', 'travel', 'low-cost', 'active'],
  'Mushroom hunting': ['solo', 'outdoor', 'travel', 'low-cost', 'active', 'learn-a-skill'],
  Cooking: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Baking: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'Coffee brewing': ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  'Wine tasting': ['group', 'indoor', 'gentle', 'learn-a-skill', 'screen-free'],
  'Cocktail making': ['solo', 'group', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Fermentation: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  BBQ: ['group', 'outdoor', 'active', 'makes-something', 'learn-a-skill', 'screen-free'],
  'Food photography': ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'Vinyl records': ['solo', 'indoor', 'gentle', 'quiet', 'screen-free'],
  Books: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Stamps: ['solo', 'indoor', 'low-cost', 'gentle', 'quiet', 'screen-free'],
  Coins: ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Art: ['solo', 'indoor', 'gentle', 'quiet', 'learn-a-skill'],
  Sneakers: ['solo', 'group', 'indoor', 'gentle', 'learn-a-skill'],
  'Vintage clothing': ['solo', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Watches: ['solo', 'indoor', 'gentle', 'learn-a-skill', 'quiet'],
  Woodworking: ['solo', 'indoor', 'active', 'makes-something', 'learn-a-skill', 'screen-free'],
  '3D printing': ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill'],
  Electronics: ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  Leatherworking: ['solo', 'indoor', 'gentle', 'makes-something', 'learn-a-skill', 'screen-free'],
  Blacksmithing: ['solo', 'indoor', 'active', 'makes-something', 'learn-a-skill', 'screen-free'],
  'Candle making': ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'screen-free'],
  'Soap making': ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'Jewelry making': ['solo', 'indoor', 'low-cost', 'gentle', 'makes-something', 'learn-a-skill'],
  'LEGO building': ['solo', 'indoor', 'gentle', 'makes-something', 'quiet', 'screen-free'],
  Volunteering: ['group', 'indoor', 'outdoor', 'low-cost', 'gentle', 'screen-free'],
  'Hosting dinners': [
    'group',
    'indoor',
    'gentle',
    'makes-something',
    'learn-a-skill',
    'screen-free',
  ],
  'Book club': ['group', 'indoor', 'low-cost', 'gentle', 'screen-free'],
  Choir: ['group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Mahjong: ['group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  'Improv comedy': ['group', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  Theater: ['group', 'indoor', 'active', 'learn-a-skill', 'screen-free'],
  'Debate club': ['group', 'indoor', 'low-cost', 'gentle', 'learn-a-skill', 'screen-free'],
  Travel: ['solo', 'group', 'outdoor', 'travel', 'active', 'learn-a-skill'],
};

export const ALL_HOBBY_FACETS = Object.keys(HOBBY_FACET_LABELS) as HobbyFacet[];

export function facetsForHobby(hobby: string): HobbyFacet[] {
  return HOBBY_FACETS[hobby] ?? [];
}

/** Hobbies carrying every one of the given facets. An empty filter matches all. */
export function hobbiesWithFacets(facets: HobbyFacet[]): string[] {
  if (facets.length === 0) return ALL_HOBBIES;
  return ALL_HOBBIES.filter((h) => {
    const owned = HOBBY_FACETS[h];
    return owned ? facets.every((f) => owned.includes(f)) : false;
  });
}
