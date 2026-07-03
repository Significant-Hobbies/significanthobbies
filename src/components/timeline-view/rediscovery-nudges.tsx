import { RotateCcw } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { findRediscoveryOpportunities } from '~/lib/rediscovery';
import type { Phase } from '~/lib/types';

interface Props {
  phases: Phase[];
}

export function RediscoveryNudges({ phases }: Props) {
  const { dropped, rekindleCandidates } = findRediscoveryOpportunities(phases);

  const items = [
    ...rekindleCandidates,
    ...dropped.filter((d) => !rekindleCandidates.some((r) => r.name === d.name)),
  ].slice(0, 6);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-soft">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Rediscover</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-lg border border-border bg-card/40 p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground capitalize truncate">
                {item.name}
              </span>
              {item.type === 'rekindle' ? (
                <Badge className="shrink-0 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] px-1.5 py-0">
                  rekindle
                </Badge>
              ) : (
                <Badge className="shrink-0 bg-destructive/10 text-destructive border border-destructive/30 text-[10px] px-1.5 py-0">
                  dropped
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-tight">
              {item.totalPhases > 1
                ? `Appeared in ${item.totalPhases} phases`
                : `Last seen in ${item.lastSeenPhase}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
