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
      'Hike the Pacific Crest Trail',
      'Go on a polar expedition',
      'Zipline through a rainforest canopy',
      'Learn to free solo climb',
      'Drive a racecar at full speed',
      'Go canyoneering',
      'Trek across Iceland',
      'Kayak the Grand Canyon',
      'Dog sled in Alaska',
      'Free dive to 20 metres',
      'Summit a volcano',
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
      'Learn to fly a plane',
      'Start and grow a business',
      'Earn a black belt in a martial art',
      'Become fluent in a second language',
      'Read 52 books in a year',
      'Become completely debt-free',
      'Learn to code and ship an app',
      'Climb the corporate ladder to a role you dreamed of',
      'Compete in a national championship',
      'Earn a postgraduate degree',
      'Master a complex card trick',
      'Memorise a long poem or speech',
      'Build an investment portfolio',
      'Complete a Tough Mudder',
      'Become a certified scuba diver',
      "Get a pilot's licence",
      'Compete in an obstacle course race',
      "Solve a Rubik's cube in under a minute",
      'Give a TED talk',
      'Build something that reaches a million people',
      'Become a recognised expert in your field',
      'Learn a second discipline deeply',
      'Patent an invention',
      'Win a competition you genuinely trained for',
      'Get featured in a major publication',
    ],
  },
  relationships: {
    emoji: '❤️',
    label: 'Relationships',
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
      'Organise a neighbourhood event',
      'Get married or celebrate a long-term partnership',
      'Spend a month living with a foreign family',
      "Teach a skill you're good at to a group of strangers",
      'Have a meaningful conversation with a complete stranger every week for a year',
      'Co-write something with a friend',
      'Show up for someone in a crisis without being asked',
      "Celebrate someone else's milestone as if it were your own",
      'Ask forgiveness from someone you hurt',
      'Forgive someone who hurt you',
      'Have one real conversation with a grandparent before it is too late',
      'Repair a relationship you damaged',
      'Write a letter to someone who changed your life and send it',
      'Spend a week with each of your parents while they are well enough to travel',
    ],
  },
  contribution: {
    emoji: '🌍',
    label: 'Contribution',
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
  food: {
    emoji: '🍽️',
    label: 'Food & Culinary',
    color: 'amber',
    ideas: [
      'Eat street food in Bangkok',
      'Bake sourdough weekly for a year',
      'Forage for wild mushrooms',
      'Make cheese from scratch',
      'Eat at a 3-star Michelin restaurant',
      'Brew your own beer or wine',
      'Grow something you can eat from seed to plate',
      'Create a family cookbook with old recipes',
      'Eat a meal cooked by a grandmother in her home',
      'Master one dish so well you could teach it',
      'Roast your own coffee beans',
      'Preserve a season: jam, pickle, ferment',
      'Eat at the source: coffee in Ethiopia, tea in Japan, chocolate in Ecuador',
      'Cook a whole animal from nose to tail',
      'Make pasta from scratch',
      'Eat something you foraged or caught yourself',
      'Take a cooking class in the country the cuisine is from',
      'Bake a wedding cake for someone you love',
      'Learn to butcher a whole fish',
      'Ferment something for the first time',
      'Eat a 12-course tasting menu',
      'Make your own condiments from scratch',
      'Cook a meal over an open fire',
      'Eat your way through a country one market at a time',
    ],
  },
  health: {
    emoji: '💪',
    label: 'Health & Vitality',
    color: 'lime',
    ideas: [
      'Run a marathon',
      'Complete a triathlon',
      'Complete a 100-mile ultramarathon',
      'Qualify for the Boston Marathon',
      'Complete an Ironman triathlon',
      'Break a personal athletic record',
      'Do 100 push-ups in a row',
      'Do a polar bear plunge',
      'Walk 10,000 steps a day for a month',
      'Hike weekly for a year',
      'Sleep 8 hours a night for 30 days',
      'Cycle coast to coast',
      'Take a cold plunge every morning for a month',
      'Get a full health checkup including bloodwork',
      'Do a 30-day yoga challenge',
      'Learn to cook 10 healthy meals from scratch',
      'Swim a mile without stopping',
      'Walk a long-distance trail over 100km',
      'Do your first pull-up',
      'Run your first 5K',
      'Climb your first mountain',
      'Spend a year strength training',
      'Learn to meditate for 20 minutes straight',
      'Fast for 24 hours at least once',
      'Get your hearing and vision checked',
    ],
  },
  mindfulness: {
    emoji: '🧘',
    label: 'Mindfulness',
    color: 'teal',
    ideas: [
      'Do a 10-day silent meditation retreat',
      'Spend a week fully off-grid',
      'Watch a sunrise and a sunset in the same day',
      'Meditate every day for 365 days',
      'Do a solo camping trip with no phone',
      'Take a tea ceremony class',
      'Spend a day in complete silence',
      'Watch a meteor shower from a dark sky location',
      'Sit with a dying person and just be present',
      'Do a digital detox for a full week',
      'Practice ichigo ichie: treat one ordinary day as unrepeatable',
      'Walk a labyrinth or pilgrimage slowly',
      'Spend a night alone in the wilderness',
      'Learn to identify 10 bird species by song',
      'Spend an hour watching a single tree',
      'Take a slow travel trip: one town, one week, no plan',
      'Spend a week in a monastery or retreat centre',
      'Learn to sit with discomfort without reaching for your phone',
      'Watch a storm roll in from start to finish',
      'Spend a full day with no screens',
      'Take a forest bathing walk',
      'Create a morning ritual you keep for a year',
      'Spend a night stargazing with no agenda',
      'Do a walking meditation every morning for a month',
      'Spend an afternoon doing one thing at a time',
    ],
  },
  reflection: {
    emoji: '📖',
    label: 'Reflection',
    color: 'indigo',
    ideas: [
      'Record your parents life stories',
      'Write your ethical will: values, lessons, what you want passed down',
      'Keep a journal for a full year',
      'Keep a journal for a decade',
      'Write a letter to your younger self',
      'Write a letter to your future self and read it in 10 years',
      'Change your mind publicly on something important',
      'Do a structured life review: decade by decade',
      'Create a photo book of one year of your life',
      'Write the story of how you became who you are',
      'Record a conversation with an elder and preserve it',
      'Write down everything you know about your family history',
      'Spend a day reviewing every job, relationship, and home you have had',
      'Write your obituary the way you would want it read',
      'Make a list of 100 things you are grateful for',
      'Re-read a book that changed your life and see what you notice now',
      'Write a letter to someone you have not forgiven and then decide whether to send it',
      'Write a manifesto for how you want to live',
      'Spend a birthday alone reflecting on the past year',
      'Write down your core values and check them against how you actually spend your time',
      'Create a personal annual report',
      'Write a forgiveness letter to yourself',
      'Spend a day visiting places that shaped you',
      'Write the speech you would give at your own retirement',
      'Make a timeline of the five most important moments of your life',
    ],
  },
};

export const EXPERIENCE_CATEGORIES = Object.keys(EXPERIENCES_BY_CATEGORY) as ExperienceCategory[];

type ExperienceLocation = 'anywhere' | 'specific-place';

export type Experience = {
  title: string;
  category: ExperienceCategory;
  emoji: string;
  location: ExperienceLocation;
};

// ─── Milestones ──────────────────────────────────────────────────────────────

type MilestoneHorizon = 'before-30' | 'before-50';

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
    category: 'relationships',
    horizon: 'before-30',
  },
  {
    title: 'Make a best friend in a foreign country',
    description: 'A real one who you still text five years later.',
    emoji: '🤝',
    category: 'relationships',
    horizon: 'before-30',
  },
  {
    title: 'Have one real conversation with a grandparent',
    description:
      "About their life, their mistakes, what they'd do differently. Before it's too late.",
    emoji: '👴',
    category: 'relationships',
    horizon: 'before-30',
  },
  {
    title: 'Throw a party worth remembering',
    description: 'Plan it properly. Invite the right mix of people. Make it legendary.',
    emoji: '🎉',
    category: 'relationships',
    horizon: 'before-30',
  },
  {
    title: 'Write a letter to someone who changed your life',
    description: "Send it. Don't wait for a funeral to say it.",
    emoji: '💌',
    category: 'relationships',
    horizon: 'before-30',
  },
  {
    title: 'Live with friends, not just roommates',
    description: "People you'd choose to live with, not just tolerate. It only happens once.",
    emoji: '👯',
    category: 'relationships',
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
    category: 'mindfulness',
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
    category: 'health',
    horizon: 'before-30',
  },
  {
    title: "Give up something that's running your life",
    description: 'Alcohol, sugar, social media, a toxic relationship. For at least 90 days.',
    emoji: '🚫',
    category: 'health',
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
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Grow something you can eat',
    description: 'A balcony herb, a vegetable patch, a proper kitchen garden. From seed to plate.',
    emoji: '🌱',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Run a race you had to train for',
    description: 'Half marathon minimum. Something that required more than casual fitness.',
    emoji: '🏃',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Learn something completely outside your field',
    description: "A programming language if you're in arts; ceramics if you're in tech.",
    emoji: '🎓',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Stay up all night to watch a sunrise',
    description: 'On purpose, somewhere beautiful. Tiredness and wonder is a strange combination.',
    emoji: '🌙',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Attend a festival that changes your taste',
    description: 'Music, film, food, ideas — something that expands your reference points.',
    emoji: '🎪',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Live somewhere for more than a tourist',
    description:
      'Rent a flat, go to the supermarket, have a local coffee shop. Actually live there.',
    emoji: '🏠',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Keep a journal for a full year',
    description:
      "Daily, honest, unedited. Read it back twelve months later. You won't recognise yourself.",
    emoji: '📖',
    category: 'reflection',
    horizon: 'before-30',
  },
  {
    title: 'Give something away that costs you something',
    description: 'Not spare change — something that actually hurts to let go of.',
    emoji: '🤲',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Finish what you started',
    description: 'The book, the project, the course. One thing, all the way through. It compounds.',
    emoji: '🎯',
    category: 'contribution',
    horizon: 'before-30',
  },
  {
    title: 'Start a foundation or fund something that outlasts you',
    description:
      'A scholarship, a community project, a trust. Something that keeps working after you stop.',
    emoji: '🏛️',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Mentor 10 people meaningfully',
    description:
      "Not advice over coffee — sustained, intentional mentorship that changes someone's trajectory.",
    emoji: '👩‍🏫',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Write a book',
    description:
      'Memoir, business, fiction. The discipline of writing a book is unlike anything else. The finished object is proof of self.',
    emoji: '📖',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Plant something that will outlive you',
    description:
      "Trees, a garden, an orchard. Something that will still be growing when you're gone.",
    emoji: '🌱',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: "Fund a child's education from start to finish",
    description: 'Sponsor a student all the way through school or university. Watch them graduate.',
    emoji: '🎓',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Build or restore a home',
    description: 'Design it yourself, or gut-renovate an old one. Live in something you shaped.',
    emoji: '🏡',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Write your ethical will',
    description:
      'Not your financial will — your values, lessons, and what you want passed down. The thing that matters.',
    emoji: '📜',
    category: 'contribution',
    horizon: 'before-50',
  },
  {
    title: 'Spend a year volunteering at serious scale',
    description:
      'Not a one-off day — a sustained year where your absence would genuinely set things back.',
    emoji: '🙏',
    category: 'contribution',
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
    category: 'health',
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
    category: 'health',
    horizon: 'before-50',
  },
  {
    title: 'Complete a triathlon',
    description:
      'Sprint or Olympic distance at minimum. The swim, the bike, the run — each one humbling for a different reason.',
    emoji: '🏊',
    category: 'health',
    horizon: 'before-50',
  },
  {
    title: 'Reach peak physical fitness for your age',
    description: 'Not for vanity — the kind of fitness that makes everything else in life easier.',
    emoji: '⛰️',
    category: 'health',
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
    category: 'health',
    horizon: 'before-50',
  },
  {
    title: 'Be present for a birth',
    description:
      "Your child's, a sibling's, a close friend's. The arrival of life changes the scale of things.",
    emoji: '👶',
    category: 'relationships',
    horizon: 'before-50',
  },
  {
    title: 'Renew your vows or celebrate a major partnership milestone',
    description:
      "Deliberately, with intention. Not because it's expected — because you mean it more now.",
    emoji: '💍',
    category: 'relationships',
    horizon: 'before-50',
  },
  {
    title: "Repair a relationship you've damaged",
    description: "The call you've been putting off. Make it.",
    emoji: '🤗',
    category: 'relationships',
    horizon: 'before-50',
  },
  {
    title: "Take a trip with your parents before it's too late",
    description: "While they're well enough to travel. Go somewhere they've always wanted to go.",
    emoji: '🌅',
    category: 'relationships',
    horizon: 'before-50',
  },
  {
    title: 'Create a home that feels like you',
    description:
      'Designed, considered, full of things that mean something. A place that tells your story.',
    emoji: '🏠',
    category: 'relationships',
    horizon: 'before-50',
  },
  {
    title: 'Do a serious meditation retreat (10+ days)',
    description:
      'Vipassana or equivalent. Ten days of silence resets how you relate to your own mind.',
    emoji: '🧘',
    category: 'mindfulness',
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
    category: 'reflection',
    horizon: 'before-50',
  },
  {
    title: 'Change your mind publicly on something important',
    description:
      "Find a belief you've held for years and genuinely re-examine it. Change it if the evidence warrants. Say so.",
    emoji: '🌓',
    category: 'reflection',
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
    category: 'relationships',
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
    category: 'health',
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
    category: 'health',
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
 * Ideas that are tied to a specific place, not doable anywhere.
 *
 * Travel ideas are almost all place-specific by default, so the whole
 * category is marked `specific-place` without listing each one. This set
 * covers the non-travel ideas that still require being somewhere specific.
 */
const SPECIFIC_PLACE_SLUGS: ReadonlySet<string> = new Set([
  // Food
  'eat-street-food-in-bangkok',
  'eat-at-the-source-coffee-in-ethiopia-tea-in-japan-chocolate-in-ecuador',
  'eat-your-way-through-a-country-one-market-at-a-time',
  'take-a-cooking-class-in-the-country-the-cuisine-is-from',
  // Adventure
  'run-with-the-bulls-in-pamplona',
  'dive-the-blue-hole-in-belize',
  'sleep-under-the-stars-in-the-sahara',
  'paraglide-over-the-swiss-alps',
  'climb-el-capitan-in-yosemite',
  'hike-the-appalachian-trail-end-to-end',
  'hike-the-pacific-crest-trail',
  'trek-across-iceland',
  'kayak-the-grand-canyon',
  'dog-sled-in-alaska',
]);

function locationForIdea(category: ExperienceCategory, slug: string): ExperienceLocation {
  if (category === 'travel') return 'specific-place';
  if (SPECIFIC_PLACE_SLUGS.has(slug)) return 'specific-place';
  return 'anywhere';
}

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
  const push = (
    title: string,
    category: ExperienceCategory,
    emoji: string,
    location: ExperienceLocation = 'anywhere'
  ) => {
    const key = title.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ title, category, emoji, location });
  };

  for (const category of EXPERIENCE_CATEGORIES) {
    const group = EXPERIENCES_BY_CATEGORY[category];
    for (const title of group.ideas) {
      push(title, category, group.emoji, locationForIdea(category, slugify(title)));
    }
  }
  for (const m of MILESTONES) push(m.title, m.category, m.emoji);
  for (const d of DESTINATIONS) push(d.name, 'travel', '✈️', 'specific-place');

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
  location: ExperienceLocation;
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

// ─── Idea descriptions ───────────────────────────────────────────────────────

/**
 * A written line for each of the 147 ideas that had only a title.
 *
 * Keyed by slug rather than title, so an idea can be reworded without
 * orphaning its description. These are what let those entries have a page:
 * before them, `/experiences/<slug>` would have been a heading and nothing
 * else, which is a thin page, and thin pages are a site-wide signal.
 */
const IDEA_DESCRIPTIONS: Record<string, string> = {
  'see-the-northern-lights-in-iceland-or-norway':
    'Aurora forecasts are a gamble. Clear skies, dark months, and most people waiting several cold nights for one good hour.',
  'walk-the-camino-de-santiago-800km-across-spain':
    'Roughly five weeks from the French border, and your feet set the schedule. Beds in albergues cost a few euros.',
  'safari-in-the-serengeti-at-sunrise':
    'A cold open-sided jeep and a 5am start, because the cats hunt before the heat arrives and then sleep.',
  'visit-all-seven-wonders-of-the-world':
    'Petra, the Colosseum, Chichen Itza, Christ the Redeemer, the Great Wall, Machu Picchu, the Taj. Four continents, years of planning.',
  'see-the-cherry-blossoms-in-kyoto-japan':
    'Peak bloom lasts about a week and shifts by a fortnight each year. Book early, then accept the forecast moves.',
  'drive-route-66-end-to-end-across-america':
    'Chicago to Santa Monica, about 2,400 miles. Much of it is now frontage road, faded neon, and towns the interstate skipped.',
  'spend-a-week-in-antarctica':
    'Two days crossing the Drake Passage before you see land. Expensive, tightly seasonal, and the seasickness is not a rumour.',
  'swim-in-the-dead-sea':
    'Ten times saltier than the ocean, so you float without trying. Any cut on your skin will announce itself.',
  'watch-the-sunrise-from-machu-picchu-peru':
    'The first bus out of Aguas Calientes leaves before 5am and the queue starts earlier. Cloud often wins anyway.',
  'take-the-trans-siberian-railway-across-russia':
    'Seven days, eight time zones, a samovar at the end of each carriage. Bring food, cards, and low expectations of privacy.',
  'sail-the-greek-islands-for-a-week':
    'Short hops between anchorages, meltemi winds through August, dinner wherever you tie up. Crewed charters exist if you cannot sail.',
  'see-the-great-barrier-reef':
    '1,400 miles of coral, roughly half the cover lost since 1995. Go to the outer reef, not the day-tour pontoons.',
  'visit-the-taj-mahal-at-dawn':
    'Gates open at sunrise and the marble runs pink to white within an hour. Closed Fridays for prayer.',
  'explore-the-amazon-rainforest':
    'Humidity you wear, and most wildlife heard rather than seen. A local guide is the difference between a green wall and a forest.',
  'see-the-midnight-sun-in-scandinavia':
    'Above the Arctic Circle in June the sun never drops. Sleep becomes a decision instead of a response.',
  'road-trip-across-new-zealand':
    'Both islands in three weeks is rushing. South Island distances look small on the map and drive twice as long.',
  'see-the-pyramids-of-giza':
    "They stand at the edge of Cairo's sprawl, not alone in empty desert. Built before the last mammoths died.",
  'trek-to-everest-base-camp':
    'Twelve days up, four down, and 5,364 metres doing most of the work on your lungs. Altitude ignores fitness.',
  'visit-the-temples-of-angkor-wat-cambodia':
    'Over 400 square kilometres of ruins. Three days barely covers it, and the crowds thin sharply by mid-afternoon.',
  'ride-the-orient-express':
    'The revived Venice Simplon route runs a handful of times a year, costs thousands, and enforces black tie at dinner.',
  'visit-all-50-us-states':
    'Alaska and Hawaii are the two that stall people. Most who finish do it in clusters across a decade.',
  'see-the-tulip-fields-in-the-netherlands':
    'Six weeks in April and May, then the heads are cut so the bulbs fatten. Rent a bike outside Keukenhof.',
  'hike-through-patagonia':
    'Wind that knocks you sideways and four seasons before lunch. The W circuit in Torres del Paine takes five days.',
  'experience-carnival-in-rio-de-janeiro':
    'Five days, street blocos from dawn, and Sambadrome parades running until sunrise. Accommodation triples in price a year ahead.',
  'skydive-from-15-000-feet':
    'About sixty seconds of freefall before the canopy opens. Tandem needs no training, just a morning and a signature.',
  'bungee-jump-off-a-bridge':
    'The stall at the edge is the hard part, not the fall. Operators count down so you stop deliberating.',
  'climb-a-mountain-over-4-000-metres':
    'Mont Blanc, Kilimanjaro, and dozens of Colorado peaks qualify. Acclimatise slowly; altitude sickness ignores how strong your legs are.',
  'surf-a-wave-over-10-feet':
    'Two-storey faces, long hold-downs, and years of smaller water first. Never paddle out on a big day alone.',
  'swim-with-humpback-whales':
    'Tonga and the Dominican Republic license it. They are the length of a bus and decide how close you get.',
  'run-with-the-bulls-in-pamplona':
    '825 metres in about three minutes, and people are gored most years. Run sober or watch from a balcony.',
  'white-water-raft-a-class-v-river':
    'Continuous rapids where a swim is genuinely dangerous. Guided trips exist, but you still paddle hard on command.',
  'hike-the-appalachian-trail-end-to-end':
    '2,190 miles, five to seven months, and roughly one in four who start reach Katahdin.',
  'dive-the-blue-hole-in-belize':
    'A sinkhole 124 metres deep with stalactites hanging at forty. Dark, narcotic, and advanced certification is not optional.',
  'sleep-under-the-stars-in-the-sahara':
    'No light pollution for hundreds of miles, and near-freezing by 3am. Bring more layers than feels reasonable at noon.',
  'paraglide-over-the-swiss-alps':
    'Tandem flights from Interlaken need a short run off the slope and about twenty minutes of your day.',
  'cage-dive-with-great-white-sharks':
    'Gansbaai, Guadalupe, or the Farallones. The cage removes the danger and none of the reaction in your chest.',
  'climb-el-capitan-in-yosemite':
    '3,000 feet of granite and usually a night sleeping on a portaledge. Years of trad climbing come before it.',
  'ride-a-motorcycle-across-a-country':
    'Six hours in the saddle is a long day, and weather arrives without a windscreen. Plan for breakdowns.',
  'complete-an-ironman-triathlon':
    '3.8km swim, 180km ride, then a marathon. Six-month plans run about twelve training hours a week.',
  'hike-the-pacific-crest-trail':
    '2,650 miles from Mexico to Canada, with snow at both ends of the window. Permits are capped daily.',
  'go-on-a-polar-expedition':
    'Hauled sledges, minus forty, and no rescue within hours. Guided crossings cost about what a car costs.',
  'zipline-through-a-rainforest-canopy':
    'Thirty metres up on a steel cable, moving fast enough that the canopy blurs. Costa Rica built the template.',
  'learn-to-free-solo-climb':
    'No rope means no second mistake. Almost everyone who does it spent a decade roped on the same routes first.',
  'do-a-polar-bear-plunge':
    'Cold shock takes your breath in the first ten seconds. Get out before your hands stop obeying you.',
  'drive-a-racecar-at-full-speed':
    'Track days put you in a caged car with an instructor beside you. The braking, not the speed, surprises people.',
  'go-canyoneering':
    'Abseiling into slot canyons where the only way out is downstream. Check the forecast; flash floods start storms away.',
  'trek-across-iceland':
    'The Laugavegur takes four days. The full north-south crossing takes weeks, over unbridged rivers and grey volcanic sand.',
  'kayak-the-grand-canyon':
    '277 river miles and roughly three weeks, gated by a private permit lottery most applicants lose for years.',
  'dog-sled-in-alaska':
    'Fourteen dogs pulling harder than you expect. Once they settle, the only sound is runners cutting through snow.',
  'write-and-finish-a-novel':
    'The finishing is the rare part. Eighty thousand words at five hundred a day is about six months.',
  'learn-to-play-a-musical-instrument':
    'The first three months sound bad, and that is the whole test. Twenty minutes daily beats a weekend binge.',
  'paint-something-you-re-proud-to-hang-on-a-wall':
    'The first dozen canvases go in a cupboard. Somewhere after that the hand catches up with the eye.',
  'learn-to-cook-10-world-cuisines-from-scratch':
    'Start with the pantry, not the recipes. A shelf of fish sauce, gochujang, and dried chillies does most of the work.',
  'record-a-song-and-release-it':
    'A laptop, an interface, and a quiet room will do. Distribution to the streaming services costs about twenty pounds a year.',
  'perform-on-a-stage-in-front-of-a-crowd':
    'Nerves peak in the wings, not under the lights. Open mics exist so the first time costs nothing.',
  'learn-a-new-language-to-conversational-fluency':
    'Roughly 600 hours for a close language, double that for Mandarin or Arabic. Speaking badly early is the shortcut.',
  'design-and-build-something-with-your-hands':
    'A shelf, a bike, a bread oven. The measuring is slow and the mistakes stay visible for years.',
  'take-a-photograph-that-stops-people-in-their-tracks':
    'Thousands of frames for the one. Light and timing decide it far more than the camera you own.',
  'write-your-memoir':
    'Not everything that happened, only what it meant. Most first drafts are far too kind to the writer.',
  'learn-calligraphy':
    'Broad nib, ink, and the same letterform a hundred times. The pleasure is the repetition, not the finished card.',
  'create-a-short-film':
    'Ten minutes takes a weekend to shoot and a month to cut. Sound is what makes it look expensive.',
  'take-a-pottery-class-and-make-a-finished-piece':
    'Centring the clay defeats most beginners for several sessions. Expect a third of your pieces to crack in the kiln.',
  'learn-watercolour-painting':
    'Unforgiving. The paper records every hesitation and nothing can be painted over, so the trick is leaving white alone.',
  'design-and-make-your-own-clothes':
    'A pattern, a machine, and a great deal of unpicking. Fit on your own body is the reward.',
  'build-a-piece-of-furniture-from-scratch':
    'A stool before a table. Wood moves with the seasons, which is why joints matter more than screws.',
  'start-a-podcast':
    'Most die at episode seven. One cheap dynamic microphone and a consistent day of the week beat any gear list.',
  'perform-stand-up-comedy':
    'Five minutes takes months to write and dozens of open mics to sand down. Silence teaches faster than laughter.',
  'choreograph-and-perform-a-dance':
    'Counting eights until the shape holds, then discovering what the body does differently once someone is watching.',
  'compose-an-original-piece-of-music':
    "Eight bars that are genuinely yours is harder than an hour of other people's. The notation software is free.",
  'illustrate-a-children-s-book':
    'Thirty-two pages, the same character recognisable in every spread, and the pictures carrying what the words leave out.',
  'throw-a-kiln-fired-ceramic-pot':
    'Wedge, centre, pull, dry slowly, glaze, fire. Six stages, and any one of them can take the piece from you.',
  'learn-to-draw-portraits':
    'The eyes sit halfway down the skull, which nobody believes until they measure. Start with faces you already know.',
  'write-and-perform-spoken-word-poetry':
    'Written for the ear, so it only exists out loud. Most pieces change shape in the final rehearsal.',
  'publish-an-article-in-a-magazine':
    'Pitch before you write. Three paragraphs, a clear angle, and a reason it has to be you.',
  'learn-to-fly-a-plane':
    'Hands on the yoke within ten minutes of the first lesson. Landing is the part that takes forty attempts.',
  'start-and-grow-a-business':
    'Revenue before polish. Most of year one is finding out who actually pays, and what they think they bought.',
  'earn-a-black-belt-in-a-martial-art':
    'Four to six years of turning up twice a week. The belt marks the end of the beginning.',
  'become-fluent-in-a-second-language':
    'Fluent means arguing, joking, and handling a phone call. That sits several years past ordering dinner confidently.',
  'read-52-books-in-a-year':
    'About forty pages a day. Abandoning books that are not working is part of the method, not a failure.',
  'become-completely-debt-free':
    'The final payment feels smaller than expected. The change is in what the monthly numbers stop deciding for you.',
  'meditate-every-day-for-365-days':
    'Ten minutes counts. What matters is what happens after month one, when it has become reliably boring.',
  'learn-to-code-and-ship-an-app':
    "Shipping is a separate skill from writing code: deploys, sign-ups, and someone else's browser breaking it quietly.",
  'climb-the-corporate-ladder-to-a-role-you-dreamed-of':
    'Visible work over years, plus a few people willing to say your name in rooms you are not in.',
  'compete-in-a-national-championship':
    'Qualifying standards are published years ahead. Most of the field trains around a full-time job to meet them.',
  'earn-a-postgraduate-degree':
    'One to five years, often alongside work, ending in a thesis few people read and one mind permanently rewired.',
  'break-a-personal-athletic-record':
    'Progressive overload and patience. Records usually fall in sessions that felt completely unremarkable at the time.',
  'master-a-complex-card-trick':
    'Sleight of hand only looks casual after a thousand repetitions in front of a mirror. The patter takes as long.',
  'memorise-a-long-poem-or-speech':
    'The method of loci, or brute repetition. Either takes a few weeks and then stays available for decades.',
  'build-an-investment-portfolio':
    'Boring wins: low fees, broad index funds, and not touching anything the month the numbers drop.',
  'complete-a-tough-mudder':
    'Ten miles, twenty-odd obstacles, and mud you find days later. Strangers pull each other over the walls.',
  'do-100-push-ups-in-a-row':
    'Small sets scattered through the day beat one hard session. Most plans get there in a couple of months.',
  'become-a-certified-scuba-diver':
    'Open Water takes four days, and about twenty dives before you stop thinking about your own breathing.',
  'get-a-pilot-s-licence':
    'Forty logged hours minimum, a written exam, a medical, and a check ride. Budget well past the advertised figure.',
  'compete-in-an-obstacle-course-race':
    'Grip strength decides more of these than running does. Hang from a bar twice a week for a season.',
  'solve-a-rubik-s-cube-in-under-a-minute':
    'Learn the beginner method, then drill it. Sub-minute takes a few weeks and no unusual talent.',
  'complete-a-100-mile-ultramarathon':
    'Twenty-four to thirty-six hours, much of it walking, with a crew handing you food you no longer want.',
  'qualify-for-the-boston-marathon':
    'A certified course and a time that tightens each year. The real cutoff has beaten the published standard since 2011.',
  'volunteer-abroad-for-at-least-a-month':
    'Pick an organisation that would exist without you. The skills they lack beat the enthusiasm they already have.',
  'reconnect-with-someone-you-ve-lost-touch-with':
    'The awkward first message is shorter than you think. Most people are glad, and assumed you had moved on.',
  'host-a-dinner-party-for-20-people':
    'Cook one thing that scales and buy the rest. A host still in the kitchen at nine has planned wrong.',
  'make-a-close-friend-in-another-country':
    'It takes more than a good week together. It takes the messages afterwards, across time zones, for years.',
  'mentor-someone-just-starting-out-in-your-field':
    'An hour a month and honest answers. What they need is the map, not the encouragement.',
  'attend-a-world-class-sporting-event-live':
    "Television flattens the speed. Sit high enough to read the shape of the play rather than the players' faces.",
  'tell-the-most-important-people-in-your-life-why-they-matter':
    'Specific beats general. Name the thing they did and roughly when, not their qualities in the abstract.',
  'throw-a-surprise-party-that-genuinely-surprises-someone':
    'One leak ends it. Fewer people in on it, and a cover story boring enough to sound like a Tuesday.',
  'join-a-community-choir-or-theatre-group':
    'Most of them do not audition. You will be the worst there for a season, alongside people who once were.',
  'take-a-road-trip-with-your-best-friends':
    'The long silences in the car are the point. Book less than feels safe and leave afternoons unplanned.',
  'write-heartfelt-letters-to-10-people-who-changed-your-life':
    'Handwritten, posted, no reply expected. Several will keep it in a drawer for the rest of their lives.',
  'spend-a-week-with-your-grandparents-or-elders':
    'Bring a recorder and ask about the years before you existed. Nobody regrets the tape; plenty regret not making it.',
  'host-a-family-reunion':
    'Somebody has to send the first message to forty people. The logistics are dull and the room is not.',
  'learn-someone-s-language-to-have-a-conversation-with-them':
    "Enough to sit at their mother's table and follow the joke. Fluency is optional; the effort is legible.",
  'attend-a-multi-day-music-festival':
    'Three days of standing, poor sleep, and one set you will still describe in twenty years. Bring earplugs.',
  'do-a-group-charity-challenge-with-friends':
    'Training together is most of it. The fundraising page gets awkward around the third ask, and works anyway.',
  'create-a-family-cookbook-with-old-recipes':
    'The measurements will be missing. Cook alongside whoever wrote them and record what their hands actually do.',
  'organise-a-neighbourhood-event':
    'A street closure form, twenty flyers, and borrowed trestle tables. Most neighbours say yes once somebody else has started.',
  'get-married-or-celebrate-a-long-term-partnership':
    'The vows outlast the catering. Smaller rooms tend to hold more of what people actually came for.',
  'spend-a-month-living-with-a-foreign-family':
    'Meals are where the language happens. A month is long enough to stop being treated as a guest.',
  'teach-a-skill-you-re-good-at-to-a-group-of-strangers':
    'You will find the holes in your own understanding within ten minutes. Prepare less and demonstrate more.',
  'have-a-meaningful-conversation-with-a-complete-stranger-every-week-for-a-year':
    'Fifty-two openings, and the first question is the whole skill. Ask what they are working on, then stop talking.',
  'co-write-something-with-a-friend':
    'Two hands on one document tests a friendship early. Agree who holds the final cut before the first draft.',
  'show-up-for-someone-in-a-crisis-without-being-asked':
    'Do not ask what they need. Bring food, run the laundry, sit there. An offer is a task; presence is not.',
  'celebrate-someone-else-s-milestone-as-if-it-were-your-own':
    'Turn up, take the photographs, make the toast. The absence of envy is the whole thing, and it is practised.',
  'plant-1-000-trees':
    'Native species, right site, and somebody watering through three summers. Survival rate matters far more than the number planted.',
  'fund-a-child-s-education-for-a-year':
    'Fees, uniform, and books run to a few hundred pounds a year in much of the world. Ask the school directly.',
  'build-something-that-outlasts-you':
    'A trust, a trail, an institution with its own funding. It only counts once it runs without you.',
  'raise-money-for-a-cause-you-deeply-believe-in':
    'The first ten donations come from people who would have given you the money anyway. The next hundred need a reason.',
  'donate-anonymously-and-tell-no-one':
    'No receipt, no thank-you note, no post about it. Find out what the impulse is worth when nobody is counting.',
  'start-a-scholarship-fund':
    'An endowment needs capital. An annual award needs only a cheque and a school willing to administer it.',
  'build-a-school-or-library-in-an-underserved-community':
    'The building is the easy part. Teachers, salaries, and maintenance are what quietly fail in year three.',
  'volunteer-at-a-hospital-for-a-year':
    'Mostly directions, tea, and sitting with patients whose families cannot get there. Weekly shifts, and nothing about it photographs well.',
  'teach-english-in-a-developing-country':
    'A CELTA takes a month and separates you from volunteers who leave a class worse than they found it.',
  'adopt-or-foster-a-child':
    'Approval runs six months to two years of assessment. Teenagers are where the shortage of placements actually sits.',
  'donate-a-kidney-or-be-a-living-donor':
    'One night in hospital, six weeks off work, and a stranger comes off dialysis. Long-term donor risk stays near baseline.',
  'leave-a-legacy-gift-to-a-charity-in-your-will':
    'One clause and a registered charity number. Costs nothing now and moves more than most people give while living.',
  'start-a-foundation':
    'Trustees, registration, and annual accounts. Below a certain size the reporting burden outweighs everything it manages to give away.',
  'clean-up-a-beach-or-river-in-your-community':
    'Two hours, gloves, and a shared bin bag. Log what you find; the data travels further than the litter.',
  'create-a-free-resource-that-helps-thousands-of-people':
    'One good guide, kept current for years. The maintenance is what separates it from thousands of abandoned ones.',
  'advocate-for-a-policy-change-you-believe-in':
    'Committee submissions, one councillor at a time, and years of no. Then it passes and everyone calls it obvious.',
  'feed-a-hundred-families':
    'A food bank moves more per pound than a collection tin. Ask what they are short of before buying anything.',
  'sponsor-a-refugee-family':
    'Housing, a bank account, school places, and a year of phone calls. Community sponsorship schemes exist in most countries.',
  'run-for-local-office':
    'Signatures, a deposit, and hundreds of doors. Local seats turn on a few hundred votes, and often nobody else stands.',
  'start-a-community-garden':
    'Permission from a landowner, a water supply, and six people who still turn up in November. Plots fill faster than volunteers.',
  'write-a-book-that-changes-someone-s-life':
    'You will never know which reader it was. Write the thing you needed and could not find.',
  'give-blood-50-times-in-your-life':
    'Every twelve weeks, an hour each time. Fifty donations is roughly fifteen years of quietly turning up.',
  'reduce-your-carbon-footprint-to-near-zero':
    'Flights, home heating, and beef account for most of it. The last tonne costs far more effort than the first five.',
  'build-homes-with-habitat-for-humanity':
    'No trade skills required on site. Framing, painting, and the family who will live there working the same shift.',
  'leave-a-place-cleaner-and-more-hopeful-than-you-found-it':
    'The measure is what is still standing a year after you left, and whether anyone there mentions your name.',
  // ─── Relationships ──────────────────────────────────────────────────────
  'ask-forgiveness-from-someone-you-hurt':
    'The conversation is shorter than the dread. Most people are more ready to forgive than you expect.',
  'forgive-someone-who-hurt-you':
    'Forgiveness is for you, not them. Carrying a grievance costs energy you could spend elsewhere.',
  'have-one-real-conversation-with-a-grandparent-before-it-is-too-late':
    'Ask about their life, their mistakes, what they would do differently. The window closes without warning.',
  'repair-a-relationship-you-damaged':
    'The call you have been putting off. Make it. Most repairs are easier than the silence that precedes them.',
  'write-a-letter-to-someone-who-changed-your-life-and-send-it':
    'Do not wait for a funeral to say it. A handwritten letter carries weight no email can match.',
  'spend-a-week-with-each-of-your-parents-while-they-are-well-enough-to-travel':
    'Go somewhere they have always wanted. The trip matters less than the time, which you cannot get back.',
  // ─── Food & Culinary ─────────────────────────────────────────────────────
  'eat-street-food-in-bangkok':
    'Yaowarat Road after dark. Follow the longest queue that is not a tour group and order what they are having.',
  'bake-sourdough-weekly-for-a-year':
    'A living starter, weekly feedings, and a year of learning that bread is mostly patience and timing.',
  'forage-for-wild-mushrooms':
    'Go with someone who knows. One wrong species in the basket is a hospital trip, so never guess.',
  'make-cheese-from-scratch':
    'Milk, rennet, salt, and patience. Ricotta takes an afternoon; aged cheeses take months and a cave.',
  'eat-at-a-3-star-michelin-restaurant':
    'A meal engineered to the last gram. Book months ahead, accept the tasting menu, and do not photograph every plate.',
  'brew-your-own-beer-or-wine':
    'A basic extract kit takes one afternoon and two weeks of waiting. The first bottle is never the best one.',
  'grow-something-you-can-eat-from-seed-to-plate':
    'A balcony herb, a tomato plant, a full vegetable patch. The taste gap between garden and supermarket is startling.',
  'eat-a-meal-cooked-by-a-grandmother-in-her-home':
    'Eat With Locals or a slow-food network connects you. The recipes are unwriteable, and the welcome is the point.',
  'master-one-dish-so-well-you-could-teach-it':
    'Pick one thing. Make it twenty times. By the tenth you stop reading the recipe; by the twentieth you are adjusting it.',
  'roast-your-own-coffee-beans':
    'A popcorn popper and green beans from a single estate. First crack, second crack, and a week to rest before brewing.',
  'preserve-a-season-jam-pickle-ferment':
    'Strawberries in June become January jam. Pickling, fermenting, and preserving turn a glut into a pantry.',
  'eat-at-the-source-coffee-in-ethiopia-tea-in-japan-chocolate-in-ecuador':
    'Drink coffee in a Yirgacheffe ceremony, tea in a Uji teahouse, chocolate from a Montañita cacao farm. Three trips, one thesis.',
  'cook-a-whole-animal-from-nose-to-tail':
    'A pig, a lamb, or a goat. Nothing wasted, every cut used. It changes how you think about meat and the animal it came from.',
  'make-pasta-from-scratch':
    'Flour, eggs, a board, and a rolling pin. Fresh tagliatelle takes an hour and ruins dried pasta for you permanently.',
  'eat-something-you-foraged-or-caught-yourself':
    'A fish you caught, mushrooms you picked, greens you gathered. The shortest food chain you will ever eat from.',
  'take-a-cooking-class-in-the-country-the-cuisine-is-from':
    'A morning market tour, an afternoon at the stove, and eating what you made. Thailand, Italy, Japan, Vietnam all do this well.',
  'bake-a-wedding-cake-for-someone-you-love':
    'Three tiers, two days of work, and a level of stress that only love justifies. It will not be perfect and that is fine.',
  'learn-to-butcher-a-whole-fish':
    'A whole fish, a sharp knife, and a YouTube tutorial. Filleting, skinning, and using the bones for stock.',
  'ferment-something-for-the-first-time':
    'Sauerkraut, kimchi, or kefir. Salt, time, and trusting bacteria you cannot see. The smell is the sign it is working.',
  'eat-a-12-course-tasting-menu':
    'Three hours, twelve small plates, and a pacing that turns a meal into a journey. Let the sommelier pair each course.',
  'make-your-own-condiments-from-scratch':
    'Ketchup, mayonnaise, mustard, hot sauce. Each one takes an hour and makes the supermarket version taste like plastic.',
  'cook-a-meal-over-an-open-fire':
    'Cast iron, hardwood coals, and no thermostat. The smoke flavours everything and the timing is entirely by feel.',
  'eat-your-way-through-a-country-one-market-at-a-time':
    'Skip the restaurants for a week. Eat only from markets, street stalls, and bakeries. The country tastes different this way.',
  // ─── Health & Vitality ───────────────────────────────────────────────────
  'walk-10-000-steps-a-day-for-a-month':
    'Roughly seven kilometres, or ninety minutes. The first week feels excessive; by the fourth it is just how you move.',
  'hike-weekly-for-a-year':
    'Fifty-two weekends, fifty-two trails. By spring you know your boots; by autumn you are choosing harder routes.',
  'sleep-8-hours-a-night-for-30-days':
    'No alarm, no phone in the bedroom, and a consistent bedtime. The first week is hard; the last week is revelatory.',
  'cycle-coast-to-coast':
    'Four to six weeks, a loaded bike, and whatever weather the continent throws at you. Train for hills before you leave.',
  'take-a-cold-plunge-every-morning-for-a-month':
    'Two to three minutes in water under 15 degrees. The shock never stops being shocking, but your recovery gets faster.',
  'get-a-full-health-checkup-including-bloodwork':
    'Cholesterol, vitamin D, inflammatory markers, hormone panel. Know your baseline before something goes wrong.',
  'do-a-30-day-yoga-challenge':
    'Twenty minutes a day, every day, for a month. By day ten you stop fighting the poses; by day thirty you are different.',
  'learn-to-cook-10-healthy-meals-from-scratch':
    'Ten meals you can make without a recipe, each one nutritious. This is the single highest-impact health skill.',
  'swim-a-mile-without-stopping':
    'Roughly 64 lengths of a 25-metre pool. Takes six to twelve weeks of consistent training from a casual swimming base.',
  'walk-a-long-distance-trail-over-100km':
    'Four to seven days, a loaded pack, and weather you cannot control. The trail teaches you what your body can actually do.',
  'do-your-first-pull-up':
    'Most adults cannot do one. Negatives, hangs, and assisted bands for two to three months will get you there.',
  'run-your-first-5k':
    'Nine weeks with a couch-to-5K plan. The first session is ninety seconds of running. The last is thirty minutes straight.',
  'climb-your-first-mountain':
    'Pick a walk-up, not a technical climb. Six hours up, two down, and a view that photographs cannot carry.',
  'spend-a-year-strength-training':
    'Three sessions a week, progressive overload, and patience. The changes are invisible for six weeks and obvious by twelve.',
  'learn-to-meditate-for-20-minutes-straight':
    'Start with five. Add a minute every few sessions. Twenty minutes is where the mind genuinely starts to settle.',
  'fast-for-24-hours-at-least-once':
    'Water only, dinner to dinner. The hunger peaks at lunch and fades by afternoon. Break it gently, not with a feast.',
  'get-your-hearing-and-vision-checked':
    'Two appointments that most people postpone for a decade. Both decline slowly enough that you do not notice until it matters.',
  'spend-120-minutes-in-nature-every-week-for-a-year':
    'The research threshold for measurable wellbeing benefits. A park counts. A forest is better. A window does not.',
  'take-up-a-sport-you-have-never-tried':
    'Pick one you have no natural advantage in. Being bad at something new is the point, and the fastest way to learn humility.',
  'walk-every-street-in-your-neighbourhood':
    'Print a map, highlight as you go. Most people know three routes and miss the other two hundred.',
  'do-a-7-day-fitness-retreat':
    'Structured training, controlled meals, and no decisions for a week. Expensive, but it breaks patterns that months of willpower cannot.',
  'track-your-sleep-for-a-month-and-fix-what-you-find':
    'A watch, a notebook, and honest mornings. The data reveals patterns that willpower alone cannot fix.',
  'learn-to-swim-properly-as-an-adult':
    'Adult swim lessons exist at most pools. Six weeks of feeling awkward, then a skill that lasts the rest of your life.',
  'do-a-digital-sunset-no-screens-after-8pm-for-a-month':
    'The hardest hour is the first one. By week two you read, talk, or sleep earlier without thinking about it.',
  'hire-a-personal-trainer-for-3-months':
    'Three months of form correction and progressive programming. The investment is in technique you keep for decades.',
  // ─── Mindfulness ─────────────────────────────────────────────────────────
  'do-a-10-day-silent-meditation-retreat':
    'Vipassana or equivalent. Ten days, no talking, no phone, no reading. The silence is harder than the sitting.',
  'watch-a-sunrise-and-a-sunset-in-the-same-day':
    'Requires planning, not luck. Pick a day with a clear forecast, wake early, and find a west-facing spot for evening.',
  'do-a-solo-camping-trip-with-no-phone':
    'One night, a tent, and whatever sounds the forest makes after dark. The first night is restless; the second is different.',
  'take-a-tea-ceremony-class':
    'A Japanese chakai or a Chinese gongfu session. The ritual is the opposite of efficiency, which is the entire point.',
  'spend-a-day-in-complete-silence':
    'No talking, no music, no podcasts. Tell the people you live with first. The internal noise is louder than you expect.',
  'watch-a-meteor-shower-from-a-dark-sky-location':
    'Check the calendar for Perseids or Geminids. Drive an hour from city lights, bring a blanket, and stay until 2am.',
  'sit-with-a-dying-person-and-just-be-present':
    'No agenda, no fixing, no stories. Just sit. It is the hardest simple thing you will ever do.',
  'do-a-digital-detox-for-a-full-week':
    'Seven days, no screens. The withdrawal is real for the first two days. By day five, time moves at a different speed.',
  'practice-ichigo-ichie-treat-one-ordinary-day-as-unrepeatable':
    'A Japanese concept: one time, one meeting. Spend a day treating every interaction as if it will never happen again.',
  'walk-a-labyrinth-or-pilgrimage-slowly':
    'Not a maze but a single winding path to the centre. Walk it slowly. The pace is the practice, not the destination.',
  'spend-a-night-alone-in-the-wilderness':
    'A bivvy bag, a sleeping bag, and a clear forecast. No tent, no fire, just the sky and whatever sounds come with it.',
  'learn-to-identify-10-bird-species-by-song':
    'Start with five common ones. Learn the song before the name. By the tenth, a walk sounds completely different.',
  'spend-an-hour-watching-a-single-tree':
    'Pick one tree. Sit with it for an hour. Notice the light, the wind, the insects, the way it moves. Time slows down.',
  'take-a-slow-travel-trip-one-town-one-week-no-plan':
    'One small town, seven days, no itinerary. You learn what a place is when you stop trying to see all of it.',
  'spend-a-week-in-a-monastery-or-retreat-centre':
    'Buddhist, Christian, or secular. A week of structured silence, simple meals, and a rhythm that strips away the noise.',
  'learn-to-sit-with-discomfort-without-reaching-for-your-phone':
    'The gap between feeling uncomfortable and reaching for distraction is where attention lives. Widen it, one minute at a time.',
  'watch-a-storm-roll-in-from-start-to-finish':
    'Find a safe vantage point. Watch the clouds build, the wind shift, the rain arrive. Twenty minutes of weather as theatre.',
  'spend-a-full-day-with-no-screens':
    'One day, no phone, no laptop, no TV. The withdrawal passes by noon. The afternoon is unexpectedly long.',
  'take-a-forest-bathing-walk':
    'Shinrin-yoku: a slow, sensory walk through a forest. No destination, no pace, no goal except being there.',
  'create-a-morning-ritual-you-keep-for-a-year':
    'Not a routine but a ritual: something with meaning, not just efficiency. Keep it for 365 days and it becomes part of you.',
  'spend-a-night-stargazing-with-no-agenda':
    'A blanket, a dark sky, and no app telling you what to look at. Just look up. The longer you look, the more you see.',
  'do-a-walking-meditation-every-morning-for-a-month':
    'Twenty minutes, slow pace, attention on the feet. Different from sitting meditation and, for many people, easier to sustain.',
  'spend-an-afternoon-doing-one-thing-at-a-time':
    'No multitasking, no background audio, no tab-switching. One activity, fully attended. Harder than it sounds.',
  // ─── Reflection ──────────────────────────────────────────────────────────
  'record-your-parents-life-stories':
    'Audio or video, not just notes. Ask the questions you have never asked. Do it now, not when you wish you had.',
  'write-your-ethical-will-values-lessons-what-you-want-passed-down':
    'Not your financial will but your values. What you learned, what you got wrong, what you hope for the people who come after.',
  'write-a-letter-to-your-younger-self':
    'What would you tell the person you were ten, twenty, thirty years ago? Write it honestly. The exercise is for you, not them.',
  'write-a-letter-to-your-future-self-and-read-it-in-10-years':
    'Seal it, date it, and put it somewhere you will find it. The person who opens it will be a stranger you once knew.',
  'do-a-structured-life-review-decade-by-decade':
    'One afternoon, a notebook, and each decade of your life. What happened, what you learned, what you would do differently.',
  'create-a-photo-book-of-one-year-of-your-life':
    'One photo a week, fifty-two weeks. Not the highlights but the ordinary days. The book becomes a year you can hold.',
  'write-the-story-of-how-you-became-who-you-are':
    'Not a memoir for publication. The narrative of your own becoming, written for yourself. The act of writing changes the story.',
  'record-a-conversation-with-an-elder-and-preserve-it':
    'Audio or video. Ask about their childhood, their work, their regrets. The recording outlives the person. Do not wait.',
  'write-down-everything-you-know-about-your-family-history':
    'Names, dates, places, stories. Start with your parents, then grandparents. The information dies with the people who hold it.',
  'spend-a-day-reviewing-every-job-relationship-and-home-you-have-had':
    'One day, a notebook, and an honest accounting. What each one taught you, what you regret, and what you would repeat.',
  'write-your-obituary-the-way-you-would-want-it-read':
    'Not morbid but clarifying. What do you want to be remembered for? The gap between the obituary and your life is your to-do list.',
  'make-a-list-of-100-things-you-are-grateful-for':
    'Not a gratitude journal but a single exhaustive list. The first twenty are easy. The last twenty are where the practice works.',
  're-read-a-book-that-changed-your-life-and-see-what-you-notice-now':
    'You are different now. The book has not changed, but what you notice in it will reveal how you have.',
  'write-a-letter-to-someone-you-have-not-forgiven-and-then-decide-whether-to-send-':
    'Write it first, decide later. The writing does the work whether or not the letter ever leaves your hands.',
  'write-a-manifesto-for-how-you-want-to-live':
    'Not resolutions but principles. One page, written in your own voice, that you can re-read when you forget who you decided to be.',
  'spend-a-birthday-alone-reflecting-on-the-past-year':
    'No dinner, no party, no plans. A notebook, a walk, and an honest accounting of the year you just lived.',
  'write-down-your-core-values-and-check-them-against-how-you-actually-spend-your-t':
    'List your values on one side. List your calendar and bank statements on the other. The gap is where the work is.',
  'create-a-personal-annual-report':
    'Borrow the corporate ritual for yourself. What went well, what failed, what you learned, and what next year is for.',
  'write-a-forgiveness-letter-to-yourself':
    'You are the person you have been hardest on. Write the letter you would write to a friend who made your mistakes.',
  'spend-a-day-visiting-places-that-shaped-you':
    'The school, the first flat, the hospital, the park. Walk them slowly. The geography of a life is worth revisiting.',
  'write-the-speech-you-would-give-at-your-own-retirement':
    'What would you say about the working years? Write it now, while you can still change what it would say.',
  'make-a-timeline-of-the-five-most-important-moments-of-your-life':
    'Five moments, five lines each. The exercise is not in choosing them but in writing why they mattered.',
  'free-dive-to-20-metres':
    'A single breath, no tank, and twenty metres down. Takes six to twelve weeks of training and a competent buddy.',
  'summit-a-volcano':
    'Pick an active or dormant one. The crater at dawn, the sulfur, the scale — nothing else on earth feels quite like it.',
  'give-a-ted-talk':
    'A fifteen-minute idea worth spreading, delivered to a real audience. Apply through TEDx events to start.',
  'become-a-recognised-expert-in-your-field':
    'Not a job title but a reputation. Years of work, published thinking, and being the person others call first.',
  'patent-an-invention':
    'A novel, useful, non-obvious idea, filed and granted. Expensive and slow, but it is the legal record of making something new.',
  'win-a-competition-you-genuinely-trained-for':
    'Not a participation trophy. Something you trained for, lost at, and came back to win. The losing is what makes it count.',
  'get-featured-in-a-major-publication':
    "The New York Times, Wired, Nature, or your field's equivalent. Pitch the story, not yourself — editors want a narrative, not a CV.",
};

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
      const slug = slugify(title);
      add({
        slug,
        title,
        description: IDEA_DESCRIPTIONS[slug],
        emoji: group.emoji,
        category,
        kind: 'idea',
        location: locationForIdea(category, slug),
      });
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
      location: 'anywhere',
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
      location: 'specific-place',
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

// ─── First steps ─────────────────────────────────────────────────────────────

export type FirstStep = { title: string; body: string; emoji: string };

/** Region-specific practicality, so travel steps are not one paragraph reused 75 times. */
const REGION_NOTE: Record<DestinationRegion, string> = {
  europe: 'Shoulder season — May or September — is usually cheaper and less crowded than summer.',
  asia: 'Monsoon and dry season matter more than temperature here; check which months you want.',
  americas:
    'Distances are larger than they look on a map. Budget travel days, not just arrival dates.',
  'africa-middle-east':
    'Wildlife and heat both run on a calendar. The right month changes the trip entirely.',
  'oceania-antarctica':
    'Seasons are inverted, and the far south has a narrow window. Book further ahead than feels sensible.',
};

const HORIZON_NOTE: Record<MilestoneHorizon, string> = {
  'before-30': 'No deadline is real here. The list is a prompt, not a schedule.',
  'before-50': 'Most people who do this start before they feel ready for it.',
};

/**
 * The "how would I actually start" steps shown on an experience page.
 *
 * Deliberately not `generateQuestChain`. That one is templated purely on
 * category and title, so all 75 travel items produced the same four
 * paragraphs with a noun swapped — fine inside the app where a user sees one
 * of them, bad on 175 indexable pages where it is most of the body.
 *
 * These weave the entry's own data in: its description, its region or horizon,
 * and the person who did it. Two destinations in different regions no longer
 * read alike, and a milestone never reads like a destination.
 */
export function firstSteps(entry: ExperienceEntry): FirstStep[] {
  const steps: FirstStep[] = [];

  // The description is quoted rather than restated. It appears as the lead
  // paragraph directly above, and an unattributed repeat a few hundred pixels
  // later reads like a mistake; framing it as the claim being tested makes the
  // repetition deliberate and gives the step something to argue with.
  steps.push({
    emoji: '🔍',
    title: 'Check whether the promise holds',
    body: entry.description
      ? `“${entry.description}” That is the pitch. Spend an hour on first-hand accounts rather than listicles — what it costs, how long it really takes, and what people wish they had known.`
      : 'Spend an hour on first-hand accounts rather than listicles — what it costs, how long it really takes, and what people wish they had known.',
  });

  if (entry.kind === 'destination' && entry.region) {
    steps.push({
      emoji: '🗓️',
      title: 'Work out when to go',
      body: REGION_NOTE[entry.region],
    });
  } else if (entry.kind === 'milestone' && entry.horizon) {
    steps.push({
      emoji: '🗓️',
      title: 'Decide what "started" would look like',
      body: `${HORIZON_NOTE[entry.horizon]} Name the smallest thing that would count as having begun, and do that one.`,
    });
  }

  steps.push({
    emoji: '🪜',
    title: 'Find the small version first',
    body:
      entry.category === 'travel'
        ? 'Somewhere nearer will tell you whether you actually like this kind of trip, for a fraction of the cost.'
        : 'There is almost always a one-afternoon version. Do that before committing money or telling anyone.',
  });

  if (entry.famous) {
    steps.push({
      emoji: '👤',
      title: `Read how ${entry.famous.name} approached it`,
      body: `${entry.famous.name} ${entry.famous.note}. Other people's accounts are the cheapest research there is.`,
    });
  }

  steps.push({
    emoji: '📌',
    title: 'Put it somewhere you will see it',
    body: 'An intention you have not written down is a mood. A list you revisit is a decision you keep making.',
  });

  return steps;
}
