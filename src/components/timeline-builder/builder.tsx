"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, Save, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PhaseCard } from "./phase-card";
import { saveTimeline, updateTimeline } from "~/lib/actions/timeline";
import type { Phase, TimelineData } from "~/lib/types";
import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { TIMELINE_TEMPLATES, type TimelineTemplate } from "~/lib/templates";

interface Props {
  existing?: TimelineData;
}

function makePhase(order: number): Phase {
  return {
    id: nanoid(),
    label: "",
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
        <h2 className="text-xl font-bold text-stone-900">Choose a starting point</h2>
        <p className="mt-1 text-sm text-stone-500">
          Pick a template to pre-fill phases, or start blank and build your own.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {TIMELINE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onPick(template)}
            className="group rounded-xl border border-stone-200 bg-white p-5 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <div className="mb-3 text-3xl">{template.emoji}</div>
            <h3 className="mb-1 text-sm font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors leading-tight">
              {template.name}
            </h3>
            <p className="mb-3 text-xs text-stone-500 leading-snug">
              {template.description}
            </p>
            {template.phases.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                {template.phases.length} phases
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
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
  const { data: session } = authClient.useSession();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [phases, setPhases] = useState<Phase[]>(
    existing?.phases?.length
      ? existing.phases
      : [makePhase(0)],
  );
  const [isPending, startTransition] = useTransition();
  // Show template picker only for new timelines (no existing prop)
  const [templatePicked, setTemplatePicked] = useState(!!existing);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    setPhases((prev) =>
      prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })),
    );
  }

  function handleSave() {
    const emptyPhases = phases.filter((p) => !p.label.trim());
    if (emptyPhases.length > 0) {
      toast.error("All phases need a name");
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (existing) {
          result = await updateTimeline(existing.id, { title: title || undefined, phases });
        } else {
          result = await saveTimeline({ title: title || undefined, phases });
        }
        toast.success(existing ? "Timeline updated" : "Timeline saved!");
        // Redirect to timeline — username lookup happens via server redirect from /timeline/[id]
        router.push(`/timeline/${result.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save";
        if (msg === "Not authenticated") {
          toast.error("Sign in to save your timeline");
          router.push("/login");
        } else {
          toast.error(msg);
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
          className="h-11 border-stone-300 bg-white text-lg font-medium placeholder:text-stone-400"
        />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            allEmpty
              ? "bg-stone-100 text-stone-500"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {phasesWithHobbies}/{totalPhases} phases have hobbies
        </span>
        {allEmpty && (
          <span className="text-xs text-stone-400">
            Tip: Add hobbies to each phase to unlock insights
          </span>
        )}
        {!existing && (
          <button
            type="button"
            onClick={() => setTemplatePicked(false)}
            className="ml-auto text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Change template
          </button>
        )}
      </div>

      {/* Phases */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={phases.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
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
                    className="mt-1.5 text-center text-xs text-stone-400"
                    style={{
                      animation: "fadeOut 0.5s ease 3s forwards",
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
          className="border-stone-300 text-stone-600 hover:text-stone-900"
          onClick={addPhase}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add phase
        </Button>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-emerald-600 px-6 text-white hover:bg-emerald-700"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {existing ? "Update timeline" : "Save timeline"}
        </Button>
      </div>
    </div>
  );
}
