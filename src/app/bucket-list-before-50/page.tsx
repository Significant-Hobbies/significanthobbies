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
  title: '50 Things to Do Before You Turn 50 — Meaningful Bucket List Goals',
  description:
    '50 profound bucket list goals for your 30s and 40s: mentor 10 people, write a book, run a marathon, live abroad, start a foundation, see your grandkids grow. Legacy over novelty.',
  openGraph: {
    title: '50 Things to Do Before You Turn 50',
    description:
      'The 40s are peak ambition. Here are 50 bucket list goals that reflect depth, legacy, and a life fully inhabited.',
  },
  alternates: { canonical: 'https://significanthobbies.com/bucket-list-before-50' },
};

// Sourced from ~/lib/experiences so the suggestion engine can see these
// too; this page renders them, it no longer owns them.
const ITEMS = MILESTONES.filter((m) => m.horizon === 'before-50').map((m) => ({
  emoji: m.emoji,
  title: m.title,
  desc: m.description,
}));

const FAQ_ITEMS = [
  {
    q: 'Is it too late to start a bucket list at 40?',
    a: "Your 40s are statistically when most people are at peak earning, network breadth, and accumulated skill. The bucket list doesn't get smaller with age — it gets more specific and more achievable. The resources and context you have at 40 make many goals more possible, not less.",
  },
  {
    q: 'How does a before-50 bucket list differ from a before-30 list?',
    a: 'The before-30 list is about breadth — experiencing as many forms of life as possible. The before-50 list is about depth — becoming something, leaving something behind, and inhabiting your life rather than sampling it. The shift from novelty to meaning is the defining characteristic.',
  },
  {
    q: 'Who inspired turning 50 into a bucket list mission?',
    a: 'Will Smith famously skydived for his 50th birthday and has spoken publicly about using milestone birthdays to confront fears and attempt transformative experiences. His approach — treating a birthday as a declaration of intent rather than a retrospective — is worth stealing.',
  },
  {
    q: "What's the single most important thing to do before 50?",
    a: "Mentoring someone. The compounding effect of helping another person across a threshold you've already crossed is enormous — for them and for you. It's also the one goal on this list that forces you to articulate what you actually believe about how to live.",
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

export default function BucketListBefore50Page() {
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
                  Guided by Whale · 50 goals worth your best years
                </p>
                <TextGenerateEffect
                  as="h1"
                  words="50 Things to Do Before You Turn 50"
                  className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance"
                />
                <p className="text-muted-foreground text-lg max-w-xl">
                  The 40s are peak ambition. Here are 50 goals that reflect depth, legacy, and a
                  life fully inhabited — not just visited.
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
          The 40s are peak ambition
        </h2>
        <p className="text-foreground text-base leading-relaxed">
          Something shifts in your 30s and crystallizes in your 40s: you stop trying to figure out
          who you are and start deciding who you&apos;ll become. The before-50 bucket list
          isn&apos;t about novelty — it&apos;s about depth. It&apos;s the list of the person who
          knows enough to choose deliberately.
        </p>
        <p className="text-foreground text-base leading-relaxed">
          Will Smith skydived for his 50th birthday and has spoken about using decade milestones as
          declarations of intent — not retrospectives. The goal isn&apos;t to arrive at 50 having
          sampled everything; it&apos;s to arrive having become something. This list is built around
          that principle.
        </p>
        <p className="text-muted-foreground text-sm">
          See Will Smith&apos;s full bucket list journey:{' '}
          <Link
            href="/bucket-lists/will-smith"
            className="text-primary hover:text-lumi-600 font-medium transition-colors"
          >
            Will Smith&apos;s bucket list →
          </Link>
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
                <div className="flex items-start gap-4 hover:border-primary transition-all">
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
            Whale tracks your goals over time, shows you what you&apos;ve accomplished, and connects
            your ambitions to the famous people who share them.
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
