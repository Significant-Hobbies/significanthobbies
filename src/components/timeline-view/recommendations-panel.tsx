import { Sparkles } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { getRecommendations } from "~/lib/recommendations";
import type { Phase } from "~/lib/types";

interface Props {
  phases: Phase[];
}

export function RecommendationsPanel({ phases }: Props) {
  const recommendations = getRecommendations(phases, 6);

  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-stone-400" />
        <h2 className="text-lg font-semibold text-stone-800">What to try next</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <div
            key={rec.name}
            className="rounded-lg border border-stone-100 bg-stone-50 p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-stone-800 capitalize">
                {rec.categoryEmoji} {rec.name}
              </span>
              <Badge className="shrink-0 bg-stone-100 text-stone-600 border border-stone-200 text-[10px] px-1.5 py-0">
                {rec.category}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 leading-tight">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
