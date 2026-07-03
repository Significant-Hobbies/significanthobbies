'use client';

import { Check, Lock, Loader2, Play } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { BorderBeam, SpotlightCard } from '~/components/aceternity';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { BUCKET_ITEM_CATEGORIES, type BucketItemCategory } from '~/lib/famous-bucket-lists';
import { generateQuestChain, type QuestChainStep } from '~/lib/quest-chains';
import { startQuest } from '~/lib/actions/user-quests';

interface QuestChainCardProps {
  bucketItemId: string;
  title: string;
  category: string | null;
  activeQuests: Array<{ id: string; questId: string; status: string; title: string }>;
}

// ─── Step status ────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'active' | 'unlocked' | 'locked';

function getStepStatuses(
  steps: QuestChainStep[],
  activeQuests: Array<{ questId: string; status: string }>,
  startedQuestIds: Set<string>
): StepStatus[] {
  // Build a set of questIds that are completed or active (started)
  const completedOrActive = new Set<string>();
  for (const q of activeQuests) {
    if (q.status === 'completed' || q.status === 'active') {
      completedOrActive.add(q.questId);
    }
  }
  // Also count locally-started quests (optimistic UI)
  for (const id of startedQuestIds) {
    completedOrActive.add(id);
  }

  const statuses: StepStatus[] = [];
  let foundCurrent = false;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isActive = activeQuests.some((q) => q.questId === step.questId && q.status === 'active');
    const isStartedLocally = startedQuestIds.has(step.questId);
    const isCompleted = completedOrActive.has(step.questId) && !isActive && !isStartedLocally;

    if (isCompleted) {
      statuses.push('completed');
    } else if (isActive || isStartedLocally) {
      statuses.push('active');
      foundCurrent = true;
    } else if (!foundCurrent) {
      // First non-completed, non-active step is unlocked
      statuses.push('unlocked');
      foundCurrent = true;
    } else {
      statuses.push('locked');
    }
  }

  return statuses;
}

// ─── Category badge ─────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  const cat = category as BucketItemCategory;
  const meta = BUCKET_ITEM_CATEGORIES[cat];
  if (!meta) return null;
  return (
    <Badge variant="outline" className="border-border bg-card/60 text-xs text-muted-foreground">
      {meta.emoji} {meta.label}
    </Badge>
  );
}

// ─── Difficulty label ───────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<QuestChainStep['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// ─── Main component ─────────────────────────────────────────────────────────

export function QuestChainCard({
  bucketItemId,
  title,
  category,
  activeQuests,
}: QuestChainCardProps) {
  const steps = useMemo(
    () => generateQuestChain({ bucketItemId, title, category }),
    [bucketItemId, title, category]
  );

  const [startedQuestIds, setStartedQuestIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const statuses = getStepStatuses(steps, activeQuests, startedQuestIds);
  const completedCount = statuses.filter((s) => s === 'completed').length;
  const allDone = completedCount === steps.length;

  function handleStartStep(step: QuestChainStep) {
    startTransition(async () => {
      const res = await startQuest({
        questId: step.questId,
        type: 'static',
        title: step.title,
        description: step.description,
        emoji: step.emoji,
        sourceBucketItemId: bucketItemId,
      });
      if (res.success) {
        setStartedQuestIds((prev) => new Set(prev).add(step.questId));
      }
    });
  }

  return (
    <SpotlightCard
      className="relative overflow-hidden rounded-xl border border-border bg-card shadow-soft"
      innerClassName="p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <CategoryBadge category={category} />
            <span className="text-xs text-muted-foreground/60">
              {allDone
                ? `${steps.length} steps complete`
                : `${completedCount}/${steps.length} steps done`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Vertical timeline of steps */}
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const status = statuses[index];
          const isLast = index === steps.length - 1;
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isUnlocked = status === 'unlocked';
          const isLocked = status === 'locked';

          return (
            <li key={step.questId} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Connector line (except after last step) */}
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px ${
                    isCompleted ? 'bg-primary/40' : 'bg-border'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Circle / number */}
              <div className="relative shrink-0">
                {isCompleted ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                ) : isActive ? (
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-card text-primary">
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/40" />
                    <span className="relative text-xs font-bold">{step.stepNumber}</span>
                  </div>
                ) : isUnlocked ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/50 bg-card text-foreground">
                    <span className="text-xs font-bold">{step.stepNumber}</span>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground/50">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className={`flex-1 min-w-0 ${isLocked ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{step.emoji}</span>
                  <p
                    className={`text-sm font-medium ${
                      isLocked ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {step.description}
                </p>

                {/* Status row */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      isCompleted
                        ? 'text-primary'
                        : isActive
                          ? 'text-primary'
                          : isUnlocked
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/40'
                    }`}
                  >
                    {isCompleted
                      ? 'Done'
                      : isActive
                        ? 'In progress'
                        : isUnlocked
                          ? DIFFICULTY_LABEL[step.difficulty]
                          : 'Locked'}
                  </span>

                  {/* Start button — only on the first unlocked step */}
                  {isUnlocked && (
                    <Button
                      size="xs"
                      onClick={() => handleStartStep(step)}
                      disabled={isPending}
                      className="bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Start step {step.stepNumber}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Border beam on the active step card for visual flair */}
      {statuses.some((s) => s === 'active') && <BorderBeam duration={8} size={150} />}
    </SpotlightCard>
  );
}
