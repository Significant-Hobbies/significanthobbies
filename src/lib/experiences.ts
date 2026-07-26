/**
 * The canonical corpus of experiences — the "what is possible" list.
 *
 * All 325 items here used to live as consts inside four page components
 * (`/bucket-list-ideas`, `/bucket-list-before-30`, `/bucket-list-before-50`,
 * `/travel-bucket-list`), which meant no other code could reach any of them.
 * Every consumer that needed experiences kept its own copy: the live
 * suggestion engine in `bucket-list-insights.ts` carried a private 52-item
 * pool that was a near-duplicate of the ideas list, so users were offered a
 * sixth of the material the product already owned.
 *
 * Three shapes, deliberately kept distinct rather than flattened into one
 * lowest-common-denominator record:
 *
 * - `EXPERIENCES_BY_CATEGORY` — 150 ideas, grouped the way the page shows them
 * - `MILESTONES` — 100 life-stage items carrying a horizon and a description
 * - `DESTINATIONS` — 75 places carrying a reason and, for three of them, a
 *   cross-reference into `famous-bucket-lists.ts`
 *
 * `ALL_EXPERIENCES` is the deduplicated union for anything that just wants
 * "things a person could do". The pages now render from here rather than
 * owning the data.
 */

import type { BucketItemCategory } from '~/lib/famous-bucket-lists';

/**
 * Deliberately an alias, not a parallel union. The same six categories already
 * classify famous bucket-list items, and two hand-maintained copies of one
 * concept is how they drift apart.
 */
export type ExperienceCategory = BucketItemCategory;

export type ExperienceGroup = {
  emoji: string;
  label: string;
  color: string;
  ideas: string[];
};

export const EXPERIENCES_BY_CATEGORY: Record<ExperienceCategory, ExperienceGroup> = {
  travel: {
    emoji: '✈️',
    label: 'Travel',
    color: 'sky',
    ideas: [
      'See the Northern Lights in Iceland or Norway',
      'Walk the Camino de Santiago (800km across Spain)',
      'Safari in the Serengeti at sunrise',
      'Visit all seven wonders of the world',
      'See the cherry blossoms in Kyoto, Japan',
      'Drive Route 66 end to end across America',
      'Spend a week in Antarctica',
      'Swim in the Dead Sea',
      'Watch the sunrise from Machu Picchu, Peru',
      'Take the Trans-Siberian Railway across Russia',
      'Sail the Greek Islands for a week',
      'See the Great Barrier Reef',
      'Visit the Taj Mahal at dawn',
      'Explore the Amazon rainforest',
      'See the midnight sun in Scandinavia',
      'Visit every continent',
      'Road trip across New Zealand',
      'See the Pyramids of Giza',
      'Trek to Everest Base Camp',
      'Visit the temples of Angkor Wat, Cambodia',
      'Ride the Orient Express',
      'Visit all 50 US states',
      'See the tulip fields in the Netherlands',
      'Hike through Patagonia',
      'Experience Carnival in Rio de Janeiro',
    ],
  },
  adventure: {
    emoji: '⛰️',
    label: 'Adventure',
    color: 'orange',
    ideas: [
      'Skydive from 15,000 feet',
      'Bungee jump off a bridge',
      'Climb a mountain over 4,000 metres',
      'Surf a wave over 10 feet',
      'Swim with humpback whales',
      'Run with the bulls in Pamplona',
      'White water raft a Class V river',
      'Hike the Appalachian Trail end to end',
      'Dive the Blue Hole in Belize',
      'Sleep under the stars in the Sahara',
      'Paraglide over the Swiss Alps',
      'Cage dive with great white sharks',
      'Climb El Capitan in Yosemite',
      'Ride a motorcycle across a country',
      'Complete an Ironman triathlon',
      'Hike the Pacific Crest Trail',
      'Go on a polar expedition',
      'Zipline through a rainforest canopy',
      'Learn to free solo climb',
      'Do a polar bear plunge',
      'Drive a racecar at full speed',
      'Go canyoneering',
      'Trek across Iceland',
      'Kayak the Grand Canyon',
      'Dog sled in Alaska',
    ],
  },
  creative: {
    emoji: '🎨',
    label: 'Creative',
    color: 'purple',
    ideas: [
      'Write and finish a novel',
      'Learn to play a musical instrument',
      "Paint something you're proud to hang on a wall",
      'Learn to cook 10 world cuisines from scratch',
      'Record a song and release it',
      'Perform on a stage in front of a crowd',
      'Learn a new language to conversational fluency',
      'Design and build something with your hands',
      'Take a photograph that stops people in their tracks',
      'Write your memoir',
      'Learn calligraphy',
      'Create a short film',
      'Take a pottery class and make a finished piece',
      'Learn watercolour painting',
      'Design and make your own clothes',
      'Build a piece of furniture from scratch',
      'Start a podcast',
      'Perform stand-up comedy',
      'Choreograph and perform a dance',
      'Compose an original piece of music',
      "Illustrate a children's book",
      'Throw a kiln-fired ceramic pot',
      'Learn to draw portraits',
      'Write and perform spoken word poetry',
      'Publish an article in a magazine',
    ],
  },
  achievement: {
    emoji: '🏆',
    label: 'Achievement',
    color: 'coral',
    ideas: [
      'Run a marathon',
      'Learn to fly a plane',
      'Start and grow a business',
      'Earn a black belt in a martial art',
      'Become fluent in a second language',
      'Complete a triathlon',
      'Read 52 books in a year',
      'Become completely debt-free',
      'Meditate every day for 365 days',
      'Learn to code and ship an app',
      'Climb the corporate ladder to a role you dreamed of',
      'Compete in a national championship',
      'Earn a postgraduate degree',
      'Break a personal athletic record',
      'Master a complex card trick',
      'Memorise a long poem or speech',
      'Build an investment portfolio',
      'Complete a Tough Mudder',
      'Do 100 push-ups in a row',
      'Become a certified scuba diver',
      "Get a pilot's licence",
      'Compete in an obstacle course race',
      "Solve a Rubik's cube in under a minute",
      'Complete a 100-mile ultramarathon',
      'Qualify for the Boston Marathon',
    ],
  },
  social: {
    emoji: '❤️',
    label: 'Social',
    color: 'rose',
    ideas: [
      'Volunteer abroad for at least a month',
      "Reconnect with someone you've lost touch with",
      'Host a dinner party for 20+ people',
      'Make a close friend in another country',
      'Mentor someone just starting out in your field',
      'Attend a world-class sporting event live',
      'Tell the most important people in your life why they matter',
      'Throw a surprise party that genuinely surprises someone',
      'Join a community choir or theatre group',
      'Take a road trip with your best friends',
      'Write heartfelt letters to 10 people who changed your life',
      'Spend a week with your grandparents or elders',
      'Host a family reunion',
      "Learn someone's language to have a conversation with them",
      'Attend a multi-day music festival',
      'Do a group charity challenge with friends',
      'Create a family cookbook with old recipes',
      'Organise a neighbourhood event',
      'Get married or celebrate a long-term partnership',
      'Spend a month living with a foreign family',
      "Teach a skill you're good at to a group of strangers",
      'Have a meaningful conversation with a complete stranger every week for a year',
      'Co-write something with a friend',
      'Show up for someone in a crisis without being asked',
      "Celebrate someone else's milestone as if it were your own",
    ],
  },
  humanitarian: {
    emoji: '🌍',
    label: 'Humanitarian',
    color: 'emerald',
    ideas: [
      'Plant 1,000 trees',
      "Fund a child's education for a year",
      'Build something that outlasts you',
      'Raise money for a cause you deeply believe in',
      'Donate anonymously and tell no one',
      'Start a scholarship fund',
      'Build a school or library in an underserved community',
      'Volunteer at a hospital for a year',
      'Teach English in a developing country',
      'Adopt or foster a child',
      'Donate a kidney or be a living donor',
      'Leave a legacy gift to a charity in your will',
      'Start a foundation',
      'Clean up a beach or river in your community',
      'Create a free resource that helps thousands of people',
      'Advocate for a policy change you believe in',
      'Feed a hundred families',
      'Sponsor a refugee family',
      'Run for local office',
      'Start a community garden',
      "Write a book that changes someone's life",
      'Give blood 50 times in your life',
      'Reduce your carbon footprint to near zero',
      'Build homes with Habitat for Humanity',
      'Leave a place cleaner and more hopeful than you found it',
    ],
  },
};

export const EXPERIENCE_CATEGORIES = Object.keys(EXPERIENCES_BY_CATEGORY) as ExperienceCategory[];

export type Experience = {
  title: string;
  category: ExperienceCategory;
  emoji: string;
};

// ─── Milestones ──────────────────────────────────────────────────────────────

export type MilestoneHorizon = 'before-30' | 'before-50';

export type Milestone = {
  title: string;
  description: string;
  emoji: string;
  category: ExperienceCategory;
  horizon: MilestoneHorizon;
};

/**
 * The life-stage lists, previously hardcoded in `/bucket-list-before-30` and
 * `/bucket-list-before-50`. Their category comes from the section headings the
 * pages grouped them under, so nothing here was invented.
 */
export const MILESTONES: Milestone[] = [
  {
    title: 'Backpack through Southeast Asia',
    description:
      'Thailand, Vietnam, Indonesia, Cambodia — go slow, stay in hostels, let it change you.',
    emoji: '🌏',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Do a spontaneous Eurotrip',
    description: 'Interrail or a one-way flight. No fixed itinerary. See where you end up.',
    emoji: '🚂',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Spend a month in Japan',
    description:
      'Tokyo, Kyoto, the countryside. Japan rewards slowness in a way no quick trip can.',
    emoji: '🗾',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Sleep on a beach under the stars',
    description: 'Not a resort beach — a proper, remote, no-WiFi, fire-lit beach.',
    emoji: '🌊',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Hike a mountain that scares you',
    description:
      'Not a walk with a view. A summit that requires training, early starts, and real effort.',
    emoji: '🏔️',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Visit a country you know nothing about',
    description: 'No guidebook research. Just go and figure it out.',
    emoji: '🌍',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Road trip with no fixed destination',
    description: 'Pick a direction. Drive. Stop when something looks interesting.',
    emoji: '🗺️',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Take a trip completely alone',
    description:
      'One week, solo, somewhere unfamiliar. The most formative thing you can do in your 20s.',
    emoji: '🏝️',
    category: 'travel',
    horizon: 'before-30',
  },
  {
    title: 'Start something — a business, blog, or side project',
    description: "It doesn't have to succeed. It has to exist.",
    emoji: '🚀',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Get fired from a job once',
    description: "Or quit spectacularly. Either way, learn that it doesn't end you.",
    emoji: '💼',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Negotiate your first raise',
    description: 'Ask, explicitly, with a number. The fear is worse than the conversation.',
    emoji: '💰',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Invest your first serious money',
    description: 'An index fund, a startup, or a skill — something that compounds.',
    emoji: '📈',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Give a public talk or presentation',
    description: 'Voluntarily. About something you know well enough to defend.',
    emoji: '🎤',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Write something and publish it',
    description: 'An essay, a story, a thread — something with your name on it, for public eyes.',
    emoji: '✍️',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Become genuinely good at one thing',
    description: 'Not competent. Good. The kind that earns you a reputation.',
    emoji: '🧠',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Work or intern in another country',
    description: 'Even six months abroad rewires how you understand work and belonging.',
    emoji: '🌐',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Fall in love',
    description:
      'Actually — not performatively. The uncomfortable, inconvenient, transforming kind.',
    emoji: '❤️',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Make a best friend in a foreign country',
    description: 'A real one who you still text five years later.',
    emoji: '🤝',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Have one real conversation with a grandparent',
    description:
      "About their life, their mistakes, what they'd do differently. Before it's too late.",
    emoji: '👴',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Throw a party worth remembering',
    description: 'Plan it properly. Invite the right mix of people. Make it legendary.',
    emoji: '🎉',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Write a letter to someone who changed your life',
    description: "Send it. Don't wait for a funeral to say it.",
    emoji: '💌',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Live with friends, not just roommates',
    description: "People you'd choose to live with, not just tolerate. It only happens once.",
    emoji: '👯',
    category: 'social',
    horizon: 'before-30',
  },
  {
    title: 'Skydive',
    description: 'The free-fall lasts 60 seconds. The shift in perspective lasts longer.',
    emoji: '🪂',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'Surf a real wave',
    description: 'Not a beginner lesson on the shore break — an actual, rideable wave.',
    emoji: '🏄',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'Scuba dive somewhere extraordinary',
    description:
      'The Great Barrier Reef, the Blue Hole, the Maldives. Underwater is another world.',
    emoji: '🤿',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'Spend a week fully off-grid',
    description: 'No phone signal. No plans. See who you are without the feed.',
    emoji: '🏕️',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'Try a sport that terrifies you',
    description: 'Rock climbing, snowboarding, MMA. Do it badly. Keep going.',
    emoji: '🎿',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'See a natural wonder up close',
    description:
      'Aurora borealis, a volcano, the Grand Canyon at sunrise. Scale that makes you small.',
    emoji: '🌋',
    category: 'adventure',
    horizon: 'before-30',
  },
  {
    title: 'Perform in front of an audience',
    description: 'Open mic, stand-up, a play. Once. The adrenaline is unlike anything.',
    emoji: '🎵',
    category: 'creative',
    horizon: 'before-30',
  },
  {
    title: "Make something with your hands you're proud of",
    description: 'Pottery, woodworking, a painting, a recipe. Something tangible.',
    emoji: '🎨',
    category: 'creative',
    horizon: 'before-30',
  },
  {
    title: 'Take a photograph that stops people',
    description: 'Not an Instagram shot — something compositionally, emotionally extraordinary.',
    emoji: '📷',
    category: 'creative',
    horizon: 'before-30',
  },
  {
    title: 'Make a short film',
    description:
      "Write, direct, edit. Even a five-minute one. You'll learn more about storytelling than any book.",
    emoji: '🎬',
    category: 'creative',
    horizon: 'before-30',
  },
  {
    title: 'Learn an instrument to a playable level',
    description: 'Not perfect. Good enough to play for someone without apology.',
    emoji: '🎸',
    category: 'creative',
    horizon: 'before-30',
  },
  {
    title: 'Read 50 books in a year',
    description:
      'Fiction, non-fiction, philosophy, biography. Change your diet, change your thinking.',
    emoji: '📚',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Do a silent meditation retreat',
    description: 'Even a weekend. No talking, no phone. The silence teaches you something.',
    emoji: '🧘',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Learn another language to conversation level',
    description: 'Not app-level. Have a real, unscripted conversation with a native speaker.',
    emoji: '🗣️',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Get into the best shape of your life',
    description: 'Not a 30-day challenge — a sustained year of treating your body as an asset.',
    emoji: '💪',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: "Give up something that's running your life",
    description: 'Alcohol, sugar, social media, a toxic relationship. For at least 90 days.',
    emoji: '🚫',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Pull an all-nighter with people you love',
    description: 'Talking, not working. A night that turns into morning and nobody wants to leave.',
    emoji: '🌅',
    category: 'achievement',
    horizon: 'before-30',
  },
  {
    title: 'Volunteer for something you believe in',
    description: 'Not one afternoon — a sustained commitment where your absence would be noticed.',
    emoji: '🙌',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Grow something you can eat',
    description: 'A balcony herb, a vegetable patch, a proper kitchen garden. From seed to plate.',
    emoji: '🌱',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Run a race you had to train for',
    description: 'Half marathon minimum. Something that required more than casual fitness.',
    emoji: '🏃',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Learn something completely outside your field',
    description: "A programming language if you're in arts; ceramics if you're in tech.",
    emoji: '🎓',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Stay up all night to watch a sunrise',
    description: 'On purpose, somewhere beautiful. Tiredness and wonder is a strange combination.',
    emoji: '🌙',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Attend a festival that changes your taste',
    description: 'Music, film, food, ideas — something that expands your reference points.',
    emoji: '🎪',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Live somewhere for more than a tourist',
    description:
      'Rent a flat, go to the supermarket, have a local coffee shop. Actually live there.',
    emoji: '🏠',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Keep a journal for a full year',
    description:
      "Daily, honest, unedited. Read it back twelve months later. You won't recognise yourself.",
    emoji: '📖',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Give something away that costs you something',
    description: 'Not spare change — something that actually hurts to let go of.',
    emoji: '🤲',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Finish what you started',
    description: 'The book, the project, the course. One thing, all the way through. It compounds.',
    emoji: '🎯',
    category: 'humanitarian',
    horizon: 'before-30',
  },
  {
    title: 'Start a foundation or fund something that outlasts you',
    description:
      'A scholarship, a community project, a trust. Something that keeps working after you stop.',
    emoji: '🏛️',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Mentor 10 people meaningfully',
    description:
      "Not advice over coffee — sustained, intentional mentorship that changes someone's trajectory.",
    emoji: '👩‍🏫',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Write a book',
    description:
      'Memoir, business, fiction. The discipline of writing a book is unlike anything else. The finished object is proof of self.',
    emoji: '📖',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Plant something that will outlive you',
    description:
      "Trees, a garden, an orchard. Something that will still be growing when you're gone.",
    emoji: '🌱',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: "Fund a child's education from start to finish",
    description: 'Sponsor a student all the way through school or university. Watch them graduate.',
    emoji: '🎓',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Build or restore a home',
    description: 'Design it yourself, or gut-renovate an old one. Live in something you shaped.',
    emoji: '🏡',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Write your ethical will',
    description:
      'Not your financial will — your values, lessons, and what you want passed down. The thing that matters.',
    emoji: '📜',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Spend a year volunteering at serious scale',
    description:
      'Not a one-off day — a sustained year where your absence would genuinely set things back.',
    emoji: '🙏',
    category: 'humanitarian',
    horizon: 'before-50',
  },
  {
    title: 'Become a recognized expert in your field',
    description:
      'Spoken at the conferences, quoted in the coverage, asked to advise. The expertise that earns trust.',
    emoji: '🧠',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Learn a second discipline deeply',
    description:
      "If you're in medicine, learn law. If you're in business, learn philosophy. Cross-domain mastery changes how you think.",
    emoji: '🔬',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Live abroad for at least one full year',
    description:
      'Not a posting, not tourism — actual residency. Shopping, commuting, building local relationships.',
    emoji: '🌐',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Perform or exhibit something you made',
    description:
      'A painting show, a musical performance, a comedy night. Make something and put it in front of strangers.',
    emoji: '🎭',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Achieve a serious physical certification',
    description:
      'Divemaster, black belt, mountaineering cert. Something that took years and a real grading process.',
    emoji: '🤿',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Build something that reaches a million people',
    description:
      'A product, a piece of writing, a course, a tool. Something that works at genuine scale.',
    emoji: '📡',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Run a marathon',
    description: 'The full 26.2. After mile 20, everyone discovers something about themselves.',
    emoji: '🏃',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Complete a triathlon',
    description:
      'Sprint or Olympic distance at minimum. The swim, the bike, the run — each one humbling for a different reason.',
    emoji: '🏊',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Reach peak physical fitness for your age',
    description: 'Not for vanity — the kind of fitness that makes everything else in life easier.',
    emoji: '⛰️',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Earn a black belt or equivalent mastery',
    description:
      'In any martial art or serious physical discipline. The journey is the transformation.',
    emoji: '🥋',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Climb something that genuinely frightens you',
    description: 'A big wall, a serious alpine route, a peak that requires real technical skill.',
    emoji: '🧗',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Complete a major cycling challenge',
    description: 'The Tour de France route, a coast-to-coast, a serious multi-day mountain route.',
    emoji: '🚴',
    category: 'achievement',
    horizon: 'before-50',
  },
  {
    title: 'Be present for a birth',
    description:
      "Your child's, a sibling's, a close friend's. The arrival of life changes the scale of things.",
    emoji: '👶',
    category: 'social',
    horizon: 'before-50',
  },
  {
    title: 'Renew your vows or celebrate a major partnership milestone',
    description:
      "Deliberately, with intention. Not because it's expected — because you mean it more now.",
    emoji: '💍',
    category: 'social',
    horizon: 'before-50',
  },
  {
    title: "Repair a relationship you've damaged",
    description: "The call you've been putting off. Make it.",
    emoji: '🤗',
    category: 'social',
    horizon: 'before-50',
  },
  {
    title: "Take a trip with your parents before it's too late",
    description: "While they're well enough to travel. Go somewhere they've always wanted to go.",
    emoji: '🌅',
    category: 'social',
    horizon: 'before-50',
  },
  {
    title: 'Create a home that feels like you',
    description:
      'Designed, considered, full of things that mean something. A place that tells your story.',
    emoji: '🏠',
    category: 'social',
    horizon: 'before-50',
  },
  {
    title: 'Do a serious meditation retreat (10+ days)',
    description:
      'Vipassana or equivalent. Ten days of silence resets how you relate to your own mind.',
    emoji: '🧘',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Read the 100 books you always meant to read',
    description:
      "The classics, the philosophy, the history. The ones you nodded along to pretending you'd read.",
    emoji: '📚',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Lose something significant and rebuild from it',
    description:
      "A company, a relationship, a belief. And come back from it with something you didn't have before.",
    emoji: '🗺️',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Keep a journal for a decade',
    description:
      'Daily or weekly, consistently. Read it back at the end. The person who started it will be a stranger.',
    emoji: '✍️',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Change your mind publicly on something important',
    description:
      "Find a belief you've held for years and genuinely re-examine it. Change it if the evidence warrants. Say so.",
    emoji: '🌓',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Sail somewhere that requires real navigation',
    description:
      'An ocean crossing, a serious coastal passage. Not a sunset cruise — actual seamanship.',
    emoji: '🛥️',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Witness a geological or astronomical event',
    description:
      'A total solar eclipse, an erupting volcano, the aurora. Scale that puts your problems in perspective.',
    emoji: '🌋',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Survive a wilderness expedition',
    description:
      'Multi-day, self-supported, genuinely remote. The kind where your decisions have consequences.',
    emoji: '🏜️',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Visit every continent',
    description:
      "Including Antarctica if you can. Each one has a climate, a culture, a geometry that's unlike anywhere else.",
    emoji: '✈️',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Ski or snowboard a black diamond run',
    description: 'Work up to it. The mountain demands honesty about your limits.',
    emoji: '🎿',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Make a documentary about something you care about',
    description:
      'Even a short one. The discipline of finding and telling a true story is extraordinary.',
    emoji: '🎬',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Record and release music you made',
    description: 'One song, properly produced. Your voice or your instrument, out in the world.',
    emoji: '🎵',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Have your work shown publicly',
    description:
      'A gallery, a publication, a stage. Something with your name on it, for strangers.',
    emoji: '🖼️',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Teach a class or course',
    description:
      "Formally or informally — something you know well, passed on to people who don't yet.",
    emoji: '🏛️',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Speak a second language fluently',
    description:
      'Not at tourist level. Well enough to give a speech, argue a point, make a friend.',
    emoji: '🌍',
    category: 'creative',
    horizon: 'before-50',
  },
  {
    title: 'Make a bet on yourself',
    description:
      "Leave the job, fund the project, start the company. Something where you're the asset.",
    emoji: '💰',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: "Forgive someone you haven't forgiven",
    description:
      'For your sake, not theirs. Carrying a grievance through your 40s is a tax you can stop paying.',
    emoji: '🤝',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Walk away from something comfortable but wrong',
    description: 'The job, the relationship, the city. Comfortable and right are different things.',
    emoji: '🚪',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Do something that gets you recognized publicly',
    description:
      'An award, a feature, a speaking slot. Not for vanity — for evidence that the work is real.',
    emoji: '🌟',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Own something that matters to your community',
    description: 'A building, a team, a publication. Stewardship is different from ownership.',
    emoji: '🔑',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Turn your next decade birthday into a mission',
    description: 'Will Smith skydived for his 50th. Make yours a declaration, not a dinner party.',
    emoji: '🎂',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Swim in all five oceans',
    description:
      'Pacific, Atlantic, Indian, Arctic, Southern. A slow, deliberate life goal that forces extraordinary travel.',
    emoji: '🌊',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Win something you genuinely competed for',
    description:
      'A race, a pitch, a competition. Something where other people were trying to beat you.',
    emoji: '🏆',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Be quoted or profiled in the press',
    description: 'For something real — your expertise, your work, your cause. Not a PR stunt.',
    emoji: '📰',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Understand your own health at a deep level',
    description:
      'Full bloodwork, genetics, a proper physical baseline. Know your body before it tells you something is wrong.',
    emoji: '🧬',
    category: 'adventure',
    horizon: 'before-50',
  },
  {
    title: 'Watch the sunrise from a place that moved you',
    description:
      'Not a beach resort — somewhere that earned the view. A summit, a desert, a cliffside you walked to.',
    emoji: '🌙',
    category: 'adventure',
    horizon: 'before-50',
  },
];

// ─── Destinations ────────────────────────────────────────────────────────────

export type DestinationRegion =
  | 'europe'
  | 'asia'
  | 'americas'
  | 'africa-middle-east'
  | 'oceania-antarctica';

export type Destination = {
  name: string;
  why: string;
  region: DestinationRegion;
  /**
   * A `slug` into FAMOUS_BUCKET_LISTS — the travel page renders it as a link
   * to `/bucket-lists/<slug>`. It is the only existing cross-reference from
   * the experience corpus into another corpus.
   *
   * Not `famous-journeys.ts`, despite the overlapping cast: those are a
   * separate set of 35 people, and only some names appear in both.
   */
  famous?: { name: string; slug: string; note: string };
};

/** Previously hardcoded in `/travel-bucket-list`, reachable by nothing. */
export const DESTINATIONS: Destination[] = [
  {
    name: 'Stonehenge, England',
    why: 'Four thousand years of mystery on a Wiltshire plain. The scale only registers in person.',
    region: 'europe',
    famous: {
      name: 'Barack Obama',
      slug: 'barack-obama',
      note: 'visited during a G8 trip and described it as genuinely awe-inspiring',
    },
  },
  {
    name: 'The Amalfi Coast, Italy',
    why: 'Cliffside villages above turquoise water. The most dramatic coastline in Europe.',
    region: 'europe',
  },
  {
    name: 'Santorini, Greece',
    why: 'White cube architecture above a caldera. Postcard images that somehow exceed expectations in person.',
    region: 'europe',
  },
  {
    name: 'The Norwegian Fjords',
    why: 'Glacial water, vertical cliffs, silence. The scale of the landscape makes everything else feel small.',
    region: 'europe',
  },
  {
    name: 'Paris at dawn',
    why: 'Not the tourist Paris — the Paris of empty streets, open cafes, and the Eiffel Tower before the crowds arrive.',
    region: 'europe',
  },
  {
    name: 'The Scottish Highlands',
    why: 'Moorland, lochs, and castle ruins. Wild in a way that feels pre-historical.',
    region: 'europe',
  },
  {
    name: 'Venice before mass tourism erases it',
    why: "A city built on water that shouldn't exist — and won't, at current rates. Go while it's still there.",
    region: 'europe',
  },
  {
    name: 'The Alhambra, Granada, Spain',
    why: 'Islamic palace architecture of extraordinary mathematical precision. The most beautiful building in Europe.',
    region: 'europe',
  },
  {
    name: 'Iceland: fire, ice, and the aurora',
    why: 'Geysers, glaciers, lava fields, and the Northern Lights. Iceland packs geological impossibilities into a small island.',
    region: 'europe',
  },
  {
    name: "Dubrovnik's Old City, Croatia",
    why: 'Medieval walls above the Adriatic. Walk the city ramparts at sunset before everyone else figures it out.',
    region: 'europe',
  },
  {
    name: 'Tuscany, Italy',
    why: 'Rolling hills, cypress trees, medieval villages, and wine made from grapes grown in sight of your table.',
    region: 'europe',
  },
  {
    name: 'Transylvania, Romania',
    why: 'Fortified Saxon villages, medieval towns, and mountain landscapes largely unchanged since the Middle Ages.',
    region: 'europe',
  },
  {
    name: 'The Swiss Alps',
    why: 'Walk between villages through mountain passes that have been trade routes for two thousand years.',
    region: 'europe',
  },
  {
    name: 'Lisbon, Portugal',
    why: 'Fado music, pastel de nata, and seven hills of tile-faced buildings. The most underrated capital in Europe.',
    region: 'europe',
  },
  {
    name: 'The Camino de Santiago',
    why: "800km across Spain on foot. The world's most famous pilgrimage — not for religion, but for whatever it teaches you about yourself.",
    region: 'europe',
  },
  {
    name: 'Kyoto, Japan in cherry blossom season',
    why: 'Ancient temples, Zen gardens, and a week every spring when the city becomes otherworldly.',
    region: 'asia',
  },
  {
    name: 'Angkor Wat, Cambodia',
    why: "The world's largest religious monument, emerging from jungle at sunrise. A civilisation's ambition, petrified in stone.",
    region: 'asia',
  },
  {
    name: 'The Taj Mahal, India',
    why: 'Built as a monument to love. The white marble shifts colour with the light — different at dawn, dusk, and under full moon.',
    region: 'asia',
  },
  {
    name: 'Bhutan',
    why: "The world's only carbon-negative country, where 'gross national happiness' is a policy metric. The Himalayas without the crowds.",
    region: 'asia',
  },
  {
    name: 'Ha Long Bay, Vietnam',
    why: 'Three thousand limestone islands rising from emerald water. Sleep on a traditional junk boat.',
    region: 'asia',
  },
  {
    name: "Bali's rice terraces and temples",
    why: 'Not the tourist Bali — the inland villages, dawn ceremonies, and 2,000-year-old subak irrigation system.',
    region: 'asia',
  },
  {
    name: 'The Silk Road, Uzbekistan',
    why: 'Samarkand, Bukhara, and the turquoise-domed cities of Central Asia. History that most Westerners have never encountered.',
    region: 'asia',
  },
  {
    name: 'Tibet and the Tibetan Plateau',
    why: "The world's highest plateau. Monasteries at 4,000 metres, the Potala Palace, and a sky that looks different at altitude.",
    region: 'asia',
  },
  {
    name: 'Komodo Island, Indonesia',
    why: 'The only place on earth where the Komodo dragon — a living dinosaur — lives wild and hunts in the open.',
    region: 'asia',
  },
  {
    name: 'Rajasthan, India',
    why: 'Fortresses, palaces, camel fairs, and a desert at the edge of a desert kingdom. India at its most theatrical.',
    region: 'asia',
  },
  {
    name: 'The Korean DMZ',
    why: "One of the strangest borders on earth — a 4km strip of no-man's land that has become accidentally rewilded.",
    region: 'asia',
  },
  {
    name: 'Georgia (the country)',
    why: 'Caucasus mountain villages, ancient cave monasteries, and natural wine from 8,000-year-old traditions.',
    region: 'asia',
  },
  {
    name: 'Maldives above and below water',
    why: 'Overwater bungalows above a lagoon that exists nowhere else on earth. Snorkel at dawn before the resort wakes up.',
    region: 'asia',
  },
  {
    name: 'The temples of Bagan, Myanmar',
    why: 'Two thousand temples across a plain. Balloon at dawn, bicycle at dusk. The most underrated ancient site in Asia.',
    region: 'asia',
  },
  {
    name: 'Mount Fuji, Japan',
    why: 'Climb it once. The Japanese have a saying: a fool never climbs Fuji — a greater fool climbs it twice.',
    region: 'asia',
  },
  {
    name: 'Machu Picchu, Peru',
    why: 'An Inca citadel at cloud level, only accessible by train or on foot. The Inca Trail approach earns the view.',
    region: 'americas',
  },
  {
    name: 'Patagonia, Argentina and Chile',
    why: 'The end of the earth: granite towers, glaciers calving into lakes, and condors overhead. Planet Earth on hard mode.',
    region: 'americas',
  },
  {
    name: 'The Amazon Rainforest, Brazil',
    why: 'More species per square kilometre than anywhere else on earth. The lungs of the world, while they still exist.',
    region: 'americas',
  },
  {
    name: 'The Grand Canyon, USA',
    why: 'The scale is impossible to understand from photographs. Stand at the rim and look down — a mile of geological time.',
    region: 'americas',
  },
  {
    name: 'Havana, Cuba',
    why: 'Time-capsule city: 1950s cars, crumbling baroque architecture, and a music culture unchanged by fifty years of isolation.',
    region: 'americas',
  },
  {
    name: 'The Canadian Rockies',
    why: 'Banff, Jasper, Lake Louise — glacier-fed lakes of impossible blue surrounded by peaks that look like set design.',
    region: 'americas',
  },
  {
    name: 'Route 66, USA',
    why: "America's original road trip: 4,000km of diners, motels, and landscapes from Illinois to California.",
    region: 'americas',
  },
  {
    name: 'Galápagos Islands, Ecuador',
    why: 'Where Darwin understood evolution. Wildlife that has never learned to fear humans — you can approach it within metres.',
    region: 'americas',
  },
  {
    name: 'Rio de Janeiro during Carnival',
    why: "The world's largest party: six days of samba, spectacular costumes, and a city that becomes one enormous stage.",
    region: 'americas',
  },
  {
    name: 'Alaska: wilderness at scale',
    why: "Denali at 6,200m, grizzlies fishing salmon, orca pods, and rainforests. America's last frontier, genuinely.",
    region: 'americas',
  },
  {
    name: 'The Atacama Desert, Chile',
    why: "The world's driest non-polar desert — and one of the best places on earth to see the Milky Way.",
    region: 'americas',
  },
  {
    name: 'New Orleans, USA',
    why: 'Creole cuisine, jazz in every bar, above-ground cemeteries, and a city that absorbed four cultures and invented something new.',
    region: 'americas',
  },
  {
    name: "Bolivia's Salar de Uyuni",
    why: "The world's largest salt flat: after rain, a perfect mirror that reflects the sky. Photography doesn't capture it.",
    region: 'americas',
  },
  {
    name: 'Niagara Falls, Canada',
    why: "One of the world's great natural spectacles. Stand at the lip, feel the spray, hear the roar that drowns all conversation.",
    region: 'americas',
  },
  {
    name: 'New York City, properly',
    why: 'Not a tourist visit — a month of living there. The museums, the boroughs, the rooftops, the rhythm of the city.',
    region: 'americas',
  },
  {
    name: 'The Serengeti, Tanzania',
    why: 'The greatest wildlife spectacle on earth. The great migration: two million wildebeest in motion.',
    region: 'africa-middle-east',
    famous: {
      name: 'Oprah Winfrey',
      slug: 'oprah-winfrey',
      note: 'has spoken about the Serengeti as a transformative experience',
    },
  },
  {
    name: 'Namibia',
    why: 'The oldest desert on earth, red sand dunes, wild horses, and a coastline where fog rolls in from a cold sea.',
    region: 'africa-middle-east',
    famous: {
      name: 'Bill Clinton',
      slug: 'bill-clinton',
      note: "visited post-presidency and described Namibia as one of Africa's most extraordinary landscapes",
    },
  },
  {
    name: 'The Pyramids of Giza, Egypt',
    why: 'The last surviving wonder of the ancient world. Stand at the base of the Great Pyramid and feel the scale of 4,500 years.',
    region: 'africa-middle-east',
  },
  {
    name: 'Zanzibar, Tanzania',
    why: "Stone Town's labyrinthine alleyways, spice plantations, and beaches that belong to a different planet than the mainland.",
    region: 'africa-middle-east',
  },
  {
    name: 'Gorilla trekking, Rwanda or Uganda',
    why: 'An hour with a family of mountain gorillas in the wild. Nothing else quite explains what it means to share 98% of DNA with another species.',
    region: 'africa-middle-east',
  },
  {
    name: "Marrakech's medina, Morocco",
    why: "Maze of souks, riads, and hammams. Djemaa el-Fna square at dusk is one of the world's great spectacles of organised chaos.",
    region: 'africa-middle-east',
  },
  {
    name: 'Victoria Falls, Zambia/Zimbabwe',
    why: "The world's largest waterfall by combined width and height. The mist is visible 50km away.",
    region: 'africa-middle-east',
  },
  {
    name: 'Petra, Jordan',
    why: 'A city carved into rose-red sandstone by the Nabataeans. Walk through the Siq at dawn before the tour buses arrive.',
    region: 'africa-middle-east',
  },
  {
    name: 'Cape Town and the Cape Peninsula',
    why: 'Table Mountain, the winelands, Boulders Beach penguins, and Cape Point — where two oceans meet.',
    region: 'africa-middle-east',
  },
  {
    name: 'The Sahara Desert',
    why: "Sleep in a tent in the silence of the world's largest hot desert. Sunrise over dunes with no other human in sight.",
    region: 'africa-middle-east',
  },
  {
    name: "Ethiopia's Danakil Depression",
    why: 'The hottest inhabited place on earth — and one of the most alien landscapes: sulfur springs, lava lakes, salt plains.',
    region: 'africa-middle-east',
  },
  {
    name: 'The Dead Sea, Jordan/Israel',
    why: "Float without swimming. The water is ten times saltier than the ocean. The lowest point on the earth's surface.",
    region: 'africa-middle-east',
  },
  {
    name: 'Wadi Rum, Jordan',
    why: 'The Valley of the Moon: red sandstone desert used as Mars in a dozen films. Spend a night in a Bedouin camp.',
    region: 'africa-middle-east',
  },
  {
    name: 'Okavango Delta, Botswana',
    why: "The world's largest inland delta — a river that flows into desert and creates an oasis of extraordinary wildlife.",
    region: 'africa-middle-east',
  },
  {
    name: "Lalibela's rock-hewn churches, Ethiopia",
    why: "Eleven medieval churches carved downward into solid volcanic rock. Still in active use. One of Africa's great wonders.",
    region: 'africa-middle-east',
  },
  {
    name: 'The Great Barrier Reef, Australia',
    why: "The world's largest coral system — and one of the places changing fastest. Dive it before the bleaching worsens.",
    region: 'oceania-antarctica',
  },
  {
    name: 'Antarctica',
    why: 'The seventh continent. No permanent residents, no shops, no infrastructure. More penguins than humans. Nothing prepares you for the scale.',
    region: 'oceania-antarctica',
  },
  {
    name: 'Milford Sound, New Zealand',
    why: 'Fiordland: fjords carved by glaciers, waterfalls dropping hundreds of metres, dolphins in water so clear it looks still.',
    region: 'oceania-antarctica',
  },
  {
    name: 'Uluru (Ayers Rock), Australia',
    why: "The world's largest monolith changes colour from orange to purple to deep red as light moves across it. Sacred to the Anangu people.",
    region: 'oceania-antarctica',
  },
  {
    name: 'The Whitsunday Islands, Australia',
    why: "74 tropical islands in the Coral Sea. Whitehaven Beach — almost pure silica — is one of the world's finest.",
    region: 'oceania-antarctica',
  },
  {
    name: 'Fiordland, New Zealand',
    why: "The most remote and spectacular wilderness in the Southern Hemisphere. The Milford Track is one of the world's great hikes.",
    region: 'oceania-antarctica',
  },
  {
    name: 'Raja Ampat, Indonesia',
    why: "The most biodiverse marine area on earth. Seventy-five percent of the world's coral species in one archipelago.",
    region: 'oceania-antarctica',
  },
  {
    name: 'The Kimberley, Australia',
    why: 'Remote wilderness larger than Germany. Ancient Wandjina rock art, gorges, and a coastline no road reaches.',
    region: 'oceania-antarctica',
  },
  {
    name: "Vanuatu's volcanoes",
    why: 'Walk to the rim of Mount Yasur — an active volcano — and look into the crater. Legally accessible. Genuinely dangerous.',
    region: 'oceania-antarctica',
  },
  {
    name: 'Queenstown, New Zealand',
    why: 'The adventure capital of the world: bungee jumping, skydiving, white-water rafting, skiing — in one small city beside a lake.',
    region: 'oceania-antarctica',
  },
  {
    name: 'The Kimberley coast by boat',
    why: 'Accessible only by sea. Horizontal waterfalls, ancient gorges, and Indigenous communities that have lived there for 40,000 years.',
    region: 'oceania-antarctica',
  },
  {
    name: 'Lord Howe Island, Australia',
    why: 'Nine kilometres long, 400 residents, 75% world heritage listed. The most pristine island in the Pacific.',
    region: 'oceania-antarctica',
  },
  {
    name: 'Franz Josef Glacier, New Zealand',
    why: 'A temperate rainforest glacier — rainforest and ice existing alongside each other. Walk on it before it retreats further.',
    region: 'oceania-antarctica',
  },
  {
    name: 'The Daintree Rainforest, Australia',
    why: "The world's oldest surviving tropical rainforest, continuously present for 180 million years. Crocodiles in the river, cassowaries in the bush.",
    region: 'oceania-antarctica',
  },
  {
    name: 'Scott Base, Antarctica',
    why: 'If you can get there — as a tourist, researcher, or journalist — the Antarctic continent changes your frame of reference permanently.',
    region: 'oceania-antarctica',
  },
];

/**
 * Every experience the product knows about, as one flat list.
 *
 * Three corpora feed it — the category ideas, the two life-stage milestone
 * lists, and the destinations. Deduplicated on lowercased title, because the
 * lists genuinely overlap ("Run a marathon" is both an idea and a before-50
 * milestone) and a suggestion engine that offers the same thing twice looks
 * broken.
 */
export const ALL_EXPERIENCES: Experience[] = (() => {
  const seen = new Set<string>();
  const out: Experience[] = [];
  const push = (title: string, category: ExperienceCategory, emoji: string) => {
    const key = title.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ title, category, emoji });
  };

  for (const category of EXPERIENCE_CATEGORIES) {
    const group = EXPERIENCES_BY_CATEGORY[category];
    for (const title of group.ideas) push(title, category, group.emoji);
  }
  for (const m of MILESTONES) push(m.title, m.category, m.emoji);
  for (const d of DESTINATIONS) push(d.name, 'travel', '✈️');

  return out;
})();

// ─── Unified view ────────────────────────────────────────────────────────────

/**
 * Which corpus an entry came from. Kept as a facet rather than collapsed away:
 * a destination and a before-30 milestone are genuinely different kinds of
 * thing, and the browse UI lets you filter on exactly that.
 */
export type ExperienceKind = 'idea' | 'milestone' | 'destination';

export type ExperienceEntry = {
  slug: string;
  title: string;
  /** Present for milestones and destinations; the bare ideas have none. */
  description?: string;
  emoji: string;
  category: ExperienceCategory;
  kind: ExperienceKind;
  region?: DestinationRegion;
  horizon?: MilestoneHorizon;
  famous?: { name: string; slug: string; note: string };
};

/** URL-safe slug. Not exported for reuse — see `slugForExperience`. */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      // Strip the combining marks NFKD just split off, so an accented
      // name slugs to its plain form instead of losing the character.
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
  );
}

/**
 * Every entry across all three corpora, deduplicated and slugged.
 *
 * Slug collisions are real — "Run a marathon" is both an idea and a before-50
 * milestone — and two entries cannot share a URL.
 *
 * The richer record wins rather than the first one seen. Ideas are iterated
 * first and carry no description, so first-writer-wins silently discarded the
 * milestone or destination version of three titles and cost them the page they
 * would otherwise have earned. A collision between two entries that both have
 * prose still keeps the first, which is stable across corpus order.
 */
export const EXPERIENCE_ENTRIES: ExperienceEntry[] = (() => {
  const bySlug = new Map<string, ExperienceEntry>();
  const add = (entry: ExperienceEntry) => {
    if (!entry.slug) return;
    const existing = bySlug.get(entry.slug);
    if (existing && !(entry.description && !existing.description)) return;
    bySlug.set(entry.slug, entry);
  };

  for (const category of EXPERIENCE_CATEGORIES) {
    const group = EXPERIENCES_BY_CATEGORY[category];
    for (const title of group.ideas) {
      add({ slug: slugify(title), title, emoji: group.emoji, category, kind: 'idea' });
    }
  }
  for (const m of MILESTONES) {
    add({
      slug: slugify(m.title),
      title: m.title,
      description: m.description,
      emoji: m.emoji,
      category: m.category,
      kind: 'milestone',
      horizon: m.horizon,
    });
  }
  for (const d of DESTINATIONS) {
    add({
      slug: slugify(d.name),
      title: d.name,
      description: d.why,
      emoji: '✈️',
      category: 'travel',
      kind: 'destination',
      region: d.region,
      famous: d.famous,
    });
  }

  // Entries with prose first. Corpus order puts all 150 bare ideas at the
  // front, so the browse page opened on a wall of rows with nothing to read
  // and nowhere to click. Stable within each half, so the order is still
  // deterministic and slugs never shuffle.
  const all = [...bySlug.values()];
  return [...all.filter((e) => e.description), ...all.filter((e) => !e.description)];
})();

/**
 * The entries that get their own page.
 *
 * Only those carrying written prose. The 150 bare ideas are titles and nothing
 * else — 150 pages whose only unique content is a heading would be thin, and
 * thin pages are a site-wide signal that would drag down the 122 hobby pages
 * that currently work. They stay browsable on the index; they earn a URL when
 * someone writes them a sentence.
 */
export const PAGED_EXPERIENCES: ExperienceEntry[] = EXPERIENCE_ENTRIES.filter(
  (e) => typeof e.description === 'string' && e.description.length > 0
);

export function findExperience(slug: string): ExperienceEntry | undefined {
  return EXPERIENCE_ENTRIES.find((e) => e.slug === slug);
}

/**
 * Same category, excluding the entry itself.
 *
 * Entries that have a page come first. These render as a "so might these" list,
 * and a list where every row is unclickable is worse than no list — bare ideas
 * only fill the tail when a category is short on written ones.
 */
export function relatedExperiences(entry: ExperienceEntry, limit = 6): ExperienceEntry[] {
  const pool = EXPERIENCE_ENTRIES.filter(
    (e) => e.slug !== entry.slug && e.category === entry.category
  );
  return [...pool.filter((e) => e.description), ...pool.filter((e) => !e.description)].slice(
    0,
    limit
  );
}
