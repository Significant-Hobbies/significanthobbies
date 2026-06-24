import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';

export const metadata: Metadata = {
  title: '50 Best Hobbies for Adults — Find What Excites You | SignificantHobbies',
  description:
    'Discover 50 hobbies perfect for adults. From creative pursuits to physical adventures, find your next passion with our curated guide.',
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

type Hobby = { name: string; desc: string };

const CREATIVE: Hobby[] = [
  {
    name: 'Photography',
    desc: "Turn everyday scenes into art. A smartphone is enough to start — upgrade gear only when you're hooked.",
  },
  {
    name: 'Drawing',
    desc: 'Sketch, doodle, illustrate. Low barrier, high reward — and proven to sharpen observation skills.',
  },
  {
    name: 'Painting',
    desc: 'Watercolor, oil, or acrylic — painting slows you down and demands you truly look at the world.',
  },
  {
    name: 'Writing',
    desc: 'Journal, short stories, or essays. Writing clarifies your thinking and builds a body of work over time.',
  },
  {
    name: 'Ceramics',
    desc: 'Working with clay is meditative, tactile, and produces things you can actually use.',
  },
  {
    name: 'Knitting',
    desc: 'Portable, calming, and social. Knitting groups are one of the fastest ways to meet interesting people.',
  },
  {
    name: 'Calligraphy',
    desc: 'The art of beautiful writing. Slow, deliberate, deeply satisfying.',
  },
  {
    name: 'Songwriting',
    desc: "You don't need to play an instrument to write lyrics. Start with a voice memo and see where it leads.",
  },
  {
    name: 'Poetry',
    desc: 'The most compact form of writing. A few well-chosen words carry enormous weight.',
  },
];

const PHYSICAL: Hobby[] = [
  {
    name: 'Running',
    desc: 'The ultimate low-barrier sport. Lace up, walk out the door, start slow — the habit builds itself.',
  },
  {
    name: 'Cycling',
    desc: 'Commute, explore, race — cycling adapts to whatever you want from it.',
  },
  {
    name: 'Yoga',
    desc: 'Flexibility, strength, and stress relief in one. No gym membership required.',
  },
  {
    name: 'Hiking',
    desc: 'Walk somewhere beautiful. Combine exercise with nature, conversation, and perspective.',
  },
  {
    name: 'Climbing',
    desc: 'Rock climbing is problem-solving with your body — endlessly varied, never boring.',
  },
  { name: 'Swimming', desc: 'Zero-impact cardio. Great for joints, great for clearing your head.' },
  {
    name: 'Martial arts',
    desc: 'Discipline, confidence, community. Martial arts training changes more than your fitness.',
  },
  {
    name: 'Dance',
    desc: 'Salsa, swing, contemporary — dancing is one of the few workouts that genuinely feels like fun.',
  },
  {
    name: 'Pickleball',
    desc: 'The fastest-growing adult sport in the US. Easy to learn, hard to put down.',
  },
];

const INTELLECTUAL: Hobby[] = [
  {
    name: 'Reading',
    desc: 'Books are the highest return-on-investment hobby. Fiction builds empathy; non-fiction builds knowledge.',
  },
  {
    name: 'Chess',
    desc: 'Strategy, pattern recognition, patience. Play online or find a local club.',
  },
  {
    name: 'Coding',
    desc: "Build something that didn't exist before. Even basic programming opens doors you can't anticipate.",
  },
  {
    name: 'Language learning',
    desc: 'A new language is a new lens on the world. Duolingo for daily practice, conversation partners to accelerate.',
  },
  {
    name: 'Philosophy',
    desc: 'Think carefully about things that matter. Stoicism, ethics, epistemology — all free to explore.',
  },
  {
    name: 'Astronomy',
    desc: 'Look up. A cheap telescope and a dark sky will leave you permanently humbled.',
  },
  {
    name: 'History',
    desc: 'Context for everything happening today. Audiobooks make history easy to fit into any schedule.',
  },
  {
    name: 'Puzzles',
    desc: 'Jigsaws, crosswords, logic puzzles — sustained attention is a skill worth training.',
  },
];

const SOCIAL: Hobby[] = [
  {
    name: 'Volunteering',
    desc: 'Connect with your community while contributing something real. Often the fastest cure for a lack of purpose.',
  },
  {
    name: 'Hosting dinners',
    desc: "A dinner party is a creative project. Menu, guest list, conversation — you're the director.",
  },
  {
    name: 'Book club',
    desc: 'Read with intention and discuss with others. Two people on the same book is already a club.',
  },
  {
    name: 'Improv comedy',
    desc: 'Improv classes will make you funnier, quicker, and better at listening — in six weeks.',
  },
  {
    name: 'Theater',
    desc: "Community theater is wildly underrated. It's performance, collaboration, and belonging in one place.",
  },
  { name: 'Travel', desc: 'Plan intentionally, go somewhere unfamiliar, come back changed.' },
  {
    name: 'Board games',
    desc: 'Tabletop gaming is one of the best social hobbies around — easy to find a group, infinite variety.',
  },
];

const OUTDOOR: Hobby[] = [
  {
    name: 'Gardening',
    desc: 'Grow food, flowers, or both. Even a balcony pot counts. The relationship with plants rewards patience.',
  },
  {
    name: 'Bird watching',
    desc: "Birding retrains your attention. You'll notice things you've walked past for years.",
  },
  {
    name: 'Camping',
    desc: 'Disconnect from screens, sleep under stars, eat simple food. Restorative in a way that nothing else quite matches.',
  },
  {
    name: 'Fishing',
    desc: "Equal parts patience, skill, and being outside. You don't have to catch anything to have a good session.",
  },
  {
    name: 'Foraging',
    desc: 'Learn to identify edible plants in your region. Combines walking, science, and cooking.',
  },
  {
    name: 'Stargazing',
    desc: 'Light pollution aside, a clear night sky is one of the most awe-inspiring free experiences available.',
  },
  {
    name: 'Mushroom hunting',
    desc: "Hunt fungi in forests — it's a proper skill, endlessly interesting, and leads to incredible meals.",
  },
  {
    name: 'Geocaching',
    desc: "GPS treasure hunting. Over 3 million caches hidden worldwide, many in places you'd never otherwise explore.",
  },
];

const MAKING: Hobby[] = [
  {
    name: 'Woodworking',
    desc: 'Build furniture, sculptures, or small objects. The smell of fresh-cut wood is its own reward.',
  },
  {
    name: '3D printing',
    desc: 'Design and print almost anything. A genuinely new creative medium becoming more accessible every year.',
  },
  {
    name: 'Leatherworking',
    desc: 'Wallets, bags, belts — hand-crafted leather goods that outlast their makers.',
  },
  {
    name: 'Candle making',
    desc: 'Custom scents, containers, gifts. Easy to start, easy to give away what you make.',
  },
  { name: 'Jewelry making', desc: 'Wire wrapping, beading, metalwork — wear what you create.' },
  {
    name: 'Baking',
    desc: 'Sourdough, pastry, bread — baking is chemistry made delicious. Share the results and become very popular.',
  },
  {
    name: 'Coffee brewing',
    desc: "Pour-over, espresso, cold brew — there's a rabbit hole here that never quite ends.",
  },
  {
    name: 'Fermentation',
    desc: 'Kimchi, kombucha, sourdough starter — turn biology into food. Endlessly interesting, gut-friendly.',
  },
  {
    name: 'Electronics',
    desc: 'Arduino, Raspberry Pi, custom keyboards — build things that actually do things.',
  },
];

function HobbyCard({ hobby }: { hobby: Hobby }) {
  return (
    <li className="flex gap-4 rounded-lg border border-stone-100 bg-white p-4 hover:border-emerald-200 transition-colors">
      <div className="flex-1">
        <Link
          href={`/hobbies/${hobbySlug(hobby.name)}`}
          className="font-semibold text-stone-900 hover:text-emerald-700 transition-colors"
        >
          {hobby.name}
        </Link>
        <p className="mt-1 text-sm text-stone-500 leading-relaxed">{hobby.desc}</p>
      </div>
    </li>
  );
}

function Section({ title, hobbies, color }: { title: string; hobbies: Hobby[]; color: string }) {
  return (
    <section className="mb-10">
      <h2 className={`text-xl font-bold mb-4 ${color}`}>{title}</h2>
      <ul className="space-y-3">
        {hobbies.map((h) => (
          <HobbyCard key={h.name} hobby={h} />
        ))}
      </ul>
    </section>
  );
}

export default function HobbiesForAdultsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '50 Best Hobbies for Adults — Find What Excites You',
          description:
            'Discover 50 hobbies perfect for adults. From creative pursuits to physical adventures, find your next passion with our curated guide.',
          author: { '@type': 'Organization', name: 'SignificantHobbies' },
          publisher: { '@type': 'Organization', name: 'SignificantHobbies' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What are good hobbies for adults?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The best hobbies for adults span multiple dimensions: Photography (creative, accessible), Running (physical, low-cost), Reading (intellectual, high-return), Volunteering (social, purposeful), and Cooking (mindful, practical). A balanced hobby stack covers creative, physical, intellectual, and social pursuits.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I find a hobby as an adult?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Start by taking a hobby personality quiz to identify your archetype. Then try the opposite of what you normally do — if you work with your mind, try something physical; if you work alone, try a social hobby. Give each hobby at least 4 sessions before deciding it's not for you.",
              },
            },
            {
              '@type': 'Question',
              name: 'What hobbies can I do at home?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Five great at-home hobbies: Writing (journaling, fiction, or essays — just a notebook or laptop), Drawing (any pen and paper to start), Cooking (build a real skill while eating better), Yoga (a mat and free YouTube is enough), and Music (learn an instrument or produce music digitally).',
              },
            },
          ],
        }}
      />

      <div className="mb-6">
        <Link href="/hobbies" className="text-sm text-stone-500 hover:text-stone-700">
          ← Hobby Directory
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-900 mb-4">
        50 Best Hobbies for Adults — Find What Excites You
      </h1>
      <p className="text-lg text-stone-500 mb-8 leading-relaxed">
        Most hobby lists are filler. This one isn&apos;t. We curated 50 hobbies across six
        categories — Creative, Physical, Intellectual, Social, Outdoor, and Making — with real
        context on what each one involves and why adults in particular find them rewarding. Scan the
        categories, follow the links, find your next thing.
      </p>

      <Section title="Creative" hobbies={CREATIVE} color="text-purple-700" />
      <Section title="Physical" hobbies={PHYSICAL} color="text-emerald-700" />

      <div className="my-8 rounded-xl bg-stone-50 border border-stone-200 p-6">
        <p className="text-stone-600 text-sm leading-relaxed">
          <strong className="text-stone-800">Finding it hard to choose?</strong> Most adults
          discover their best hobbies by experimenting freely, not by thinking hard. Give something
          three sessions before deciding — the first one is always awkward.
        </p>
      </div>

      <Section title="Intellectual" hobbies={INTELLECTUAL} color="text-blue-700" />
      <Section title="Social" hobbies={SOCIAL} color="text-orange-700" />
      <Section title="Outdoor" hobbies={OUTDOOR} color="text-teal-700" />
      <Section title="Making" hobbies={MAKING} color="text-amber-700" />

      <div className="mt-12 rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Not sure which fits you best?</h2>
        <p className="text-stone-500 mb-4">
          Take our 2-minute quiz — answer a few questions about your personality and schedule, and
          get a shortlist tailored to you.
        </p>
        <Link
          href="/find-your-hobby"
          className="inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Take the Quiz →
        </Link>
        <div className="mt-4">
          <Link
            href="/timeline/new"
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Already have hobbies? Build your hobby timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
