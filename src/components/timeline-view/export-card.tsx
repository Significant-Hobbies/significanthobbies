import { getCategoryForHobby } from '~/lib/hobbies';
import { computeInsights } from '~/lib/insights';
import { computePersonality } from '~/lib/personality';
import type { TimelineData } from '~/lib/types';

interface Props {
  timeline: TimelineData;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

export function ExportCard({ timeline, exportRef }: Props) {
  const { phases } = timeline;
  const insights = phases.length >= 2 ? computeInsights(phases) : null;
  const personality = phases.length > 0 ? computePersonality(phases) : null;
  const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())))
    .size;
  const allHobbies = phases.flatMap((p) => p.hobbies).slice(0, 20);

  return (
    <div
      ref={exportRef}
      className="w-[600px] rounded-2xl bg-slate-950 p-8 overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 0 60px rgba(16,185,129,0.08)',
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(16,185,129,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-1">
              significanthobbies
            </p>
            <h1 className="text-2xl font-bold text-slate-100">
              {timeline.title ?? 'My Hobby Journey'}
            </h1>
            {timeline.user?.username && (
              <p className="mt-0.5 text-sm text-slate-500">@{timeline.user.username}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400">{totalHobbies}</div>
            <div className="text-xs text-slate-500">hobbies</div>
          </div>
        </div>
      </div>

      {/* Phase timeline */}
      <div className="relative mb-6">
        <div className="flex gap-px overflow-hidden rounded-lg">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex-1 bg-slate-800" style={{ minWidth: 0 }}>
              <div
                className="h-2"
                style={{
                  background: `hsl(${160 - i * (120 / Math.max(phases.length - 1, 1))}, 70%, 50%)`,
                }}
              />
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-slate-300 truncate">{phase.label}</p>
                <p className="text-xs text-slate-600">{phase.hobbies.length} hobbies</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hobby cloud */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {allHobbies.map((hobby) => {
          const cat = getCategoryForHobby(hobby.name);
          return (
            <span
              key={hobby.name}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300"
            >
              {cat && <span>{cat.emoji}</span>}
              {hobby.name}
            </span>
          );
        })}
        {totalHobbies > 20 && (
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-500">
            +{totalHobbies - 20} more
          </span>
        )}
      </div>

      {/* Personality */}
      {personality && (
        <div className="mb-6 rounded-lg bg-slate-800/40 border border-slate-700/50 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl leading-none">{personality.archetype.emoji}</span>
            <span className="font-bold text-emerald-400">{personality.archetype.name}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{personality.narrative}</p>
        </div>
      )}

      {/* Insights row */}
      {insights && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-slate-800/60 p-3 text-center">
            <div className="text-xl font-bold text-orange-400">{insights.rekindled.length}</div>
            <div className="text-xs text-slate-500">rekindled</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3 text-center">
            <div className="text-xl font-bold text-blue-400">
              {insights.mostPersistent.filter((h) => h.count >= 2).length}
            </div>
            <div className="text-xs text-slate-500">persistent</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3 text-center">
            <div className="text-xl font-bold text-purple-400">{phases.length}</div>
            <div className="text-xs text-slate-500">phases</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <div className="flex gap-1">
          {['🎨', '🎵', '💪', '📚', '🎮'].map((emoji) => (
            <span key={emoji} className="text-sm opacity-60">
              {emoji}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-600">significanthobbies.com</p>
      </div>
    </div>
  );
}
