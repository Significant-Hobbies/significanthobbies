import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JsonLd } from '~/components/json-ld';
import {
  findExperience,
  PAGED_EXPERIENCES,
  relatedExperiences,
  type ExperienceEntry,
} from '~/lib/experiences';
import { generateQuestChain } from '~/lib/quest-chains';
import { safeDecodeURIComponent } from '~/lib/slug';

/**
 * A page per experience — but only for the ones carrying written prose.
 *
 * `PAGED_EXPERIENCES` deliberately excludes the 150 bare ideas. A page whose
 * only unique content is its own heading is a thin page, thin pages are a
 * site-wide ranking signal, and there are already 122 hobby pages that work.
 * The bare ideas stay browsable on /experiences and earn a URL when someone
 * writes them a sentence.
 */
export async function generateStaticParams() {
  return PAGED_EXPERIENCES.map((e) => ({ slug: e.slug }));
}

function resolve(raw: string): ExperienceEntry | undefined {
  const slug = safeDecodeURIComponent(raw);
  if (!slug) return undefined;
  const entry = findExperience(slug);
  // Findable in the corpus is not the same as having a page.
  return entry?.description ? entry : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const entry = resolve((await params).slug);
  if (!entry) return { title: 'Not found — SignificantHobbies' };
  return {
    title: `${entry.title} — SignificantHobbies`,
    description: entry.description,
    alternates: { canonical: `/experiences/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: `/experiences/${entry.slug}`,
      type: 'article',
    },
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = resolve((await params).slug);
  if (!entry) notFound();

  // The chain is the "how would I actually start" section. It is templated per
  // category, so it supports the page rather than being its substance — the
  // written description above it is what makes this page worth indexing.
  const chain = generateQuestChain({
    bucketItemId: entry.slug,
    title: entry.title,
    category: entry.category,
  });
  const related = relatedExperiences(entry, 6);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: entry.title,
          description: entry.description,
          step: chain.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.title,
            text: s.description,
          })),
        }}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href="/experiences" className="hover:text-foreground">
          ← Everything you could do
        </Link>
      </nav>

      <h1
        className="mt-6 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
        style={{ textWrap: 'balance', lineHeight: 1.12 }}
      >
        {entry.emoji} {entry.title}
      </h1>

      <p className="mt-5 max-w-[62ch] text-lg text-foreground/80" style={{ lineHeight: 1.6 }}>
        {entry.description}
      </p>

      <p className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Tag>{entry.category}</Tag>
        {entry.region ? <Tag>{entry.region.replace(/-/g, ' ')}</Tag> : null}
        {entry.horizon ? <Tag>{entry.horizon.replace('-', ' ')}</Tag> : null}
      </p>

      {entry.famous ? (
        <p className="mt-6 max-w-[62ch] text-base text-muted-foreground">
          <Link
            href={`/bucket-lists/${entry.famous.slug}`}
            prefetch={false}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {entry.famous.name}
          </Link>{' '}
          {entry.famous.note}.
        </p>
      ) : null}

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-foreground">How you would actually start</h2>
        <ol className="mt-5 space-y-4">
          {chain.map((step) => (
            <li key={step.questId} className="border-border border-l-2 pl-4">
              <p className="font-medium text-foreground">
                {step.emoji} {step.title}
              </p>
              <p className="mt-1 max-w-[62ch] text-base text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-serif text-2xl text-foreground">If this appeals, so might these</h2>
          <ul className="mt-4 divide-y divide-border border-border border-t">
            {related.map((r) => (
              <li key={r.slug} className="py-3">
                {r.description ? (
                  <Link
                    href={`/experiences/${r.slug}`}
                    prefetch={false}
                    className="text-base text-foreground underline-offset-4 hover:underline"
                  >
                    {r.emoji} {r.title}
                  </Link>
                ) : (
                  <span className="text-base text-muted-foreground">
                    {r.emoji} {r.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-14 border-border border-t pt-10">
        <Link
          href="/life-bingo"
          className="inline-block rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
        >
          Put this on a list
        </Link>
        <p className="mt-4 text-base text-muted-foreground">No account needed.</p>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-card px-2.5 py-1 capitalize">
      {children}
    </span>
  );
}
