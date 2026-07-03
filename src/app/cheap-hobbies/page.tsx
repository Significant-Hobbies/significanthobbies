import type { Metadata } from 'next';
import Link from 'next/link';

import {
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
  TextGenerateEffect,
} from '~/components/aceternity';
import { JsonLd } from '~/components/json-ld';

export const metadata: Metadata = {
  title: '25 Free & Cheap Hobbies That Are Actually Fun | SignificantHobbies',
  description:
    '25 free and cheap hobbies that are genuinely worth your time. 15 completely free + 10 under $50 to start. With honest cost breakdowns.',
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

type CheapHobby = {
  name: string;
  cost: string;
  what: string;
  why: string;
};

const FREE_HOBBIES: CheapHobby[] = [
  {
    name: 'Running',
    cost: 'Free',
    what: 'Shoes you already own + the road outside your door.',
    why: 'Running is one of the few hobbies where the activity itself is the reward and the equipment is already in your closet. The community of local runners is welcoming and costs nothing to join.',
  },
  {
    name: 'Writing',
    cost: 'Free',
    what: 'A text editor, a notebook — or nothing but your phone.',
    why: 'Writing is the most scalable hobby: it costs nothing, you can do it anywhere, and the compound interest on daily writing practice is remarkable. A year of journaling changes how you think.',
  },
  {
    name: 'Reading',
    cost: 'Free (with library card)',
    what: 'Library membership is free almost everywhere. So are Libby and Project Gutenberg.',
    why: 'A library card unlocks more books, audiobooks, and magazines than you could read in a lifetime. Reading is the highest-return-on-time hobby that exists.',
  },
  {
    name: 'Hiking',
    cost: 'Free',
    what: 'Most trails are free. AllTrails has a solid free tier for finding them.',
    why: 'National forests, state parks, and public lands are accessible and mostly free. Hiking combines exercise, nature, and often social connection in a way that no gym membership can match.',
  },
  {
    name: 'Drawing',
    cost: 'Free',
    what: "Any pen and any paper — that's all you actually need.",
    why: 'Drawing teaches observation. Once you start drawing things, you notice them differently. The tools matter far less than the practice.',
  },
  {
    name: 'Bird watching',
    cost: 'Free',
    what: "Merlin Bird ID app is free. Binoculars help but aren't required.",
    why: 'Birding is a gateway to paying deep attention to the world around you. There are birds everywhere — in cities, suburbs, forests. The free app identifies them by sight or sound.',
  },
  {
    name: 'Meditation',
    cost: 'Free',
    what: 'Insight Timer is free. YouTube has unlimited guided meditations. Or just sit.',
    why: 'The science on meditation is solid — 10 minutes daily produces measurable reductions in anxiety and improvements in attention within weeks. No equipment required.',
  },
  {
    name: 'Language learning',
    cost: 'Free',
    what: 'Duolingo is free. YouTube has comprehensive language courses. Language exchange apps are free.',
    why: 'Reaching conversational fluency in a language requires daily repetition — exactly what free apps like Duolingo are designed for. Supplement with free YouTube immersion content.',
  },
  {
    name: 'Stargazing',
    cost: 'Free',
    what: 'Stellarium and SkySafari have free tiers. Dark sky + clear night = everything you need.',
    why: "Light pollution aside, the night sky is free and spectacular. A free app makes it navigable. The scale of what you're looking at — billions of years old, billions of light-years away — does something to perspective.",
  },
  {
    name: 'Poetry',
    cost: 'Free',
    what: 'Write with anything. Read at the Poetry Foundation (free website) or your library.',
    why: 'Poetry is the most compressed form of writing and the most immediately shareable. Writing a short poem daily is a meaningful creative practice that costs nothing.',
  },
  {
    name: 'Foraging',
    cost: 'Free',
    what: 'iNaturalist is free for identification. Your region likely has free beginner walks through local clubs.',
    why: "Learning to identify edible plants transforms how you walk through the world. Wild garlic, blackberries, nettles, dandelions — once you can see them, they're everywhere.",
  },
  {
    name: 'Chess',
    cost: 'Free',
    what: 'Chess.com and Lichess are both entirely free online.',
    why: 'Chess is endlessly deep, playable 24/7, and available against opponents at exactly your skill level. The free tier on both major platforms is genuinely feature-complete.',
  },
  {
    name: 'Geocaching',
    cost: 'Free',
    what: 'The Geocaching.com basic membership is free. Thousands of caches near you, right now.',
    why: "Geocaching turns any outdoor walk into a treasure hunt. The free tier gives access to millions of caches worldwide. It's a great excuse to explore parts of your city or region you'd never otherwise visit.",
  },
  {
    name: 'Volunteering',
    cost: 'Free',
    what: 'Your time. Volunteermatch.org and Idealist list opportunities in every city.',
    why: "Volunteering is free and net-positive in every direction: community, mental health, social connection, and sense of purpose. It's also one of the best ways to meet people you'd actually want to know.",
  },
  {
    name: 'Philosophy',
    cost: 'Free',
    what: 'The Internet Encyclopedia of Philosophy and Stanford Encyclopedia are free. So are most classics on Project Gutenberg.',
    why: 'Some of the most worthwhile thinking in human history is available at no cost. Marcus Aurelius, Epictetus, Camus, Wittgenstein — free and waiting.',
  },
];

const CHEAP_HOBBIES: CheapHobby[] = [
  {
    name: 'Knitting',
    cost: 'Under $20 to start',
    what: 'Two needles and one skein of yarn. YouTube will teach you everything else.',
    why: 'Knitting is portable, meditative, and produces objects you can give away. A beginner knitting kit and yarn to make your first dishcloth costs less than a meal out.',
  },
  {
    name: 'Watercolor painting',
    cost: 'Under $25',
    what: 'A basic pan watercolor set and a pad of watercolor paper. Brushes often come with the set.',
    why: 'Watercolor is the most forgiving visual art medium. Happy accidents are the point. A starter set gives you hundreds of hours of creative experimentation.',
  },
  {
    name: 'Calligraphy',
    cost: 'Under $20',
    what: 'A basic dip pen and nib set + ink. Amazon has full beginner kits for $12–18.',
    why: 'Calligraphy slows you down and rewards attention. The learning curve produces visible, immediate progress. Finished pieces make beautiful gifts.',
  },
  {
    name: 'Coffee brewing',
    cost: 'Under $35',
    what: 'A pour-over dripper ($10) + filters ($5) + one good bag of beans ($15–20).',
    why: 'Pour-over coffee is better than nearly any cafe coffee and costs about 80 cents per cup once you have the equipment. The hobby is also endlessly refineable — grind, temperature, timing, water.',
  },
  {
    name: 'Yoga',
    cost: 'Under $30 (or free)',
    what: 'A yoga mat ($20–30). Yoga with Adriene on YouTube is free and world-class.',
    why: 'A quality yoga mat and a free YouTube channel is all you need for years of practice. Hot yoga studios are expensive; your living room floor is not.',
  },
  {
    name: 'Ukulele',
    cost: 'Under $60',
    what: 'A Kala or Donner soprano ukulele. All lessons available for free on YouTube.',
    why: 'The ukulele is the most beginner-friendly fretted instrument. Four chords, learned in an afternoon, lets you play hundreds of songs. The instrument is genuinely fun to play.',
  },
  {
    name: 'Gardening',
    cost: 'Under $20 to start',
    what: "One pot, one bag of soil, one packet of herb seeds — basil or mint. That's it.",
    why: 'Growing food or flowers connects you to a natural cycle. A single pot of herbs on a windowsill is a legitimate start, produces food you eat, and costs less than a dinner out.',
  },
  {
    name: 'Fermentation',
    cost: 'Under $10',
    what: 'A mason jar, salt, and cabbage for sauerkraut. The starter cost is almost nothing.',
    why: "Fermentation is applied biology. You can start your first batch of sauerkraut tonight for under $5. Once you're comfortable, move to kimchi, kombucha, and sourdough.",
  },
  {
    name: 'Origami',
    cost: 'Under $10',
    what: 'A pack of origami paper ($6–8) and YouTube. The paper fold themselves into anything.',
    why: 'Origami is tactile, meditative, and produces three-dimensional art from a flat sheet of paper. It also teaches geometric thinking in a hands-on way.',
  },
  {
    name: 'Candle making',
    cost: 'Under $30 to start',
    what: 'A starter wax kit with wicks, fragrance oils, and containers is $25–35 on Amazon.',
    why: "Hand-poured candles make excellent gifts and the startup cost pays for itself quickly if you'd otherwise be buying candles. The hobby is also genuinely satisfying — you end up with something beautiful and functional.",
  },
];

export default function CheapHobbiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '25 Free & Cheap Hobbies That Are Actually Fun',
          description:
            '25 free and cheap hobbies with honest cost breakdowns. 15 completely free, 10 under $50.',
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
              name: 'What hobbies are completely free?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Five truly free hobbies: Running (shoes you already own, road outside your door), Writing (any text editor or notebook), Reading (library card unlocks unlimited books for free), Hiking (most trails on public land are free), and Drawing (any pen and any paper is all you need).',
              },
            },
            {
              '@type': 'Question',
              name: 'What hobbies can I start with no equipment?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Five hobbies that need zero equipment to start: Meditation (sit anywhere, close your eyes, breathe — free apps like Insight Timer guide you), Running (walk out your door), Journaling (use your phone's notes app), Bird watching (the free Merlin app identifies birds by sound), and Stargazing (look up — free apps like SkySafari show you what you're seeing).",
              },
            },
            {
              '@type': 'Question',
              name: "What's the cheapest hobby to start?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The three cheapest hobbies to start are: Walking or running (completely free — you already own shoes), Journaling (a $2 notebook is enough to start a practice that can last a lifetime), and Stargazing (free with any dark sky and a free astronomy app on your phone — a telescope is optional and not needed to begin).',
              },
            },
          ],
        }}
      />

      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/60">
        <GridBackground variant="dots" size={22} />
        <FadeIn className="relative p-6 sm:p-8">
          <Link href="/hobbies" className="text-sm text-muted-foreground hover:text-foreground">
            ← Hobby Directory
          </Link>
          <TextGenerateEffect
            words="25 Free & Cheap Hobbies That Are Actually Fun"
            className="mt-4 text-3xl font-bold text-foreground"
          />
        </FadeIn>
      </div>

      <FadeIn delay={0.1}>
        <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
          The most rewarding hobbies usually aren&apos;t the expensive ones. Running, reading,
          writing, chess, hiking, drawing — these cost nothing, and some of the deepest hobbyists in
          the world practice them.
        </p>
      </FadeIn>
      <FadeIn delay={0.18}>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          This list is honest: we&apos;ve included 15 completely free hobbies and 10 that cost under
          $50 to start, with a real breakdown of what you actually need. No filler, no
          &quot;you&apos;ll need to upgrade your gear&quot; bait-and-switch.
        </p>
      </FadeIn>

      {/* Jump links */}
      <FadeIn className="flex gap-3 mb-10 flex-wrap">
        <a
          href="#free"
          className="rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5 text-xs font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          15 Completely Free
        </a>
        <a
          href="#cheap"
          className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-800 hover:opacity-80 transition-opacity"
        >
          10 Under $50
        </a>
      </FadeIn>

      {/* Free Hobbies */}
      <FadeIn>
        <section id="free" className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">15 Completely Free Hobbies</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Zero dollars required to start. These hobbies are free indefinitely — no catch, no
              upgrade required.
            </p>
          </div>
          <StaggerContainer className="space-y-4">
            {FREE_HOBBIES.map((hobby) => (
              <StaggerItem key={hobby.name}>
                <SpotlightCard className="shadow-soft" innerClassName="rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <Link
                      href={`/hobbies/${hobbySlug(hobby.name)}`}
                      className="text-base font-bold text-foreground hover:text-foreground transition-colors"
                      prefetch={false}
                    >
                      {hobby.name}
                    </Link>
                    <span className="flex-shrink-0 rounded-full border border-foreground/20 bg-foreground/10 px-3 py-0.5 text-xs font-medium text-foreground">
                      {hobby.cost}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mb-2 font-medium">{hobby.what}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{hobby.why}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </FadeIn>

      {/* Cheap Hobbies */}
      <FadeIn>
        <section id="cheap">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">10 Hobbies Under $50 to Start</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              A small upfront investment, then free forever. These are the hobbies where one
              purchase gives you years of practice.
            </p>
          </div>
          <StaggerContainer className="space-y-4">
            {CHEAP_HOBBIES.map((hobby) => (
              <StaggerItem key={hobby.name}>
                <SpotlightCard className="shadow-soft" innerClassName="rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <Link
                      href={`/hobbies/${hobbySlug(hobby.name)}`}
                      className="text-base font-bold text-foreground hover:text-foreground transition-colors"
                      prefetch={false}
                    >
                      {hobby.name}
                    </Link>
                    <span className="flex-shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700">
                      {hobby.cost}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mb-2 font-medium">{hobby.what}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{hobby.why}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </FadeIn>

      <FadeIn className="mt-10">
        <SpotlightCard className="shadow-soft" innerClassName="rounded-xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-2">The real cost of any hobby</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The most expensive part of any hobby is the time you invest in it. Choose based on what
            genuinely interests you, not what gear looks coolest. The hobby that sticks is the one
            you&apos;ll actually do — usually the one with the lowest friction to start.
          </p>
        </SpotlightCard>
      </FadeIn>

      <FadeIn className="mt-12">
        <SpotlightCard
          className="border-foreground/20 bg-foreground/10 shadow-soft"
          innerClassName="rounded-xl p-8 text-center"
        >
          <h2 className="text-xl font-bold text-foreground mb-2">Find your perfect hobby</h2>
          <p className="text-muted-foreground mb-4">
            Take our 2-minute quiz for personalized recommendations. We&apos;ll ask about your
            schedule, budget, and what you want to get out of a hobby.
          </p>
          <Link
            href="/find-your-hobby"
            className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
          >
            Take the Quiz →
          </Link>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
