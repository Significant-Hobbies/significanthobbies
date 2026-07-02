import { asc, eq, inArray } from 'drizzle-orm';
import { ArrowLeft, Pencil, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CommentsSectionWithOwn } from '~/components/timeline-view/comments-section';
import { ExportButton } from '~/components/timeline-view/export-button';
import { InsightsPanel } from '~/components/timeline-view/insights-panel';
import { LikeButton } from '~/components/timeline-view/like-button';
import { PersonalityCard } from '~/components/timeline-view/personality-card';
import { PhaseSwimlane } from '~/components/timeline-view/phase-swimlane';
import { RecommendationsPanel } from '~/components/timeline-view/recommendations-panel';
import { RediscoveryNudges } from '~/components/timeline-view/rediscovery-nudges';
import { VersionHistory } from '~/components/timeline-view/version-history';
import { VisibilityToggle } from '~/components/timeline-view/visibility-toggle';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { comments as commentsTable, likes as likesTable, timelines, users } from '~/db/schema';
import type { Phase, TimelineData, TimelinePin, TimelineVisibility } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username, slug } = await params;
  const timeline = await db.query.timelines.findFirst({
    where: eq(timelines.slug, slug),
  });
  if (!timeline) {
    return { title: 'Timeline — SignificantHobbies' };
  }
  // Verify the user matches
  if (timeline.userId) {
    const timelineUser = await db.query.users.findFirst({
      where: eq(users.id, timeline.userId),
      columns: { username: true },
    });
    if (timelineUser?.username !== username) {
      return { title: 'Timeline — SignificantHobbies' };
    }
  }
  // Don't leak private timeline titles into metadata (unfurlers cache it).
  if (timeline.visibility === 'PRIVATE') {
    const session = await getServerAuthSession();
    if (session?.user?.id !== timeline.userId) {
      return { title: 'Timeline — SignificantHobbies' };
    }
  }
  return {
    title: timeline.title
      ? `${timeline.title} — SignificantHobbies`
      : 'Timeline — SignificantHobbies',
    description: timeline.title
      ? `${timeline.title} — a hobby timeline by @${username} on SignificantHobbies.`
      : `A hobby timeline by @${username} on SignificantHobbies.`,
  };
}

export default async function TimelineBySlugPage({ params }: Props) {
  const { username, slug } = await params;
  const session = await getServerAuthSession();

  const raw = await db.query.timelines.findFirst({
    where: eq(timelines.slug, slug),
  });

  if (!raw) notFound();

  // Get user info
  const timelineUser = raw.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, raw.userId),
        columns: { id: true, name: true, username: true, image: true },
      })
    : null;

  if (timelineUser?.username !== username) notFound();

  const isOwner = session?.user?.id === raw.userId;
  const isVisible = raw.visibility !== 'PRIVATE' || isOwner;

  if (!isVisible) notFound();

  const phases = parseJSONColumn<Phase[]>(raw.phases, [], 'timeline-slug-view:phases');

  const pins = parseJSONColumn<TimelinePin[]>(raw.pins, [], 'timeline-slug-view:pins');

  const rawVersions = parseJSONColumn<{ date: string; phases: string }[]>(
    raw.versions,
    [],
    'timeline-slug-view:versions'
  );
  const versions = rawVersions.map((v) => ({
    date: v.date,
    phases: parseJSONColumn<Phase[]>(v.phases, [], 'timeline-slug-view:version-phases'),
  }));

  const timeline: TimelineData = {
    id: raw.id,
    title: raw.title,
    visibility: raw.visibility as TimelineVisibility,
    slug: raw.slug,
    phases,
    pins,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    user: timelineUser,
  };

  // Get likes
  const likeRows = await db
    .select({ userId: likesTable.userId })
    .from(likesTable)
    .where(eq(likesTable.timelineId, raw.id));

  const currentUserId = session?.user?.id ?? null;
  const isLiked = likeRows.some((l) => l.userId === currentUserId);
  const likeCount = likeRows.length;

  // Get comments
  const commentRows = await db
    .select({
      id: commentsTable.id,
      userId: commentsTable.userId,
      body: commentsTable.body,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(eq(commentsTable.timelineId, raw.id))
    .orderBy(asc(commentsTable.createdAt));

  // Fetch comment users — single inArray query instead of one findFirst per
  // user (N+1 → 1).
  const commentUserIds = [...new Set(commentRows.map((c) => c.userId))];
  const commentUsersMap: Record<
    string,
    { id: string; name: string | null; username: string | null; image: string | null }
  > = {};
  if (commentUserIds.length > 0) {
    const commentUsers = await db.query.users.findMany({
      where: inArray(users.id, commentUserIds),
      columns: { id: true, name: true, username: true, image: true },
    });
    for (const u of commentUsers) commentUsersMap[u.id] = u;
  }

  const ownCommentIds = new Set(
    currentUserId ? commentRows.filter((c) => c.userId === currentUserId).map((c) => c.id) : []
  );

  const commentList = commentRows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    user: commentUsersMap[c.userId] ?? { name: null, username: null, image: null },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />@{username}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {timeline.title ?? 'Hobby Timeline'}
          </h1>
          {timelineUser && (
            <Link
              href={`/u/${username}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="h-3.5 w-3.5" />@{username}
            </Link>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="border-border text-xs text-muted-foreground">
              {phases.length} phases
            </Badge>
            <Badge variant="outline" className="border-border text-xs text-muted-foreground">
              {new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size} hobbies
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LikeButton
            timelineId={timeline.id}
            initialLiked={isLiked}
            initialCount={likeCount}
            isAuthenticated={!!currentUserId}
          />
          {isOwner && <VisibilityToggle timelineId={timeline.id} current={timeline.visibility} />}
          <ExportButton timeline={timeline} />
          {currentUserId && !isOwner && session?.user?.username && timelineUser?.username && (
            <Link href={`/compare-journeys?a=${session.user.username}&b=${timelineUser.username}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Compare with mine
              </Button>
            </Link>
          )}
          {isOwner && (
            <Link href={`/timeline/${timeline.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {phases.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/40 p-12 text-center">
          <p className="text-muted-foreground">No phases yet.</p>
          {isOwner && (
            <Link href={`/timeline/${timeline.id}/edit`}>
              <Button className="mt-4 bg-primary text-primary-foreground hover:bg-lumi-300">
                Add phases
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <PhaseSwimlane phases={phases} pins={pins} />
          <PersonalityCard phases={phases} />
          <InsightsPanel phases={phases} />
          {isOwner && <RediscoveryNudges phases={phases} />}
          {isOwner && <RecommendationsPanel phases={phases} />}
          <CommentsSectionWithOwn
            timelineId={timeline.id}
            initialComments={commentList}
            currentUserId={currentUserId}
            ownCommentIds={ownCommentIds}
          />
          {isOwner && versions.length > 0 && (
            <VersionHistory versions={versions} currentPhases={phases} />
          )}
        </div>
      )}
    </div>
  );
}
