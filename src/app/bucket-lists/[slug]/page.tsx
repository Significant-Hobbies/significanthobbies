import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  BorderBeam,
  FadeIn,
  GradientMesh,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { AddToMyListButton } from '~/components/add-to-my-list-button';
import { Whale } from '~/components/whale';
import {
  BUCKET_ITEM_CATEGORIES,
  FAMOUS_BUCKET_LISTS,
  getFamousBucketList,
} from '~/lib/famous-bucket-lists';
import { getServerAuthSession } from '~/server/auth';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return FAMOUS_BUCKET_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = getFamousBucketList(slug);
  if (!list) return {};
  const done = list.items.filter((i) => i.status === 'done').length;
  return {
    title: `${list.name}'s Bucket List (${done} completed) — SignificantHobbies`,
    description: `${list.items.length} verified bucket list items from ${list.name}. ${done} completed. ${list.knownFor}. Add any item to your own bucket list.`,
    openGraph: {
      title: `${list.name}'s Bucket List`,
      description: `${done} of ${list.items.length} items completed. Browse and add to your own list.`,
    },
    alternates: { canonical: `https://significanthobbies.com/bucket-lists/${slug}` },
  };
}

export default async function FamousBucketListPage({ params }: Props) {
  const { slug } = await params;
  const list = getFamousBucketList(slug);
  if (!list) notFound();

  const session = await getServerAuthSession();
  const isLoggedIn = !!session?.user?.id;

  const done = list.items.filter((i) => i.status === 'done').length;
  const total = list.items.length;
  const pct = Math.round((done / total) * 100);

  // Circular progress
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${list.name}'s Bucket List`,
    description: list.knownFor,
    numberOfItems: list.items.length,
    itemListElement: list.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      description: item.description,
    })),
  };

  return (
    <main className="bg-card">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Coral accent bar ─────────────────────────────────────────── */}
      <div className="bg-primary h-1" />

      {/* ── Light header ─────────────────────────────────────────────── */}
      <section className="relative bg-card border-b border-border">
        <GradientMesh />
        <div className="relative mx-auto max-w-3xl px-4 py-10 space-y-6">
          <FadeIn>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity"
            >
              ← All bucket lists
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex items-start gap-6">
              {/* Big emoji */}
              <div className="text-6xl sm:text-7xl shrink-0">{list.emoji}</div>
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                  {list.name}
                </h1>
                <p className="text-sm text-primary font-medium">{list.knownFor}</p>
              </div>
              {/* Circular progress — desktop */}
              <div className="shrink-0 hidden sm:block">
                <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                  <circle cx="36" cy="36" r={r} fill="none" stroke="#f5f5f4" strokeWidth="5" />
                  <circle
                    cx="36"
                    cy="36"
                    r={r}
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    className="stroke-primary"
                  />
                </svg>
                <p className="text-center text-xs text-muted-foreground mt-1">{pct}% done</p>
              </div>
            </div>
          </FadeIn>

          {/* Progress bar — mobile */}
          <FadeIn delay={0.15}>
            <div className="sm:hidden space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {done} of {total} completed
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </FadeIn>

          {list.quote && (
            <FadeIn delay={0.2}>
              <blockquote className="border-l-2 border-lumi pl-4 italic text-muted-foreground text-sm">
                &ldquo;{list.quote.text}&rdquo;
              </blockquote>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── Items ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        {!isLoggedIn && (
          <FadeIn>
            <div className="flex items-center gap-3 rounded-xl border border-lumi-200 bg-primary/10 px-5 py-3">
              <Whale size={36} float />
              <p className="text-sm text-foreground">
                <a href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </a>{' '}
                to add any of these to your own bucket list.
              </p>
            </div>
          </FadeIn>
        )}

        <SpotlightCard className="shadow-soft" innerClassName="p-0">
          <div className="relative overflow-hidden rounded-xl">
            <BorderBeam />
            <StaggerContainer className="p-1.5">
              <ul className="space-y-3">
                {list.items.map((item, i) => {
                  const cat = item.category ? BUCKET_ITEM_CATEGORIES[item.category] : null;
                  const isDone = item.status === 'done';

                  return (
                    <StaggerItem key={i}>
                      <li
                        className={`group rounded-2xl border p-5 transition-all duration-200 ${
                          isDone
                            ? 'border-lumi-200 bg-primary/10'
                            : 'border-border bg-card hover:border-border hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Status indicator — coral for done */}
                          <div
                            className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? 'border-primary bg-primary text-foreground'
                                : 'border-border text-transparent'
                            }`}
                          >
                            ✓
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3
                                className={`font-semibold text-foreground ${isDone ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {item.title}
                              </h3>
                              {cat && (
                                <span
                                  className={`shrink-0 text-xs rounded-full px-2.5 py-1 font-medium border ${
                                    isDone
                                      ? 'border-lumi-200 text-primary bg-primary/10'
                                      : 'border-border text-muted-foreground bg-card/40'
                                  }`}
                                >
                                  {cat.emoji} {cat.label}
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>

                            {item.completedNote && (
                              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-primary/10 border border-lumi-200 px-3 py-2">
                                <span className="text-primary text-sm shrink-0">✓</span>
                                <p className="text-xs text-lumi-600 leading-relaxed">
                                  {item.completedNote}
                                </p>
                              </div>
                            )}

                            {isLoggedIn && (
                              <div className="mt-3">
                                <AddToMyListButton
                                  title={item.title}
                                  description={item.description}
                                  category={item.category}
                                  sourceSlug={list.slug}
                                  sourceItemTitle={item.title}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    </StaggerItem>
                  );
                })}
              </ul>
            </StaggerContainer>
          </div>
        </SpotlightCard>

        {/* Sources */}
        {list.sources && list.sources.length > 0 && (
          <div className="rounded-xl border border-border bg-card/40 px-5 py-4 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Sources</p>
            <ul className="space-y-1">
              {list.sources.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/40 mt-0.5">·</span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic">
              Only items with verified public sources are included.
            </p>
          </div>
        )}

        {/* Back to all */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Link
            href="/bucket-lists"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Browse all famous lists
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-primary hover:text-lumi-600 transition-colors"
            >
              View my bucket list →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
