import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FadeIn, SpotlightCard } from '~/components/aceternity';
import { HobbyRoadmapCard } from '~/components/hobby-roadmap-card';
import { JsonLd } from '~/components/json-ld';
import { Badge } from '~/components/ui/badge';
import { timelines, users } from '~/db/schema';
import { blogPosts } from '~/lib/blog-posts';
import { getCategoryForHobby, HOBBY_CATEGORIES } from '~/lib/hobbies';
import { getRelatedHobbies } from '~/lib/hobby-affinities';
import { getResourcesForHobby } from '~/lib/hobby-resources';
import { getRoadmapForHobby } from '~/lib/hobby-roadmap';
import { safeDecodeURIComponent } from '~/lib/slug';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

interface Props {
  params: Promise<{ hobby: string }>;
}

function slugToHobby(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const revalidate = 3600; // 1 hour ISR

export async function generateStaticParams() {
  return HOBBY_CATEGORIES.flatMap((c) =>
    c.hobbies.map((h) => ({
      hobby: h.toLowerCase().replace(/\s+/g, '-'),
    }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { hobby } = await params;
  const decoded = safeDecodeURIComponent(hobby);
  if (!decoded) return {};
  const name = slugToHobby(decoded);
  return {
    title: `${name} — SignificantHobbies`,
    description: `Explore ${name} — see community timelines, find tools and resources, and discover related hobbies on SignificantHobbies.`,
  };
}

export default async function HobbyDetailPage({ params }: Props) {
  const { hobby: hobbySlug } = await params;
  const decoded = safeDecodeURIComponent(hobbySlug);
  if (!decoded) notFound();
  const hobbyName = slugToHobby(decoded);

  const category = getCategoryForHobby(hobbyName);
  if (!category) notFound();

  const session = await getServerAuthSession();
  const isLoggedIn = !!session?.user;

  // Find public timelines that include this hobby
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
    .limit(50);

  const matchingTimelines = rawTimelines.filter((t) => {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], 'hobby-detail:filter:phases');
    return phases.some((p) =>
      p.hobbies.some((h) => h.name.toLowerCase() === hobbyName.toLowerCase())
    );
  });

  const popularityCount = matchingTimelines.length;

  const otherHobbies = category.hobbies.filter((h) => h.toLowerCase() !== hobbyName.toLowerCase());

  const resources = getResourcesForHobby(hobbyName);
  const roadmap = getRoadmapForHobby(hobbyName);
  const crossCategoryHobbies = getRelatedHobbies(hobbyName);

  const relatedPosts = blogPosts
    .filter((post) => {
      const search = hobbyName.toLowerCase();
      return (
        post.title.toLowerCase().includes(search) ||
        post.excerpt.toLowerCase().includes(search) ||
        post.content.some(
          (block) => block.type === 'paragraph' && block.text.toLowerCase().includes(search)
        )
      );
    })
    .slice(0, 2);

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
              name: hobbyName,
              item: `https://significanthobbies.com/hobbies/${hobbySlug}`,
            },
          ],
        }}
      />
      {/* Guest CTA banner */}
      {!isLoggedIn && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-foreground/30 bg-foreground/10 px-5 py-3">
          <p className="text-sm text-foreground">
            Track your <span className="font-semibold text-foreground">{hobbyName}</span> journey
          </p>
          <Link
            href="/timeline/new"
            className="shrink-0 text-sm font-medium text-foreground hover:text-foreground transition-colors"
          >
            Start now →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <Link href="/hobbies" className="text-sm text-muted-foreground hover:text-foreground">
          ← All hobbies
        </Link>
      </div>
      <FadeIn className="mb-8 flex items-center gap-3">
        <span className="text-4xl">{category.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{hobbyName}</h1>
          <p className="text-muted-foreground text-sm">{category.name}</p>
        </div>
      </FadeIn>

      {/* Popularity */}
      <FadeIn className="mb-8 flex items-center gap-3" delay={0.08}>
        <div className="rounded-xl border border-border bg-card px-5 py-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-foreground">{popularityCount}</span>
          <span className="text-sm text-muted-foreground">
            {popularityCount === 1 ? (
              'public timeline features this hobby'
            ) : popularityCount === 0 ? (
              <span>
                public timelines yet —{' '}
                <Link
                  href="/timeline/new"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  be the first!
                </Link>
              </span>
            ) : (
              'public timelines feature this hobby'
            )}
          </span>
        </div>
      </FadeIn>

      {/* Roadmap: concrete next-step path from today → 3 months */}
      <FadeIn className="mb-8" delay={0.12}>
        <HobbyRoadmapCard roadmap={roadmap} />
      </FadeIn>

      {/* Resources */}
      {resources.length > 0 && (
        <FadeIn className="mb-8" delay={0.1}>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            Tools & resources for {hobbyName}
          </h2>
          <div className="space-y-3">
            {resources.map((r, i) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 rounded-xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-sm ${
                  i === 0 ? 'p-5' : 'px-5 py-3'
                }`}
              >
                <span className={i === 0 ? 'text-3xl' : 'text-xl'}>{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-foreground group-hover:text-foreground transition-colors ${i === 0 ? 'text-base' : 'text-sm'}`}
                    >
                      {r.name}
                    </span>
                    {r.type === 'own' && (
                      <span className="rounded-full bg-foreground/10 border border-foreground/20 px-2 py-0.5 text-[10px] font-medium text-foreground">
                        by SignificantHobbies
                      </span>
                    )}
                    {r.type === 'sponsored' && (
                      <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-medium text-foreground">
                        sponsored
                      </span>
                    )}
                  </div>
                  <p className={`text-muted-foreground ${i === 0 ? 'text-sm mt-0.5' : 'text-xs'}`}>
                    {r.description}
                  </p>
                </div>
                <span className="text-muted-foreground/40 group-hover:text-foreground transition-colors text-sm">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <FadeIn className="mb-8" delay={0.1}>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Related articles</h2>
          <div className="space-y-3">
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} prefetch={false}>
                <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{post.emoji}</span>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-foreground transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.readTime} min read
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Community timelines */}
      <FadeIn className="mb-12" delay={0.1}>
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          Community timelines featuring {hobbyName}
        </h2>
        {matchingTimelines.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matchingTimelines.map((t) => {
              const phases = parseJSONColumn<Phase[]>(t.phases, [], 'hobby-detail:render:phases');
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
            <p className="text-muted-foreground">No public timelines feature {hobbyName} yet.</p>
            <Link href="/timeline/new">
              <button className="mt-3 text-sm text-foreground hover:text-foreground">
                Be the first →
              </button>
            </Link>
          </div>
        )}
      </FadeIn>

      {/* Related hobbies in same category */}
      {otherHobbies.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            {category.emoji} Other {category.name.toLowerCase()} hobbies
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherHobbies.map((h) => (
              <Link
                key={h}
                href={`/hobbies/${encodeURIComponent(h.toLowerCase().replace(/\s+/g, '-'))}`}
                prefetch={false}
              >
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground cursor-pointer transition-colors"
                >
                  {category.emoji} {h}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cross-category related hobbies */}
      {crossCategoryHobbies.length > 0 && (
        <FadeIn delay={0.1}>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">You might also like</h2>
          <p className="mb-4 text-xs text-muted-foreground/60">
            Hobbies people pair with {hobbyName.toLowerCase()}, often from a completely different
            direction.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {crossCategoryHobbies.map((affinity) => {
              const affinityCategory = getCategoryForHobby(affinity.name);
              const slug = affinity.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={affinity.name}
                  href={`/hobbies/${encodeURIComponent(slug)}`}
                  className="block h-full"
                  prefetch={false}
                >
                  <SpotlightCard className="h-full p-4" innerClassName="h-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{affinityCategory?.emoji ?? '🎯'}</span>
                      <span className="font-semibold text-foreground text-sm group-hover:text-foreground transition-colors">
                        {affinity.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {affinity.reason}
                    </p>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
