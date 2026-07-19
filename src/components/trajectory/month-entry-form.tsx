'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { saveEntry } from '~/lib/actions/trajectory';
import {
  formatMonthLabel,
  monthKeyFor,
  type TrajectoryEntryRow,
  type TrajectoryNumberInput,
} from '~/lib/trajectory';

interface Props {
  eraId: string;
  /** Existing entry for the current month, if any (for upsert prefill). */
  existingEntry: TrajectoryEntryRow | null;
  onDone: () => void;
}

/**
 * Monthly reflection form. Free-form reflection + dynamic list of
 * { label, value } numeric inputs ("Add a number" button). Calls saveEntry
 * (upsert on eraId + monthKey). Pre-filled if an entry for the current
 * month already exists.
 */
export function MonthEntryForm({ eraId, existingEntry, onDone }: Props) {
  const currentMonth = monthKeyFor(new Date());
  const [monthKey, setMonthKey] = useState(existingEntry?.monthKey ?? currentMonth);
  const [reflection, setReflection] = useState(existingEntry?.reflection ?? '');
  const [numbers, setNumbers] = useState<TrajectoryNumberInput[]>(existingEntry?.numbers ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addNumber() {
    setNumbers((prev) => [...prev, { label: '', value: 0 }]);
  }

  function updateNumber(index: number, patch: Partial<TrajectoryNumberInput>) {
    setNumbers((prev) => prev.map((n, i) => (i === index ? { ...n, ...patch } : n)));
  }

  function removeNumber(index: number) {
    setNumbers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const cleanedNumbers = numbers
      .map((n) => ({ label: n.label.trim(), value: n.value }))
      .filter((n) => n.label !== '');
    const res = await saveEntry({
      eraId,
      monthKey,
      reflection: reflection.trim(),
      numbers: cleanedNumbers,
    });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? 'Could not save reflection.');
      return;
    }
    onDone();
  }

  const isCurrentMonth = monthKey === currentMonth;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border bg-background/40 p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="entry-month" className="font-serif text-sm font-medium text-foreground">
          Reflection
        </label>
        <Input
          id="entry-month"
          type="month"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
          className="h-7 w-auto border-border/50 bg-transparent text-xs text-muted-foreground"
        />
      </div>

      <Textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder={
          isCurrentMonth
            ? 'What did this month look like against your ideal? Where did you move toward it, where did you drift?'
            : `Looking back at ${formatMonthLabel(monthKey)} — what happened?`
        }
        rows={5}
        maxLength={5000}
        autoFocus
        className="resize-none border-border/60 bg-card/50 font-serif text-[15px] leading-relaxed placeholder:font-sans placeholder:text-sm placeholder:italic placeholder:text-muted-foreground/50"
      />

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Numbers (optional)</span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={addNumber}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add a number
          </Button>
        </div>
        {numbers.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground/70">
            Add numeric inputs that map to your ideal — runway months, workouts per week, books
            read. The chart draws once you have 3 months of numbers.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {numbers.map((n, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={n.label}
                  onChange={(e) => updateNumber(i, { label: e.target.value })}
                  placeholder="label (e.g. runway months)"
                  className="flex-1 border-border/50 bg-card/40 text-sm"
                  maxLength={80}
                />
                <Input
                  type="number"
                  step="any"
                  value={Number.isFinite(n.value) ? n.value : 0}
                  onChange={(e) => updateNumber(i, { value: Number(e.target.value) })}
                  className="w-24 border-border/50 bg-card/40 text-sm tabular-nums"
                />
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => removeNumber(i)}
                  aria-label="Remove number"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save reflection'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
