import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';

export const metadata: Metadata = {
  title: 'What Are Significant Hobbies? — SignificantHobbies',
  description:
    'Significant hobbies are the interests that shape who you are across life phases. Learn how to map your hobby journey, discover your hobby personality, and find what to try next.',
  openGraph: {
    title: 'What Are Significant Hobbies?',
    description: 'The interests that shape who you are across life phases.',
  },
};

const ARCHETYPES = [
  {
    name: 'Renaissance Explorer',
    emoji: '🗺️',
    description:
      'You collect experiences. Wide-ranging curiosity defines you — always trying something new, rarely staying in one lane. Your breadth is your superpower.',
  },
  {
    name: 'Deep Specialist',
    emoji: '🎯',
    description:
      'You go deep, not wide. One or two pursuits occupy years of your life. Mastery is the goal. You are the person people turn to.',
  },
  {
    name: 'Creative Soul',
    emoji: '🎨',
    description:
      "Making things is how you think. Whether it's writing, painting, music, or code — your hobbies produce something that wasn't there before.",
  },
  {
    name: 'Action Hero',
    emoji: '⚡',
    description:
      'Your body is the instrument. Climbing, running, martial arts, cycling — you need movement, challenge, and physical feedback to feel alive.',
  },
  {
    name: 'Social Connector',
    emoji: '🤝',
    description:
      'Hobbies are how you build relationships. Team sports, board games, group classes — you pursue interests that bring people together.',
  },
  {
    name: 'Mindful Observer',
    emoji: '🌿',
    description:
      'Presence over pace. Gardening, birdwatching, journaling, meditation — you seek stillness and a deeper relationship with the world around you.',
  },
  {
    name: 'Builder & Maker',
    emoji: '🔧',
    description:
      "If something can be built, repaired, or optimized, you're interested. Woodworking, electronics, cooking, homebrewing — tangible results satisfy you.",
  },
  {
    name: 'Curious Scholar',
    emoji: '📚',
    description:
      'Learning is the hobby. History, philosophy, languages, science — your interests are intellectual and you never stop adding to your mental library.',
  },
];

const HOBBY_TYPES = [
  {
    label: 'Creative',
    emoji: '🎨',
    examples: 'Writing, painting, photography, music, ceramics',
    description: 'Making something that expresses who you are.',
    href: '/hobbies',
  },
  {
    label: 'Physical',
    emoji: '🏃',
    examples: 'Running, climbing, yoga, martial arts, cycling',
    description: 'Activities where your body is the instrument of growth.',
    href: '/hobbies',
  },
  {
    label: 'Intellectual',
    emoji: '🧠',
    examples: 'Chess, languages, history, coding, philosophy',
    description: 'Hobbies that expand how you think and what you know.',
    href: '/hobbies',
  },
  {
    label: 'Social',
    emoji: '🎭',
    examples: 'Team sports, tabletop games, improv, volunteering',
    description: 'Interests that deepen through doing them with others.',
    href: '/hobbies',
  },
  {
    label: 'Making',
    emoji: '🔨',
    examples: 'Woodworking, cooking, electronics, homebrewing',
    description: 'The satisfaction of producing something tangible.',
    href: '/hobbies',
  },
];

export default function WhatAreSignificantHobbiesPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'What Are Significant Hobbies?',
          description:
            'Significant hobbies are the interests that shape who you are across life phases.',
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
              name: 'What are significant hobbies?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Significant hobbies are interests that shaped who you became — not just things you do, but pursuits that connect to your identity, relationships, and personal growth across life phases.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I find my hobby personality?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Build a hobby timeline mapping your interests across life phases (childhood, teens, college, career, now). SignificantHobbies analyzes your pattern and assigns one of 8 archetypes like Renaissance Explorer, Creative Soul, or Action Hero.',
              },
            },
            {
              '@type': 'Question',
              name: 'How many hobbies should I have?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Research suggests a balanced 'hobby stack' of 4 types: one creative (Make), one physical (Move), one intellectual (Think), and one social (Connect). You don't need dozens — 3-5 active hobbies is healthy.",
              },
            },
            {
              '@type': 'Question',
              name: 'Is it too late to start a new hobby?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Never. Julia Child didn't cook until 36. Vera Wang started fashion at 40. Grandma Moses began painting at 78. Age gives you advantages: patience, resources, and knowing what you actually enjoy.",
              },
            },
          ],
        }}
      />

      <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
        {/* Hero */}
        <section
          className="relative overflow-hidden px-4 py-20 sm:py-28"
          style={{
            background:
              'linear-gradient(160deg, #F5F5F4 0%, #ECFDF5 40%, #FAFAF9 70%, #F5F5F4 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute rounded-full"
              style={{
                width: 600,
                height: 600,
                top: '-25%',
                right: '-10%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 400,
                height: 400,
                bottom: '-20%',
                left: '5%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              What Are Significant Hobbies?
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A significant hobby isn&apos;t just something you do on weekends. It&apos;s an
              interest that shaped who you became — the guitar phase in high school that taught you
              discipline, the running habit that carried you through your 30s, the cooking that
              became your love language.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/timeline/new"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                Build your timeline
                <span>→</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-md"
              >
                See what others explore
              </Link>
            </div>
          </div>
        </section>

        {/* Article body */}
        <div className="mx-auto max-w-3xl px-4 py-16">
          {/* Section 1: Why some hobbies matter more */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              Why Some Hobbies Matter More Than Others
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Most of us have tried dozens of hobbies. Some lasted a week. Some became a part of
                our identity for years. The difference between a fleeting interest and a significant
                hobby isn&apos;t how much time you log — it&apos;s how deeply the pursuit weaves
                into who you are.
              </p>
              <p>
                Significant hobbies tend to share a few qualities: they challenge you at the right
                level, they connect to something you genuinely value, and they leave a trace — in
                your skills, your relationships, or your sense of self. You don&apos;t just do them.
                You become someone through them.
              </p>
              <p>
                Psychologists have long studied the role of leisure in identity formation. When
                researchers ask people to describe themselves, hobbies and interests feature
                prominently. We are, in part, what we choose to spend our discretionary time on.
                This is the foundation of what we call your{' '}
                <strong className="text-foreground">hobby personality</strong> — the pattern of
                interests across your life that reveals something true about who you are.
              </p>
              <p>
                Browse the{' '}
                <Link
                  href="/hobbies"
                  className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  hobby directory
                </Link>{' '}
                to discover hundreds of pursuits organized by category, and see which ones resonate
                with the person you&apos;re becoming.
              </p>
            </div>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 2: The science */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              The Science Behind Hobby Significance
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                There&apos;s real psychology behind why certain hobbies stick while others fade.
                Three mechanisms stand out:
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {[
                {
                  title: 'Flow state (Csikszentmihalyi)',
                  body: 'The psychologist Mihaly Csikszentmihalyi identified "flow" — a state of deep absorption where challenge and skill are perfectly matched. Hobbies that put you in flow are hobbies you return to. They\'re hard enough to be interesting but not so hard they feel impossible. This is why rock climbing holds people for decades while easy puzzles get abandoned.',
                },
                {
                  title: 'Identity formation',
                  body: "We become what we practice. A person who paints isn't just someone who paints — they start to see the world like a painter. A runner develops not just fitness but resilience, solitude tolerance, and a relationship with early mornings. Significant hobbies reshape cognition, habits, and self-concept over time.",
                },
                {
                  title: 'Social connection',
                  body: "Shared hobbies create unusually strong bonds. The people you climb with, play music with, or run with know a version of you that most people don't — the version that shows up for hard things. Research on friendship consistently finds that shared activity, not shared history, is what actually sustains relationships.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="mb-2 text-base font-bold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Want to go deeper?{' '}
              <Link
                href="/blog"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Read the blog
              </Link>{' '}
              for long-form essays on the psychology of hobbies, identity, and leisure.
            </p>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 3: Mapping */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              Mapping Your Significant Hobbies
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                One of the most revealing exercises you can do is build a hobby timeline — a visual
                map of the interests you&apos;ve held across your life. Not just the ones you have
                now, but the ones you&apos;ve had, dropped, rekindled, or abandoned.
              </p>
              <p>
                The timeline moves through life phases: childhood, teenage years, college, early
                career, and wherever you are now. When you lay it all out, patterns emerge that are
                hard to see from inside any single chapter.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  What you might discover
                </p>
              </div>
              <div className="divide-y divide-stone-50">
                {[
                  {
                    phase: 'Childhood',
                    insight:
                      'Interests formed before external pressure — often your most authentic ones',
                  },
                  {
                    phase: 'Teens',
                    insight: 'Hobbies tied to identity formation and social belonging',
                  },
                  {
                    phase: 'College',
                    insight: 'The widest experimental window — many pivots, some that stuck',
                  },
                  {
                    phase: 'Career',
                    insight:
                      'Hobbies as counterweight to work — what you needed vs. what you chose',
                  },
                  {
                    phase: 'Now',
                    insight: 'What has survived? What came back? What are you building toward?',
                  },
                ].map(({ phase, insight }) => (
                  <div key={phase} className="flex items-start gap-4 px-6 py-4">
                    <span className="mt-0.5 rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-semibold text-foreground whitespace-nowrap">
                      {phase}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
              <p className="mb-3 text-base font-semibold text-foreground">
                Ready to see your patterns?
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Build your hobby timeline in minutes. Add phases, drop in your hobbies, and watch
                your story take shape.
              </p>
              <Link
                href="/timeline/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Build your hobby timeline →
              </Link>
            </div>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 4: Hobby personality */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              Discover Your Hobby Personality
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                The hobbies you&apos;ve held — not just the ones you have now, but all of them —
                reveal a consistent pattern. We call this your hobby personality. It&apos;s the
                archetype that shows up across your interests, regardless of how different they seem
                on the surface.
              </p>
              <p>
                SignificantHobbies identifies eight archetypes. Most people are a blend of two or
                three, but one usually dominates.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ARCHETYPES.map(({ name, emoji, description }) => (
                <div
                  key={name}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <h3 className="text-sm font-bold text-foreground">{name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Your archetype is calculated from your timeline.{' '}
              <Link
                href="/timeline/new"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Build yours to find out which one you are.
              </Link>
            </p>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 5: Types of significant hobbies */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              Types of Significant Hobbies
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Significant hobbies span every domain of human activity. Here are the five broad
                categories — each attracts a different kind of person, though most people have
                interests that cross multiple categories.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {HOBBY_TYPES.map(({ label, emoji, examples, description, href }) => (
                <Link key={label} href={href} className="group block">
                  <div className="flex items-start gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md">
                    <span className="text-3xl">{emoji}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{label} Hobbies</h3>
                        <span className="text-xs font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          Explore →
                        </span>
                      </div>
                      <p className="mb-1.5 text-sm text-muted-foreground">{description}</p>
                      <p className="text-xs text-muted-foreground/60">{examples}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 6: How to find your next hobby */}
          <section className="mb-16">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              How to Find Your Next Significant Hobby
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                The hardest part isn&apos;t sticking to a hobby — it&apos;s knowing which one to
                try. Most people cycle through the same familiar categories rather than genuinely
                exploring. Here are three approaches that actually work.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {[
                {
                  number: '01',
                  title: 'The 20-hour rule',
                  body: 'You can&apos;t evaluate a hobby in one session. The first few hours of any pursuit are defined by awkwardness and the gap between what you imagine and what you can actually do. Commit to 20 hours before deciding if something is for you. Most hobbies only reveal themselves after you&apos;re past the initial frustration.',
                },
                {
                  number: '02',
                  title: 'Try the opposite of what you usually do',
                  body: 'If you&apos;re always in your head (reading, coding, strategy games), try something physical or craft-based. If you&apos;re always physical, try something slow and contemplative. Our unexplored quadrants often contain the most growth — because we tend to avoid what we&apos;re not immediately good at.',
                },
                {
                  number: '03',
                  title: 'Look at what you loved as a kid',
                  body: 'Before external expectations shaped your interests, you gravitated toward things naturally. If you were always building things, drawing, or making up stories — that signal is still relevant. Many adults who return to childhood interests find they weren&apos;t abandoning them; they were just waiting.',
                },
              ].map(({ number, title, body }) => (
                <div
                  key={number}
                  className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="shrink-0 text-2xl font-bold text-muted-foreground">{number}</div>
                  <div>
                    <h3 className="mb-2 font-bold text-foreground">{title}</h3>
                    <p
                      className="text-sm leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-3 text-base text-muted-foreground">
                See what the community is exploring right now — filter by category, sort by
                trending, and get inspired by what others have picked up recently.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30"
              >
                See what others are exploring →
              </Link>
            </div>
          </section>

          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          {/* Section 7: Start your journey */}
          <section className="mb-8">
            <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
              Start Your Journey
            </h2>
            <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The best time to map your significant hobbies was when you first started noticing the
              patterns. The second best time is now. SignificantHobbies gives you the tools to do
              it: a timeline builder, a hobby directory, a community to explore alongside, and side
              quests to push you into new territory.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  href: '/timeline/new',
                  label: 'Build your timeline',
                  description: 'Map your hobby history across every life phase',
                  accent: true,
                  emoji: '📅',
                },
                {
                  href: '/explore',
                  label: 'Explore timelines',
                  description: 'See how others have mapped their hobby journeys',
                  accent: false,
                  emoji: '🔍',
                },
                {
                  href: '/hobbies',
                  label: 'Browse the hobby directory',
                  description: 'Hundreds of hobbies organized by category',
                  accent: false,
                  emoji: '📋',
                },
                {
                  href: '/blog',
                  label: 'Read the journal',
                  description: 'Essays on hobbies, identity, and living curiously',
                  accent: false,
                  emoji: '✍️',
                },
                {
                  href: '/side-quests',
                  label: 'Try side quests',
                  description: 'Structured challenges to push you into new hobbies',
                  accent: false,
                  emoji: '⚔️',
                },
              ].map(({ href, label, description, accent, emoji }) => (
                <Link key={href} href={href} className="group block">
                  <div
                    className={`flex h-full items-start gap-4 rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      accent
                        ? 'border-foreground/20 bg-primary text-primary-foreground hover:opacity-90'
                        : 'border-border bg-card hover:border-foreground/30'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p
                        className={`mb-1 font-bold ${accent ? 'text-foreground' : 'text-foreground'}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm leading-relaxed ${
                          accent ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
