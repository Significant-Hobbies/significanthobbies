import { and, count, desc, eq } from 'drizzle-orm';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  BorderBeam,
  FadeIn,
  GradientMesh,
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
import { TimelineCard } from '~/components/timeline-card';
import { Button } from '~/components/ui/button';
import { bucketListItems, follows, timelines, users } from '~/db/schema';
import { getPublicCommitmentsForUser } from '~/lib/actions/commitments';
import type { StampRow } from '~/lib/commitments';
import { BUCKET_ITEM_CATEGORIES } from '~/lib/famous-bucket-lists';
import { getCategoryForHobby } from '~/lib/hobbies';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
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

  const totalPhases = timelineList.reduce((sum, t) => sum + t.phases.length, 0);

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

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12">
      <GradientMesh />
      {/* Profile header */}
      <FadeIn className="relative mb-8">
        <SpotlightCard className="shadow-soft" innerClassName="p-6">
          <div className="relative overflow-hidden rounded-xl">
            <BorderBeam size={200} duration={15} />
            <div className="flex items-start gap-5 flex-wrap">
              {/* Avatar with optional owner glow */}
              <div
                className={
                  isOwner
                    ? 'rounded-full p-0.5 bg-gradient-to-br from-foreground/40 via-foreground/20 to-transparent ring-2 ring-foreground/30 shadow-[0_0_18px_2px_oklch(0.82_0.13_88/0.15)]'
                    : ''
                }
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? 'Avatar'}
                    width={72}
                    height={72}
                    className="rounded-full border-2 border-border"
                  />
                ) : (
                  <div className="h-[72px] w-[72px] rounded-full bg-foreground/5 border-2 border-border flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {(user.name ?? username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    {user.name ?? username}
                  </h1>
                  {isOwner && (
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit profile
                    </Link>
                  )}
                </div>
                <p className="text-muted-foreground">@{user.username}</p>

                {/* Bio */}
                {user.bio && (
                  <p className="mt-2 text-sm text-muted-foreground italic leading-relaxed max-w-md">
                    {user.bio}
                  </p>
                )}

                {/* Website */}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}

                {/* Stats bar */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground">
                    <NumberTicker value={timelineList.length} className="font-semibold" />
                    <span className="text-muted-foreground">
                      timeline{timelineList.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground">
                    <NumberTicker value={allHobbies.length} className="font-semibold" />
                    <span className="text-muted-foreground">
                      unique hobbie{allHobbies.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground">
                    <NumberTicker value={totalPhases} className="font-semibold" />
                    <span className="text-muted-foreground">
                      phase{totalPhases !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground">
                    <NumberTicker value={followerCount} className="font-semibold" />
                    <span className="text-muted-foreground">
                      follower{followerCount !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground">
                    <NumberTicker value={followingCount} className="font-semibold" />
                    <span className="text-muted-foreground">following</span>
                  </span>
                </div>

                {/* Follow button (shown to non-owners) */}
                {!isOwner && session?.user && (
                  <div className="mt-3">
                    <FollowButton
                      targetUserId={user.id}
                      initialFollowing={isFollowing}
                      initialCount={followerCount}
                      isOwnProfile={false}
                    />
                  </div>
                )}

                {/* Prompt unauthenticated visitors to log in to follow */}
                {!isOwner && !session?.user && (
                  <div className="mt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-colors"
                    >
                      Follow
                    </Link>
                    <span className="ml-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{followerCount}</span>{' '}
                      {followerCount === 1 ? 'follower' : 'followers'}
                    </span>
                  </div>
                )}
              </div>

              {isOwner && (
                <Link href="/timeline/new">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90">
                    <Plus className="mr-1.5 h-4 w-4" />
                    New timeline
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SpotlightCard>
      </FadeIn>

      <div className="space-y-8">
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

        {/* Timelines */}
        {timelineList.length > 0 ? (
          <FadeIn className="relative" delay={0.15}>
            <h2 className="mb-4 text-sm font-medium text-foreground">Timelines</h2>
            <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {timelineList.map((t) => (
                <StaggerItem key={t.id}>
                  <TimelineCard timeline={t} showVisibility={isOwner} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 p-10 text-center">
            <p className="text-muted-foreground font-medium">
              {isOwner
                ? "You haven't built a timeline yet."
                : `@${username} hasn't shared a timeline yet.`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {isOwner
                ? 'Map the hobbies that shaped each chapter of your life.'
                : "Check back later, or explore other people's hobby journeys in the meantime."}
            </p>
            {isOwner ? (
              <Link href="/timeline/new">
                <Button className="mt-4 bg-primary text-primary-foreground hover:opacity-90">
                  Build your first timeline
                </Button>
              </Link>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                >
                  Explore timelines
                </Link>
                <Link
                  href="/journeys"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  Famous journeys
                </Link>
              </div>
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
