import { Globe, Heart, Link as LinkIcon, Lock } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '~/components/ui/badge';
import { getTimelineUrl } from '~/lib/timeline-url';
import type { TimelineData } from '~/lib/types';

interface Props {
  timeline: TimelineData;
  showVisibility?: boolean;
  likeCount?: number;
}

const VISIBILITY_ICONS = {
  PRIVATE: Lock,
  UNLISTED: LinkIcon,
  PUBLIC: Globe,
};

export function TimelineCard({ timeline, showVisibility = false, likeCount }: Props) {
  const { phases } = timeline;
  const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())))
    .size;

  const VisIcon = VISIBILITY_ICONS[timeline.visibility];

  return (
    <Link href={getTimelineUrl(timeline)}>
      <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-card/40">
        {/* Title row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground group-hover:text-foreground transition-colors leading-tight">
            {timeline.title ?? 'Hobby Timeline'}
          </h3>
          {showVisibility && (
            <VisIcon className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Phase badges */}
        <div className="mb-3 flex flex-wrap gap-1">
          {phases.slice(0, 4).map((p) => (
            <Badge
              key={p.id}
              variant="outline"
              className="border-border text-xs text-muted-foreground py-0"
            >
              {p.label}
            </Badge>
          ))}
          {phases.length > 4 && (
            <Badge
              variant="outline"
              className="border-border text-xs text-muted-foreground/60 py-0"
            >
              +{phases.length - 4}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            {phases.length} phases · {totalHobbies} hobbies
          </p>
          {likeCount !== undefined && likeCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-rose-400">
              <Heart className="h-3 w-3 fill-rose-400" />
              {likeCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
