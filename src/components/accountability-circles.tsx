'use client';

import { Copy, Plus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  buildCirclePlan,
  type CircleCadence,
  createDefaultCircle,
  type HobbyCircle,
  normalizeMemberList,
} from '~/lib/accountability-circles';
import { QUEST_CATEGORIES, type QuestCategory } from '~/lib/side-quests';

const STORAGE_KEY = 'sh-hobby-circles';

function readCircles(): HobbyCircle[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HobbyCircle[];
  } catch {
    return [];
  }
}

function writeCircles(circles: HobbyCircle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
}

function focusLabel(focus: HobbyCircle['focus']): string {
  if (focus === 'balanced') return 'Balanced';
  return QUEST_CATEGORIES.find((category) => category.id === focus)?.label ?? focus;
}

export function AccountabilityCircles({ completedQuestIds }: { completedQuestIds: string[] }) {
  const [circles, setCircles] = useState<HobbyCircle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = readCircles();
    const initial = stored.length > 0 ? stored : [createDefaultCircle()];
    setCircles(initial);
    setSelectedId(initial[0]?.id ?? null);
    if (stored.length === 0) writeCircles(initial);
  }, []);

  const selectedCircle = circles.find((circle) => circle.id === selectedId) ?? circles[0];
  const selectedPlan = useMemo(
    () => (selectedCircle ? buildCirclePlan(selectedCircle, completedQuestIds) : null),
    [completedQuestIds, selectedCircle]
  );

  function updateCircle(id: string, updates: Partial<HobbyCircle>) {
    setCircles((current) => {
      const next = current.map((circle) => (circle.id === id ? { ...circle, ...updates } : circle));
      writeCircles(next);
      return next;
    });
  }

  function addCircle() {
    const circle = createDefaultCircle();
    circle.name = `Hobby circle ${circles.length + 1}`;
    const next = [...circles, circle];
    setCircles(next);
    setSelectedId(circle.id);
    writeCircles(next);
  }

  function copyPrompt() {
    if (!selectedPlan) return;
    navigator.clipboard.writeText(selectedPlan.checkInPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!selectedPlan || !selectedCircle) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        Loading circles...
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Users className="h-4 w-4 text-foreground" />
            Circles
          </div>
          <button
            type="button"
            onClick={addCircle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            aria-label="Add circle"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {circles.map((circle) => (
            <button
              key={circle.id}
              type="button"
              onClick={() => setSelectedId(circle.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${
                selectedCircle.id === circle.id
                  ? 'border-foreground/30 bg-foreground/10'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="font-medium text-foreground">{circle.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {focusLabel(circle.focus)} · {circle.members.length} member
                {circle.members.length === 1 ? '' : 's'}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Circle name</span>
              <input
                value={selectedCircle.name}
                onChange={(event) => updateCircle(selectedCircle.id, { name: event.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Focus</span>
              <select
                value={selectedCircle.focus}
                onChange={(event) =>
                  updateCircle(selectedCircle.id, {
                    focus: event.target.value as QuestCategory | 'balanced',
                  })
                }
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-foreground/30"
              >
                <option value="balanced">Balanced</option>
                {QUEST_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Cadence</span>
              <select
                value={selectedCircle.cadence}
                onChange={(event) =>
                  updateCircle(selectedCircle.id, {
                    cadence: event.target.value as CircleCadence,
                  })
                }
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-foreground/30"
              >
                <option value="weekly">Weekly</option>
                <option value="weekend">Weekend</option>
                <option value="daily">Daily</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Members</span>
              <textarea
                value={selectedCircle.members.join(', ')}
                onChange={(event) =>
                  updateCircle(selectedCircle.id, {
                    members: normalizeMemberList(event.target.value),
                  })
                }
                rows={2}
                className="w-full resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Accountability round</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPlan.completedCount}/{selectedPlan.totalCount} done ·{' '}
                {selectedPlan.completionPct}% complete
              </p>
            </div>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy check-in'}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {selectedPlan.quests.map((quest) => {
              const done = completedQuestIds.includes(quest.id);
              return (
                <a
                  key={quest.id}
                  href={`/side-quests?q=${quest.id}`}
                  className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                    done
                      ? 'border-foreground/20 bg-foreground/10'
                      : 'border-border bg-card/40 hover:border-foreground/30'
                  }`}
                >
                  <div className="text-3xl">{quest.emoji}</div>
                  <div className="mt-3 font-semibold text-foreground">{quest.title}</div>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {quest.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/60">
                    <span>{quest.timeEstimate}</span>
                    <span>{done ? 'Done' : 'Open'}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
