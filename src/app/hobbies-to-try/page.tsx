import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';

export const metadata: Metadata = {
  title: '40 New Hobbies to Try in 2026 — From Beginner-Friendly to Bold | SignificantHobbies',
  description:
    '40 hobbies to try in 2026, organized by how much effort they take to start. From tonight with no equipment to deep year-long commitments.',
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

type TryHobby = {
  name: string;
  what: string;
  time: string;
};

const START_TONIGHT: TryHobby[] = [
  {
    name: 'Writing',
    what: 'Open a blank document and write whatever comes to mind for 20 minutes. No equipment, no audience, no wrong answers.',
    time: '20 min/day to start',
  },
  {
    name: 'Drawing',
    what: "Grab any pen and paper. Sketch objects around you. The goal isn't skill — it's observation.",
    time: '15–30 min/session',
  },
  {
    name: 'Meditation',
    what: 'Sit comfortably, focus on breathing, return attention when it wanders. Use an app if helpful. Completely free.',
    time: '10–20 min/day',
  },
  {
    name: 'Reading',
    what: "Pick a book you've been meaning to read. Read one chapter tonight. Momentum follows.",
    time: '30 min/day builds a habit',
  },
  {
    name: 'Poetry',
    what: "Write three lines describing something you can see right now. You've written a poem. Keep going.",
    time: 'As little as 10 min/day',
  },
  {
    name: 'Running',
    what: "Walk outside and run until you're tired. Walk. Run again. Return. That was your first training session.",
    time: '20–40 min, 3x/week',
  },
  {
    name: 'Stargazing',
    what: 'Download a star map app, go somewhere dark, look up. The sky tonight is different from every other night.',
    time: "1+ hour anytime it's clear",
  },
  {
    name: 'Language learning',
    what: 'Download Duolingo and start with 10 minutes of Spanish, Japanese, or whatever calls to you. The first lesson is free and immediate.',
    time: '10–20 min/day',
  },
  {
    name: 'Bird watching',
    what: "Download Merlin Bird ID. Go outside. Listen. The app will identify what you're hearing. You'll be amazed what's already around you.",
    time: '15+ min, anywhere outdoors',
  },
  {
    name: 'Philosophy',
    what: "Pick a thinker you've heard of — Stoics, Camus, or someone living — and read one essay or watch one lecture tonight.",
    time: '30–60 min/session',
  },
];

const THIS_WEEKEND: TryHobby[] = [
  {
    name: 'Hiking',
    what: 'Find a local trail (AllTrails is free), wear comfortable shoes, bring water. A 2-hour hike this weekend resets your entire week.',
    time: '2–5 hours, weekends',
  },
  {
    name: 'Cooking',
    what: "Pick one recipe you've never made. Buy the ingredients, follow it exactly, eat it. That's the beginning.",
    time: '1–2 hours per cook',
  },
  {
    name: 'Baking',
    what: 'Make a basic loaf of bread or a batch of cookies. Baking rewards precision and teaches patience. Both are useful.',
    time: '2–3 hours per session',
  },
  {
    name: 'Chess',
    what: 'Chess.com and Lichess are both free. Start a game, use the hints to learn tactics, play someone at your level.',
    time: '30–60 min/session',
  },
  {
    name: 'Photography',
    what: "Take your phone on a 1-hour walk with the goal of taking 50 photos. You'll start seeing composition you never noticed.",
    time: '1+ hours',
  },
  {
    name: 'Camping',
    what: 'Drive somewhere outside the city this weekend. Borrow gear if you can. One overnight in nature resets a lot.',
    time: 'One weekend to start',
  },
  {
    name: 'Kayaking',
    what: 'Most outdoor recreation centers rent kayaks by the hour. No experience needed. Get on the water and see if it sticks.',
    time: '2–4 hours, rent gear first',
  },
  {
    name: 'Calligraphy',
    what: 'A beginner calligraphy kit costs around $15. Spend a Saturday afternoon learning basic strokes. The progress is immediate and visible.',
    time: '1–2 hours/session',
  },
  {
    name: 'Board games',
    what: "Host a board game night. Wingspan, Catan, Codenames — pick one and invite people. You'll likely have one by next weekend.",
    time: '2–4 hours, great socially',
  },
  {
    name: 'Cycling',
    what: 'Rent or borrow a bike and ride for an hour without a destination. See where you end up. Then plan a proper route.',
    time: '1–2 hours to start',
  },
];

const THIS_MONTH: TryHobby[] = [
  {
    name: 'Yoga',
    what: 'Take a beginners class (Yoga with Adriene on YouTube is excellent and free). Commit to 30 days and feel the difference.',
    time: '30–60 min, 3–5x/week',
  },
  {
    name: 'Ukulele',
    what: 'Four chords gets you 80% of pop songs. A decent ukulele costs $50–80. In a month you can play recognizable music.',
    time: '20–30 min/day',
  },
  {
    name: 'Watercolor painting',
    what: 'Starter kit is $20–30. Pick up a beginner workbook or follow YouTube tutorials. Watercolor is forgiving and beautiful.',
    time: '1–2 hours/session',
  },
  {
    name: 'Gardening',
    what: 'Start with one pot of herbs on a windowsill. Basil, mint, chives. Water them. Eat from them. Expand from there.',
    time: '15–30 min/day',
  },
  {
    name: 'Swimming',
    what: "Join a local pool's adult lessons program. One month of consistent swim sessions will transform your comfort in water.",
    time: '30–60 min, 3x/week',
  },
  {
    name: 'Fermentation',
    what: 'Make a jar of sauerkraut in week one. It takes 5 minutes to prepare. Check it daily. Eat it in 2–3 weeks. Then try kimchi.',
    time: '5 min to start, ongoing tending',
  },
  {
    name: 'Knitting',
    what: "Learn to cast on, knit, and bind off. Make a dishcloth. It's unglamorous but it teaches everything you need for bigger projects.",
    time: '30–60 min/session',
  },
  {
    name: 'Improv comedy',
    what: 'Sign up for an intro improv workshop at your local theater. One session changes how you interact with people — permanently.',
    time: '1 class/week for 6–8 weeks',
  },
  {
    name: 'Coffee brewing',
    what: "Get a pour-over kit ($30) and a decent bag of beans. Learn grind size and water temperature. You'll never settle for mediocre coffee again.",
    time: '10–15 min each morning',
  },
  {
    name: 'Climbing',
    what: 'Day passes at indoor climbing gyms are $20–30. Shoes are rentable. Your first session is mostly an introduction to holds — take a beginner class.',
    time: '1.5–2 hours per session',
  },
];

const THIS_YEAR: TryHobby[] = [
  {
    name: 'Guitar',
    what: 'First 3 months: open chords and basic strumming. By month 6, you can play dozens of songs. By year 1, people will ask you to play. Takes daily practice.',
    time: '30–60 min/day',
  },
  {
    name: 'Woodworking',
    what: 'Start with hand tools — a saw, chisels, and a mallet. Build a simple shelf or box. The learning compounds dramatically after the first few projects.',
    time: 'Several hours/weekend',
  },
  {
    name: 'Martial arts',
    what: 'A year of consistent training (2–3x/week) in Brazilian Jiu-Jitsu, Muay Thai, or Judo will change your body, confidence, and social circle.',
    time: '2–3 classes/week',
  },
  {
    name: 'Coding',
    what: 'Build a specific thing — a personal website, a tool you wish existed, an app for a hobby. Motivation from a real project beats tutorials.',
    time: '1–2 hours/day',
  },
  {
    name: 'Piano',
    what: 'Even digital keyboards with weighted keys are a worthwhile investment. A year of regular practice gets you to Für Elise and real songs you love.',
    time: '30–60 min/day',
  },
  {
    name: 'Ceramics',
    what: "Studio memberships with wheel access run $50–100/month. It takes months before your bowls stop collapsing — and that's part of the draw.",
    time: '2–4 hours, 1–2x/week',
  },
  {
    name: 'Scuba diving',
    what: "Get your PADI Open Water certification over a long weekend. After that, the world's oceans open up. A genuinely life-changing activity for some people.",
    time: 'One certification weekend + ongoing dives',
  },
  {
    name: 'Filmmaking',
    what: 'Make a short film this year. Write, shoot, edit, and share it. The entire pipeline is learnable with free tools. The constraint of completion is everything.',
    time: 'Variable — at least months of part-time work',
  },
  {
    name: 'Language learning',
    what: 'Reach A2/B1 in a new language by year-end. Daily Duolingo + conversation practice with a tutor (iTalki is affordable) makes this realistic.',
    time: '30+ min/day',
  },
  {
    name: 'Marathon training',
    what: 'Sign up for a race 9 months from now. Follow a structured plan. The process of training for a marathon restructures your entire week around something meaningful.',
    time: '4–6 days/week, escalating',
  },
];

type Section = {
  id: string;
  label: string;
  subtitle: string;
  hobbies: TryHobby[];
  badgeColor: string;
};

const SECTIONS: Section[] = [
  {
    id: 'start-tonight',
    label: 'Start Tonight',
    subtitle: '10 hobbies that need no equipment, no class, no prep',
    hobbies: START_TONIGHT,
    badgeColor: 'bg-foreground/10 text-foreground border-foreground/20',
  },
  {
    id: 'this-weekend',
    label: 'This Weekend',
    subtitle: '10 low-barrier hobbies to explore in a few hours',
    hobbies: THIS_WEEKEND,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'this-month',
    label: 'This Month',
    subtitle: '10 hobbies worth a 30-day honest attempt',
    hobbies: THIS_MONTH,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'this-year',
    label: 'This Year',
    subtitle: '10 deep-dive hobbies for people ready to commit',
    hobbies: THIS_YEAR,
    badgeColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
];

export default function HobbiesToTryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '40 New Hobbies to Try in 2026 — From Beginner-Friendly to Bold',
          description:
            '40 hobbies to try in 2026, organized by how much effort they take to start.',
          author: { '@type': 'Organization', name: 'SignificantHobbies' },
          publisher: { '@type': 'Organization', name: 'SignificantHobbies' },
        }}
      />

      <div className="mb-6">
        <Link href="/hobbies" className="text-sm text-muted-foreground hover:text-foreground">
          ← Hobby Directory
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">40 New Hobbies to Try in 2026</h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        The biggest barrier to starting a new hobby isn&apos;t motivation — it&apos;s friction. The
        gap between &ldquo;I want to try that&rdquo; and actually doing it is almost always about
        unclear next steps, not lack of interest.
      </p>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        This list is organized by effort-to-entry, not by category. Find your current available
        bandwidth — tonight, this weekend, this month, or this year — and start from there.
      </p>

      {/* Jump links */}
      <div className="flex flex-wrap gap-2 mb-10">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors hover:opacity-80 ${s.badgeColor}`}
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{section.label}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{section.subtitle}</p>
            </div>
            <ul className="space-y-4">
              {section.hobbies.map((hobby) => (
                <li
                  key={hobby.name}
                  className="rounded-xl border border-border bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <Link
                      href={`/hobbies/${hobbySlug(hobby.name)}`}
                      className="text-base font-bold text-foreground hover:text-foreground transition-colors"
                      prefetch={false}
                    >
                      {hobby.name}
                    </Link>
                    <span
                      className={`flex-shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium ${section.badgeColor}`}
                    >
                      {hobby.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{hobby.what}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-foreground/10 border border-foreground/20 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Find your perfect hobby</h2>
        <p className="text-muted-foreground mb-4">
          Not sure where to start? Our quiz asks about your schedule, personality, and what you want
          from a hobby — then gives you a personalized shortlist.
        </p>
        <Link
          href="/find-your-hobby"
          className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
        >
          Take the Quiz →
        </Link>
      </div>
    </div>
  );
}
