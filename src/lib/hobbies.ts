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
  const lower = hobby.toLowerCase();
  return HOBBY_CATEGORIES.find((c) => c.hobbies.some((h) => h.toLowerCase() === lower));
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
