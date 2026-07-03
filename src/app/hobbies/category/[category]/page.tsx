import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JsonLd } from '~/components/json-ld';
import { Badge } from '~/components/ui/badge';
import { timelines, users } from '~/db/schema';
import { categoryImageSrc, categoryImageSrcSet } from '~/lib/category-images';
import { HOBBY_CATEGORIES, type HobbyCategory } from '~/lib/hobbies';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

interface Props {
  params: Promise<{ category: string }>;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Creative:
    'Express yourself through art, design, and craft. Creative hobbies are where imagination meets skill — from putting brush to canvas to shaping clay with your hands.',
  Music:
    'Whether you play, produce, or simply lose yourself in sound. Music hobbies range from picking up your first instrument to mastering audio production.',
  Physical:
    'Move your body, challenge your limits. Physical hobbies build strength, endurance, and the kind of clarity that only comes after a good sweat.',
  Intellectual:
    'Feed your curiosity. Intellectual hobbies stretch your mind — from deep reading to strategic games to learning a new language.',
  Gaming:
    'Play with purpose. Gaming hobbies connect you to stories, strategy, and communities — from board game nights to competitive esports.',
  Outdoor:
    'Step outside and explore. Outdoor hobbies connect you to nature — from tending a garden to spotting birds to sleeping under the stars.',
  Culinary:
    'Create with flavor. Culinary hobbies turn your kitchen into a playground — from perfecting sourdough to brewing the perfect cup.',
  Collecting:
    'Curate what matters. Collecting hobbies are about the thrill of the hunt and the joy of a well-organized shelf.',
  Making:
    'Build with your hands. Making hobbies produce tangible results — from woodworking joints to 3D-printed prototypes to hand-stitched leather.',
  Social:
    'Connect through shared experiences. Social hobbies bring people together — from hosting dinner parties to improv comedy to volunteering.',
};

function slugToCategory(slug: string): HobbyCategory | undefined {
  return HOBBY_CATEGORIES.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
}

export function generateStaticParams() {
  return HOBBY_CATEGORIES.map((c) => ({
    category: c.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = slugToCategory(slug);
  if (!cat) return { title: 'Category — SignificantHobbies' };
  return {
    title: `${cat.name} Hobbies — SignificantHobbies`,
    description: `Explore ${cat.hobbies.length} ${cat.name.toLowerCase()} hobbies. Browse community timelines, find tools, and discover your next ${cat.name.toLowerCase()} passion.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const cat = slugToCategory(slug);
  if (!cat) notFound();

  const description = CATEGORY_DESCRIPTIONS[cat.name] ?? '';

  // Query public timelines that contain any hobby from this category
  const categoryHobbyNames = new Set(cat.hobbies.map((h) => h.toLowerCase()));

  const rawTimelines = await db
    .select({
      id: timelines.id,
      title: timelines.title,
      slug: timelines.slug,
      phases: timelines.phases,
      updatedAt: timelines.updatedAt,
      userName: users.name,
      userUsername: users.username,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(eq(timelines.visibility, 'PUBLIC'))
    .orderBy(desc(timelines.updatedAt))
    .limit(100);

  const matchingTimelines = rawTimelines.filter((t) => {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], 'hobby-category:filter:phases');
    return phases.some((p) => p.hobbies.some((h) => categoryHobbyNames.has(h.name.toLowerCase())));
  });

  const displayedTimelines = matchingTimelines.slice(0, 6);

  const relatedCategories = HOBBY_CATEGORIES.filter((c) => c.name !== cat.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Hobbies',
              item: 'https://significanthobbies.com/hobbies',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${cat.name} Hobbies`,
              item: `https://significanthobbies.com/hobbies/category/${slug}`,
            },
          ],
        }}
      />

      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/hobbies" className="text-sm text-muted-foreground hover:text-foreground">
          ← Hobby directory
        </Link>
      </div>

      {/* Image header — photo with a simple bottom darkening for text */}
      <div className="relative -mx-4 mb-8 h-56 sm:mx-0 sm:h-72 sm:rounded-xl overflow-hidden">
        {categoryImageSrc(cat.name) ? (
          <img
            src={categoryImageSrc(cat.name, 1200)!}
            srcSet={categoryImageSrcSet(cat.name)!}
            sizes="(max-width: 640px) 100vw, 1200px"
            alt={`${cat.name} hobbies`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-card" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(12, 43, 41, 0.85) 0%, rgba(12, 43, 41, 0.3) 50%, transparent 80%)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{cat.emoji}</span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{cat.name}</h1>
          </div>
          <p className="mt-1 text-sm text-foreground/70">{cat.hobbies.length} hobbies</p>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed max-w-2xl mb-8">{description}</p>

      {/* Hobbies grid */}
      <div className="mb-12">
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Browse {cat.name.toLowerCase()} hobbies
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cat.hobbies.map((hobby) => {
            const hobbySlug = hobby.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={hobby} href={`/hobbies/${encodeURIComponent(hobbySlug)}`} prefetch={false}>
                <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-sm cursor-pointer">
                  <span className="font-medium text-foreground group-hover:text-foreground transition-colors text-sm">
                    {hobby}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Community timelines */}
      <div className="mb-12">
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Popular {cat.name.toLowerCase()} timelines
        </h2>
        {displayedTimelines.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {displayedTimelines.map((t) => {
              const phases = parseJSONColumn<Phase[]>(t.phases, [], 'hobby-category:render:phases');
              const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name)))
                .size;
              return (
                <Link
                  key={t.id}
                  href={getTimelineUrl({
                    id: t.id,
                    slug: t.slug,
                    user: t.userUsername ? { username: t.userUsername } : null,
                  })}
                  prefetch={false}
                >
                  <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30">
                    <h3 className="font-medium text-foreground group-hover:text-foreground transition-colors">
                      {t.title ?? 'Hobby Timeline'}
                    </h3>
                    {t.userName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        @{t.userUsername ?? t.userName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {phases.length} phases · {totalHobbies} hobbies
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
            <p className="text-muted-foreground">
              No public timelines for {cat.name.toLowerCase()} hobbies yet.
            </p>
            <Link href="/timeline/new">
              <button className="mt-3 text-sm text-foreground hover:text-foreground">
                Be the first →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mb-12 rounded-xl border border-foreground/20 bg-foreground/10 p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">
            Track your {cat.name.toLowerCase()} journey
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build a timeline that captures every phase of your hobby life.
          </p>
        </div>
        <Link
          href="/timeline/new"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-colors"
        >
          Start now →
        </Link>
      </div>

      {/* Related categories */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">Explore other categories</h2>
        <div className="flex flex-wrap gap-2">
          {relatedCategories.map((c) => {
            const catSlug = c.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={c.name} href={`/hobbies/category/${catSlug}`} prefetch={false}>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground cursor-pointer transition-colors py-1 px-3"
                >
                  {c.emoji} {c.name}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
