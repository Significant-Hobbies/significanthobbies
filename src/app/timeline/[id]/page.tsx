import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PhaseSwimlane } from "~/components/timeline-view/phase-swimlane";
import { InsightsPanel } from "~/components/timeline-view/insights-panel";
import { ExportButton } from "~/components/timeline-view/export-button";
import { VisibilityToggle } from "~/components/timeline-view/visibility-toggle";
import { LikeButton } from "~/components/timeline-view/like-button";
import { CommentsSectionWithOwn } from "~/components/timeline-view/comments-section";
import { PersonalityCard } from "~/components/timeline-view/personality-card";
import { RediscoveryNudges } from "~/components/timeline-view/rediscovery-nudges";
import { RecommendationsPanel } from "~/components/timeline-view/recommendations-panel";
import { VersionHistory } from "~/components/timeline-view/version-history";
import { ArrowLeft, Pencil, User } from "lucide-react";
import type { Phase, TimelineData, TimelinePin, TimelineVisibility } from "~/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const timeline = await db.timeline.findUnique({ where: { id } });
  const title = timeline?.title ? `${timeline.title} — SignificantHobbies` : "Timeline — SignificantHobbies";
  return {
    title,
    description: timeline?.title
      ? `${timeline.title} — a hobby timeline on SignificantHobbies. See hobbies across life phases, personality insights, and more.`
      : "A hobby timeline on SignificantHobbies — see hobbies across life phases and discover your hobby personality.",
  };
}

export default async function TimelinePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const raw = await db.timeline.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      likes: { select: { userId: true } },
      comments: {
        select: {
          id: true,
          userId: true,
          body: true,
          createdAt: true,
          user: { select: { name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!raw) notFound();

  // Redirect to new URL format if timeline has a user with username and a slug
  if (raw.user?.username && raw.slug) {
    redirect(`/u/${raw.user.username}/${raw.slug}`);
  }

  const isOwner = session?.user?.id === raw.userId;
  const isVisible = raw.visibility !== "PRIVATE" || isOwner;

  if (!isVisible) notFound();

  let phases: Phase[] = [];
  try {
    phases = JSON.parse(raw.phases as string) as Phase[];
  } catch { /* ignore */ }

  let pins: TimelinePin[] = [];
  try { pins = JSON.parse(raw.pins as string) as TimelinePin[]; } catch { /* ignore */ }

  let versions: { date: string; phases: Phase[] }[] = [];
  try {
    const rawVersions = JSON.parse(raw.versions as string) as { date: string; phases: string }[];
    versions = rawVersions.map((v) => ({
      date: v.date,
      phases: JSON.parse(v.phases) as Phase[],
    }));
  } catch { /* ignore */ }

  const timeline: TimelineData = {
    id: raw.id,
    title: raw.title,
    visibility: raw.visibility as TimelineVisibility,
    slug: raw.slug,
    phases,
    pins,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    user: raw.user,
  };

  const currentUserId = session?.user?.id ?? null;
  const isLiked = raw.likes.some((l) => l.userId === currentUserId);
  const likeCount = raw.likes.length;

  // Which comments belong to the current user (drives delete button visibility)
  const ownCommentIds = new Set(
    currentUserId
      ? raw.comments.filter((c) => c.userId === currentUserId).map((c) => c.id)
      : [],
  );

  const comments = raw.comments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    user: c.user,
  }));

  const breadcrumbHref = raw.user?.username ? `/u/${raw.user.username}` : "/";
  const breadcrumbLabel = raw.user?.username ? `@${raw.user.username}` : "Home";

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
            {timeline.title ?? "Hobby Timeline"}
          </h1>
          {raw.user && (
            <Link
              href={raw.user.username ? `/u/${raw.user.username}` : "#"}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
            >
              <User className="h-3.5 w-3.5" />
              {raw.user.username ? `@${raw.user.username}` : raw.user.name}
            </Link>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-stone-200 text-xs text-stone-500"
            >
              {phases.length} phases
            </Badge>
            <Badge
              variant="outline"
              className="border-stone-200 text-xs text-stone-500"
            >
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
          {isOwner && (
            <VisibilityToggle
              timelineId={timeline.id}
              current={timeline.visibility}
            />
          )}
          <ExportButton timeline={timeline} />
          {currentUserId && !isOwner && session?.user?.username && raw.user?.username && (
            <Link
              href={`/compare-journeys?a=${session.user.username}&b=${raw.user.username}`}
            >
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
            initialComments={comments}
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
