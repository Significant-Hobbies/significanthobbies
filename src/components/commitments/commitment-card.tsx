'use client';

import { useState } from 'react';
import { Trophy, X } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { abandonCommitment } from '~/lib/actions/commitments';
import { computeStreak, type StampRow } from '~/lib/commitments';
import { LogStampForm } from './log-stamp-form';

type Props = {
  id: string;
  hobbyName: string;
  goalDays: number;
  status: string;
  startDate: Date;
  stamps: StampRow[];
  // Show the abandon control (owner only).
  canAbandon?: boolean;
};

export function CommitmentCard({
  id,
  hobbyName,
  goalDays,
  status,
  startDate,
  stamps,
  canAbandon = false,
}: Props) {
  const info = computeStreak(stamps);
  const progress = Math.min(100, Math.round((info.totalStamps / goalDays) * 100));
  const isComplete = status === 'completed';
  const dueToday = status === 'active' && !info.stampedToday;
  const [abandoning, setAbandoning] = useState(false);

  async function handleAbandon() {
    if (
      !confirm(`Abandon your ${hobbyName} commitment? Stamps already logged stay on your profile.`)
    ) {
      return;
    }
    setAbandoning(true);
    await abandonCommitment(id);
    setAbandoning(false);
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isComplete
          ? 'border-border bg-card'
          : dueToday
            ? 'border-border bg-card'
            : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{hobbyName}</h3>
            {isComplete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
                <Trophy className="h-3 w-3" />
                Complete
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {goalDays}-day goal · started {startDate.toLocaleDateString()}
          </p>
        </div>
        {canAbandon && status === 'active' && (
          <button
            onClick={handleAbandon}
            disabled={abandoning}
            className="text-muted-foreground/40 hover:text-destructive transition-colors"
            title="Abandon commitment"
            aria-label="Abandon commitment"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Current" value={info.currentStreak} />
        <Stat label="Longest" value={info.longestStreak} />
        <Stat label="Total" value={`${info.totalStamps}/${goalDays}`} />
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-foreground/40 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3">
        {status === 'active' && !info.stampedToday && (
          <LogStampForm commitmentId={id} hobbyName={hobbyName} />
        )}
        {status === 'active' && info.stampedToday && (
          <p className="text-xs text-muted-foreground">Stamped today.</p>
        )}
        {isComplete && (
          <p className="text-xs text-muted-foreground">
            You hit your {goalDays}-day goal. The stamps live on your profile.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-foreground/5 py-1.5">
      <div className="text-base font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground/50">{label}</div>
    </div>
  );
}
