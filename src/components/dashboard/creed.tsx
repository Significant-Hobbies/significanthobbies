'use client';

import { Check, Edit3, Feather, Sparkles, X } from 'lucide-react';
import { useState, useTransition } from 'react';

import { GradientMesh, SpotlightCard } from '~/components/aceternity';
import { Button } from '~/components/ui/button';
import { updateCreed } from '~/lib/actions/user';
import { cn } from '~/lib/utils';

interface CreedProps {
  creed: string | null;
  userName: string | null;
}

const MAX_LEN = 500;

/**
 * Creed — the user's personal declaration. "I am someone who..."
 *
 * This is the emotional anchor of the product. It sits at the very top of the
 * dashboard, above everything else. Two states: an invitation to write it
 * (empty), and a living quote on a museum wall (filled).
 */
export function Creed({ creed, userName }: CreedProps) {
  const [savedCreed, setSavedCreed] = useState<string | null>(creed);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(creed ?? '');
  const [isPending, startTransition] = useTransition();

  const hasCreed = savedCreed !== null && savedCreed.trim().length > 0;

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await updateCreed(trimmed);
      if (result.success) {
        setSavedCreed(trimmed.slice(0, MAX_LEN));
        setIsEditing(false);
      }
    });
  }

  function handleCancel() {
    setDraft(savedCreed ?? '');
    setIsEditing(false);
  }

  function startEdit() {
    setDraft(savedCreed ?? '');
    setIsEditing(true);
  }

  const charCount = draft.length;
  const overLimit = charCount > MAX_LEN;

  // ─── Edit mode (shared by empty + edit states) ───
  if (!hasCreed || isEditing) {
    const isEmpty = !hasCreed;
    return (
      <SpotlightCard
        className="shadow-soft"
        innerClassName="relative px-6 py-8 sm:px-10 sm:py-10"
        spotlightColor="oklch(0.82 0.13 88 / 0.10)"
      >
        <GradientMesh variant="gold" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Icon with gold glow */}
          <div className="relative mb-5">
            <div
              className="absolute inset-0 rounded-full blur-xl"
              aria-hidden="true"
              style={{
                background: 'radial-gradient(circle, oklch(0.82 0.13 88 / 0.18), transparent 70%)',
              }}
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
              {isEmpty ? (
                <Feather className="h-6 w-6 text-primary" />
              ) : (
                <Edit3 className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>

          <h2 className="font-serif text-xl font-semibold text-foreground">
            {isEmpty ? 'Write your creed' : 'Edit your creed'}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            One sentence. What are you about? What do you want your life to prove?
          </p>

          {/* Textarea — feels like writing a stamp, not filling a form */}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
            placeholder="I am someone who..."
            autoFocus
            className={cn(
              'mt-6 min-h-20 w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-center',
              'font-serif text-lg italic text-foreground placeholder:text-muted-foreground/50',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            rows={3}
          />

          {/* Character counter */}
          <div className="mt-2 flex w-full items-center justify-end">
            <span
              className={cn(
                'text-xs tabular-nums',
                overLimit ? 'text-destructive' : 'text-muted-foreground/60'
              )}
            >
              {charCount} / {MAX_LEN}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            {!isEmpty && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="gap-1.5 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isPending || !draft.trim() || overLimit}
              className="gap-1.5 bg-primary text-primary-foreground hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              {isPending ? 'Saving…' : 'Save creed'}
            </Button>
          </div>
        </div>
      </SpotlightCard>
    );
  }

  // ─── Display state — a quote on a museum wall ───
  return (
    <SpotlightCard
      className="shadow-soft"
      innerClassName="relative px-6 py-8 sm:px-10 sm:py-10"
      spotlightColor="oklch(0.82 0.13 88 / 0.08)"
    >
      <GradientMesh variant="gold" />

      {/* Edit button — top-right, ghost, muted */}
      <div className="absolute right-3 top-3 z-20">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={startEdit}
          aria-label="Edit creed"
          className="text-muted-foreground/60 hover:text-foreground"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Subtle sparkles mark — signals this is a living document */}
        <Sparkles className="mb-4 h-4 w-4 text-primary/40" aria-hidden="true" />

        <blockquote className="font-serif text-xl italic leading-relaxed text-foreground sm:text-2xl">
          {savedCreed}
        </blockquote>

        {userName && <p className="mt-5 text-sm text-muted-foreground">— {userName}</p>}
      </div>
    </SpotlightCard>
  );
}
