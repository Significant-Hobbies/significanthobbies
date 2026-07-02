import type { Metadata } from 'next';
import Link from 'next/link';

import { Lumi } from '~/components/lumi';
import { BUCKET_ITEM_CATEGORIES, FAMOUS_BUCKET_LISTS } from '~/lib/famous-bucket-lists';

export const metadata: Metadata = {
  title: '1000+ Bucket List Ideas for 2025 — SignificantHobbies',
  description:
    'The ultimate bucket list ideas guide: travel, adventure, creative, achievement, social, and humanitarian goals. Curated from real bucket lists of famous people. Free to build yours.',
  openGraph: {
    title: "1000+ Bucket List Ideas — Curated from Famous People's Real Lists",
    description:
      'Find your next life goal. Browse bucket list ideas by category, inspired by Obama, Serena Williams, Richard Branson, and more.',
  },
  alternates: { canonical: 'https://significanthobbies.com/bucket-list-ideas' },
};

const IDEAS_BY_CATEGORY = {
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
} as const;

const CATEGORY_STYLES = {
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-400' },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  coral: {
    bg: 'bg-[#fff0ec]',
    border: 'border-[#f0a090]',
    text: 'text-[#e05533]',
    dot: 'bg-[#e05533]',
  },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400' },
  emerald: {
    bg: 'bg-foreground/10',
    border: 'border-foreground/20',
    text: 'text-foreground',
    dot: 'bg-foreground',
  },
};

export default function BucketListIdeasPage() {
  const totalIdeas = Object.values(IDEAS_BY_CATEGORY).reduce(
    (sum, cat) => sum + cat.ideas.length,
    0
  );

  return (
    <main className="bg-card">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-card pt-16 pb-10 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Lumi in a coral-tinted card */}
          <div className="flex items-center gap-5 rounded-2xl border border-[#f0a090] bg-[#fff0ec] px-6 py-5 mb-8 max-w-md">
            <Lumi size={80} glow float />
            <div>
              <p className="text-[#e05533] text-xs font-semibold uppercase tracking-widest mb-1">
                Guided by Lumi · {totalIdeas}+ ideas
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Curated from real bucket lists of presidents, athletes, and icons.
              </p>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance">
            Bucket list ideas <span className="text-[#e05533]">worth doing before you die</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl">
            Curated from the verified bucket lists of presidents, athletes, billionaires, and icons
            — then expanded to cover every kind of life well-lived.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
            >
              ✨ Build my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-[#e05533] hover:text-[#e05533] transition-colors"
            >
              See famous lists →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category nav ─────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {Object.entries(IDEAS_BY_CATEGORY).map(([key, cat]) => {
              const style = CATEGORY_STYLES[cat.color as keyof typeof CATEGORY_STYLES];
              return (
                <a
                  key={key}
                  href={`#${key}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${style.bg} ${style.border} ${style.text}`}
                >
                  {cat.emoji} {cat.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Ideas by category ────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {Object.entries(IDEAS_BY_CATEGORY).map(([key, cat]) => {
          const style = CATEGORY_STYLES[cat.color as keyof typeof CATEGORY_STYLES];
          const catInfo = BUCKET_ITEM_CATEGORIES[key as keyof typeof BUCKET_ITEM_CATEGORIES];
          return (
            <section key={key} id={key} className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl border ${style.border} ${style.bg} flex items-center justify-center text-xl`}
                >
                  {cat.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground text-balance">{cat.label}</h2>
                  <p className={`text-sm ${style.text} font-medium`}>{cat.ideas.length} ideas</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {cat.ideas.map((idea, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} px-4 py-3 group`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                    <span className="text-sm text-foreground leading-relaxed">{idea}</span>
                  </div>
                ))}
              </div>

              {/* Famous person who did something in this category */}
              {(() => {
                const famous = FAMOUS_BUCKET_LISTS.filter((p) =>
                  p.items.some((item) => item.category === key && item.status === 'done')
                ).slice(0, 2);
                if (famous.length === 0) return null;
                return (
                  <div className={`rounded-xl border ${style.border} ${style.bg} px-5 py-4`}>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${style.text} mb-3`}
                    >
                      Famous people who checked {cat.label.toLowerCase()} off their list
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {famous.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/bucket-lists/${p.slug}`}
                          className="inline-flex items-center gap-2 text-sm text-foreground hover:text-foreground font-medium transition-colors"
                        >
                          <span>{p.emoji}</span>
                          <span>{p.name}</span>
                          <span className="text-muted-foreground/60 text-xs">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </section>
          );
        })}
      </div>

      {/* ── Lumi CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#fff0ec] border-t border-[#f0a090]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Found something that speaks to you?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lumi tracks your bucket list, shows your personality archetype, and matches you to the
            famous person whose ambitions look most like yours.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
            >
              ✨ Start my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:border-[#e05533] transition-colors"
            >
              Browse famous lists →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
