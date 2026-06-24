import { getCategoryForHobby, type HobbyCategory } from './hobbies';

export type RoadmapStep = {
  id: 'today' | 'week' | 'month' | 'quarter';
  horizon: string;
  goal: string;
  action: string;
};

export type HobbyRoadmap = {
  hobby: string;
  category: HobbyCategory | undefined;
  steps: RoadmapStep[];
};

// Hand-tuned roadmaps for the highest-traffic hobbies. Anything not listed
// falls back to a category-based template so every hobby still gets a path.
const HOBBY_ROADMAP_OVERRIDES: Record<string, Omit<RoadmapStep, 'id' | 'horizon'>[]> = {
  Drawing: [
    {
      goal: 'Draw one thing today',
      action:
        'Pick a mug, plant, or hand. Spend 10 minutes drawing it with whatever pen is near you.',
    },
    {
      goal: 'Build a 5-day streak',
      action: 'Do a 15-min daily sketch — same object each day. Compare day 1 and day 5.',
    },
    {
      goal: 'Finish a 30-page sketchbook',
      action:
        'Work through Drawabox Lesson 1 (boxes, lines, ellipses). Post one drawing for feedback.',
    },
    {
      goal: 'Draw from observation confidently',
      action: "Attend a local figure-drawing session or join r/learnart's weekly critique thread.",
    },
  ],
  Guitar: [
    {
      goal: 'Learn to play one full song',
      action:
        "Pick a 3-chord song (Knockin' on Heaven's Door works). Watch a 10-min Justin Guitar lesson.",
    },
    {
      goal: 'Master 5 open chords cleanly',
      action: 'Practice 15 min/day: G, C, D, Em, Am with smooth transitions. Use a metronome.',
    },
    {
      goal: 'Play 3 songs end-to-end',
      action:
        'Pick songs that share chord shapes. Record yourself on day 30 to hear the gap close.',
    },
    {
      goal: 'Play with another human',
      action:
        'Join a beginner jam night, swap with a friend who plays, or post a cover to r/guitar.',
    },
  ],
  Piano: [
    {
      goal: 'Find Middle C and play a scale',
      action: 'Spend 15 min on Synthesia or any piano app. No theory yet — just feel the keys.',
    },
    {
      goal: 'Play a simple melody hands-separately',
      action: "Learn 'Ode to Joy' or 'Twinkle Twinkle'. 20 min/day for a week.",
    },
    {
      goal: 'Coordinate both hands on one piece',
      action: "Pick a beginner piece (Pianote's first track). Practice slowly with a metronome.",
    },
    {
      goal: 'Sight-read at beginner level',
      action: "Work through the first 30 pages of Alfred's Adult Piano Book 1.",
    },
  ],
  Running: [
    {
      goal: 'Run for 1 minute, walk for 1 minute, ×8',
      action: "Lace up. Don't optimize — just get out the door and breathe through your nose.",
    },
    {
      goal: 'Complete Week 1 of Couch to 5K',
      action: "Three runs this week. Log them in Strava or a notes app — pace doesn't matter.",
    },
    {
      goal: 'Run 5K without stopping',
      action: 'Follow the full C25K plan. Add one rest-day mobility session for knees.',
    },
    {
      goal: 'Sign up for a local 5K race',
      action: 'Find one within 60 days on RunSignUp. The deadline beats motivation every time.',
    },
  ],
  Cycling: [
    {
      goal: 'Ride for 20 minutes',
      action: 'Pump the tires, check brakes, pick a flat loop near home. No Strava, no plan.',
    },
    {
      goal: 'Complete a 10-mile ride',
      action: 'Use Komoot to plan a low-traffic route. Bring water and a snack.',
    },
    {
      goal: 'Finish a 25-mile weekend ride',
      action: 'Build up to it: ride twice during the week, longer ride on Saturday.',
    },
    {
      goal: 'Join a group ride or do a metric century (62mi)',
      action: "Find a local club on Meetup or your local bike shop's board.",
    },
  ],
  Yoga: [
    {
      goal: 'Do a 10-minute morning flow',
      action: "Open Yoga With Adriene's 'Yoga For Complete Beginners'. Mat optional.",
    },
    {
      goal: 'Practice 4× this week',
      action: 'Pick 20-min videos. Same time of day if possible — the habit beats the duration.',
    },
    {
      goal: 'Hold a stable downward dog for 5 breaths',
      action: "Try Adriene's 30-day series. Take rest days when it stops feeling good.",
    },
    {
      goal: 'Try a live class in a studio or park',
      action:
        "Look for community/donation-based classes near you. Different teachers unlock things at-home can't.",
    },
  ],
  Chess: [
    {
      goal: 'Play 3 games online',
      action:
        "Create a free Chess.com or Lichess account. Play 10-min rapid games — don't worry about losing.",
    },
    {
      goal: 'Learn 2 openings as White and 1 as Black',
      action: 'Pick London System (white) + Caro-Kann (black). Watch one 10-min video on each.',
    },
    {
      goal: 'Solve 50 tactics puzzles',
      action: "Use Lichess's puzzle trainer 10 min/day. This drives the biggest early rating jump.",
    },
    {
      goal: 'Reach 1000 rapid rating',
      action: 'Review one of your losses per week with the free Chess.com analysis tool.',
    },
  ],
  Coding: [
    {
      goal: 'Write and run a 5-line program',
      action:
        "Install Python (or open replit.com). Print 'hello' and a fibonacci number. That's it.",
    },
    {
      goal: "Build a tiny CLI tool you'd actually use",
      action: 'Pick one annoying task (rename files, fetch weather). Ship it in a weekend.',
    },
    {
      goal: 'Ship something with a UI',
      action:
        'Build a todo app or personal site. Deploy it to Vercel or GitHub Pages so others can see it.',
    },
    {
      goal: 'Contribute to an open-source project',
      action:
        "Find a 'good first issue' on GitHub. Tiny doc fixes count — the goal is the PR loop.",
    },
  ],
  Reading: [
    {
      goal: 'Read for 20 minutes today',
      action: "Pick the book you've been meaning to read. Phone in another room.",
    },
    {
      goal: 'Finish one book this week',
      action: 'Aim for 30 pages/day. Log it on Goodreads or StoryGraph to feel the momentum.',
    },
    {
      goal: 'Read 4 books this month across 2 genres',
      action: 'Mix fiction with non-fiction. Note one sentence per book about what stuck.',
    },
    {
      goal: 'Join or start a book club',
      action:
        'Local library, Discord, or three friends on a group chat. Discussion changes what you notice.',
    },
  ],
  Photography: [
    {
      goal: 'Take 36 photos on a 30-min walk',
      action: 'One theme: reflections, shadows, or doorways. Keep only the 6 best and write why.',
    },
    {
      goal: 'Shoot in manual mode for one full session',
      action:
        'Watch a 15-min YouTube primer on aperture and shutter speed. Practice on a static subject.',
    },
    {
      goal: 'Publish a 10-photo mini-series',
      action:
        'Pick a theme (your neighborhood, hands at work, golden hour). Post it on Unsplash or Instagram.',
    },
    {
      goal: 'Print and hang one of your photos',
      action:
        'A real print on a wall changes how you see your own work. Local print shops do 8x10s cheaply.',
    },
  ],
  Cooking: [
    {
      goal: 'Cook one new recipe tonight',
      action:
        'Pick something with 5 ingredients or fewer. Pasta aglio e olio is the canonical answer.',
    },
    {
      goal: 'Master one technique this week',
      action: "Searing, rice, eggs, vinaigrette — pick one. Repeat it 3× until it's reflex.",
    },
    {
      goal: 'Host a 3-course dinner for friends',
      action: "Plan a menu where 2 dishes are make-ahead. Don't try a new recipe day-of.",
    },
    {
      goal: 'Cook from a single cuisine for a month',
      action:
        'Italian, Thai, Mexican — pick one. Buy one pantry-staples kit and explore depth, not breadth.',
    },
  ],
  Writing: [
    {
      goal: 'Write 200 words today',
      action: 'Open a blank doc. Set a 15-min timer. Stop editing — just get words out.',
    },
    {
      goal: 'Write daily for 7 days',
      action:
        'Same time, same place. Quantity beats quality at this stage — aim for 300 words/day.',
    },
    {
      goal: 'Finish a complete short piece',
      action:
        'A 1500-word essay or a 5-page short story. Beginning, middle, end. Share it with one person.',
    },
    {
      goal: 'Publish something in public',
      action:
        'Substack, Medium, or your own site. Public commitment is the unlock for serious writing.',
    },
  ],
  Gardening: [
    {
      goal: 'Plant one herb in a pot today',
      action: 'Grab basil or mint from the grocery store. Sunny window, water when topsoil is dry.',
    },
    {
      goal: 'Keep 3 plants alive for 2 weeks',
      action:
        'Add 2 more low-maintenance plants (pothos, snake plant). Set a 2× weekly water reminder.',
    },
    {
      goal: 'Grow something edible from seed',
      action:
        'Lettuce or radishes are forgiving. Track in a notebook: when planted, first sprout, first leaves.',
    },
    {
      goal: 'Build a small raised bed or balcony garden',
      action:
        "4×4 ft is plenty. Pick 3 things you'll actually eat. Visit a local nursery for region-specific advice.",
    },
  ],
  'Language learning': [
    {
      goal: 'Learn 10 words today',
      action: 'Install Duolingo or Anki. 15 min — the goal is to start, not to be perfect.',
    },
    {
      goal: 'Hit a 14-day Duolingo streak',
      action: '5–10 min/day. Pair it with a daily anchor (morning coffee, commute).',
    },
    {
      goal: 'Hold a 5-minute conversation',
      action: 'Book one iTalki tutor session ($10). The fear of speaking is the actual lesson.',
    },
    {
      goal: 'Watch a show in the target language',
      action: "Pick something with subtitles. Don't translate everything — let context teach you.",
    },
  ],
};

const CATEGORY_TEMPLATES: Record<string, Omit<RoadmapStep, 'id' | 'horizon'>[]> = {
  Creative: [
    {
      goal: 'Make one tiny thing',
      action:
        "Spend 20 minutes today producing something — finished or not. The bar is just 'made'.",
    },
    {
      goal: 'Show up 4× this week',
      action: 'Same time slot, even if short. Consistency beats motivation early on.',
    },
    {
      goal: 'Complete one polished piece',
      action:
        'Pick a small scope you can finish. Share it with one person whose taste you respect.',
    },
    {
      goal: 'Get outside feedback',
      action:
        'Post in a subreddit, Discord, or local meetup for your craft. The feedback loop is the unlock.',
    },
  ],
  Music: [
    {
      goal: 'Spend 15 minutes with the instrument',
      action: 'No app, no tutorial — just make sound. Get used to holding it.',
    },
    {
      goal: 'Learn one beginner exercise or song',
      action:
        'Pick the easiest possible thing. Justin Guitar / Pianote / YouTube all have free starters.',
    },
    {
      goal: 'Practice 4× this week, 20 min each',
      action: "Track sessions in a notes app. Same chord/scale until it's automatic.",
    },
    {
      goal: 'Play for one other person',
      action: 'A roommate, a friend, a recording online — the audience changes how you practice.',
    },
  ],
  Physical: [
    {
      goal: 'Do one short session today',
      action: '10–20 minutes. The bar is showing up — intensity comes later.',
    },
    {
      goal: 'Hit 3 sessions this week',
      action: 'Block calendar time. Lay out gear the night before to remove friction.',
    },
    {
      goal: 'Set a measurable target and meet it',
      action:
        'Pick something concrete (distance, reps, time). Track in a notes app or app like Strava.',
    },
    {
      goal: 'Sign up for a local event or class',
      action: 'A race, a class series, a league. External deadlines are the strongest motivator.',
    },
  ],
  Intellectual: [
    {
      goal: 'Spend 20 focused minutes today',
      action: 'Phone in another room. The block is more important than the topic.',
    },
    {
      goal: 'Build a daily 20-min habit',
      action: 'Pair it with an existing routine — morning coffee, after dinner. Same time wins.',
    },
    {
      goal: 'Finish one substantial piece of work',
      action: 'A book, a course, a project. Pick something with a clear end state.',
    },
    {
      goal: 'Find a community or partner',
      action:
        'Discord, subreddit, study group. Discussion deepens understanding faster than reading alone.',
    },
  ],
  Gaming: [
    {
      goal: 'Play one full session',
      action: 'Pick the game, block 60–90 min, no distractions. Notice what hooks you.',
    },
    {
      goal: 'Learn the deep mechanics',
      action:
        'Watch one tutorial or read the strategy wiki. Casual play stops compounding without it.',
    },
    {
      goal: 'Beat or complete something hard',
      action: 'A boss, a campaign, a ladder rank. Pick a concrete win and chase it.',
    },
    {
      goal: 'Join a community',
      action:
        'Discord, subreddit, or a local game night. Other players unlock new ways to enjoy it.',
    },
  ],
  Outdoor: [
    {
      goal: 'Spend 30 minutes outside today',
      action: 'Walk the location, observe, take notes. No gear needed yet.',
    },
    {
      goal: 'Go out 3× this week with intent',
      action:
        'Bring whatever the bare minimum gear is. Same spot is fine — repeat exposure teaches you.',
    },
    {
      goal: 'Plan a longer trip or session',
      action: 'Half-day or full-day. Use AllTrails / Komoot / local guides to find a good spot.',
    },
    {
      goal: 'Join a local group or guide',
      action:
        'Audubon chapter, hiking club, fishing guide. Locals shortcut years of trial and error.',
    },
  ],
  Culinary: [
    {
      goal: 'Make one new thing tonight',
      action:
        'Keep it simple — 5 ingredients or fewer. NYT Cooking and Serious Eats have great starter recipes.',
    },
    {
      goal: 'Cook 3 times at home this week',
      action: 'Pick recipes that share ingredients. Shop once, cook through the week.',
    },
    {
      goal: 'Master one core technique',
      action:
        'Pick searing, eggs, knife skills, or sauce-making. Repeat until you stop reading the recipe.',
    },
    {
      goal: 'Cook for others',
      action:
        "Invite 2–4 people. Forces planning, timing, and presentation in a way solo cooking doesn't.",
    },
  ],
  Collecting: [
    {
      goal: 'Acquire your first piece thoughtfully',
      action: "Don't bulk-buy. Pick one thing you actually love and learn its story.",
    },
    {
      goal: 'Research the field for an hour',
      action: 'Find the 2–3 best subreddits, YouTube channels, or forums. Bookmark them.',
    },
    {
      goal: 'Build a small focused collection (5–10 items)',
      action: 'Pick a theme — era, artist, region. Constraints make a collection meaningful.',
    },
    {
      goal: 'Visit a show, store, or meetup in person',
      action: "Online is efficient; in-person is where you actually learn what's good.",
    },
  ],
  Making: [
    {
      goal: 'Build the smallest possible thing',
      action: 'A keychain, a coaster, a print. The point is finishing — finished beats ambitious.',
    },
    {
      goal: 'Buy or borrow the minimum viable tools',
      action:
        "Don't over-equip early. Look for used tools on Facebook Marketplace or local maker spaces.",
    },
    {
      goal: 'Complete a real project',
      action: 'Something a friend would actually want. Plan, build, iterate. Document with photos.',
    },
    {
      goal: 'Join a makerspace or trade tips',
      action:
        "Local makerspace, subreddit, or Discord. Other makers unlock techniques you'd never find solo.",
    },
  ],
  Social: [
    {
      goal: 'Show up to one thing this week',
      action: "Even if you don't know anyone. Showing up is 80% — the rest follows.",
    },
    {
      goal: 'Attend 3 events in a month',
      action:
        'Same community ideally — recurring faces turn strangers into acquaintances faster than variety.',
    },
    {
      goal: 'Take on a small role',
      action:
        'Volunteer to help set up, bring snacks, lead a small piece. Roles accelerate belonging.',
    },
    {
      goal: 'Host or organize something yourself',
      action: "A dinner, a discussion, a small event. You're now contributing, not just attending.",
    },
  ],
};

const DEFAULT_TEMPLATE: Omit<RoadmapStep, 'id' | 'horizon'>[] = [
  {
    goal: 'Try it for 20 minutes today',
    action: 'The smallest possible session. Notice what felt easy and what felt hard.',
  },
  {
    goal: 'Build a 3-session week',
    action: 'Block the time. Track sessions in a notes app to feel the momentum.',
  },
  {
    goal: 'Complete one tangible milestone',
    action: 'A finished piece, a measured improvement, a public share. Pick something concrete.',
  },
  {
    goal: 'Connect with others doing it',
    action: 'Online community, local meetup, or one friend. Solo learning has a ceiling.',
  },
];

const HORIZONS = ['Today', 'This week', 'This month', '3 months'] as const;
const STEP_IDS: RoadmapStep['id'][] = ['today', 'week', 'month', 'quarter'];

export function getRoadmapForHobby(hobbyName: string): HobbyRoadmap {
  const category = getCategoryForHobby(hobbyName);
  const overrides = HOBBY_ROADMAP_OVERRIDES[hobbyName];
  const template =
    overrides ?? (category ? CATEGORY_TEMPLATES[category.name] : undefined) ?? DEFAULT_TEMPLATE;

  const steps: RoadmapStep[] = template.map((step, i) => ({
    id: STEP_IDS[i],
    horizon: HORIZONS[i],
    goal: step.goal,
    action: step.action,
  }));

  return { hobby: hobbyName, category, steps };
}
