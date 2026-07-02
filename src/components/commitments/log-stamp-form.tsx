'use client';

import { useState } from 'react';
import { Stamp } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { logStamp } from '~/lib/actions/commitments';

type Props = {
  commitmentId: string;
  hobbyName: string;
  // When true, the form is rendered inline (compact). Otherwise it's a button
  // that expands into the form.
  defaultOpen?: boolean;
};

export function LogStampForm({ commitmentId, hobbyName, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justEarned, setJustEarned] = useState<string[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofUrl.trim()) {
      setError('Add a proof link to stamp today.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await logStamp({
      commitmentId,
      proofUrl: proofUrl.trim(),
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? 'Could not log stamp.');
      return;
    }
    setProofUrl('');
    setNote('');
    setOpen(false);
    if (res.newBadges && res.newBadges.length > 0) {
      setJustEarned(res.newBadges);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5"
      >
        <Stamp className="h-3.5 w-3.5" />
        Stamp today
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-background p-3 space-y-3"
    >
      <p className="text-xs text-muted-foreground">
        Log today&apos;s practice for{' '}
        <span className="font-medium text-foreground">{hobbyName}</span>.
      </p>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-1">
          Proof link (YouTube, photo, anything)
        </label>
        <input
          type="text"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or any URL"
          className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-1">
          Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you work on?"
          maxLength={500}
          className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {justEarned && justEarned.length > 0 && (
        <p className="text-xs text-foreground">
          New badge{justEarned.length > 1 ? 's' : ''} earned: {justEarned.join(', ')} 🎉
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={submitting}
          size="sm"
          className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5"
        >
          <Stamp className="h-3.5 w-3.5" />
          {submitting ? 'Stamping…' : 'Stamp today'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
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
