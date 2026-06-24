import { asc, eq, inArray } from 'drizzle-orm';
import { ArrowLeft, Pencil, User } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

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
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  let timeline = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });
  // Don't leak private timeline titles into metadata (unfurlers cache it).
  if (timeline?.visibility === 'PRIVATE') {
    const session = await getServerAuthSession();
    if (session?.user?.id !== timeline.userId) timeline = undefined;
  }
  const title = timeline?.title
    ? `${timeline.title} — SignificantHobbies`
    : 'Timeline — SignificantHobbies';
  return {
    title,
    description: timeline?.title
      ? `${timeline.title} — a hobby timeline on SignificantHobbies. See hobbies across life phases, personality insights, and more.`
      : 'A hobby timeline on SignificantHobbies — see hobbies across life phases and discover your hobby personality.',
  };
}

export default async function TimelinePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerAuthSession();

  const raw = await db.query.timelines.findFirst({
    where: eq(timelines.id, id),
  });

  if (!raw) notFound();

  // Get user info
  const timelineUser = raw.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, raw.userId),
        columns: { id: true, name: true, username: true, image: true },
      })
    : null;

  // Redirect to new URL format if timeline has a user with username and a slug
  if (timelineUser?.username && raw.slug) {
    redirect(`/u/${timelineUser.username}/${raw.slug}`);
  }

  const isOwner = session?.user?.id === raw.userId;
  const isVisible = raw.visibility !== 'PRIVATE' || isOwner;

  if (!isVisible) notFound();

  let phases: Phase[] = [];
  try {
    phases = JSON.parse(raw.phases) as Phase[];
  } catch {
    /* ignore */
  }

  let pins: TimelinePin[] = [];
  try {
    pins = JSON.parse(raw.pins) as TimelinePin[];
  } catch {
    /* ignore */
  }

  let versions: { date: string; phases: Phase[] }[] = [];
  try {
    const rawVersions = JSON.parse(raw.versions) as { date: string; phases: string }[];
    versions = rawVersions.map((v) => ({
      date: v.date,
      phases: JSON.parse(v.phases) as Phase[],
    }));
  } catch {
    /* ignore */
  }

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

  // Which comments belong to the current user (drives delete button visibility)
  const ownCommentIds = new Set(
    currentUserId ? commentRows.filter((c) => c.userId === currentUserId).map((c) => c.id) : []
  );

  const commentList = commentRows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    user: commentUsersMap[c.userId] ?? { name: null, username: null, image: null },
  }));

  const breadcrumbHref = timelineUser?.username ? `/u/${timelineUser.username}` : '/';
  const breadcrumbLabel = timelineUser?.username ? `@${timelineUser.username}` : 'Home';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={breadcrumbHref}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {breadcrumbLabel}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {timeline.title ?? 'Hobby Timeline'}
          </h1>
          {timelineUser && (
            <Link
              href={timelineUser.username ? `/u/${timelineUser.username}` : '#'}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
            >
              <User className="h-3.5 w-3.5" />
              {timelineUser.username ? `@${timelineUser.username}` : timelineUser.name}
            </Link>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="border-stone-200 text-xs text-stone-500">
              {phases.length} phases
            </Badge>
            <Badge variant="outline" className="border-stone-200 text-xs text-stone-500">
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
                className="border-stone-300 text-stone-600 hover:text-stone-900"
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
                className="border-stone-300 text-stone-600 hover:text-stone-900"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {phases.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-12 text-center">
          <p className="text-stone-500">No phases yet.</p>
          {isOwner && (
            <Link href={`/timeline/${timeline.id}/edit`}>
              <Button className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
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
