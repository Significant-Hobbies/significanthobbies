import { BADGES } from '~/lib/badges';

export function BadgeCollection({ earnedBadgeIds }: { earnedBadgeIds: string[] }) {
  const earned = new Set(earnedBadgeIds);
  const visible = BADGES.filter((b) => !b.hidden || earned.has(b.id));

  if (visible.length === 0 && earnedBadgeIds.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
        Badges
        {earnedBadgeIds.length > 0 && (
          <span className="ml-2 text-emerald-600">{earnedBadgeIds.length} earned</span>
        )}
      </h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((badge) => {
          const isEarned = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isEarned
                  ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm'
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
              title={isEarned ? badge.description : 'Keep completing quests to unlock this badge'}
            >
              <span className={isEarned ? '' : 'grayscale opacity-40'}>
                {isEarned ? badge.emoji : '?'}
              </span>
              <span>{isEarned ? badge.name : '???'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
