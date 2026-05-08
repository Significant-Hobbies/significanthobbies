export type StarterKit = {
  slug: string;
  title: string;
  category: string;
  fit: string;
  budget: string;
  timeToFirstWin: string;
  localSources: string[];
  supplies: string[];
  firstExperiment: string;
  successSignal: string;
  upgradePath: string;
  relatedHobbies: string[];
};

export const STARTER_KITS: StarterKit[] = [
  {
    slug: "phone-photography-walk",
    title: "Phone photography walk",
    category: "Creative",
    fit: "For people who want a creative hobby without buying gear first.",
    budget: "$0-$15",
    timeToFirstWin: "45 minutes",
    localSources: ["Your phone", "A nearby street, park, or market", "Public library photo books"],
    supplies: [
      "Phone with available storage",
      "Comfortable shoes",
      "One simple theme, such as reflections, doors, or shadows",
    ],
    firstExperiment:
      "Take 36 photos on a short walk, then keep only 6. Write one sentence about why each keeper worked.",
    successSignal:
      "You notice yourself looking for light, angles, and details after the walk is over.",
    upgradePath:
      "Borrow a camera, print a small set locally, or try a weekend golden-hour route.",
    relatedHobbies: ["Photography", "Drawing", "Writing"],
  },
  {
    slug: "windowsill-herb-lab",
    title: "Windowsill herb lab",
    category: "Outdoor",
    fit: "For apartment dwellers who want a living project with daily feedback.",
    budget: "$10-$30",
    timeToFirstWin: "20 minutes setup, 2 weeks to harvest",
    localSources: ["Grocery store herb pots", "Garden center", "Reused jars or mugs"],
    supplies: [
      "One basil, mint, or chive plant",
      "Small pot with drainage",
      "Sunny windowsill",
      "Notebook or notes app",
    ],
    firstExperiment:
      "Track water, sunlight, and growth for 14 days. Use one cutting in a meal before buying anything else.",
    successSignal:
      "You remember to check the plant because the result is useful, not because an app reminds you.",
    upgradePath:
      "Add one contrasting plant, start seeds, or join a local plant swap.",
    relatedHobbies: ["Gardening", "Cooking", "Food photography"],
  },
  {
    slug: "five-dollar-sketchbook",
    title: "Five-dollar sketchbook",
    category: "Creative",
    fit: "For perfectionists who need a low-stakes way to make visible progress.",
    budget: "$5-$12",
    timeToFirstWin: "25 minutes",
    localSources: ["Dollar store", "Office supply aisle", "Coffee shop table"],
    supplies: [
      "Cheap sketchbook",
      "Black pen",
      "Timer",
      "Three everyday objects",
    ],
    firstExperiment:
      "Draw the same object three times: 2 minutes, 8 minutes, then 15 minutes. Label what improved.",
    successSignal:
      "The third drawing is not perfect, but it clearly shows better observation.",
    upgradePath:
      "Try a local figure drawing night, a library art book, or a basic pencil set.",
    relatedHobbies: ["Drawing", "Calligraphy", "Painting"],
  },
  {
    slug: "neighborhood-running-loop",
    title: "Neighborhood running loop",
    category: "Physical",
    fit: "For busy people who need a hobby that starts at the front door.",
    budget: "$0-$20",
    timeToFirstWin: "30 minutes",
    localSources: ["Side streets", "School track", "Public park paths"],
    supplies: [
      "Comfortable shoes",
      "Water",
      "Simple route under two miles",
      "Stopwatch or phone timer",
    ],
    firstExperiment:
      "Alternate 60 seconds jogging and 90 seconds walking for 20 minutes. Repeat twice this week.",
    successSignal:
      "You finish wanting the next run to be slightly smoother, not dramatically harder.",
    upgradePath:
      "Map a 5K route, visit a local running store, or join a beginner group run.",
    relatedHobbies: ["Running", "Cycling", "Hiking"],
  },
  {
    slug: "library-chess-sprint",
    title: "Library chess sprint",
    category: "Intellectual",
    fit: "For people who want a strategic hobby with free practice partners.",
    budget: "$0-$10",
    timeToFirstWin: "60 minutes",
    localSources: ["Public library", "Community center", "Used bookstore"],
    supplies: [
      "Chess board or free app",
      "One beginner puzzle set",
      "Score sheet or notebook",
    ],
    firstExperiment:
      "Solve 10 mate-in-one puzzles, play one slow game, then write down the first mistake you noticed.",
    successSignal:
      "You can name one tactic or pattern you missed before the session.",
    upgradePath:
      "Attend a local club night, study basic endgames, or play one weekly rated game.",
    relatedHobbies: ["Chess", "Puzzles", "Reading"],
  },
  {
    slug: "weekend-soup-project",
    title: "Weekend soup project",
    category: "Culinary",
    fit: "For anyone who wants cooking practice that pays off for several meals.",
    budget: "$12-$25",
    timeToFirstWin: "90 minutes",
    localSources: ["Grocery store", "Farmers market", "Borrowed stock pot"],
    supplies: [
      "One base recipe",
      "Onion, carrot, and celery",
      "Protein or beans",
      "Storage containers",
    ],
    firstExperiment:
      "Cook one simple soup, split it into three portions, and adjust seasoning on each serving.",
    successSignal:
      "The second bowl tastes better because you changed salt, acid, spice, or texture intentionally.",
    upgradePath:
      "Make stock, visit a spice shop, or host a low-pressure soup night.",
    relatedHobbies: ["Cooking", "Fermentation", "Hosting dinners"],
  },
];

export const STARTER_KIT_CATEGORIES = [
  ...new Set(STARTER_KITS.map((kit) => kit.category)),
];
