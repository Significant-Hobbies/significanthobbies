import { Badge } from "~/components/ui/badge";
import { computeInsights } from "~/lib/insights";
import type { Phase } from "~/lib/types";

interface Props {
  phases: Phase[];
}

function phaseTransitionColor(majorChange: string): string {
  if (majorChange.toLowerCase().includes("gained")) return "text-emerald-600";
  if (majorChange.toLowerCase().includes("lost")) return "text-red-500";
  if (majorChange.toLowerCase().includes("shifted focus")) return "text-amber-600";
  return "text-stone-500";
}

export function InsightsPanel({ phases }: Props) {
  if (phases.length < 2) return null;

  const insights = computeInsights(phases);
  const {
    rekindled,
    mostPersistent,
    categoryDiversity,
    longestStreaks,
    phaseTransitions,
  } = insights;

  const topPersistent = mostPersistent.filter((h) => h.count >= 2).slice(0, 6);
  const totalHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  ).size;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      <h2 className="text-lg font-semibold text-stone-800">Insights</h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div className="text-2xl font-bold text-emerald-600">
            {totalHobbies}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">total hobbies</div>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.03) 100%)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <div className="text-2xl font-bold text-blue-600">
            {rekindled.length}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">rekindled</div>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.03) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <div className="text-2xl font-bold text-purple-600">
            {topPersistent.length}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">persistent</div>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <div className="text-2xl font-bold text-amber-600">
            {categoryDiversity}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">categories</div>
        </div>
      </div>

      {/* Rekindled hobbies */}
      {rekindled.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Rekindled hobbies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {rekindled.map((h) => (
              <Badge
                key={h}
                className="bg-orange-100 text-orange-700 border border-orange-200 capitalize"
              >
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Most persistent */}
      {topPersistent.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Most persistent
          </h3>
          <div className="space-y-1.5">
            {topPersistent.map(({ hobby, count }) => {
              const inAllPhases = count === phases.length;
              return (
                <div key={hobby} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-stone-700 capitalize">{hobby}</span>
                    {inAllPhases && (
                      <span className="text-xs leading-none" title="Present in every phase">⭐</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: phases.length }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-4 rounded-sm ${
                            i < count ? "bg-emerald-500" : "bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500">
                      {count}/{phases.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Longest streaks */}
      {longestStreaks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Longest streaks
          </h3>
          <div className="space-y-1.5">
            {longestStreaks.map(({ hobby, streak, startPhase, endPhase }) => (
              <div key={hobby} className="flex items-center justify-between">
                <span className="text-sm text-stone-700 capitalize">{hobby}</span>
                <span className="text-xs text-stone-500">
                  {streak} phases ({startPhase} → {endPhase})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase transitions */}
      {phaseTransitions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Phase transitions
          </h3>
          <div className="space-y-1.5">
            {phaseTransitions.map(({ fromPhase, toPhase, majorChange }) => (
              <div
                key={`${fromPhase}-${toPhase}`}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-stone-500 shrink-0">
                  {fromPhase} → {toPhase}:
                </span>
                <span className={phaseTransitionColor(majorChange)}>
                  {majorChange}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
