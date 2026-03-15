type TimelineUrlInput = {
  id: string;
  slug: string | null;
  user?: { username: string | null } | null;
};

export function getTimelineUrl(timeline: TimelineUrlInput): string {
  if (timeline.user?.username && timeline.slug) {
    return `/u/${timeline.user.username}/${timeline.slug}`;
  }
  return `/timeline/${timeline.id}`;
}
