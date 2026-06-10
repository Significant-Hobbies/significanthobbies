import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { TimelineCard } from "~/components/timeline-card";
import { SuggestionsPanel } from "~/components/suggestions-panel";
import { FollowButton } from "~/components/follow-button";
import { BadgeCollection } from "~/components/badge-collection";
import { Plus, ExternalLink, Pencil } from "lucide-react";
import type { Phase, TimelineVisibility } from "~/lib/types";
import { getCategoryForHobby } from "~/lib/hobbies";
import { eq, and, desc, count } from "drizzle-orm";
import { users, follows, timelines } from "~/db/schema";

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
  Creative: "border-purple-300 bg-purple-50 text-purple-700",
  Music: "border-pink-300 bg-pink-50 text-pink-700",
  Physical: "border-orange-300 bg-orange-50 text-orange-700",
  Intellectual: "border-blue-300 bg-blue-50 text-blue-700",
  Gaming: "border-violet-300 bg-violet-50 text-violet-700",
  Outdoor: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Culinary: "border-yellow-300 bg-yellow-50 text-yellow-700",
  Collecting: "border-stone-300 bg-stone-100 text-stone-600",
  Making: "border-amber-300 bg-amber-50 text-amber-700",
  Social: "border-teal-300 bg-teal-50 text-teal-700",
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
  let ownTimelines;
  if (isOwner) {
    ownTimelines = await db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, user.id))
      .orderBy(desc(timelines.updatedAt));
  } else {
    ownTimelines = await db
      .select()
      .from(timelines)
      .where(
        and(
          eq(timelines.userId, user.id),
          eq(timelines.visibility, "PUBLIC"),
        ),
      )
      .orderBy(desc(timelines.updatedAt));
  }

  // Parse earned badges
  let earnedBadgeIds: string[] = [];
  try { earnedBadgeIds = JSON.parse(user.earnedBadges) as string[]; } catch { /* ignore */ }

  // Check if the current user is following this profile
  let isFollowing = false;
  if (session?.user?.id && !isOwner) {
    const followRecord = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, user.id),
      ),
    });
    isFollowing = !!followRecord;
  }

  const timelineList = ownTimelines.map((t) => {
    let phases: Phase[] = [];
    try {
      phases = JSON.parse(t.phases) as Phase[];
    } catch { /* ignore */ }
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Profile header */}
      <div className="scroll-reveal mb-8 flex items-start gap-5 flex-wrap">
        {/* Avatar with optional owner glow */}
        <div className={isOwner ? "rounded-full p-0.5 bg-gradient-to-br from-emerald-400/40 via-emerald-600/20 to-transparent ring-2 ring-emerald-400/30 shadow-[0_0_18px_2px_rgba(16,185,129,0.15)]" : ""}>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={72}
              height={72}
              className="rounded-full border-2 border-stone-200"
            />
          ) : (
            <div className="h-[72px] w-[72px] rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-2xl font-bold text-stone-500">
              {(user.name ?? username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-stone-900">
              {user.name ?? username}
            </h1>
            {isOwner && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit profile
              </Link>
            )}
          </div>
          <p className="text-stone-500">@{user.username}</p>

          {/* Bio */}
          {user.bio && (
            <p className="mt-2 text-sm text-stone-600 italic leading-relaxed max-w-md">
              {user.bio}
            </p>
          )}

          {/* Website */}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Stats bar */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
              <span className="text-emerald-600 font-semibold">{timelineList.length}</span>
              <span className="text-stone-500">timeline{timelineList.length !== 1 ? "s" : ""}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
              <span className="text-emerald-600 font-semibold">{allHobbies.length}</span>
              <span className="text-stone-500">unique hobbie{allHobbies.length !== 1 ? "s" : ""}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
              <span className="text-emerald-600 font-semibold">{totalPhases}</span>
              <span className="text-stone-500">phase{totalPhases !== 1 ? "s" : ""}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
              <span className="text-emerald-600 font-semibold">{followerCount}</span>
              <span className="text-stone-500">follower{followerCount !== 1 ? "s" : ""}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
              <span className="text-emerald-600 font-semibold">{followingCount}</span>
              <span className="text-stone-500">following</span>
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
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Follow
              </Link>
              <span className="ml-3 text-sm text-stone-500">
                <span className="font-semibold text-stone-700">{followerCount}</span>{" "}
                {followerCount === 1 ? "follower" : "followers"}
              </span>
            </div>
          )}
        </div>

        {isOwner && (
          <Link href="/timeline/new">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="mr-1.5 h-4 w-4" />
              New timeline
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {/* Hobby cloud */}
        {allHobbies.length > 0 && (
          <div className="scroll-reveal scroll-reveal-d1">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
              Hobby cloud
            </h2>
            <div className="flex flex-wrap gap-2">
              {top10Hobbies.map((hobbyName) => {
                const cat = getCategoryForHobby(hobbyName);
                const colorClass = cat
                  ? (CATEGORY_BADGE_COLORS[cat.name] ?? "border-stone-200 bg-stone-50 text-stone-600")
                  : "border-stone-200 bg-stone-50 text-stone-600";
                return (
                  <Link
                    key={hobbyName}
                    href={`/hobbies/${encodeURIComponent(hobbyName.toLowerCase().replace(/\s+/g, "-"))}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:ring-1 hover:ring-emerald-300 ${colorClass}`}
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
              <p className="mt-2 text-xs text-stone-400">
                Complete <a href="/side-quests" className="text-emerald-600 hover:underline">side quests</a> to earn badges!
              </p>
            )}
          </div>
        )}

        {/* Timelines */}
        {timelineList.length > 0 ? (
          <div className="scroll-reveal scroll-reveal-d2">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
              Timelines
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {timelineList.map((t) => (
                <TimelineCard
                  key={t.id}
                  timeline={t}
                  showVisibility={isOwner}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-10 text-center">
            <p className="text-stone-600 font-medium">
              {isOwner ? "You haven't built a timeline yet." : `@${username} hasn't shared a timeline yet.`}
            </p>
            <p className="mt-1 text-sm text-stone-400">
              {isOwner
                ? "Map the hobbies that shaped each chapter of your life."
                : "Check back later, or explore other people's hobby journeys in the meantime."}
            </p>
            {isOwner ? (
              <Link href="/timeline/new">
                <Button className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                  Build your first timeline
                </Button>
              </Link>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Explore timelines
                </Link>
                <Link
                  href="/journeys"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-emerald-400 hover:text-emerald-700"
                >
                  Famous journeys
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {isOwner && allHobbies.length > 0 && (
          <SuggestionsPanel existingHobbies={allHobbies} />
        )}
      </div>
    </div>
  );
}
