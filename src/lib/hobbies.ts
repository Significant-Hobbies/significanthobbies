export type HobbyCategory = {
  name: string;
  emoji: string;
  hobbies: string[];
};

export const HOBBY_CATEGORIES: HobbyCategory[] = [
  {
    name: "Creative",
    emoji: "🎨",
    hobbies: [
      "Drawing", "Painting", "Photography", "Writing", "Sculpting",
      "Ceramics", "Knitting", "Crochet", "Embroidery", "Sewing", "Origami", "Calligraphy",
      "Graphic design", "Music production", "Songwriting", "Poetry", "Filmmaking", "Cosplay",
    ],
  },
  {
    name: "Music",
    emoji: "🎵",
    hobbies: [
      "Guitar", "Piano", "Drums", "Violin", "Bass", "Singing",
      "DJing", "Ukulele", "Saxophone", "Flute", "Music theory",
    ],
  },
  {
    name: "Physical",
    emoji: "💪",
    hobbies: [
      "Running", "Cycling", "Swimming", "Hiking", "Climbing", "Yoga",
      "Gym", "Martial arts", "Dance", "Basketball", "Football", "Tennis",
      "Skiing", "Skateboarding", "Surfing", "Rowing", "Badminton",
      "Scuba diving", "Fencing", "Pickleball",
    ],
  },
  {
    name: "Intellectual",
    emoji: "📚",
    hobbies: [
      "Reading", "Chess", "Coding", "Language learning", "Puzzles",
      "Philosophy", "History", "Astronomy", "Mathematics", "Science",
    ],
  },
  {
    name: "Gaming",
    emoji: "🎮",
    hobbies: [
      "Video games", "Board games", "Tabletop RPGs", "Speedrunning",
      "Esports", "Card games", "Dungeon Master",
    ],
  },
  {
    name: "Outdoor",
    emoji: "🌿",
    hobbies: [
      "Gardening", "Bird watching", "Camping", "Fishing", "Foraging",
      "Stargazing", "Rock collecting", "Beekeeping", "Geocaching", "Mushroom hunting",
    ],
  },
  {
    name: "Culinary",
    emoji: "🍳",
    hobbies: [
      "Cooking", "Baking", "Coffee brewing", "Wine tasting",
      "Cocktail making", "Fermentation", "BBQ", "Food photography",
    ],
  },
  {
    name: "Collecting",
    emoji: "🗂️",
    hobbies: [
      "Vinyl records", "Books", "Stamps", "Coins", "Art",
      "Sneakers", "Vintage clothing", "Watches",
    ],
  },
  {
    name: "Making",
    emoji: "🔧",
    hobbies: [
      "Woodworking", "3D printing", "Electronics", "Leatherworking",
      "Blacksmithing", "Candle making", "Soap making", "Jewelry making", "LEGO building",
    ],
  },
  {
    name: "Social",
    emoji: "🤝",
    hobbies: [
      "Volunteering", "Hosting dinners", "Book club", "Improv comedy",
      "Theater", "Debate club", "Travel",
    ],
  },
];

export const ALL_HOBBIES = HOBBY_CATEGORIES.flatMap((c) => c.hobbies);

export function getCategoryForHobby(hobby: string): HobbyCategory | undefined {
  const lower = hobby.toLowerCase();
  return HOBBY_CATEGORIES.find((c) =>
    c.hobbies.some((h) => h.toLowerCase() === lower),
  );
}

export function getSuggestedHobbies(
  existingHobbies: string[],
  limit = 6,
): string[] {
  const existing = new Set(existingHobbies.map((h) => h.toLowerCase()));

  // Find categories the user is already in
  const userCategories = new Set(
    existingHobbies
      .map((h) => getCategoryForHobby(h)?.name)
      .filter(Boolean) as string[],
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
