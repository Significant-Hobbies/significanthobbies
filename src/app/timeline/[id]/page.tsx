import { asc, eq, inArray } from 'drizzle-orm';
import { ArrowLeft, Pencil, User } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  FadeIn,
  GradientMesh,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { CommentsSectionWithOwn } from '~/components/timeline-view/comments-section';
import { ExportButton } from '~/components/timeline-view/export-button';
import { InsightsPanel } from '~/components/timeline-view/insights-panel';
import { LikeButton } from '~/components/timeline-view/like-button';
import { PersonalityCard } from '~/components/timeline-view/personality-card';
import { PhaseSwimlane } from '~/components/timeline-view/phase-swimlane';
import { RecommendationsPanel } from '~/components/timeline-view/recommendations-panel';
import { RediscoveryQuests } from '~/components/timeline-view/rediscovery-quests';
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

  const phases = parseJSONColumn<Phase[]>(raw.phases, [], 'timeline-view:phases');

  const pins = parseJSONColumn<TimelinePin[]>(raw.pins, [], 'timeline-view:pins');

  const rawVersions = parseJSONColumn<{ date: string; phases: string }[]>(
    raw.versions,
    [],
    'timeline-view:versions'
  );
  const versions = rawVersions.map((v) => ({
    date: v.date,
    phases: parseJSONColumn<Phase[]>(v.phases, [], 'timeline-view:version-phases'),
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
    <FadeIn className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={breadcrumbHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {breadcrumbLabel}
        </Link>
      </div>

      {/* Header with gradient mesh backdrop */}
      <div className="relative mb-8 flex items-start justify-between gap-4 flex-wrap">
        <GradientMesh />
        <FadeIn className="relative">
          <h1 className="text-2xl font-bold text-foreground">
            {timeline.title ?? 'Hobby Timeline'}
          </h1>
          {timelineUser && (
            <Link
              href={timelineUser.username ? `/u/${timelineUser.username}` : '#'}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="h-3.5 w-3.5" />
              {timelineUser.username ? `@${timelineUser.username}` : timelineUser.name}
            </Link>
          )}
          <SpotlightCard className="mt-2 inline-flex shadow-soft" innerClassName="p-0">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                {phases.length} phases
              </Badge>
              <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                {new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size} hobbies
              </Badge>
            </div>
          </SpotlightCard>
        </FadeIn>
        <div className="relative flex items-center gap-2 flex-wrap">
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
        <div className="rounded-xl border border-border bg-card/40 p-12 text-center shadow-soft">
          <p className="text-muted-foreground">No phases yet.</p>
          {isOwner && (
            <Link href={`/timeline/${timeline.id}/edit`}>
              <Button className="mt-4 bg-primary text-primary-foreground hover:opacity-90">
                Add phases
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <StaggerContainer className="space-y-8">
          <StaggerItem>
            <PhaseSwimlane phases={phases} pins={pins} />
          </StaggerItem>
          <StaggerItem>
            <PersonalityCard phases={phases} />
          </StaggerItem>
          <StaggerItem>
            <InsightsPanel phases={phases} />
          </StaggerItem>
          {isOwner && (
            <StaggerItem>
              <RediscoveryQuests timelineId={timeline.id} phases={phases} />
            </StaggerItem>
          )}
          {isOwner && (
            <StaggerItem>
              <RecommendationsPanel phases={phases} />
            </StaggerItem>
          )}
          <StaggerItem>
            <CommentsSectionWithOwn
              timelineId={timeline.id}
              initialComments={commentList}
              currentUserId={currentUserId}
              ownCommentIds={ownCommentIds}
            />
          </StaggerItem>
          {isOwner && versions.length > 0 && (
            <StaggerItem>
              <VersionHistory versions={versions} currentPhases={phases} />
            </StaggerItem>
          )}
        </StaggerContainer>
      )}
    </FadeIn>
  );
}
