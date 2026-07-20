// Side Quests — 50 curated micro-adventures inspired by the viral "50 side quests" tweet

export type QuestCategory =
  | 'sensory'
  | 'creative'
  | 'culinary'
  | 'social'
  | 'exploration'
  | 'mindful';

export type SideQuest = {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  emoji: string;
  relatedHobbies: string[];
};

export const QUEST_CATEGORIES: {
  id: QuestCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { id: 'sensory', label: 'Sensory', emoji: '\u{1F441}\uFE0F', color: 'emerald' },
  { id: 'creative', label: 'Creative', emoji: '\uD83C\uDFA8', color: 'purple' },
  { id: 'culinary', label: 'Culinary', emoji: '\uD83C\uDF73', color: 'amber' },
  { id: 'social', label: 'Social', emoji: '\uD83E\uDD1D', color: 'blue' },
  { id: 'exploration', label: 'Exploration', emoji: '\uD83E\uDDED', color: 'teal' },
  { id: 'mindful', label: 'Mindful', emoji: '\uD83E\uDDD8', color: 'violet' },
];

export const SIDE_QUESTS: SideQuest[] = [
  // ── Sensory (8) ─────────────────────────────────────────────
  {
    id: 'sq-01',
    title: 'Sunrise Walk',
    description:
      'Wake up early enough to watch the full sunrise from start to finish. No phone, just eyes.',
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83C\uDF05',
    relatedHobbies: ['Hiking', 'Photography'],
  },
  {
    id: 'sq-02',
    title: 'Texture Hunter',
    description:
      "Photograph 10 different textures in your neighborhood — bark, rust, fabric, cracks. See what you've been walking past.",
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83D\uDCF7',
    relatedHobbies: ['Photography'],
  },
  {
    id: 'sq-03',
    title: 'Learn 5 Constellations',
    description:
      'Go outside on a clear night and identify at least five constellations. Bonus if you can find a planet.',
    category: 'sensory',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\u2B50',
    relatedHobbies: ['Stargazing', 'Astronomy'],
  },
  {
    id: 'sq-04',
    title: 'Familiar Route, Unfamiliar Time',
    description:
      'Walk a route you know by heart but at a completely different time of day. Notice how it transforms.',
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83D\uDEB6',
    relatedHobbies: ['Hiking'],
  },
  {
    id: 'sq-05',
    title: 'Ten Minutes of Silence',
    description:
      'Sit in complete silence for 10 uninterrupted minutes. No music, no podcasts, no distractions. Just you.',
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\uD83E\uDD2B',
    relatedHobbies: ['Yoga'],
  },
  {
    id: 'sq-06',
    title: 'Press Flowers or Leaves',
    description:
      'Collect interesting leaves or flowers and press them between book pages. Check back in a week.',
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83C\uDF3F',
    relatedHobbies: ['Gardening', 'Foraging'],
  },
  {
    id: 'sq-07',
    title: 'Map Your Neighborhood Gems',
    description:
      "Walk around and note 5 spots you'd recommend to a friend visiting — the best bench, the hidden mural, the perfect tree.",
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDDFA\uFE0F',
    relatedHobbies: ['Photography', 'Bird watching'],
  },
  {
    id: 'sq-08',
    title: 'Listen to a Full Album',
    description:
      "Pick an album you've never heard and listen front to back with no skipping. Sit with it like a movie.",
    category: 'sensory',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83C\uDFB5',
    relatedHobbies: ['Vinyl records', 'Music theory'],
  },

  // ── Creative (9) ────────────────────────────────────────────
  {
    id: 'sq-09',
    title: 'Draw 5 Everyday Objects',
    description:
      "Sketch five mundane things around you — a mug, your keys, a shoe. Don't aim for perfection, aim for seeing.",
    category: 'creative',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\u270F\uFE0F',
    relatedHobbies: ['Drawing'],
  },
  {
    id: 'sq-10',
    title: "The Letter You'll Never Send",
    description:
      'Write a letter to someone — past self, future self, someone you miss. Say everything. Then keep it.',
    category: 'creative',
    difficulty: 'medium',
    timeEstimate: '30 min',
    emoji: '\u2709\uFE0F',
    relatedHobbies: ['Writing', 'Poetry'],
  },
  {
    id: 'sq-11',
    title: 'A Week of Calligraphy',
    description:
      'Practice calligraphy or hand-lettering for 10 minutes every day for a week. Watch your hand learn.',
    category: 'creative',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDD8B\uFE0F',
    relatedHobbies: ['Calligraphy', 'Drawing'],
  },
  {
    id: 'sq-12',
    title: 'Life Chapter Playlist',
    description:
      'Create a playlist where each song represents a chapter of your life so far. Add liner notes.',
    category: 'creative',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83C\uDFB6',
    relatedHobbies: ['Music production', 'Songwriting'],
  },
  {
    id: 'sq-13',
    title: 'Memorize a Poem',
    description:
      'Choose a poem that moves you and commit it to memory. Recite it to yourself on walks.',
    category: 'creative',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDCDC',
    relatedHobbies: ['Poetry', 'Reading'],
  },
  {
    id: 'sq-14',
    title: 'Build Something With Your Hands',
    description:
      'No screens. Build a birdhouse, a shelf, a clay pot — anything physical. Feel the material resist and give.',
    category: 'creative',
    difficulty: 'hard',
    timeEstimate: 'half day',
    emoji: '\uD83D\uDD28',
    relatedHobbies: ['Woodworking', 'Ceramics', 'Sculpting'],
  },
  {
    id: 'sq-15',
    title: 'Self-Portrait Without a Camera',
    description:
      "Draw, paint, or collage a self-portrait. It doesn't have to look like you — it has to feel like you.",
    category: 'creative',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDDBC\uFE0F',
    relatedHobbies: ['Drawing', 'Painting'],
  },
  {
    id: 'sq-16',
    title: 'Learn a Song on an Instrument',
    description:
      "Pick one song and learn to play it all the way through. Doesn't matter if it's simple — finish it.",
    category: 'creative',
    difficulty: 'hard',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDFB8',
    relatedHobbies: ['Guitar', 'Piano', 'Ukulele'],
  },
  {
    id: 'sq-17',
    title: 'Fill a Sketchbook Page',
    description:
      'Fill an entire page — doodles, patterns, words, color. No blank space allowed. No rules either.',
    category: 'creative',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83D\uDCD3',
    relatedHobbies: ['Drawing', 'Painting', 'Graphic design'],
  },

  // ── Culinary (8) ────────────────────────────────────────────
  {
    id: 'sq-18',
    title: 'Dish From an Unvisited Country',
    description:
      "Pick a country you've never been to and cook one of its traditional dishes from scratch. Taste the distance.",
    category: 'culinary',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDF0D',
    relatedHobbies: ['Cooking'],
  },
  {
    id: 'sq-19',
    title: 'Bread From Scratch',
    description:
      'Make bread with just flour, water, yeast, and salt. Knead it. Wait for it. Smell it baking.',
    category: 'culinary',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDF5E',
    relatedHobbies: ['Baking'],
  },
  {
    id: 'sq-20',
    title: 'Fresh Pasta',
    description:
      'Make pasta from scratch — just eggs and flour. Roll it, cut it, boil it. A meal you earned.',
    category: 'culinary',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDF5D',
    relatedHobbies: ['Cooking'],
  },
  {
    id: 'sq-21',
    title: 'Perfect Your Signature Sauce',
    description:
      "Pick a sauce — tomato, curry, pesto, anything — and make it until it's yours. Tweak, taste, repeat.",
    category: 'culinary',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83E\uDD63',
    relatedHobbies: ['Cooking'],
  },
  {
    id: 'sq-22',
    title: 'Start an Herb Garden',
    description:
      "Plant basil, rosemary, or whatever speaks to you. Even a windowsill counts. Grow something you'll eat.",
    category: 'culinary',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83C\uDF31',
    relatedHobbies: ['Gardening', 'Cooking'],
  },
  {
    id: 'sq-23',
    title: 'Brew Coffee a New Way',
    description:
      "Try pour-over, French press, cold brew, or Turkish — whichever you haven't done. Taste the difference.",
    category: 'culinary',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\u2615',
    relatedHobbies: ['Coffee brewing'],
  },
  {
    id: 'sq-24',
    title: 'Solo Picnic',
    description:
      'Pack a simple meal, find a beautiful spot, and eat outside alone. Blanket optional, presence required.',
    category: 'culinary',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83E\uDDFA',
    relatedHobbies: ['Cooking', 'Camping'],
  },
  {
    id: 'sq-25',
    title: 'Ferment Something',
    description:
      'Start a fermentation project — kimchi, kombucha, sourdough starter, pickles. Let time do the work.',
    category: 'culinary',
    difficulty: 'hard',
    timeEstimate: 'half day',
    emoji: '\uD83E\uDD6C',
    relatedHobbies: ['Fermentation', 'Cooking'],
  },

  // ── Social (8) ──────────────────────────────────────────────
  {
    id: 'sq-26',
    title: 'Sincere Compliment to a Stranger',
    description:
      "Give a genuine, specific compliment to someone you don't know. Watch what it does to both of you.",
    category: 'social',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\uD83D\uDCAC',
    relatedHobbies: ['Volunteering'],
  },
  {
    id: 'sq-27',
    title: 'Attend an Open Mic',
    description:
      'Go to an open mic night — poetry, comedy, music. Extra credit if you sign up yourself.',
    category: 'social',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83C\uDFA4',
    relatedHobbies: ['Improv comedy', 'Singing', 'Poetry'],
  },
  {
    id: 'sq-28',
    title: 'Volunteer Without Posting About It',
    description:
      'Spend a few hours helping others with zero intention of telling anyone. Let it just be for you and them.',
    category: 'social',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83E\uDEF6',
    relatedHobbies: ['Volunteering'],
  },
  {
    id: 'sq-29',
    title: 'Coffee Shop, No Phone',
    description:
      'Go to a coffee shop alone. Leave your phone in your pocket. Just sit, watch, sip, think.',
    category: 'social',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\u2615',
    relatedHobbies: ['Coffee brewing', 'Writing'],
  },
  {
    id: 'sq-30',
    title: 'Host a Dinner',
    description:
      'Cook for friends or strangers. Set the table. Put on music. Make it an occasion, not just a meal.',
    category: 'social',
    difficulty: 'hard',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDF7D\uFE0F',
    relatedHobbies: ['Hosting dinners', 'Cooking'],
  },
  {
    id: 'sq-31',
    title: 'Learn a Self-Defense Move',
    description:
      "Attend a class or watch a trusted tutorial and practice one move until it's muscle memory.",
    category: 'social',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83E\uDD4B',
    relatedHobbies: ['Martial arts'],
  },
  {
    id: 'sq-32',
    title: 'Handwritten Thank-You Note',
    description:
      'Write a genuine thank-you note by hand and deliver or mail it. Specific gratitude hits different on paper.',
    category: 'social',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\uD83D\uDC8C',
    relatedHobbies: ['Writing', 'Calligraphy'],
  },
  {
    id: 'sq-33',
    title: 'Teach Someone Something',
    description:
      'Share a skill you have — tie a knot, make a recipe, play a chord. Teaching is learning twice.',
    category: 'social',
    difficulty: 'medium',
    timeEstimate: '30 min',
    emoji: '\uD83C\uDF93',
    relatedHobbies: ['Guitar', 'Cooking', 'Chess'],
  },

  // ── Exploration (9) ─────────────────────────────────────────
  {
    id: 'sq-34',
    title: 'Museum Solo Date',
    description:
      "Visit a museum alone. Linger at whatever catches you. Skip what doesn't. No itinerary.",
    category: 'exploration',
    difficulty: 'easy',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDFDB\uFE0F',
    relatedHobbies: ['Art', 'History'],
  },
  {
    id: 'sq-35',
    title: 'Read a Book Outdoors',
    description:
      'Take a physical book to a park, bench, or rooftop. Read at least 50 pages under open sky.',
    category: 'exploration',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDCD6',
    relatedHobbies: ['Reading', 'Books'],
  },
  {
    id: 'sq-36',
    title: 'Watch a Classic Film',
    description:
      "Pick a movie made before you were born that you've never seen. Watch the whole thing, no multitasking.",
    category: 'exploration',
    difficulty: 'easy',
    timeEstimate: '1 hour',
    emoji: '\uD83C\uDFAC',
    relatedHobbies: ['Filmmaking'],
  },
  {
    id: 'sq-37',
    title: 'Unknown Neighborhood',
    description:
      "Go to a part of your city you've never walked through. Wander without a destination. Get a little lost.",
    category: 'exploration',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDFD9\uFE0F',
    relatedHobbies: ['Travel', 'Photography'],
  },
  {
    id: 'sq-38',
    title: 'Bookshop Surprise',
    description:
      "Visit a bookshop and buy a book you'd never normally pick. Judge it by its first page, not its cover.",
    category: 'exploration',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83D\uDCDA',
    relatedHobbies: ['Reading', 'Books'],
  },
  {
    id: 'sq-39',
    title: 'Deep-Dive a Historical Event',
    description:
      'Pick one historical event and learn everything you can about it in an afternoon. Go down the rabbit hole.',
    category: 'exploration',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83D\uDD0D',
    relatedHobbies: ['History', 'Reading'],
  },
  {
    id: 'sq-40',
    title: 'Try a New Sport',
    description:
      "Try a sport or physical activity you've never done — bouldering, fencing, rowing, anything. Be a beginner.",
    category: 'exploration',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83E\uDD3E',
    relatedHobbies: ['Climbing', 'Swimming', 'Rowing', 'Tennis'],
  },
  {
    id: 'sq-41',
    title: 'Unfamiliar Cultural Event',
    description:
      'Attend a cultural event outside your usual sphere — a ceremony, a festival, a performance you know nothing about.',
    category: 'exploration',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83C\uDF8A',
    relatedHobbies: ['Theater', 'Travel'],
  },
  {
    id: 'sq-42',
    title: 'Fix Something in Your Home',
    description:
      'That wobbly chair, leaky faucet, or squeaky door — fix it yourself. YouTube is allowed. Pride is guaranteed.',
    category: 'exploration',
    difficulty: 'medium',
    timeEstimate: '1 hour',
    emoji: '\uD83D\uDD27',
    relatedHobbies: ['Woodworking', 'Electronics'],
  },

  // ── Mindful (8) ─────────────────────────────────────────────
  {
    id: 'sq-43',
    title: 'Journal in a Cafe',
    description:
      "Bring a notebook to a cafe and write about whatever surfaces. Don't curate. Just let it flow.",
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\u270D\uFE0F',
    relatedHobbies: ['Writing', 'Poetry'],
  },
  {
    id: 'sq-44',
    title: '24-Hour Social Media Detox',
    description:
      'Delete the apps for 24 hours. Not mute — delete. Notice the phantom thumb-scrolls. Reclaim the hours.',
    category: 'mindful',
    difficulty: 'medium',
    timeEstimate: 'half day',
    emoji: '\uD83D\uDCF5',
    relatedHobbies: ['Reading', 'Yoga'],
  },
  {
    id: 'sq-45',
    title: 'Stretch in a New Way',
    description:
      "Try a yoga flow, a mobility routine, or just 15 minutes of stretches you've never done. Listen to your body.",
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\uD83E\uDDD8',
    relatedHobbies: ['Yoga'],
  },
  {
    id: 'sq-46',
    title: 'Write 50 Gratitudes',
    description:
      "Sit down and list 50 things you're grateful for. The first 20 are easy — the last 30 are where the real ones hide.",
    category: 'mindful',
    difficulty: 'medium',
    timeEstimate: '30 min',
    emoji: '\uD83D\uDE4F',
    relatedHobbies: ['Writing'],
  },
  {
    id: 'sq-47',
    title: 'Walk in the Rain',
    description:
      "Next time it rains, go for a walk on purpose. Feel it. Skip the umbrella if you're brave enough.",
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83C\uDF27\uFE0F',
    relatedHobbies: ['Hiking'],
  },
  {
    id: 'sq-48',
    title: 'Organize One Drawer',
    description:
      'Pick your messiest drawer. Empty it completely. Only put back what you actually want. Enjoy the calm.',
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\uD83D\uDDC4\uFE0F',
    relatedHobbies: [],
  },
  {
    id: 'sq-49',
    title: 'Watch a Sunset With Full Attention',
    description:
      'No photos. No talking. Just watch the sky change color from start to finish. Be there for the whole show.',
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '30 min',
    emoji: '\uD83C\uDF07',
    relatedHobbies: ['Photography', 'Stargazing'],
  },
  {
    id: 'sq-50',
    title: 'Write Your Own Side Quest',
    description:
      "Design a personal side quest that only you would think of. What's something you've always wanted to try? Write it down and do it.",
    category: 'mindful',
    difficulty: 'easy',
    timeEstimate: '15 min',
    emoji: '\u2728',
    relatedHobbies: ['Writing'],
  },
];

// ── Helpers ──────────────────────────────────────────────────

export function getQuestById(id: string): SideQuest | undefined {
  return SIDE_QUESTS.find((q) => q.id === id);
}

export type QuestFilters = {
  vibe?: 'solo' | 'social' | 'either';
  energy?: 'chill' | 'active' | 'creative';
  time?: '15 min' | '30 min' | '1 hour' | 'half day';
};

const SOLO_CATEGORIES: QuestCategory[] = ['sensory', 'creative', 'mindful', 'exploration'];
const SOCIAL_CATEGORIES: QuestCategory[] = ['social'];
const CHILL_CATEGORIES: QuestCategory[] = ['sensory', 'mindful'];
const ACTIVE_CATEGORIES: QuestCategory[] = ['exploration', 'social'];
const CREATIVE_CATEGORIES: QuestCategory[] = ['creative', 'culinary'];

export function filterQuests(filters: QuestFilters): SideQuest[] {
  return SIDE_QUESTS.filter((q) => {
    if (filters.vibe && filters.vibe !== 'either') {
      const cats = filters.vibe === 'solo' ? SOLO_CATEGORIES : SOCIAL_CATEGORIES;
      if (!cats.includes(q.category)) return false;
    }

    if (filters.energy) {
      const cats =
        filters.energy === 'chill'
          ? CHILL_CATEGORIES
          : filters.energy === 'active'
            ? ACTIVE_CATEGORIES
            : CREATIVE_CATEGORIES;
      if (!cats.includes(q.category)) return false;
    }

    if (filters.time) {
      if (q.timeEstimate !== filters.time) return false;
    }

    return true;
  });
}
