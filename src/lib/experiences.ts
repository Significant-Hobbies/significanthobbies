/**
 * The canonical corpus of experiences — the "what is possible" list.
 *
 * These 145 items used to live inside `src/app/bucket-list-ideas/page.tsx`, as
 * a const in a page component. That meant no other code could reach them:
 * every consumer that needed experiences kept its own copy. The live
 * suggestion engine in `bucket-list-insights.ts` had a private 52-item
 * SUGGESTION_POOL that was a near-duplicate of this list, so users were
 * offered suggestions from a third of the material the product already owned.
 *
 * Anything that needs "things a person could do" imports from here. The page
 * now renders this rather than owning it.
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

/** Every experience as a flat list, tagged with its category and emoji. */
export const ALL_EXPERIENCES: Experience[] = EXPERIENCE_CATEGORIES.flatMap((category) =>
  EXPERIENCES_BY_CATEGORY[category].ideas.map((title) => ({
    title,
    category,
    emoji: EXPERIENCES_BY_CATEGORY[category].emoji,
  }))
);
