'use client';

import { Check, Compass, Flame, RotateCcw, Target, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { SpotlightCard } from '~/components/aceternity';
import { ArcCompleteCelebration } from '~/components/dashboard/arc-complete-celebration';
import { Button } from '~/components/ui/button';
import { completeArc, abandonArc } from '~/lib/actions/arcs';
import { abandonQuest, completeUserQuest } from '~/lib/actions/user-quests';
import { cn } from '~/lib/utils';

interface Quest {
  id: string;
  questId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  status: string;
  sourceHobby: string | null;
  startedAt: Date | string;
  completedAt: Date | string | null;
}

interface Arc {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  status: string;
  startedAt: Date | string;
  quests: Quest[];
}

interface ActiveArcsProps {
  arcs: Arc[];
}

function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const ARC_TYPE_META: Record<string, { label: string; className: string; icon: typeof Compass }> = {
  rediscovery: {
    label: 'Rediscovery',
    className: 'border-primary/30 bg-primary/10 text-primary',
    icon: Compass,
  },
  bucket_chain: {
    label: 'Training',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-600',
    icon: Target,
  },
  custom: {
    label: 'Custom',
    className: 'border-border bg-muted text-muted-foreground',
    icon: Flame,
  },
};

export function ActiveArcs({ arcs }: ActiveArcsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completedArc, setCompletedArc] = useState<{
    id: string;
    title: string;
    emoji: string | null;
    type: string;
  } | null>(null);

  function handleCompleteQuest(questId: string, quest: Quest) {
    startTransition(async () => {
      const result = await completeUserQuest(questId);
      if (result.success) {
        // Check if this was the last quest in an arc — if so, show celebration
        const arc = arcs.find((a) => a.quests.some((q) => q.id === questId));
        if (arc) {
          const remaining = arc.quests.filter((q) => q.status === 'active' && q.id !== questId);
          if (remaining.length === 0) {
            // Arc is complete!
            setCompletedArc({
              id: arc.id,
              title: arc.title,
              emoji: arc.emoji,
              type: arc.type,
            });
            return;
          }
        }
        router.refresh();
      }
    });
  }

  function handleAbandonQuest(questId: string) {
    startTransition(async () => {
      await abandonQuest(questId);
      router.refresh();
    });
  }

  function handleCompleteArc(arcId: string, arc: Arc) {
    startTransition(async () => {
      await completeArc(arcId);
      setCompletedArc({
        id: arc.id,
        title: arc.title,
        emoji: arc.emoji,
        type: arc.type,
      });
    });
  }

  function handleAbandonArc(arcId: string) {
    startTransition(async () => {
      await abandonArc(arcId);
      router.refresh();
    });
  }

  function handleDismissCelebration() {
    setCompletedArc(null);
    router.refresh();
  }

  if (arcs.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Current arcs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your active chapters — each one is a story you&apos;re writing
          </p>
        </div>
        <SpotlightCard className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <p className="font-serif text-lg font-medium text-foreground">No active arcs</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Your timeline will suggest arcs based on hobbies you&apos;ve left behind. Visit your
            timeline to begin.
          </p>
          <Link
            href="/timeline"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to timeline →
          </Link>
        </SpotlightCard>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Current arcs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your active chapters — each one is a story you&apos;re writing
        </p>
      </div>

      <div className="space-y-4">
        {arcs.map((arc) => {
          const meta = ARC_TYPE_META[arc.type] ?? ARC_TYPE_META.custom!;
          const ArcIcon = meta.icon;
          const activeQuests = arc.quests.filter((q) => q.status === 'active');
          const completedQuests = arc.quests.filter((q) => q.status === 'completed');
          const allDone = activeQuests.length === 0 && completedQuests.length > 0;
          const days = daysSince(arc.startedAt);

          return (
            <div key={arc.id}>
              <SpotlightCard className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                {/* Arc header */}
                <div className="flex items-start gap-4 border-b border-border/50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {arc.emoji ?? <Target className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {arc.title}
                      </h3>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                          meta.className
                        )}
                      >
                        <ArcIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </div>
                    {arc.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{arc.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-200"
                          style={{
                            width: `${allDone ? 100 : (completedQuests.length / arc.quests.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {completedQuests.length}/{arc.quests.length} quests complete · {days}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side quests */}
                <div className="divide-y divide-border/50">
                  {arc.quests.map((quest, qi) => {
                    const isActive = quest.status === 'active';
                    const isCompleted = quest.status === 'completed';
                    const isAbandoned = quest.status === 'abandoned';
                    const isFirstActive =
                      isActive && !arc.quests.slice(0, qi).some((q) => q.status === 'active');

                    return (
                      <div
                        key={quest.id}
                        className={cn(
                          'flex items-start gap-3 p-4 transition-colors',
                          isFirstActive && 'bg-primary/5',
                          isAbandoned && 'opacity-50'
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-base">
                          {quest.emoji ?? <RotateCcw className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{quest.title}</p>
                            {quest.sourceHobby && (
                              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                From: {quest.sourceHobby}
                              </span>
                            )}
                          </div>
                          {quest.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {quest.description}
                            </p>
                          )}
                        </div>

                        {/* Status / actions */}
                        <div className="flex shrink-0 items-center gap-2">
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <Check className="h-3.5 w-3.5" /> Done
                            </span>
                          )}
                          {isActive && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleCompleteQuest(quest.id, quest)}
                                disabled={isPending}
                                className="h-7 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                              >
                                Complete
                              </Button>
                              <button
                                onClick={() => handleAbandonQuest(quest.id)}
                                disabled={isPending}
                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Abandon quest"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {isAbandoned && (
                            <span className="text-xs text-muted-foreground">Abandoned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Arc footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border/50 px-5 py-3">
                  {allDone ? (
                    <>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Trophy className="h-4 w-4" /> Arc complete!
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteArc(arc.id, arc)}
                        disabled={isPending}
                        className="h-7 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                      >
                        Complete arc
                      </Button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAbandonArc(arc.id)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Abandon arc
                    </button>
                  )}
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>

      <ArcCompleteCelebration arc={completedArc} onDismiss={handleDismissCelebration} />
    </section>
  );
}
