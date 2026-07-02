'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loader2, Plus, Save } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { saveTimeline, updateTimeline } from '~/lib/actions/timeline';
import { captureError } from '~/lib/foundry-monitoring';
import { TIMELINE_TEMPLATES, type TimelineTemplate } from '~/lib/templates';
import type { Phase, TimelineData } from '~/lib/types';

import { PhaseCard } from './phase-card';

interface Props {
  existing?: TimelineData;
}

function makePhase(order: number): Phase {
  return {
    id: nanoid(),
    label: '',
    hobbies: [],
    order,
  };
}

function templateToPhases(template: TimelineTemplate): Phase[] {
  if (template.phases.length === 0) {
    return [makePhase(0)];
  }
  return template.phases.map((tp, i) => ({
    id: Math.random().toString(36).slice(2),
    label: tp.label,
    ageStart: tp.ageStart,
    ageEnd: tp.ageEnd,
    hobbies: tp.suggestedHobbies.map((name) => ({ name })),
    order: i,
  }));
}

function TemplatePicker({ onPick }: { onPick: (template: TimelineTemplate) => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Choose a starting point</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a template to pre-fill phases, or start blank and build your own.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {TIMELINE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onPick(template)}
            className="group rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/30 hover:bg-foreground/10 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            <div className="mb-3 text-3xl">{template.emoji}</div>
            <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-foreground transition-colors leading-tight">
              {template.name}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground leading-snug">
              {template.description}
            </p>
            {template.phases.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground transition-colors">
                {template.phases.length} phases
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground/60 group-hover:bg-foreground/10 group-hover:text-foreground transition-colors">
                empty
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TimelineBuilder({ existing }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [phases, setPhases] = useState<Phase[]>(
    existing?.phases?.length ? existing.phases : [makePhase(0)]
  );
  const [isPending, startTransition] = useTransition();
  // Show template picker only for new timelines (no existing prop)
  const [templatePicked, setTemplatePicked] = useState(!!existing);

  // On touch, require a short press-and-hold before a drag starts so normal
  // vertical scrolling of the phase list is never hijacked. Pointer (mouse)
  // gets a small distance threshold for the same reason.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const draftKey = existing ? `timeline-draft-${existing.id}` : null;

  // Restore an unsaved draft on first mount (existing timelines only).
  // New timelines stay in component state until first Save.
  useEffect(() => {
    if (!draftKey) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as { title?: string; phases?: Phase[] };
      if (typeof draft.title === 'string') setTitle(draft.title);
      if (Array.isArray(draft.phases) && draft.phases.length > 0) {
        setPhases(draft.phases);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, []);

  // Mirror edits to localStorage so reordering / typing isn't lost on reload.
  useEffect(() => {
    if (!draftKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, phases }));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [draftKey, title, phases]);

  function handlePickTemplate(template: TimelineTemplate) {
    setPhases(templateToPhases(template));
    setTemplatePicked(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPhases((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((p, i) => ({
        ...p,
        order: i,
      }));
    });
  }

  function addPhase() {
    setPhases((prev) => [...prev, makePhase(prev.length)]);
  }

  function updatePhase(id: string, patch: Phase) {
    setPhases((prev) => prev.map((p) => (p.id === id ? patch : p)));
  }

  function deletePhase(id: string) {
    setPhases((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  }

  function handleSave() {
    const emptyPhases = phases.filter((p) => !p.label.trim());
    if (emptyPhases.length > 0) {
      toast.error('All phases need a name');
      return;
    }

    startTransition(async () => {
      try {
        const result = existing
          ? await updateTimeline(existing.id, { title: title || undefined, phases })
          : await saveTimeline({ title: title || undefined, phases });
        if (draftKey) {
          try {
            localStorage.removeItem(draftKey);
          } catch {}
        }
        toast.success(existing ? 'Timeline updated' : 'Timeline saved!');
        // Redirect to timeline — username lookup happens via server redirect from /timeline/[id]
        router.push(`/timeline/${result.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save';
        if (msg === 'Not authenticated') {
          toast.error('Sign in to save your timeline');
          router.push('/login');
        } else {
          // Don't leak a raw server error to users; the draft is kept in
          // localStorage so nothing is lost — they can retry.
          console.error('Timeline save failed', err);
          captureError(err, { scope: 'timeline-builder', source: 'save' });
          toast.error(
            "Couldn't save your timeline — your changes are kept here, try again in a moment."
          );
        }
      }
    });
  }

  // Show template picker for new timelines
  if (!templatePicked) {
    return <TemplatePicker onPick={handlePickTemplate} />;
  }

  const phasesWithHobbies = phases.filter((p) => p.hobbies.length > 0).length;
  const totalPhases = phases.length;
  const allEmpty = phasesWithHobbies === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Title */}
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Timeline title (optional)"
          className="h-11 border-border bg-card text-lg font-medium placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Progress indicator */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            allEmpty ? 'bg-foreground/5 text-muted-foreground' : 'bg-foreground/10 text-foreground'
          }`}
        >
          {phasesWithHobbies}/{totalPhases} phases have hobbies
        </span>
        {allEmpty && (
          <span className="text-xs text-muted-foreground/60">
            Tip: Add hobbies to each phase to unlock insights
          </span>
        )}
        {!existing && (
          <button
            type="button"
            onClick={() => setTemplatePicked(false)}
            className="ml-auto text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Change template
          </button>
        )}
      </div>

      {/* Phases */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div key={phase.id}>
                <PhaseCard
                  phase={phase}
                  onChange={(updated) => updatePhase(phase.id, updated)}
                  onDelete={() => deletePhase(phase.id)}
                  isOnly={phases.length === 1}
                />
                {index === 0 && phases.length > 1 && (
                  <p
                    className="mt-1.5 text-center text-xs text-muted-foreground/60"
                    style={{
                      animation: 'fadeOut 0.5s ease 3s forwards',
                    }}
                  >
                    Drag to reorder
                  </p>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-border text-muted-foreground hover:text-foreground"
          onClick={addPhase}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add phase
        </Button>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-primary px-6 text-primary-foreground hover:opacity-90"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {existing ? 'Update timeline' : 'Save timeline'}
        </Button>
      </div>
    </div>
  );
}
