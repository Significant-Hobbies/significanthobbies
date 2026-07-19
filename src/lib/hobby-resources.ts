type ResourceType = 'curated' | 'sponsored' | 'own';

export type HobbyResource = {
  name: string;
  url: string;
  description: string;
  type: ResourceType;
  icon: string;
};

const HOBBY_RESOURCES: Record<string, HobbyResource[]> = {
  // Creative
  Drawing: [
    {
      name: 'Drawabox',
      url: 'https://drawabox.com',
      description: 'Free structured drawing fundamentals course',
      type: 'curated',
      icon: '✏️',
    },
    {
      name: 'Proko',
      url: 'https://www.proko.com',
      description: 'Professional art tutorials and courses',
      type: 'curated',
      icon: '🎨',
    },
  ],
  Photography: [
    {
      name: 'Unsplash',
      url: 'https://unsplash.com',
      description: 'Share and discover high-quality photos',
      type: 'curated',
      icon: '📸',
    },
    {
      name: '500px',
      url: 'https://500px.com',
      description: 'Photography community and portfolio',
      type: 'curated',
      icon: '🖼️',
    },
  ],
  Writing: [
    {
      name: 'NaNoWriMo',
      url: 'https://nanowrimo.org',
      description: 'National Novel Writing Month community',
      type: 'curated',
      icon: '📝',
    },
  ],

  // Music
  Guitar: [
    {
      name: 'Justin Guitar',
      url: 'https://www.justinguitar.com',
      description: 'Free guitar lessons from beginner to advanced',
      type: 'curated',
      icon: '🎸',
    },
    {
      name: 'Ultimate Guitar',
      url: 'https://www.ultimate-guitar.com',
      description: 'Tabs, chords, and guitar community',
      type: 'curated',
      icon: '🎵',
    },
  ],
  Piano: [
    {
      name: 'Synthesia',
      url: 'https://synthesiagame.com',
      description: 'Learn piano with falling notes visualization',
      type: 'curated',
      icon: '🎹',
    },
    {
      name: 'Pianote',
      url: 'https://www.pianote.com',
      description: 'Online piano lessons for all levels',
      type: 'curated',
      icon: '🎶',
    },
  ],

  // Physical
  Running: [
    {
      name: 'Strava',
      url: 'https://www.strava.com',
      description: 'Track runs and connect with athletes',
      type: 'curated',
      icon: '🏃',
    },
    {
      name: 'Couch to 5K',
      url: 'https://c25k.com',
      description: 'Beginner running program',
      type: 'curated',
      icon: '👟',
    },
  ],
  Cycling: [
    {
      name: 'Strava',
      url: 'https://www.strava.com',
      description: 'Track rides, find routes, join challenges',
      type: 'curated',
      icon: '🚴',
    },
    {
      name: 'Komoot',
      url: 'https://www.komoot.com',
      description: 'Route planning and outdoor navigation',
      type: 'curated',
      icon: '🗺️',
    },
  ],
  Yoga: [
    {
      name: 'Yoga With Adriene',
      url: 'https://yogawithadriene.com',
      description: 'Free yoga videos for every level',
      type: 'curated',
      icon: '🧘',
    },
    {
      name: 'Down Dog',
      url: 'https://www.downdogapp.com',
      description: 'Personalized yoga practice app',
      type: 'curated',
      icon: '🐕',
    },
  ],
  Climbing: [
    {
      name: 'Mountain Project',
      url: 'https://www.mountainproject.com',
      description: 'Route database and climbing community',
      type: 'curated',
      icon: '🧗',
    },
  ],

  // Intellectual
  Reading: [
    {
      name: 'Goodreads',
      url: 'https://www.goodreads.com',
      description: 'Track books and find recommendations',
      type: 'curated',
      icon: '📖',
    },
    {
      name: 'StoryGraph',
      url: 'https://www.thestorygraph.com',
      description: 'AI-powered book recommendations',
      type: 'curated',
      icon: '📊',
    },
  ],
  Chess: [
    {
      name: 'Chess.com',
      url: 'https://www.chess.com',
      description: 'Play, learn, and compete online',
      type: 'curated',
      icon: '♟️',
    },
    {
      name: 'Lichess',
      url: 'https://lichess.org',
      description: 'Free, open-source chess platform',
      type: 'curated',
      icon: '👑',
    },
  ],
  Coding: [
    {
      name: 'GitHub',
      url: 'https://github.com',
      description: 'Build, share, and collaborate on code',
      type: 'curated',
      icon: '💻',
    },
    {
      name: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org',
      description: 'Learn to code for free',
      type: 'curated',
      icon: '🎓',
    },
  ],
  'Language learning': [
    {
      name: 'Duolingo',
      url: 'https://www.duolingo.com',
      description: 'Free language learning with gamification',
      type: 'curated',
      icon: '🦉',
    },
    {
      name: 'iTalki',
      url: 'https://www.italki.com',
      description: 'Practice with native speakers',
      type: 'curated',
      icon: '🗣️',
    },
  ],

  // Gaming
  'Video games': [
    {
      name: 'HowLongToBeat',
      url: 'https://howlongtobeat.com',
      description: 'Track game completion times',
      type: 'curated',
      icon: '🕹️',
    },
    {
      name: 'Backloggd',
      url: 'https://www.backloggd.com',
      description: 'Track and rate your game library',
      type: 'curated',
      icon: '🎮',
    },
  ],
  'Board games': [
    {
      name: 'BoardGameGeek',
      url: 'https://boardgamegeek.com',
      description: 'The definitive board game database',
      type: 'curated',
      icon: '🎲',
    },
  ],
  'Tabletop RPGs': [
    {
      name: 'D&D Beyond',
      url: 'https://www.dndbeyond.com',
      description: 'Official D&D character builder and tools',
      type: 'curated',
      icon: '🐉',
    },
    {
      name: 'Roll20',
      url: 'https://roll20.net',
      description: 'Virtual tabletop for online play',
      type: 'curated',
      icon: '🎭',
    },
  ],

  // Outdoor
  Gardening: [
    {
      name: 'Planta',
      url: 'https://getplanta.com',
      description: 'Plant care reminders and identification',
      type: 'curated',
      icon: '🌱',
    },
  ],
  'Bird watching': [
    {
      name: 'Merlin Bird ID',
      url: 'https://merlin.allaboutbirds.org',
      description: 'Identify birds by sight or sound',
      type: 'curated',
      icon: '🐦',
    },
    {
      name: 'eBird',
      url: 'https://ebird.org',
      description: 'Log sightings and explore bird data',
      type: 'curated',
      icon: '🦅',
    },
  ],
  Hiking: [
    {
      name: 'AllTrails',
      url: 'https://www.alltrails.com',
      description: 'Find and review hiking trails',
      type: 'curated',
      icon: '🥾',
    },
    {
      name: 'Komoot',
      url: 'https://www.komoot.com',
      description: 'Route planning and outdoor navigation',
      type: 'curated',
      icon: '🗺️',
    },
  ],
  Camping: [
    {
      name: 'Hipcamp',
      url: 'https://www.hipcamp.com',
      description: 'Find unique campsites and glamping',
      type: 'curated',
      icon: '⛺',
    },
  ],
  Fishing: [
    {
      name: 'Fishbrain',
      url: 'https://fishbrain.com',
      description: 'Fishing forecasts and catch logging',
      type: 'curated',
      icon: '🎣',
    },
  ],

  // Culinary
  Cooking: [
    {
      name: 'Paprika',
      url: 'https://www.paprikaapp.com',
      description: 'Recipe manager and meal planner',
      type: 'curated',
      icon: '🍳',
    },
    {
      name: 'Serious Eats',
      url: 'https://www.seriouseats.com',
      description: 'Science-driven recipes and techniques',
      type: 'curated',
      icon: '👨‍🍳',
    },
  ],
  Baking: [
    {
      name: 'King Arthur Baking',
      url: 'https://www.kingarthurbaking.com',
      description: 'Recipes, guides, and baking community',
      type: 'curated',
      icon: '🍞',
    },
  ],
  'Coffee brewing': [
    {
      name: 'James Hoffmann',
      url: 'https://www.youtube.com/@jameshoffmann',
      description: 'Expert coffee guides and reviews',
      type: 'curated',
      icon: '☕',
    },
  ],

  // Making
  Woodworking: [
    {
      name: 'Wood Magazine',
      url: 'https://www.woodmagazine.com',
      description: 'Plans, tips, and woodworking projects',
      type: 'curated',
      icon: '🪵',
    },
  ],
  '3D printing': [
    {
      name: 'Thingiverse',
      url: 'https://www.thingiverse.com',
      description: 'Free 3D printable models',
      type: 'curated',
      icon: '🖨️',
    },
    {
      name: 'Printables',
      url: 'https://www.printables.com',
      description: 'Community-driven 3D model library',
      type: 'curated',
      icon: '🔩',
    },
  ],
  'LEGO building': [
    {
      name: 'BrickLink',
      url: 'https://www.bricklink.com',
      description: 'Buy, sell, and catalog LEGO sets',
      type: 'curated',
      icon: '🧱',
    },
    {
      name: 'Rebrickable',
      url: 'https://rebrickable.com',
      description: 'Find alternate builds from your sets',
      type: 'curated',
      icon: '🏗️',
    },
  ],

  // Collecting
  'Vinyl records': [
    {
      name: 'Discogs',
      url: 'https://www.discogs.com',
      description: 'Music database and vinyl marketplace',
      type: 'curated',
      icon: '💿',
    },
  ],

  // Social
  Volunteering: [
    {
      name: 'VolunteerMatch',
      url: 'https://www.volunteermatch.org',
      description: 'Find volunteer opportunities near you',
      type: 'curated',
      icon: '🤝',
    },
  ],
};

export function getResourcesForHobby(hobby: string): HobbyResource[] {
  return (
    HOBBY_RESOURCES[hobby] ?? HOBBY_RESOURCES[hobby.charAt(0).toUpperCase() + hobby.slice(1)] ?? []
  );
}
