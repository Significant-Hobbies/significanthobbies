import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
  TextGenerateEffect,
} from '~/components/aceternity';
import { Lumi } from '~/components/lumi';
import { BUCKET_ITEM_CATEGORIES, FAMOUS_BUCKET_LISTS } from '~/lib/famous-bucket-lists';

export const metadata: Metadata = {
  title: 'Bucket Lists — SignificantHobbies',
  description:
    'Explore the bucket lists of presidents, athletes, billionaires, and icons. Find the life you want to live.',
  openGraph: {
    title: "What do the world's most remarkable people want to do before they die?",
    description:
      'Browse verified bucket lists from Will Smith, Obama, Serena Williams, Elon Musk and more. Find your next great ambition.',
  },
};

const CATEGORY_BORDER_HOVER: Record<string, string> = {
  travel: 'hover:border-sky-300',
  adventure: 'hover:border-orange-300',
  creative: 'hover:border-purple-300',
  achievement: 'hover:border-lumi-200',
  social: 'hover:border-rose-300',
  humanitarian: 'hover:border-foreground/30',
};

function getDominantCategory(slug: string) {
  const list = FAMOUS_BUCKET_LISTS.find((l) => l.slug === slug);
  if (!list) return null;
  const counts: Record<string, number> = {};
  for (const item of list.items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// Computed from source data so it never drifts
const TOTAL_ITEMS = FAMOUS_BUCKET_LISTS.reduce((sum, p) => sum + p.items.length, 0);
const TOTAL_PEOPLE = FAMOUS_BUCKET_LISTS.length;
const TOTAL_CATEGORIES = Object.keys(BUCKET_ITEM_CATEGORIES).length;

export default function BucketListsPage() {
  return (
    <main className="bg-card">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-card pt-20 pb-16 px-4">
        <GridBackground />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Lumi left-aligned */}
              <div className="shrink-0">
                <Lumi size={100} glow float />
              </div>
              {/* Headline block */}
              <div className="space-y-5 text-center sm:text-left">
                <p className="text-primary text-sm font-semibold">Guided by Lumi</p>
                <TextGenerateEffect
                  words="Your bucket list is a love letter to your future self."
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground text-balance"
                />
                <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                  The world&apos;s most remarkable people have written theirs down. Browse their
                  lists — then build yours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-foreground hover:bg-lumi-600 active:scale-95 transition-all duration-150 shadow-md"
                  >
                    ✨ Start my list
                  </Link>
                  <a
                    href="#lists"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
                  >
                    Browse famous lists ↓
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Category pills */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-2 justify-center mt-10">
              {Object.entries(BUCKET_ITEM_CATEGORIES).map(([key, { label, emoji }]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground"
                >
                  {emoji} {label}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { value: TOTAL_PEOPLE, label: 'famous people' },
              { value: TOTAL_ITEMS, label: 'verified items' },
              { value: TOTAL_CATEGORIES, label: 'categories' },
              { value: '100%', label: 'free' },
            ].map(({ value, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-xl font-bold text-primary">{value}</span>
                <span className="text-muted-foreground">{label}</span>
                {i < 3 && (
                  <span className="hidden sm:inline-block ml-8 text-muted-foreground/40 select-none">
                    ·
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Person grid ──────────────────────────────────────────────────── */}
      <section id="lists" className="bg-card pb-24 pt-16">
        <div className="mx-auto max-w-5xl px-4 space-y-10">
          <FadeIn>
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                Famous bucket lists
              </h2>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Click any person to see their full list — and borrow items for yours.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FAMOUS_BUCKET_LISTS.map((person) => {
              const done = person.items.filter((i) => i.status === 'done').length;
              const total = person.items.length;
              const pct = Math.round((done / total) * 100);
              const dom = getDominantCategory(person.slug);
              const borderHover = dom
                ? (CATEGORY_BORDER_HOVER[dom] ?? 'hover:border-lumi-200')
                : 'hover:border-lumi-200';

              // Circular SVG progress ring — 60px
              const r = 24;
              const circ = 2 * Math.PI * r;
              const offset = circ * (1 - pct / 100);

              return (
                <StaggerItem key={person.slug}>
                  <CardHoverEffect className="h-full">
                    <Link
                      href={`/bucket-lists/${person.slug}`}
                      className={`group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft ${borderHover} hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
                      prefetch={false}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className="text-4xl leading-none">{person.emoji}</span>
                        {/* Circular progress — 60px */}
                        <svg
                          width="60"
                          height="60"
                          viewBox="0 0 60 60"
                          className="shrink-0 -rotate-90"
                        >
                          <circle
                            cx="30"
                            cy="30"
                            r={r}
                            fill="none"
                            stroke="#f5f5f4"
                            strokeWidth="4"
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r={r}
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            className="stroke-primary transition-all duration-700"
                          />
                          <text
                            x="30"
                            y="30"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                              fontSize: '11px',
                              fill: '#78716c',
                              fontWeight: 600,
                              transform: 'rotate(90deg)',
                              transformOrigin: '30px 30px',
                            }}
                          >
                            {pct}%
                          </text>
                        </svg>
                      </div>

                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {person.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                        {person.knownFor}
                      </p>

                      {/* Top 2 items preview */}
                      <ul className="mt-5 space-y-2">
                        {person.items.slice(0, 2).map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2.5 text-sm text-muted-foreground"
                          >
                            <span
                              className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                                item.status === 'done'
                                  ? 'border-primary bg-primary'
                                  : 'border-border'
                              }`}
                            />
                            <span
                              className={
                                item.status === 'done' ? 'line-through text-muted-foreground' : ''
                              }
                            >
                              {item.title.length > 46 ? `${item.title.slice(0, 46)}…` : item.title}
                            </span>
                          </li>
                        ))}
                        {total > 2 && (
                          <li className="text-xs text-muted-foreground pl-6">+{total - 2} more</li>
                        )}
                      </ul>

                      {/* Hover CTA */}
                      <div className="mt-5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        View list →
                      </div>
                    </Link>
                  </CardHoverEffect>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary">
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center space-y-6">
          <div className="flex justify-center">
            <Lumi size={80} glow float onDark />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight text-balance">
            Your turn. What do you want to do
            <br className="hidden sm:block" /> before you die?
          </h2>
          <p className="text-foreground/80 text-base max-w-sm mx-auto">
            Lumi will help you discover what belongs on your list — based on who you are, not who
            everyone else expects you to be.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-bold text-primary hover:bg-foreground/5 active:scale-95 transition-all duration-150 shadow-lg"
            >
              ✨ Start my bucket list
            </Link>
            <Link
              href="/find-your-hobby"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-card/10 px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-card/20 transition-colors duration-150"
            >
              Take the hobby quiz →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
