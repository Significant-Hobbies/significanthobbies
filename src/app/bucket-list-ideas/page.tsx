import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { Whale } from '~/components/whale';
import { EXPERIENCES_BY_CATEGORY } from '~/lib/experiences';
import { FAMOUS_BUCKET_LISTS } from '~/lib/famous-bucket-lists';

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

// The corpus moved to ~/lib/experiences so the suggestion engine and any
// future surface can read it. This page renders it; it no longer owns it.
const IDEAS_BY_CATEGORY = EXPERIENCES_BY_CATEGORY;

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
    bg: 'bg-primary/10',
    border: 'border-lumi-200',
    text: 'text-primary',
    dot: 'bg-primary',
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
      <section className="relative bg-card pt-16 pb-10 px-4">
        <GridBackground />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn>
            {/* Whale in a gold-tinted card */}
            <div className="flex items-center gap-5 rounded-2xl border border-lumi-200 bg-primary/10 px-6 py-5 mb-8 max-w-md shadow-soft">
              <Whale size={80} glow float />
              <div>
                <p className="text-primary text-sm font-semibold mb-1">
                  Guided by Whale · {totalIdeas}+ ideas
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Curated from real bucket lists of presidents, athletes, and icons.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance">
              Bucket list ideas <span className="text-primary">worth doing before you die</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl">
              Curated from the verified bucket lists of presidents, athletes, billionaires, and
              icons — then expanded to cover every kind of life well-lived.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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
          </FadeIn>
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
                  {cat.label}
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
          return (
            <section key={key} id={key} className="scroll-mt-28 space-y-6">
              <FadeIn>
                <div>
                  <h2 className="text-2xl font-bold text-foreground text-balance">{cat.label}</h2>
                  <p className={`text-sm ${style.text} font-medium`}>{cat.ideas.length} ideas</p>
                </div>
              </FadeIn>

              <StaggerContainer className="grid gap-2 sm:grid-cols-2">
                {cat.ideas.map((idea, i) => (
                  <StaggerItem key={i}>
                    <SpotlightCard
                      className={`border ${style.border} ${style.bg} shadow-soft`}
                      innerClassName="px-4 py-3"
                    >
                      <div className="flex items-start gap-3 group">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                        <span className="text-sm text-foreground leading-relaxed">{idea}</span>
                      </div>
                    </SpotlightCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Famous person who did something in this category */}
              {(() => {
                const famous = FAMOUS_BUCKET_LISTS.filter((p) =>
                  p.items.some((item) => item.category === key && item.status === 'done')
                ).slice(0, 2);
                if (famous.length === 0) return null;
                return (
                  <FadeIn>
                    <CardHoverEffect className={`border ${style.border} ${style.bg} shadow-soft`}>
                      <div className="px-5 py-4">
                        <p className={`text-sm font-semibold ${style.text} mb-3`}>
                          Famous people who checked {cat.label.toLowerCase()} off their list
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {famous.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/bucket-lists/${p.slug}`}
                              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-foreground font-medium transition-colors"
                              prefetch={false}
                            >
                              <span>{p.name}</span>
                              <span className="text-subtle text-xs">→</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </CardHoverEffect>
                  </FadeIn>
                );
              })()}
            </section>
          );
        })}
      </div>

      {/* ── Whale CTA ─────────────────────────────────────────────── */}
      <section className="bg-primary/10 border-t border-lumi-200">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Whale size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Found something that speaks to you?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Whale tracks your bucket list, shows your personality archetype, and matches you to the
            famous person whose ambitions look most like yours.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-foreground hover:bg-lumi-600 transition-colors shadow-md"
            >
              Start my bucket list
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
    </main>
  );
}
