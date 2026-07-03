'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import {
  BorderBeam,
  FadeIn,
  GridBackground,
  NumberTicker,
  StaggerContainer,
  StaggerItem,
  SpotlightCard,
  TextGenerateEffect,
} from '~/components/aceternity';
import { AccountabilityCircles } from '~/components/accountability-circles';
import { useQuestProgress } from '~/hooks/use-quest-progress';
import { getBadgeById } from '~/lib/badges';
import {
  filterQuests,
  getQuestById,
  QUEST_CATEGORIES,
  type QuestCategory,
  type QuestFilters,
  SIDE_QUESTS,
  type SideQuest,
} from '~/lib/side-quests';

// ── Category color mapping ──────────────────────────────────────

const CATEGORY_COLORS: Record<QuestCategory, { border: string; bg: string; text: string }> = {
  sensory: {
    border: 'border-foreground/20',
    bg: 'bg-foreground/10',
    text: 'text-foreground',
  },
  creative: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  culinary: {
    border: 'border-primary/30',
    bg: 'bg-primary/10',
    text: 'text-foreground',
  },
  social: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  exploration: {
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
  },
  mindful: {
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
};

const DIFFICULTY_DOTS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

type Tab = 'random' | 'pick' | 'board' | 'circles';

// ── Sub-components ──────────────────────────────────────────────

function CategoryPill({ category }: { category: QuestCategory }) {
  const cat = QUEST_CATEGORIES.find((c) => c.id === category);
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.border} ${colors.bg} ${colors.text}`}
    >
      {cat?.emoji} {cat?.label}
    </span>
  );
}

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const count = DIFFICULTY_DOTS[difficulty] ?? 1;
  return (
    <span className="inline-flex items-center gap-0.5" title={difficulty}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            i < count ? 'bg-card/400' : 'bg-foreground/10'
          }`}
        />
      ))}
    </span>
  );
}

function QuestCard({
  quest,
  isCompleted,
  onComplete,
  onUncomplete,
  showShareButton,
  onRollAgain,
  rollLabel,
}: {
  quest: SideQuest;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  showShareButton?: boolean;
  onRollAgain?: () => void;
  rollLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/side-quests?q=${quest.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [quest.id]);

  return (
    <SpotlightCard className="mx-auto w-full max-w-lg shadow-soft" innerClassName="p-8">
      {isCompleted && <BorderBeam />}
      {/* Emoji */}
      <div className="mb-5 text-center text-6xl">{quest.emoji}</div>

      {/* Title */}
      <h2 className="mb-3 text-center text-2xl font-bold text-foreground">{quest.title}</h2>

      {/* Description */}
      <p className="mb-5 text-center leading-relaxed text-muted-foreground">{quest.description}</p>

      {/* Pills row */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <CategoryPill category={quest.category} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <DifficultyDots difficulty={quest.difficulty} />
          {quest.difficulty}
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {quest.timeEstimate}
        </span>
      </div>

      {/* Related hobbies */}
      {quest.relatedHobbies.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5">
          {quest.relatedHobbies.map((hobby) => (
            <span
              key={hobby}
              className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {hobby}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isCompleted ? (
          <button
            type="button"
            onClick={() => onUncomplete(quest.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-foreground/5"
          >
            Completed
            <span className="text-foreground">&#10003;</span>
            <span className="ml-1 text-xs text-muted-foreground/60">(undo)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(quest.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Mark Complete &#10003;
          </button>
        )}

        {onRollAgain && (
          <button
            type="button"
            onClick={onRollAgain}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:text-foreground"
          >
            {rollLabel ?? 'Roll Again'} &#127922;
          </button>
        )}

        {showShareButton && (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-card/40"
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}
      </div>
    </SpotlightCard>
  );
}

function FilterPills<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { label: string; value: T }[];
  selected: T | undefined;
  onSelect: (value: T | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted-foreground">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(selected === opt.value ? undefined : opt.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
            selected === opt.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          <NumberTicker value={completed} /> / {total} completed
        </span>
        <span className="text-muted-foreground/60">
          <NumberTicker value={pct} />%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-foreground/5">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BadgeToast({ badgeIds, onDismiss }: { badgeIds: string[]; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badgeIds.length === 0) return;
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [badgeIds, onDismiss]);

  if (badgeIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {badgeIds.map((id) => {
        const badge = getBadgeById(id);
        if (!badge) return null;
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className={`flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 shadow-lg transition-all duration-300 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className="text-3xl">{badge.emoji}</span>
            <div className="text-left">
              <p className="font-bold text-foreground">{badge.name}</p>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main inner component (uses useSearchParams) ─────────────────

function SideQuestsInner() {
  const searchParams = useSearchParams();
  const {
    completeQuest,
    uncompleteQuest,
    isCompleted,
    newBadges,
    dismissNewBadges,
    completedCount,
    completed,
  } = useQuestProgress();

  const [activeTab, setActiveTab] = useState<Tab>('random');
  const [currentQuest, setCurrentQuest] = useState<SideQuest | null>(() => SIDE_QUESTS[0] ?? null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Help Me Pick filters
  const [vibe, setVibe] = useState<QuestFilters['vibe']>('either');
  const [energy, setEnergy] = useState<QuestFilters['energy']>(undefined);
  const [time, setTime] = useState<QuestFilters['time']>(undefined);
  const [pickedQuest, setPickedQuest] = useState<SideQuest | null>(null);

  // Quest Board expanded cards
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Save prompt
  const [savePromptDismissed, setSavePromptDismissed] = useState(true);

  // Initialize
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'circles') {
      setActiveTab('circles');
    }

    const qParam = searchParams.get('q');
    if (qParam) {
      const quest = getQuestById(qParam);
      if (quest) {
        setCurrentQuest(quest);
        setActiveTab('random');
        return;
      }
    }
    // Pick a random quest
    setCurrentQuest(SIDE_QUESTS[Math.floor(Math.random() * SIDE_QUESTS.length)]);
  }, [searchParams]);

  // Check save prompt dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem('sh-save-prompt-dismissed');
    setSavePromptDismissed(dismissed === 'true');
  }, []);

  const rollAgain = useCallback(() => {
    setIsShuffling(true);
    let count = 0;
    const interval = setInterval(() => {
      setCurrentQuest(SIDE_QUESTS[Math.floor(Math.random() * SIDE_QUESTS.length)]);
      count++;
      if (count >= 4) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 80);
  }, []);

  // Filtered quests for Help Me Pick
  const filteredQuests = useMemo(() => {
    return filterQuests({ vibe, energy, time });
  }, [vibe, energy, time]);

  const pickFromFiltered = useCallback(() => {
    if (filteredQuests.length === 0) return;
    setPickedQuest(filteredQuests[Math.floor(Math.random() * filteredQuests.length)]);
  }, [filteredQuests]);

  // Auto-pick when filters change
  useEffect(() => {
    if (filteredQuests.length > 0) {
      setPickedQuest(filteredQuests[Math.floor(Math.random() * filteredQuests.length)]);
    } else {
      setPickedQuest(null);
    }
  }, [filteredQuests]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const dismissSavePrompt = useCallback(() => {
    setSavePromptDismissed(true);
    localStorage.setItem('sh-save-prompt-dismissed', 'true');
  }, []);

  const showSavePrompt = completedCount >= 3 && !savePromptDismissed;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'random', label: '\u{1F3B2} Random' },
    { id: 'pick', label: '\u{1F3AF} Help Me Pick' },
    { id: 'board', label: '\u{1F4CB} Quest Board' },
    { id: 'circles', label: '\u{1F91D} Circles' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <GridBackground />
        <FadeIn className="relative mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5 text-sm font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            Side Quests
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <TextGenerateEffect words="50 Quests to Make Life Interesting" />
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
            Roll a random quest, get a personalized pick, or take on the full board.
          </p>

          <div className="mt-8 flex justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                style={{ opacity: 0.4 + i * 0.12 }}
              />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Tab bar */}
      <section className="border-b border-border px-4">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl">
          {/* Mode A: Random */}
          {activeTab === 'random' && currentQuest && (
            <div className="flex justify-center">
              <div
                className={`transition-all duration-150 ${
                  isShuffling ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                }`}
              >
                <QuestCard
                  quest={currentQuest}
                  isCompleted={isCompleted(currentQuest.id)}
                  onComplete={completeQuest}
                  onUncomplete={uncompleteQuest}
                  showShareButton
                  onRollAgain={rollAgain}
                />
              </div>
            </div>
          )}

          {/* Mode B: Help Me Pick */}
          {activeTab === 'pick' && (
            <div>
              <div className="mx-auto mb-8 max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <FilterPills
                  label="Vibe"
                  options={[
                    { label: 'Solo', value: 'solo' as const },
                    { label: 'Social', value: 'social' as const },
                    { label: 'Either', value: 'either' as const },
                  ]}
                  selected={vibe}
                  onSelect={(v) => setVibe(v ?? 'either')}
                />
                <FilterPills
                  label="Energy"
                  options={[
                    { label: 'Chill', value: 'chill' as const },
                    { label: 'Active', value: 'active' as const },
                    { label: 'Creative', value: 'creative' as const },
                  ]}
                  selected={energy}
                  onSelect={setEnergy}
                />
                <FilterPills
                  label="Time"
                  options={[
                    { label: '15 min', value: '15 min' as const },
                    { label: '30 min', value: '30 min' as const },
                    { label: '1 hour', value: '1 hour' as const },
                    { label: 'Half day', value: 'half day' as const },
                  ]}
                  selected={time}
                  onSelect={setTime}
                />
              </div>

              <div className="flex justify-center">
                {pickedQuest ? (
                  <QuestCard
                    quest={pickedQuest}
                    isCompleted={isCompleted(pickedQuest.id)}
                    onComplete={completeQuest}
                    onUncomplete={uncompleteQuest}
                    onRollAgain={pickFromFiltered}
                    rollLabel="Try Another"
                  />
                ) : (
                  <div className="rounded-2xl border border-border bg-card/40 px-8 py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                      No quests match those filters — try loosening up!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode C: Quest Board */}
          {activeTab === 'board' && (
            <div>
              <ProgressBar completed={completedCount} total={SIDE_QUESTS.length} />

              {/* Save prompt */}
              {showSavePrompt && (
                <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-5 py-3">
                  <p className="text-sm text-foreground">
                    <span className="mr-1">&#128190;</span> Save your progress — sign in to keep
                    your quests across devices.{' '}
                    <Link
                      href="/login"
                      className="font-semibold text-foreground hover:text-foreground"
                    >
                      Sign in
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={dismissSavePrompt}
                    className="ml-4 shrink-0 text-muted-foreground/60 hover:text-muted-foreground"
                    aria-label="Dismiss"
                  >
                    &#10005;
                  </button>
                </div>
              )}

              {/* Categories */}
              {QUEST_CATEGORIES.map((cat) => {
                const quests = SIDE_QUESTS.filter((q) => q.category === cat.id);
                const catCompleted = quests.filter((q) => completed.includes(q.id)).length;

                return (
                  <div key={cat.id} className="mb-10">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-xl">{cat.emoji}</span>
                      <h3 className="text-lg font-bold text-foreground">{cat.label}</h3>
                      <span className="text-sm text-muted-foreground/60">
                        <NumberTicker value={catCompleted} />/{quests.length} completed
                      </span>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {quests.map((quest) => {
                        const done = isCompleted(quest.id);
                        const expanded = expandedCards.has(quest.id);

                        return (
                          <StaggerItem key={quest.id}>
                            <SpotlightCard
                              className={`shadow-soft ${done ? 'border-foreground/20' : ''}`}
                              innerClassName="p-0"
                            >
                              {done && <BorderBeam />}
                              <div className="flex items-start gap-3 p-4">
                                {/* Checkbox */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    done ? uncompleteQuest(quest.id) : completeQuest(quest.id);
                                  }}
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all ${
                                    done
                                      ? 'bg-foreground text-primary-foreground'
                                      : 'border-2 border-border hover:border-foreground/30'
                                  }`}
                                  aria-label={
                                    done ? `Uncomplete ${quest.title}` : `Complete ${quest.title}`
                                  }
                                >
                                  {done && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <path
                                        d="M2 6L5 9L10 3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </button>

                                {/* Content */}
                                <button
                                  type="button"
                                  onClick={() => toggleExpanded(quest.id)}
                                  className="flex-1 text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{quest.emoji}</span>
                                    <span
                                      className={`font-medium ${
                                        done
                                          ? 'text-muted-foreground/60 line-through'
                                          : 'text-foreground'
                                      }`}
                                    >
                                      {quest.title}
                                    </span>
                                    <DifficultyDots difficulty={quest.difficulty} />
                                  </div>
                                </button>
                              </div>

                              {/* Expanded details */}
                              {expanded && (
                                <div className="border-t border-border px-4 pb-4 pt-3">
                                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                                    {quest.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-muted-foreground/60">
                                      {quest.timeEstimate}
                                    </span>
                                    {quest.relatedHobbies.map((hobby) => (
                                      <span
                                        key={hobby}
                                        className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground"
                                      >
                                        {hobby}
                                      </span>
                                    ))}
                                  </div>
                                  <Link
                                    href="/timeline/new"
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-foreground"
                                    prefetch={false}
                                  >
                                    Add to timeline
                                    <span>&#8594;</span>
                                  </Link>
                                </div>
                              )}
                            </SpotlightCard>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'circles' && <AccountabilityCircles completedQuestIds={completed} />}
        </div>
      </section>

      {/* Badge Toast */}
      <BadgeToast badgeIds={newBadges} onDismiss={dismissNewBadges} />
    </div>
  );
}

// ── Exported component with Suspense boundary ───────────────────

export function SideQuestsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading quests...</div>
        </div>
      }
    >
      <SideQuestsInner />
    </Suspense>
  );
}
