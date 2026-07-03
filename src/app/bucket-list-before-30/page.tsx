import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';
import { Lumi } from '~/components/lumi';

export const metadata: Metadata = {
  title: '50 Things to Do Before You Turn 30 — Your Ultimate Bucket List',
  description:
    '50 bucket list goals worth achieving before 30: backpack SE Asia, fall in love, start something, negotiate your first raise, skydive, write something real. Real and varied — not a travel brochure.',
  openGraph: {
    title: '50 Things to Do Before You Turn 30',
    description:
      'Travel, career, love, adventure, and creativity — 50 bucket list goals that define what your 20s are actually for.',
  },
  alternates: { canonical: 'https://significanthobbies.com/bucket-list-before-30' },
};

const ITEMS: { emoji: string; title: string; desc: string }[] = [
  // Travel
  {
    emoji: '🌏',
    title: 'Backpack through Southeast Asia',
    desc: 'Thailand, Vietnam, Indonesia, Cambodia — go slow, stay in hostels, let it change you.',
  },
  {
    emoji: '🚂',
    title: 'Do a spontaneous Eurotrip',
    desc: 'Interrail or a one-way flight. No fixed itinerary. See where you end up.',
  },
  {
    emoji: '🗾',
    title: 'Spend a month in Japan',
    desc: 'Tokyo, Kyoto, the countryside. Japan rewards slowness in a way no quick trip can.',
  },
  {
    emoji: '🌊',
    title: 'Sleep on a beach under the stars',
    desc: 'Not a resort beach — a proper, remote, no-WiFi, fire-lit beach.',
  },
  {
    emoji: '🏔️',
    title: 'Hike a mountain that scares you',
    desc: 'Not a walk with a view. A summit that requires training, early starts, and real effort.',
  },
  {
    emoji: '🌍',
    title: 'Visit a country you know nothing about',
    desc: 'No guidebook research. Just go and figure it out.',
  },
  {
    emoji: '🗺️',
    title: 'Road trip with no fixed destination',
    desc: 'Pick a direction. Drive. Stop when something looks interesting.',
  },
  {
    emoji: '🏝️',
    title: 'Take a trip completely alone',
    desc: 'One week, solo, somewhere unfamiliar. The most formative thing you can do in your 20s.',
  },
  // Career & achievement
  {
    emoji: '🚀',
    title: 'Start something — a business, blog, or side project',
    desc: "It doesn't have to succeed. It has to exist.",
  },
  {
    emoji: '💼',
    title: 'Get fired from a job once',
    desc: "Or quit spectacularly. Either way, learn that it doesn't end you.",
  },
  {
    emoji: '💰',
    title: 'Negotiate your first raise',
    desc: 'Ask, explicitly, with a number. The fear is worse than the conversation.',
  },
  {
    emoji: '📈',
    title: 'Invest your first serious money',
    desc: 'An index fund, a startup, or a skill — something that compounds.',
  },
  {
    emoji: '🎤',
    title: 'Give a public talk or presentation',
    desc: 'Voluntarily. About something you know well enough to defend.',
  },
  {
    emoji: '✍️',
    title: 'Write something and publish it',
    desc: 'An essay, a story, a thread — something with your name on it, for public eyes.',
  },
  {
    emoji: '🧠',
    title: 'Become genuinely good at one thing',
    desc: 'Not competent. Good. The kind that earns you a reputation.',
  },
  {
    emoji: '🌐',
    title: 'Work or intern in another country',
    desc: 'Even six months abroad rewires how you understand work and belonging.',
  },
  // Social & relationships
  {
    emoji: '❤️',
    title: 'Fall in love',
    desc: 'Actually — not performatively. The uncomfortable, inconvenient, transforming kind.',
  },
  {
    emoji: '🤝',
    title: 'Make a best friend in a foreign country',
    desc: 'A real one who you still text five years later.',
  },
  {
    emoji: '👴',
    title: 'Have one real conversation with a grandparent',
    desc: "About their life, their mistakes, what they'd do differently. Before it's too late.",
  },
  {
    emoji: '🎉',
    title: 'Throw a party worth remembering',
    desc: 'Plan it properly. Invite the right mix of people. Make it legendary.',
  },
  {
    emoji: '💌',
    title: 'Write a letter to someone who changed your life',
    desc: "Send it. Don't wait for a funeral to say it.",
  },
  {
    emoji: '👯',
    title: 'Live with friends, not just roommates',
    desc: "People you'd choose to live with, not just tolerate. It only happens once.",
  },
  // Adventure
  {
    emoji: '🪂',
    title: 'Skydive',
    desc: 'The free-fall lasts 60 seconds. The shift in perspective lasts longer.',
  },
  {
    emoji: '🏄',
    title: 'Surf a real wave',
    desc: 'Not a beginner lesson on the shore break — an actual, rideable wave.',
  },
  {
    emoji: '🤿',
    title: 'Scuba dive somewhere extraordinary',
    desc: 'The Great Barrier Reef, the Blue Hole, the Maldives. Underwater is another world.',
  },
  {
    emoji: '🏕️',
    title: 'Spend a week fully off-grid',
    desc: 'No phone signal. No plans. See who you are without the feed.',
  },
  {
    emoji: '🎿',
    title: 'Try a sport that terrifies you',
    desc: 'Rock climbing, snowboarding, MMA. Do it badly. Keep going.',
  },
  {
    emoji: '🌋',
    title: 'See a natural wonder up close',
    desc: 'Aurora borealis, a volcano, the Grand Canyon at sunrise. Scale that makes you small.',
  },
  // Creative
  {
    emoji: '🎵',
    title: 'Perform in front of an audience',
    desc: 'Open mic, stand-up, a play. Once. The adrenaline is unlike anything.',
  },
  {
    emoji: '🎨',
    title: "Make something with your hands you're proud of",
    desc: 'Pottery, woodworking, a painting, a recipe. Something tangible.',
  },
  {
    emoji: '📷',
    title: 'Take a photograph that stops people',
    desc: 'Not an Instagram shot — something compositionally, emotionally extraordinary.',
  },
  {
    emoji: '🎬',
    title: 'Make a short film',
    desc: "Write, direct, edit. Even a five-minute one. You'll learn more about storytelling than any book.",
  },
  {
    emoji: '🎸',
    title: 'Learn an instrument to a playable level',
    desc: 'Not perfect. Good enough to play for someone without apology.',
  },
  // Mind & personal growth
  {
    emoji: '📚',
    title: 'Read 50 books in a year',
    desc: 'Fiction, non-fiction, philosophy, biography. Change your diet, change your thinking.',
  },
  {
    emoji: '🧘',
    title: 'Do a silent meditation retreat',
    desc: 'Even a weekend. No talking, no phone. The silence teaches you something.',
  },
  {
    emoji: '🗣️',
    title: 'Learn another language to conversation level',
    desc: 'Not app-level. Have a real, unscripted conversation with a native speaker.',
  },
  {
    emoji: '💪',
    title: 'Get into the best shape of your life',
    desc: 'Not a 30-day challenge — a sustained year of treating your body as an asset.',
  },
  {
    emoji: '🚫',
    title: "Give up something that's running your life",
    desc: 'Alcohol, sugar, social media, a toxic relationship. For at least 90 days.',
  },
  {
    emoji: '🌅',
    title: 'Pull an all-nighter with people you love',
    desc: 'Talking, not working. A night that turns into morning and nobody wants to leave.',
  },
  // Humanitarian & depth
  {
    emoji: '🙌',
    title: 'Volunteer for something you believe in',
    desc: 'Not one afternoon — a sustained commitment where your absence would be noticed.',
  },
  {
    emoji: '🌱',
    title: 'Grow something you can eat',
    desc: 'A balcony herb, a vegetable patch, a proper kitchen garden. From seed to plate.',
  },
  {
    emoji: '🏃',
    title: 'Run a race you had to train for',
    desc: 'Half marathon minimum. Something that required more than casual fitness.',
  },
  {
    emoji: '🎓',
    title: 'Learn something completely outside your field',
    desc: "A programming language if you're in arts; ceramics if you're in tech.",
  },
  {
    emoji: '🌙',
    title: 'Stay up all night to watch a sunrise',
    desc: 'On purpose, somewhere beautiful. Tiredness and wonder is a strange combination.',
  },
  {
    emoji: '🎪',
    title: 'Attend a festival that changes your taste',
    desc: 'Music, film, food, ideas — something that expands your reference points.',
  },
  {
    emoji: '🏠',
    title: 'Live somewhere for more than a tourist',
    desc: 'Rent a flat, go to the supermarket, have a local coffee shop. Actually live there.',
  },
  {
    emoji: '📖',
    title: 'Keep a journal for a full year',
    desc: "Daily, honest, unedited. Read it back twelve months later. You won't recognise yourself.",
  },
  {
    emoji: '🤲',
    title: 'Give something away that costs you something',
    desc: 'Not spare change — something that actually hurts to let go of.',
  },
  {
    emoji: '🎯',
    title: 'Finish what you started',
    desc: 'The book, the project, the course. One thing, all the way through. It compounds.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is 30 really a meaningful deadline for a bucket list?',
    a: "The age isn't magic — the mindset is. Your 20s are statistically your most flexible decade: fewer fixed obligations, higher risk tolerance, and maximum optionality. The 'before 30' framing is a forcing function to act before life narrows, not a verdict on life after.",
  },
  {
    q: "What if I haven't done most of these by 30?",
    a: "Most people haven't. This list isn't a performance review — it's a menu. Pick 5 that genuinely call to you and pursue those. A list you actually pursue beats a complete list you only read.",
  },
  {
    q: 'Should I be sharing my bucket list with others?',
    a: 'Share the goals where accountability helps (races, creative projects, negotiating a raise). Keep private the goals that are still forming and fragile — premature exposure can kill ambition before it solidifies.',
  },
  {
    q: "How is a bucket list different from a New Year's resolution?",
    a: "New Year's resolutions are usually habits (exercise more, eat less). Bucket list items are experiences and achievements — things that happen once and leave a permanent mark. The permanence is what makes them different: you can't undo having skydived or having fallen in love.",
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function BucketListBefore30Page() {
  return (
    <main className="bg-card">
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-card pt-16 pb-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <Lumi size={88} glow float className="shrink-0" />
            <div className="space-y-4 text-center sm:text-left">
              <p className="text-[#e05533] text-sm font-semibold">
                Guided by Lumi · 50 experiences
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance">
                50 Things to Do <span className="text-[#e05533]">Before You Turn 30</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Your 20s are the most optionful decade you&apos;ll have. Here&apos;s how to use them
                — from backpacking SE Asia to falling in love to negotiating your first raise.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
                >
                  Build my bucket list
                </Link>
                <Link
                  href="/bucket-lists"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-[#e05533] hover:text-[#e05533] transition-colors"
                >
                  See famous lists →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground text-balance">
          Why your 20s are the best time
        </h2>
        <p className="text-foreground text-base leading-relaxed">
          Your 20s are not a rehearsal. They&apos;re the decade when the cost of experimentation is
          lowest: fewer dependants, more flexibility, a body that recovers fast, and a nervous
          system still wired for novelty. The experiences you collect now become the reference
          points you draw on for the rest of your life — the yardsticks for courage, the proof of
          capability, the foundation of identity.
        </p>
        <p className="text-foreground text-base leading-relaxed">
          This list isn&apos;t about ticking boxes. It&apos;s about building a self. The travel
          teaches you adaptability. The creative work teaches you that you have something to say.
          The career risks teach you that rejection is survivable. The relationships teach you who
          you are when someone else is watching.
        </p>
        <p className="text-muted-foreground text-sm">
          Pick the 5 that call to you most and start there. Don&apos;t try to do all 50 — that
          misses the point.
        </p>
      </div>

      {/* ── List ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-[#f0a090] bg-[#fff0ec] px-4 py-4 hover:border-[#e05533] hover:shadow-sm transition-all group"
            >
              <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
              <div className="space-y-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[#e05533] shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="font-semibold text-foreground text-sm leading-snug">{item.title}</p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed pl-5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-card/40 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-border bg-card px-6 py-5 space-y-3"
              >
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#fff0ec] border-t border-[#f0a090]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-foreground text-balance">Ready to build yours?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lumi tracks your bucket list, shows your progress over time, and matches you to the
            famous person whose ambitions look most like yours.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
            >
              Build my bucket list
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
