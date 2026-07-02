import { count, desc, eq, like, or } from 'drizzle-orm';
import Link from 'next/link';

import { timelines, users } from '~/db/schema';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

import { SearchPageClient } from './search-client';

export const metadata = { title: 'Search — SignificantHobbies' };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

const MAX_QUERY_LENGTH = 80;

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  // Cap to bound SQLite LIKE work and protect against pathological queries
  // pasted into the URL bar.
  const query = (q ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Search</h1>
          <p className="mt-2 text-muted-foreground">Find timelines, people, and hobbies.</p>
        </div>
        <SearchPageClient initialQuery="" />
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 py-20 text-center">
          <span className="mb-4 text-4xl">🔍</span>
          <p className="text-muted-foreground font-medium">Start typing to search</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Search for timelines, usernames, or hobbies
          </p>
        </div>
      </div>
    );
  }

  const lower = query.toLowerCase();
  // Strip LIKE wildcards so `%foo` doesn't match every username. Drizzle's
  // like() doesn't pass through an ESCAPE clause, so escaping with backslash
  // is a no-op in SQLite — removal is the safe move.
  const safeLower = lower.replace(/[%_]/g, '');
  const safeQuery = query.replace(/[%_]/g, '');

  // --- Timelines ---
  const rawTimelines = await db
    .select({
      id: timelines.id,
      title: timelines.title,
      visibility: timelines.visibility,
      slug: timelines.slug,
      phases: timelines.phases,
      createdAt: timelines.createdAt,
      updatedAt: timelines.updatedAt,
      userId: users.id,
      userName: users.name,
      userUsername: users.username,
      userImage: users.image,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(eq(timelines.visibility, 'PUBLIC'))
    .orderBy(desc(timelines.updatedAt))
    .limit(100);

  // Filter by title containing query (SQLite like is case-insensitive by default for ASCII)
  const filteredTimelines = rawTimelines.filter((t) => t.title?.toLowerCase().includes(lower));

  const timelineResults = filteredTimelines.slice(0, 20).map((raw) => {
    const phases = parseJSONColumn<Phase[]>(raw.phases, [], 'search:phases');
    return {
      id: raw.id,
      title: raw.title,
      visibility: raw.visibility as TimelineVisibility,
      slug: raw.slug,
      phases,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.userId
        ? { id: raw.userId, name: raw.userName, username: raw.userUsername, image: raw.userImage }
        : null,
    };
  });

  // --- People ---
  const userResults = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
    })
    .from(users)
    .where(or(like(users.username, `%${safeLower}%`), like(users.name, `%${safeQuery}%`)))
    .limit(20);

  // Get timeline counts for each user
  const userWithCounts = await Promise.all(
    userResults.map(async (u) => {
      const [result] = await db
        .select({ count: count() })
        .from(timelines)
        .where(eq(timelines.userId, u.id));
      return { ...u, _count: { timelines: result?.count ?? 0 } };
    })
  );

  // --- Hobbies (from static list) ---
  const matchingHobbies = HOBBY_CATEGORIES.flatMap((cat) =>
    cat.hobbies
      .filter((h) => h.toLowerCase().includes(lower))
      .map((h) => ({ hobby: h, category: cat.name, emoji: cat.emoji }))
  ).slice(0, 20);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <p className="mt-2 text-muted-foreground">Find timelines, people, and hobbies.</p>
      </div>

      <SearchPageClient initialQuery={query} />

      <div className="mt-8 space-y-10">
        {/* --- Timelines section --- */}
        <section className="scroll-reveal">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Timelines
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {timelineResults.length}
            </span>
          </h2>
          {timelineResults.length > 0 ? (
            <div className="space-y-2">
              {timelineResults.map((t) => {
                const totalHobbies = new Set(
                  t.phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase()))
                ).size;
                const username = t.user?.username ?? t.user?.name;
                return (
                  <Link key={t.id} href={getTimelineUrl(t)}>
                    <div className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/30 hover:bg-card/40">
                      <div>
                        <p className="font-medium text-foreground group-hover:text-foreground transition-colors">
                          {t.title ?? 'Hobby Timeline'}
                        </p>
                        {username && (
                          <p className="mt-0.5 text-xs text-muted-foreground/60">@{username}</p>
                        )}
                      </div>
                      <p className="shrink-0 pl-4 text-xs text-muted-foreground/60">
                        {t.phases.length} phases &middot; {totalHobbies} hobbies
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/40 px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No timelines found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </section>

        {/* --- People section --- */}
        <section className="scroll-reveal scroll-reveal-d2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            People
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {userWithCounts.length}
            </span>
          </h2>
          {userWithCounts.length > 0 ? (
            <div className="space-y-2">
              {userWithCounts.map((user) => (
                <Link key={user.id} href={user.username ? `/u/${user.username}` : '#'}>
                  <div className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-foreground/30 hover:bg-card/40">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-sm font-semibold text-muted-foreground border border-border">
                      {(user.name ?? user.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                        {user.name ?? user.username}
                      </p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground/60">@{user.username}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground/60">
                      {user._count.timelines} timeline{user._count.timelines !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/40 px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No people found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </section>

        {/* --- Hobbies section --- */}
        <section className="scroll-reveal scroll-reveal-d3">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Hobbies
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {matchingHobbies.length}
            </span>
          </h2>
          {matchingHobbies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchingHobbies.map(({ hobby, category, emoji }) => (
                <Link
                  key={hobby}
                  href={`/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, '-'))}`}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                    <span>{emoji}</span>
                    {hobby}
                    <span className="text-muted-foreground/60 text-xs">{category}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/40 px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No hobbies found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
