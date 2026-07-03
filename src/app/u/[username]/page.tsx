import { and, count, desc, eq } from 'drizzle-orm';
import { ArrowRight, ExternalLink, Pencil, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  FadeIn,
  GradientMesh,
  GridBackground,
  NumberTicker,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { BadgeCollection } from '~/components/badge-collection';
import { CommitmentCard } from '~/components/commitments/commitment-card';
import { FollowButton } from '~/components/follow-button';
import { LifeGrid } from '~/components/life-grid';
import { SuggestionsPanel } from '~/components/suggestions-panel';
import { Button } from '~/components/ui/button';
import { bucketListItems, follows, timelines, userQuests, users } from '~/db/schema';
import { getPublicCommitmentsForUser } from '~/lib/actions/commitments';
import type { StampRow } from '~/lib/commitments';
import { BUCKET_ITEM_CATEGORIES } from '~/lib/famous-bucket-lists';
import { getCategoryForHobby } from '~/lib/hobbies';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { Phase, TimelineVisibility } from '~/lib/types';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { parseJSONColumn } from '~/lib/utils';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return {
    title: `@${username} — SignificantHobbies`,
    description: `View @${username}'s hobby journey on SignificantHobbies — their timelines, hobby cloud, and badges.`,
  };
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Creative: 'border-purple-400/30 bg-purple-400/10 text-purple-300',
  Music: 'border-pink-400/30 bg-pink-400/10 text-pink-300',
  Physical: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  Intellectual: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
  Gaming: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  Outdoor: 'border-foreground/20 bg-foreground/10 text-foreground',
  Culinary: 'border-foreground/20 bg-foreground/10 text-foreground',
  Collecting: 'border-border bg-foreground/5 text-muted-foreground',
  Making: 'border-primary/30 bg-primary/10 text-lumi-300',
  Social: 'border-teal-400/30 bg-teal-400/10 text-teal-300',
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await getServerAuthSession();

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      website: true,
      creed: true,
      createdAt: true,
      earnedBadges: true,
      birthYear: true,
    },
  });

  if (!user) notFound();

  const isOwner = session?.user?.id === user.id;

  // Get follower and following counts
  const [followerResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, user.id));
  const [followingResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const followerCount = followerResult?.count ?? 0;
  const followingCount = followingResult?.count ?? 0;

  // Get timelines - public for visitors, all for owner. UNLISTED means
  // "anyone with the link" — it must never be listed on the public profile.
  const ownTimelines = isOwner
    ? await db
        .select()
        .from(timelines)
        .where(eq(timelines.userId, user.id))
        .orderBy(desc(timelines.updatedAt))
    : await db
        .select()
        .from(timelines)
        .where(and(eq(timelines.userId, user.id), eq(timelines.visibility, 'PUBLIC')))
        .orderBy(desc(timelines.updatedAt));

  // Parse earned badges
  const earnedBadgeIds = parseJSONColumn<string[]>(
    user.earnedBadges,
    [],
    `profile:badges:${user.id}`
  );

  // Public bucket list items for this profile
  const publicBucketItems = await db
    .select()
    .from(bucketListItems)
    .where(and(eq(bucketListItems.userId, user.id), eq(bucketListItems.visibility, 'public')))
    .orderBy(desc(bucketListItems.createdAt));

  // Commitments + stamps for the life grid and commitments section.
  const profileCommitments = await getPublicCommitmentsForUser(user.id);
  const birth = birthDateFromYear(user.birthYear);
  const stampedWeeks = new Set<number>();
  for (const c of profileCommitments) {
    for (const s of c.stamps) {
      const idx = weekIndexForDay(birth, s.dayDate);
      if (idx !== null) stampedWeeks.add(idx);
    }
  }
  const lifeGrid = buildLifeGrid(birth, stampedWeeks);

  // Check if the current user is following this profile
  let isFollowing = false;
  if (session?.user?.id && !isOwner) {
    const followRecord = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, session.user.id), eq(follows.followingId, user.id)),
    });
    isFollowing = !!followRecord;
  }

  const timelineList = ownTimelines.map((t) => {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], `profile:timeline:${t.id}`);
    return {
      id: t.id,
      title: t.title,
      visibility: t.visibility as TimelineVisibility,
      slug: t.slug,
      phases,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      user: { id: user.id, name: user.name, username: user.username, image: user.image },
    };
  });

  const allHobbies = [
    ...new Set(timelineList.flatMap((t) => t.phases.flatMap((p) => p.hobbies.map((h) => h.name)))),
  ];

  // Build hobby cloud: top 10 most-used hobbies by occurrence count
  const hobbyCountMap: Record<string, number> = {};
  for (const t of timelineList) {
    for (const p of t.phases) {
      for (const h of p.hobbies) {
        hobbyCountMap[h.name] = (hobbyCountMap[h.name] ?? 0) + 1;
      }
    }
  }
  const top10Hobbies = Object.entries(hobbyCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  // Completed quests — queried directly from the userQuests table so this works
  // for any public profile (the getCompletedQuests() action is auth-scoped to
  // the logged-in user only).
  const completedQuestRows = await db
    .select({
      id: userQuests.id,
      questId: userQuests.questId,
      title: userQuests.title,
      emoji: userQuests.emoji,
      description: userQuests.description,
      completedAt: userQuests.completedAt,
    })
    .from(userQuests)
    .where(and(eq(userQuests.userId, user.id), eq(userQuests.status, 'completed')))
    .orderBy(desc(userQuests.completedAt));

  // Years lived — evidence of time on earth.
  const yearsLived = user.birthYear ? new Date().getFullYear() - user.birthYear : 0;

  const displayName = user.name ?? username;

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12">
      {/* Monument backdrop — quiet grid + warm gold mesh */}
      <GridBackground />
      <GradientMesh />

      {/* ─── Section 1 — The Creed ─────────────────────────────────────────
          The opening plaque of the exhibit. Who is this person? */}
      <FadeIn className="relative">
        <div className="flex flex-col items-center text-center pt-8 pb-12">
          {/* Avatar — gold-bordered circle, the face on the plaque */}
          <div className="rounded-full p-1 ring-1 ring-[oklch(0.82_0.13_88/0.4)] shadow-[0_0_24px_4px_oklch(0.82_0.13_88/0.12)]">
            {user.image ? (
              <Image
                src={user.image}
                alt={displayName}
                width={96}
                height={96}
                className="rounded-full border-2 border-[oklch(0.82_0.13_88/0.5)]"
              />
            ) : (
              <div className="h-[96px] w-[96px] rounded-full border-2 border-[oklch(0.82_0.13_88/0.5)] bg-foreground/5 flex items-center justify-center text-3xl font-serif font-semibold text-muted-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* The creed — a quote on a museum wall */}
          <div className="mt-8 max-w-2xl">
            {user.creed ? (
              <>
                <p className="font-serif text-2xl sm:text-3xl italic leading-relaxed text-foreground">
                  &ldquo;{user.creed}&rdquo;
                </p>
                <div className="mx-auto mt-6 h-px w-16 bg-[oklch(0.82_0.13_88/0.4)]" />
              </>
            ) : user.bio ? (
              <>
                <p className="font-serif text-2xl sm:text-3xl italic leading-relaxed text-foreground">
                  &ldquo;{user.bio}&rdquo;
                </p>
                <div className="mx-auto mt-6 h-px w-16 bg-[oklch(0.82_0.13_88/0.4)]" />
              </>
            ) : (
              <p className="font-serif text-xl italic text-muted-foreground">
                {displayName} is building their stamp.
              </p>
            )}
          </div>

          {/* Name + username — the plaque inscription */}
          <div className="mt-6 flex items-center gap-2 flex-wrap justify-center">
            <h1 className="font-serif text-xl font-semibold text-foreground">{displayName}</h1>
            <span className="text-sm text-muted-foreground">@{user.username}</span>
            {isOwner && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            )}
          </div>

          {/* Website — a quiet footnote */}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Follow / owner actions — kept functional, styled quiet */}
          <div className="mt-5 flex items-center gap-3">
            {!isOwner && session?.user && (
              <FollowButton
                targetUserId={user.id}
                initialFollowing={isFollowing}
                initialCount={followerCount}
                isOwnProfile={false}
              />
            )}
            {!isOwner && !session?.user && (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.82_0.13_88/0.4)] px-4 py-1.5 text-sm font-medium text-foreground hover:bg-[oklch(0.82_0.13_88/0.08)] transition-colors"
                >
                  Follow
                </Link>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{followerCount}</span>{' '}
                  {followerCount === 1 ? 'follower' : 'followers'}
                </span>
              </>
            )}
            {isOwner && (
              <Link href="/timeline/new">
                <Button
                  variant="outline"
                  className="border-[oklch(0.82_0.13_88/0.4)] text-foreground hover:bg-[oklch(0.82_0.13_88/0.08)]"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  New timeline
                </Button>
              </Link>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ─── Section 2 — The Stamp ─────────────────────────────────────────
          Evidence of existence. This person was here. This is what they did. */}
      <FadeIn className="relative py-12" delay={0.05}>
        <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StaggerItem>
            <SpotlightCard className="shadow-soft h-full" innerClassName="p-5 text-center">
              <NumberTicker
                value={timelineList.length}
                className="font-serif text-3xl font-semibold text-[oklch(0.82_0.13_88)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {timelineList.length === 1 ? 'timeline' : 'timelines'}
              </p>
            </SpotlightCard>
          </StaggerItem>
          <StaggerItem>
            <SpotlightCard className="shadow-soft h-full" innerClassName="p-5 text-center">
              <NumberTicker
                value={allHobbies.length}
                className="font-serif text-3xl font-semibold text-[oklch(0.82_0.13_88)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {allHobbies.length === 1 ? 'hobby pursued' : 'hobbies pursued'}
              </p>
            </SpotlightCard>
          </StaggerItem>
          <StaggerItem>
            <SpotlightCard className="shadow-soft h-full" innerClassName="p-5 text-center">
              <NumberTicker
                value={completedQuestRows.length}
                className="font-serif text-3xl font-semibold text-[oklch(0.82_0.13_88)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {completedQuestRows.length === 1 ? 'quest completed' : 'quests completed'}
              </p>
            </SpotlightCard>
          </StaggerItem>
          <StaggerItem>
            <SpotlightCard className="shadow-soft h-full" innerClassName="p-5 text-center">
              {yearsLived > 0 ? (
                <NumberTicker
                  value={yearsLived}
                  className="font-serif text-3xl font-semibold text-[oklch(0.82_0.13_88)]"
                />
              ) : (
                <span className="font-serif text-3xl font-semibold text-muted-foreground/40">
                  &mdash;
                </span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {yearsLived === 1 ? 'year lived' : 'years lived'}
              </p>
            </SpotlightCard>
          </StaggerItem>
        </StaggerContainer>
      </FadeIn>

      {/* ─── Section 3 — Past Arcs ─────────────────────────────────────────
          The chapters of their life, rendered as exhibit panels. */}
      {timelineList.length > 0 && (
        <FadeIn className="relative py-12" delay={0.1}>
          <h2 className="mb-6 text-center font-serif text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Past Arcs
          </h2>
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {timelineList.map((t) => {
              const timelineHobbies = [
                ...new Set(t.phases.flatMap((p) => p.hobbies.map((h) => h.name))),
              ];
              return (
                <StaggerItem key={t.id}>
                  <Link href={getTimelineUrl(t)} prefetch={false} className="block h-full">
                    <SpotlightCard className="shadow-soft h-full" innerClassName="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
                          {t.title ?? 'Hobby Timeline'}
                        </h3>
                        <span className="shrink-0 rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                          {t.phases.length} {t.phases.length === 1 ? 'arc' : 'arcs'}
                        </span>
                      </div>

                      {/* Hobbies pursued in this chapter */}
                      {timelineHobbies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {timelineHobbies.slice(0, 6).map((hobbyName) => {
                            const cat = getCategoryForHobby(hobbyName);
                            const colorClass = cat
                              ? (CATEGORY_BADGE_COLORS[cat.name] ??
                                'border-border bg-card/40 text-muted-foreground')
                              : 'border-border bg-card/40 text-muted-foreground';
                            return (
                              <span
                                key={hobbyName}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                              >
                                {cat && <span>{cat.emoji}</span>}
                                {hobbyName}
                              </span>
                            );
                          })}
                          {timelineHobbies.length > 6 && (
                            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground/60">
                              +{timelineHobbies.length - 6}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        View the arc
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </SpotlightCard>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </FadeIn>
      )}

      {/* Empty-state for timelines — only for the owner, kept quiet */}
      {timelineList.length === 0 && isOwner && (
        <FadeIn className="relative py-12" delay={0.1}>
          <div className="rounded-xl border border-border bg-card/30 p-10 text-center">
            <p className="font-serif text-lg text-muted-foreground">
              You haven&rsquo;t built a timeline yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/60">
              Map the hobbies that shaped each chapter of your life.
            </p>
            <Link href="/timeline/new">
              <Button className="mt-4 bg-primary text-primary-foreground hover:opacity-90">
                Build your first timeline
              </Button>
            </Link>
          </div>
        </FadeIn>
      )}

      {/* ─── Section 4 — The Evidence ──────────────────────────────────────
          Completed quests. Proof of what they've done, not a leaderboard. */}
      {completedQuestRows.length > 0 && (
        <FadeIn className="relative py-12" delay={0.1}>
          <h2 className="mb-6 text-center font-serif text-sm uppercase tracking-[0.2em] text-muted-foreground">
            The Evidence
          </h2>
          <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completedQuestRows.map((q) => (
              <StaggerItem key={q.id}>
                <SpotlightCard className="shadow-soft h-full" innerClassName="p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none">{q.emoji ?? '🏆'}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-sm font-semibold text-foreground leading-snug">
                        {q.title}
                      </h3>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[oklch(0.82_0.13_88/0.3)] bg-[oklch(0.82_0.13_88/0.08)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[oklch(0.82_0.13_88)]">
                        Completed
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeIn>
      )}

      {/* ─── Remaining exhibit rooms ───────────────────────────────────────
          Life grid, commitments, badges, bucket list — preserved functionality. */}
      <div className="space-y-12 pt-4">
        {/* Life in weeks — mortality frame */}
        {(user.birthYear || stampedWeeks.size > 0) && (
          <div className="scroll-reveal">
            <LifeGrid grid={lifeGrid} />
          </div>
        )}

        {/* Commitments */}
        {profileCommitments.length > 0 && (
          <div className="scroll-reveal scroll-reveal-d1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Commitments</h2>
              {isOwner && (
                <a
                  href="/commitments"
                  className="text-xs text-foreground hover:text-foreground transition-colors"
                >
                  Manage →
                </a>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {profileCommitments.slice(0, 4).map((c) => (
                <CommitmentCard
                  key={c.id}
                  id={c.id}
                  hobbyName={c.hobbyName}
                  goalDays={c.goalDays}
                  status={c.status}
                  startDate={c.startDate}
                  stamps={c.stamps as StampRow[]}
                  canAbandon={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hobby cloud */}
        {allHobbies.length > 0 && (
          <div className="scroll-reveal scroll-reveal-d1">
            <h2 className="mb-3 text-sm font-medium text-foreground">Hobby cloud</h2>
            <div className="flex flex-wrap gap-2">
              {top10Hobbies.map((hobbyName) => {
                const cat = getCategoryForHobby(hobbyName);
                const colorClass = cat
                  ? (CATEGORY_BADGE_COLORS[cat.name] ??
                    'border-border bg-card/40 text-muted-foreground')
                  : 'border-border bg-card/40 text-muted-foreground';
                return (
                  <Link
                    key={hobbyName}
                    href={`/hobbies/${encodeURIComponent(hobbyName.toLowerCase().replace(/\s+/g, '-'))}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:ring-1 hover:ring-foreground/30 ${colorClass}`}
                    prefetch={false}
                  >
                    {cat && <span>{cat.emoji}</span>}
                    {hobbyName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Badge collection */}
        {(earnedBadgeIds.length > 0 || isOwner) && (
          <div className="scroll-reveal scroll-reveal-d1">
            <BadgeCollection earnedBadgeIds={earnedBadgeIds} />
            {isOwner && earnedBadgeIds.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground/60">
                Complete{' '}
                <a href="/side-quests" className="text-foreground hover:underline">
                  side quests
                </a>{' '}
                to earn badges!
              </p>
            )}
          </div>
        )}

        {/* Public bucket list */}
        {publicBucketItems.length > 0 && (
          <div className="scroll-reveal scroll-reveal-d3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Bucket list</h2>
              {isOwner && (
                <a
                  href="/dashboard"
                  className="text-xs text-foreground hover:text-foreground transition-colors"
                >
                  Manage →
                </a>
              )}
            </div>
            <ul className="space-y-2">
              {publicBucketItems.map((item) => {
                const cat = item.category
                  ? BUCKET_ITEM_CATEGORIES[item.category as keyof typeof BUCKET_ITEM_CATEGORIES]
                  : null;
                const isDone = item.status === 'done';
                const isInProgress = item.status === 'in_progress';
                return (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
                      isDone
                        ? 'border-foreground/30 bg-foreground/10'
                        : isInProgress
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border bg-card/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                        isDone
                          ? 'border-foreground bg-foreground text-primary-foreground'
                          : isInProgress
                            ? 'border-primary bg-primary/40 text-lumi-300'
                            : 'border-border'
                      }`}
                    >
                      {isDone ? '✓' : isInProgress ? '●' : ''}
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        isDone ? 'line-through text-muted-foreground/60' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                      {item.targetYear && (
                        <span className="ml-2 text-xs text-muted-foreground/60">
                          by {item.targetYear}
                        </span>
                      )}
                    </span>
                    {cat && (
                      <span className="text-xs text-muted-foreground/60 shrink-0" title={cat.label}>
                        {cat.emoji}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {isOwner && allHobbies.length > 0 && <SuggestionsPanel existingHobbies={allHobbies} />}
      </div>
    </div>
  );
}
