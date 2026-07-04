'use client';

import { useState } from 'react';
import { Check, Sunrise, Sunset } from 'lucide-react';

import { Button } from '~/components/ui/button';

interface JournalEntry {
  id: string;
  amEntry: string | null;
  pmEntry: string | null;
}

interface Checkin {
  id: string;
  amCompleted: boolean;
  pmCompleted: boolean;
}

interface JournalActions {
  saveJournalEntry: (
    dayDate: string,
    amEntry: string | null,
    pmEntry: string | null
  ) => Promise<void>;
  saveDailyCheckin: (dayDate: string, amCompleted: boolean, pmCompleted: boolean) => Promise<void>;
}

interface Props {
  today: string;
  isMorning: boolean;
  journalEntry: JournalEntry | null;
  checkin: Checkin | null;
  actions: JournalActions;
}

export function JournalSection({
  today,
  isMorning,
  journalEntry: initialJournal,
  checkin: initialCheckin,
  actions,
}: Props) {
  const [amEntry, setAmEntry] = useState(initialJournal?.amEntry ?? '');
  const [pmEntry, setPmEntry] = useState(initialJournal?.pmEntry ?? '');
  const [amCompleted, setAmCompleted] = useState(initialCheckin?.amCompleted ?? false);
  const [pmCompleted, setPmCompleted] = useState(initialCheckin?.pmCompleted ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const journalTitle = isMorning ? 'Morning Focus' : 'Evening Reflection';
  const journalPlaceholder = isMorning
    ? 'What will you change today? One sentence is enough.'
    : 'What did you change today? One sentence is enough.';

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await actions.saveJournalEntry(today, amEntry || null, pmEntry || null);
      if (isMorning) {
        setAmCompleted(true);
        await actions.saveDailyCheckin(today, true, pmCompleted);
      } else {
        setPmCompleted(true);
        await actions.saveDailyCheckin(today, amCompleted, true);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const canSave = isMorning ? amEntry.trim().length > 0 : pmEntry.trim().length > 0;
  const currentEntry = isMorning ? amEntry : pmEntry;
  const charCount = currentEntry.length;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Journal</h2>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Proof for yourself, not anyone else
          </p>
        </div>
        <span className="text-xs text-muted-foreground/60">
          {isMorning ? 'Morning' : 'Evening'}
        </span>
      </div>

      {/* Journal card with header + gradient focus border */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-colors focus-within:border-primary/40">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            {isMorning ? (
              <Sunrise className="h-4 w-4 text-primary" />
            ) : (
              <Sunset className="h-4 w-4 text-primary" />
            )}
            <h3 className="font-serif text-sm font-medium text-foreground">{journalTitle}</h3>
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground/50">
            {charCount} chars
          </span>
        </div>
        <textarea
          value={isMorning ? amEntry : pmEntry}
          onChange={(e) => (isMorning ? setAmEntry(e.target.value) : setPmEntry(e.target.value))}
          placeholder={journalPlaceholder}
          className="w-full min-h-[140px] resize-none bg-transparent px-5 py-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none"
        />
      </div>

      {/* Morning entry (read-only, evening view) */}
      {!isMorning && amEntry && (
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Sunrise className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">This morning you wrote</p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {amEntry}
          </p>
        </div>
      )}

      {/* Save — with circular checkmark animation */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving || !canSave} className="gap-2">
          {saving ? 'Saving…' : isMorning ? 'Save morning' : 'Save evening'}
        </Button>

        {/* Circular checkmark animation when saved */}
        {saved && (
          <div className="flex items-center gap-2 animate-fade-in-up">
            <div className="relative flex h-7 w-7 items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  fill="none"
                  strokeWidth="2.5"
                  stroke="oklch(0.82 0.13 88)"
                  strokeDasharray="69.12"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="animate-[drawLine_0.5s_ease-out]"
                  style={{ filter: 'drop-shadow(0 0 4px oklch(0.82 0.13 88 / 0.5))' }}
                />
              </svg>
              <Check className="absolute h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Saved</span>
          </div>
        )}

        {!canSave && !saved && (
          <span className="text-xs text-muted-foreground/60">
            {isMorning
              ? 'What will you change today? One sentence is enough.'
              : 'What did you change today? One sentence is enough.'}
          </span>
        )}
      </div>
    </div>
  );
}
