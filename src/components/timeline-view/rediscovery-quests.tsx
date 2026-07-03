'use client';

import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { SpotlightCard, StaggerContainer, StaggerItem } from '~/components/aceternity';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { startQuest } from '~/lib/actions/user-quests';
import { generateRediscoveryQuests, type GeneratedQuest } from '~/lib/quest-generator';
import type { Phase } from '~/lib/types';

interface RediscoveryQuestsProps {
  timelineId: string;
  phases: Phase[];
}

// ─── Rediscovery type badge styles ─────────────────────────────────────────
// Rekindle = gold (most likely to stick), Dormant = sage, Dropped = muted.

const REDISCOVERY_BADGE: Record<
  GeneratedQuest['rediscoveryType'],
  { label: string; className: string }
> = {
  rekindle: {
    label: 'Rekindle',
    className: 'border-primary/30 bg-primary/10 text-foreground',
  },
  dormant: {
    label: 'Dormant',
    className: 'border-emerald-300/40 bg-emerald-100/60 text-emerald-800',
  },
  dropped: {
    label: 'Dropped',
    className: 'border-border bg-muted text-muted-foreground',
  },
};

export function RediscoveryQuests({ timelineId, phases }: RediscoveryQuestsProps) {
  const quests = useMemo(() => generateRediscoveryQuests(phases).slice(0, 4), [phases]);

  // Track which quests have been started so the button can change state.
  const [started, setStarted] = useState<Set<string>>(new Set());
  // Track which cards should fade out (after the 2s success hold).
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  if (quests.length === 0) return null;

  function handleStart(quest: GeneratedQuest) {
    startQuest({
      questId: quest.questId,
      type: quest.type,
      title: quest.title,
      description: quest.description,
      emoji: quest.emoji,
      sourceHobby: quest.sourceHobby,
      sourceTimelineId: timelineId,
    }).then((res) => {
      if (!res.success) return;
      setStarted((prev) => new Set(prev).add(quest.questId));
      // After 2 seconds, fade the card out.
      setTimeout(() => {
        setHidden((prev) => new Set(prev).add(quest.questId));
      }, 2000);
    });
  }

  const visibleQuests = quests.filter((q) => !hidden.has(q.questId));

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-soft">
      {/* Section header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Rediscovery quests
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Hobbies you&apos;ve left behind — pick one to revisit
        </p>
      </div>

      <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleQuests.map((quest) => {
          const isStarted = started.has(quest.questId);
          const badge = REDISCOVERY_BADGE[quest.rediscoveryType];

          return (
            <StaggerItem key={quest.questId}>
              <SpotlightCard
                className="h-full transition-opacity duration-500 shadow-soft"
                innerClassName="flex h-full flex-col gap-3 p-5"
              >
                {/* Top row: emoji + type badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {quest.emoji}
                  </div>
                  <Badge className={`shrink-0 text-[10px] ${badge.className}`}>{badge.label}</Badge>
                </div>

                {/* Title + description */}
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{quest.title}</h3>
                  <p className="text-sm leading-snug text-muted-foreground">{quest.description}</p>
                </div>

                {/* Last seen metadata */}
                <p className="text-xs text-muted-foreground">
                  Last seen in {quest.lastSeenPhase}
                  {quest.totalPhases > 1 && ` · appeared in ${quest.totalPhases} phases`}
                </p>

                {/* Action button */}
                <div className="mt-auto pt-1">
                  {isStarted ? (
                    <Button disabled className="w-full bg-primary/15 text-foreground">
                      <Check className="mr-1.5 h-4 w-4" />
                      Quest started
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStart(quest)}
                      disabled={isPending}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90"
                    >
                      Start quest
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
