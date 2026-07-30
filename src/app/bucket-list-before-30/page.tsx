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
import { Whale } from '~/components/whale';
import { MILESTONES } from '~/lib/experiences';

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

// Sourced from ~/lib/experiences so the suggestion engine can see these
// too; this page renders them, it no longer owns them.
const ITEMS = MILESTONES.filter((m) => m.horizon === 'before-30').map((m) => ({
  emoji: m.emoji,
  title: m.title,
  desc: m.description,
}));

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
    <div className="bg-card">
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-card pt-16 pb-10 px-4">
        <GridBackground />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <Whale size={88} glow float className="shrink-0" />
              <div className="space-y-4 text-center sm:text-left">
                <p className="text-primary text-sm font-semibold">
                  Guided by Whale · 50 experiences
                </p>
                <TextGenerateEffect
                  as="h1"
                  words="50 Things to Do Before You Turn 30"
                  className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance"
                />
                <p className="text-muted-foreground text-lg max-w-xl">
                  Your 20s are the most optionful decade you&apos;ll have. Here&apos;s how to use
                  them — from backpacking SE Asia to falling in love to negotiating your first
                  raise.
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-foreground hover:bg-lumi-600 transition-colors shadow-md"
                  >
                    Build my bucket list
                  </Link>
                  <Link
                    href="/bucket-lists"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    See famous lists →
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
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
        <StaggerContainer className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <StaggerItem key={i}>
              <SpotlightCard
                className="border border-lumi-200 bg-primary/10 shadow-soft"
                innerClassName="px-4 py-4"
              >
                <div className="flex items-start gap-4 hover:border-primary transition-all group">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-primary shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-semibold text-foreground text-sm leading-snug">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed pl-5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
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
      <section className="bg-primary/10 border-t border-lumi-200">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Whale size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-foreground text-balance">Ready to build yours?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Whale tracks your bucket list, shows your progress over time, and matches you to the
            famous person whose ambitions look most like yours.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-foreground hover:bg-lumi-600 transition-colors shadow-md"
            >
              Build my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:border-primary transition-colors"
            >
              Browse famous lists →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
