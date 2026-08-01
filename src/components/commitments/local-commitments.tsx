'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { StartCommitmentForm } from './start-commitment-form';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';

interface LocalStamp {
  id: string;
  dayDate: string;
  proofUrl: string;
  note: string;
}
interface LocalCommitment {
  id: string;
  hobbyName: string;
  goalDays: number;
  status: 'active' | 'completed' | 'abandoned';
  startDate: string;
  stamps: LocalStamp[];
}

export function LocalCommitments() {
  const [items, setItems] = useState<LocalCommitment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [proofs, setProofs] = useState<Record<string, string>>({});

  useEffect(() => {
    readLocalRecord(
      browserRecordAdapter(),
      'commitments:state',
      'commitments',
      (value): value is LocalCommitment[] => Array.isArray(value)
    ).then((stored) => {
      setItems(stored ?? []);
      setLoaded(true);
    });
  }, []);

  async function save(next: LocalCommitment[]) {
    setItems(next);
    await writeLocalRecord(browserRecordAdapter(), 'commitments:state', 'commitments', next);
  }

  async function start(hobbyName: string, goalDays: number) {
    if (
      items.some(
        (item) =>
          item.status === 'active' && item.hobbyName.toLowerCase() === hobbyName.toLowerCase()
      )
    ) {
      return { success: false, error: `You already have an active commitment for ${hobbyName}` };
    }
    await save([
      ...items,
      {
        id: `local-commitment-${crypto.randomUUID()}`,
        hobbyName,
        goalDays,
        status: 'active',
        startDate: new Date().toISOString(),
        stamps: [],
      },
    ]);
    return { success: true };
  }

  async function stamp(item: LocalCommitment) {
    const proofUrl = proofs[item.id]?.trim();
    if (!proofUrl) return toast.error('Proof is required.');
    const dayDate = new Date().toISOString().slice(0, 10);
    if (item.stamps.some((stamp) => stamp.dayDate === dayDate))
      return toast.error('You already stamped today.');
    const stamps = [
      ...item.stamps,
      { id: `local-stamp-${crypto.randomUUID()}`, dayDate, proofUrl, note: '' },
    ];
    const next = items.map((candidate) =>
      candidate.id === item.id
        ? {
            ...candidate,
            stamps,
            status: stamps.length >= item.goalDays ? ('completed' as const) : candidate.status,
          }
        : candidate
    );
    await save(next);
    setProofs((current) => ({ ...current, [item.id]: '' }));
  }

  if (!loaded)
    return <p className="text-sm text-muted-foreground">Loading commitments from this device…</p>;
  return (
    <StorageModeProvider mode="local">
      <div className="space-y-8">
        <StorageModeStatus />
        <header className="rounded-[1.75rem] bg-[#a8dc91] px-6 py-10 text-[#192817] shadow-[0_14px_40px_rgba(53,80,40,0.10)] sm:px-9">
          <p className="text-base font-bold">Living promises</p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-none tracking-[-0.03em] sm:text-6xl">
            Commitments
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#344b31]">
            Choose something worth returning to, then keep honest proof of the days you showed up.
          </p>
        </header>
        <StartCommitmentForm onLocalStart={start} />
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No commitments yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <section
                key={item.id}
                className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(66,55,22,0.08)]"
              >
                <p className="font-serif text-2xl font-medium">{item.hobbyName}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.stamps.length} of {item.goalDays} proof stamps · {item.status}
                </p>
                {item.status === 'active' && (
                  <div className="mt-4 space-y-2">
                    <input
                      value={proofs[item.id] ?? ''}
                      onChange={(event) =>
                        setProofs((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      placeholder="Proof URL or note"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => stamp(item)}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Stamp today
                    </button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </StorageModeProvider>
  );
}
