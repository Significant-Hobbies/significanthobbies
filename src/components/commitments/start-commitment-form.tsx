'use client';

import { useState } from 'react';
import { Flame, Plus } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { startCommitment } from '~/lib/actions/commitments';

type Props = {
  // Optional pre-filtered hobby suggestions from the user's timeline.
  suggestions?: string[];
  // The user's remaining weeks (for the mortality frame at creation time).
  weeksRemaining?: number;
};

const PRESET_GOALS = [7, 30, 100, 365];

// Roughly how many weeks a daily commitment of N days will spend.
function weeksForDays(days: number): number {
  return Math.round((days / 7) * 10) / 10;
}

export function StartCommitmentForm({ suggestions = [], weeksRemaining }: Props) {
  const [open, setOpen] = useState(false);
  const [hobbyName, setHobbyName] = useState('');
  const [goalDays, setGoalDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hobbyName.trim()) {
      setError('Pick a hobby to commit to.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await startCommitment({ hobbyName: hobbyName.trim(), goalDays });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? 'Could not start commitment.');
      return;
    }
    setHobbyName('');
    setGoalDays(30);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground hover:bg-lumi-300 gap-1.5"
      >
        <Flame className="h-4 w-4" />
        Start a commitment
      </Button>
    );
  }

  const spendWeeks = weeksForDays(goalDays);

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What hobby are you committing to?
        </label>
        <input
          list="commitment-hobby-suggestions"
          value={hobbyName}
          onChange={(e) => setHobbyName(e.target.value)}
          placeholder="e.g. Guitar, Running, Spanish"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40"
          autoFocus
        />
        <datalist id="commitment-hobby-suggestions">
          {suggestions.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Goal: show up daily for…
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoalDays(g)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                goalDays === g
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground hover:border-foreground/40'
              }`}
            >
              {g} days
            </button>
          ))}
        </div>
      </div>

      {weeksRemaining !== undefined && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          This commitment will spend ~{spendWeeks} weeks of your remaining{' '}
          {weeksRemaining.toLocaleString()}. Worth it?
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {submitting ? 'Starting…' : 'Begin commitment'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
