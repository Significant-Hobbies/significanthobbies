import type { Metadata } from 'next';
import Link from 'next/link';

import { DESTINATIONS, type Destination, type DestinationRegion } from '~/lib/experiences';

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

export const metadata: Metadata = {
  title: 'Ultimate Travel Bucket List: 75 Destinations to See Before You Die',
  description:
    '75 travel bucket list destinations organized by region: Europe, Asia, Americas, Africa & Middle East, Oceania & Antarctica. With notes on why each one belongs on every serious list.',
  openGraph: {
    title: 'Ultimate Travel Bucket List: 75 Destinations to See Before You Die',
    description:
      'From Stonehenge (Obama) to the Serengeti (Oprah) to Namibia (Clinton) — 75 destinations worth crossing the world for.',
  },
  alternates: { canonical: 'https://significanthobbies.com/travel-bucket-list' },
};

// Sourced from ~/lib/experiences. These 75 destinations were unreachable by
// any other code while they lived here; the page renders them now, it does not
// own them.
const byRegion = (region: DestinationRegion) => DESTINATIONS.filter((d) => d.region === region);
const EUROPE = byRegion('europe');
const ASIA = byRegion('asia');
const AMERICAS = byRegion('americas');
const AFRICA_MIDDLE_EAST = byRegion('africa-middle-east');
const OCEANIA_ANTARCTICA = byRegion('oceania-antarctica');

const REGIONS = [
  { id: 'europe', label: 'Europe', emoji: '🏰', color: 'sky', items: EUROPE },
  { id: 'asia', label: 'Asia', emoji: '🏯', color: 'red', items: ASIA },
  { id: 'americas', label: 'Americas', emoji: '🗽', color: 'emerald', items: AMERICAS },
  {
    id: 'africa-middle-east',
    label: 'Africa & Middle East',
    emoji: '🦁',
    color: 'coral',
    items: AFRICA_MIDDLE_EAST,
  },
  {
    id: 'oceania-antarctica',
    label: 'Oceania & Antarctica',
    emoji: '🐧',
    color: 'teal',
    items: OCEANIA_ANTARCTICA,
  },
];

const REGION_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  red: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    badge: 'bg-destructive/15 text-destructive border-destructive/30',
    dot: 'bg-destructive/80',
  },
  emerald: {
    bg: 'bg-foreground/10',
    border: 'border-foreground/20',
    text: 'text-foreground',
    badge: 'bg-foreground/10 text-foreground border-foreground/20',
    dot: 'bg-foreground',
  },
  coral: {
    bg: 'bg-primary/10',
    border: 'border-lumi-200',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary border-lumi-200',
    dot: 'bg-primary',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-400',
  },
};

const FAQ_ITEMS = [
  {
    q: 'How do you choose which countries to visit first?',
    a: "Start with accessibility and personal resonance, not rankings. The best first international trip is the one you'll actually take. Prioritize countries where a language barrier won't stop you from getting lost — and then deliberately go somewhere where it will.",
  },
  {
    q: 'Is it worth visiting famous destinations that are now overcrowded?',
    a: "Yes, but with strategy. Most overcrowded destinations have off-season windows or early-morning access where the experience is qualitatively different. The Taj Mahal at dawn and the Taj Mahal at noon are almost different places. Go when others don't.",
  },
  {
    q: 'How did famous people like Obama, Oprah, and Clinton approach travel?',
    a: "All three have spoken about travel as a tool for perspective rather than leisure. Obama's Stonehenge visit, Oprah's Serengeti experience, and Clinton's Namibia trip share a common theme: places that force you to reckon with history, scale, or nature at a level that ordinary life doesn't provide.",
  },
  {
    q: 'Should I travel slowly or cover more ground?',
    a: 'Slow travel produces better memories and deeper experiences. Research on episodic memory shows that novelty within a continuous experience (one country, many villages) creates richer recall than rapid location-hopping (many countries, brief stops). Two weeks in one region beats two weeks across six.',
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

export default function TravelBucketListPage() {
  const totalDestinations = REGIONS.reduce((sum, r) => sum + r.items.length, 0);

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
                  Guided by Whale · {totalDestinations} destinations across 5 regions
                </p>
                <TextGenerateEffect
                  as="h1"
                  words="The Ultimate Travel Bucket List (75 Destinations)"
                  className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance"
                />
                <p className="text-muted-foreground text-lg max-w-xl">
                  From Stonehenge to the Serengeti to Antarctica — 75 places organized by region,
                  with notes on why each one belongs on every serious list.
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-foreground hover:bg-lumi-600 transition-colors shadow-md"
                  >
                    Build my travel list
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

      {/* ── Region nav ───────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {REGIONS.map((region) => {
              const s = REGION_STYLES[region.color];
              return (
                <a
                  key={region.id}
                  href={`#${region.id}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${s.badge}`}
                >
                  {region.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Destinations by region ───────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {REGIONS.map((region, regionIdx) => {
          const s = REGION_STYLES[region.color];
          let counter = REGIONS.slice(0, regionIdx).reduce((sum, r) => sum + r.items.length, 0);
          return (
            <section key={region.id} id={region.id} className="scroll-mt-28 space-y-6">
              <FadeIn>
                <div>
                  <h2 className="text-2xl font-bold text-foreground text-balance">
                    {region.label}
                  </h2>
                  <p className={`text-sm ${s.text} font-medium`}>
                    {region.items.length} destinations
                  </p>
                </div>
              </FadeIn>

              <StaggerContainer className="space-y-3">
                {region.items.map((dest, j) => {
                  counter++;
                  return (
                    <StaggerItem key={j}>
                      <SpotlightCard
                        className={`border ${s.border} ${s.bg} shadow-soft`}
                        innerClassName="px-5 py-4 space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${s.text}`}>{counter}</span>
                              <h3 className="font-semibold text-foreground text-sm leading-snug">
                                {dest.name}
                              </h3>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {dest.why}
                            </p>
                            {dest.famous && (
                              <p className="text-xs text-muted-foreground">
                                <Link
                                  href={`/bucket-lists/${dest.famous.slug}`}
                                  className={`font-medium ${s.text} hover:underline transition-colors`}
                                  prefetch={false}
                                >
                                  {dest.famous.name}
                                </Link>{' '}
                                {dest.famous.note}.
                              </p>
                            )}
                          </div>
                        </div>
                      </SpotlightCard>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </section>
          );
        })}
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
            Whale tracks your travel bucket list, shows your progress across regions, and matches
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
