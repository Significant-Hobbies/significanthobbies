import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3">
          <p className="text-sm text-stone-700">
            Track your <span className="font-semibold text-emerald-600">{hobbyName}</span> journey
          </p>
          <Link
            href="/timeline/new"
            className="shrink-0 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Start now →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <Link href="/hobbies" className="text-sm text-stone-500 hover:text-stone-700">
          ← All hobbies
        </Link>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <span className="text-4xl">{category.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{hobbyName}</h1>
          <p className="text-stone-500 text-sm">{category.name}</p>
        </div>
      </div>

      {/* Popularity */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-stone-200 bg-white px-5 py-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-emerald-600">{popularityCount}</span>
          <span className="text-sm text-stone-600">
            {popularityCount === 1 ? (
              'public timeline features this hobby'
            ) : popularityCount === 0 ? (
              <span>
                public timelines yet —{' '}
                <Link
                  href="/timeline/new"
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  be the first!
                </Link>
              </span>
            ) : (
              'public timelines feature this hobby'
            )}
          </span>
        </div>
      </div>

      {/* Roadmap: concrete next-step path from today → 3 months */}
      <div className="mb-8">
        <HobbyRoadmapCard roadmap={roadmap} />
      </div>

      {/* Resources */}
      {resources.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
            Tools & resources for {hobbyName}
          </h2>
          <div className="space-y-3">
            {resources.map((r, i) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 rounded-xl border border-stone-200 bg-white transition-all hover:border-emerald-400 hover:shadow-sm ${
                  i === 0 ? 'p-5' : 'px-5 py-3'
                }`}
              >
                <span className={i === 0 ? 'text-3xl' : 'text-xl'}>{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors ${i === 0 ? 'text-base' : 'text-sm'}`}
                    >
                      {r.name}
                    </span>
                    {r.type === 'own' && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        by SignificantHobbies
                      </span>
                    )}
                    {r.type === 'sponsored' && (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        sponsored
                      </span>
                    )}
                  </div>
                  <p className={`text-stone-500 ${i === 0 ? 'text-sm mt-0.5' : 'text-xs'}`}>
                    {r.description}
                  </p>
                </div>
                <span className="text-stone-300 group-hover:text-emerald-500 transition-colors text-sm">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
            Related articles
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <div className="group rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{post.emoji}</span>
                    <div>
                      <h3 className="font-medium text-stone-800 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">{post.readTime} min read</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Community timelines */}
      <div className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
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
                >
                  <div className="group rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-400">
                    <h3 className="font-medium text-stone-800 group-hover:text-emerald-600 transition-colors">
                      {t.title ?? 'Hobby Timeline'}
                    </h3>
                    {t.userName && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        @{t.userUsername ?? t.userName}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1.5">
                      {phases.length} phases · {totalHobbies} hobbies
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center">
            <p className="text-stone-500">No public timelines feature {hobbyName} yet.</p>
            <Link href="/timeline/new">
              <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700">
                Be the first →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Related hobbies in same category */}
      {otherHobbies.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
            {category.emoji} Other {category.name.toLowerCase()} hobbies
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherHobbies.map((h) => (
              <Link
                key={h}
                href={`/hobbies/${encodeURIComponent(h.toLowerCase().replace(/\s+/g, '-'))}`}
              >
                <Badge
                  variant="outline"
                  className="border-stone-200 text-stone-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors"
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
        <div>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-stone-500">
            You might also like
          </h2>
          <p className="mb-4 text-xs text-stone-400">
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
                  className="group block rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-400"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{affinityCategory?.emoji ?? '🎯'}</span>
                    <span className="font-semibold text-stone-800 text-sm group-hover:text-emerald-600 transition-colors">
                      {affinity.name}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{affinity.reason}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
