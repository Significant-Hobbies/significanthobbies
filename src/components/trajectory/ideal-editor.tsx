'use client';

import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { setIdeal } from '~/lib/actions/trajectory';
import { BUCKET_LABELS, type TrajectoryBucket } from '~/lib/trajectory';

interface Props {
  bucket: TrajectoryBucket;
  /** The current ideal text, or null if no active era exists. */
  currentIdeal: string | null;
  /** Whether there's an active era to close before opening a new one. */
  hasActiveEra: boolean;
  onClose: () => void;
}

const PLACEHOLDERS: Record<TrajectoryBucket, string> = {
  health: 'e.g. Sleep 7 hours, train 3× a week, and walk daily. No back pain by year-end.',
  finance: 'e.g. 12 months of runway, no high-interest debt, investing 20% of income.',
  knowledge:
    'e.g. Read one book a month. Ship two essays. Get fluent enough in Rust to ship a side project.',
  relationships:
    'e.g. Call my parents weekly. One real conversation with a close friend each week. Date nights without phones.',
};

/**
 * Inline form for editing the current ideal. On save, if there's an existing
 * active era, prompts the user to declare whether they reached it (Yes →
 * completed, No → abandoned) before opening the new era. First-ever ideal
 * skips the close prompt.
 */
export function IdealEditor({ bucket, currentIdeal, hasActiveEra, onClose }: Props) {
  const [text, setText] = useState(currentIdeal ?? '');
  const [phase, setPhase] = useState<'edit' | 'close-prompt'>('edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Describe your ideal in a sentence or two.');
      return;
    }
    if (trimmed === currentIdeal) {
      onClose();
      return;
    }
    if (hasActiveEra) {
      setPhase('close-prompt');
      return;
    }
    await submit(trimmed, undefined);
  }

  async function submit(idealText: string, previousOutcome: 'completed' | 'abandoned' | undefined) {
    setSubmitting(true);
    setError(null);
    const res = await setIdeal({ bucket, idealText, previousOutcome });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? 'Could not save ideal.');
      setPhase('edit');
      return;
    }
    onClose();
  }

  if (phase === 'close-prompt') {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-background/40 p-5">
        <div className="space-y-2">
          <p className="font-serif text-base text-foreground">
            Did you reach your previous ideal for {BUCKET_LABELS[bucket].toLowerCase()}?
          </p>
          <p className="font-serif text-sm italic leading-relaxed text-muted-foreground">
            &ldquo;{currentIdeal}&rdquo;
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground/80">
            Either answer closes this chapter and opens a new one. There is no wrong choice — the
            point is to be honest about where you ended up.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => submit(text.trim(), 'completed')} disabled={submitting}>
            Yes — reached it
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => submit(text.trim(), 'abandoned')}
            disabled={submitting}
          >
            No — moved on
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPhase('edit')} disabled={submitting}>
            Back
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-border bg-background/40 p-5"
    >
      <label
        htmlFor={`ideal-${bucket}`}
        className="block font-serif text-sm font-medium text-foreground"
      >
        Your ideal for {BUCKET_LABELS[bucket].toLowerCase()}
      </label>
      <Textarea
        id={`ideal-${bucket}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDERS[bucket]}
        rows={3}
        maxLength={500}
        autoFocus
        className="resize-none border-border/60 bg-card/50 font-serif text-[15px] leading-relaxed placeholder:font-sans placeholder:text-sm placeholder:italic placeholder:text-muted-foreground/50"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        One to three sentences. This is your committed finish line — the gap between it and where
        you are is the score.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : hasActiveEra ? 'Set new ideal' : 'Set ideal'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
