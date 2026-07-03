'use client';

import { Check, Compass } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { BorderBeam, SpotlightCard, StaggerContainer, StaggerItem } from '~/components/aceternity';
import { Button } from '~/components/ui/button';
import { abandonQuest, completeUserQuest } from '~/lib/actions/user-quests';
import { cn } from '~/lib/utils';

interface ActiveQuestsProps {
  quests: Array<{
    id: string;
    questId: string;
    type: string;
    sourceHobby: string | null;
    sourceTimelineId: string | null;
    title: string;
    description: string | null;
    emoji: string | null;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
  }>;
}

function daysSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)));
}

export function ActiveQuests({ quests }: ActiveQuestsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Track which quest just completed so we can show a checkmark animation.
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  function handleComplete(id: string) {
    startTransition(async () => {
      const res = await completeUserQuest(id);
      if (res.success) {
        setJustCompletedId(id);
        // Let the checkmark animation breathe before the card disappears.
        await new Promise((r) => setTimeout(r, 600));
        router.refresh();
      }
    });
  }

  function handleAbandon(id: string) {
    startTransition(async () => {
      await abandonQuest(id);
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Active quests
        </h2>
        <p className="text-sm text-muted-foreground">Rediscover what you used to love</p>
      </div>

      {quests.length === 0 ? (
        /* Empty state */
        <SpotlightCard
          className="shadow-soft"
          innerClassName="flex flex-col items-center justify-center p-10 text-center"
          spotlightColor="oklch(0.82 0.13 88 / 0.10)"
        >
          <div className="relative mb-5">
            <div
              className="absolute inset-0 rounded-full blur-xl"
              aria-hidden="true"
              style={{
                background: 'radial-gradient(circle, oklch(0.82 0.13 88 / 0.15), transparent 70%)',
              }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
              <Compass className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h3 className="font-serif text-lg font-medium text-foreground">No active quests</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your timeline will suggest quests based on hobbies you&apos;ve left behind.
          </p>
          <Link
            href="/timeline"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-glow"
          >
            Explore your timeline
          </Link>
        </SpotlightCard>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => {
            const days = daysSince(quest.startedAt);
            const isStale = days > 7;
            const completed = justCompletedId === quest.id;

            return (
              <StaggerItem key={quest.id}>
                <SpotlightCard
                  className={cn('h-full shadow-soft', isStale && 'border-primary/40')}
                  innerClassName="flex h-full flex-col p-5"
                  spotlightColor="oklch(0.82 0.13 88 / 0.10)"
                >
                  {isStale && <BorderBeam duration={15} />}

                  {/* Emoji icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {quest.emoji ?? '🔄'}
                  </div>

                  {/* Title + description */}
                  <h3 className="font-medium text-foreground">{quest.title}</h3>
                  {quest.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {quest.description}
                    </p>
                  )}

                  {/* Source hobby badge */}
                  {quest.sourceHobby && (
                    <span className="mt-3 inline-flex w-fit items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                      From: {quest.sourceHobby}
                    </span>
                  )}

                  {/* Days active */}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Started {days} {days === 1 ? 'day' : 'days'} ago
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-5">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(quest.id)}
                      disabled={isPending}
                      className={cn(
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                        completed && 'gap-1.5'
                      )}
                    >
                      {completed ? (
                        <>
                          <Check className="h-4 w-4 animate-in fade-in zoom-in duration-300" />
                          Done
                        </>
                      ) : (
                        'Complete'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAbandon(quest.id)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Abandon
                    </Button>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </section>
  );
}
