'use client';

import { BookOpen, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type JournalRecord = {
  dayDate: string;
  amEntry?: string | null;
  pmEntry?: string | null;
};

export function JournalArchive({ records }: { records: JournalRecord[] }) {
  const [entries, setEntries] = useState(records);

  useEffect(() => {
    function receiveSavedEntry(event: Event) {
      const detail = (event as CustomEvent<JournalRecord>).detail;
      if (!detail?.dayDate) return;
      setEntries((current) => [
        detail,
        ...current.filter((item) => item.dayDate !== detail.dayDate),
      ]);
    }
    window.addEventListener('journal:entry-saved', receiveSavedEntry);
    return () => window.removeEventListener('journal:entry-saved', receiveSavedEntry);
  }, []);

  const writtenEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => entry.amEntry?.trim() || entry.pmEntry?.trim())
        .sort((left, right) => right.dayDate.localeCompare(left.dayDate)),
    [entries]
  );

  return (
    <section
      id="journal-history"
      aria-labelledby="journal-history-title"
      className="scroll-mt-24 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_36px_rgba(66,55,22,0.10)]"
    >
      <div className="border-b border-[#e8dfd1] bg-[#ffd0bd] p-5 sm:p-7">
        <BookOpen className="size-6" />
        <p className="mt-5 text-sm font-bold text-[#713f2d]">In your own words</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h2 id="journal-history-title" className="font-serif text-3xl sm:text-4xl">
            Journal history
          </h2>
          <span className="font-serif text-2xl tabular-nums">
            {writtenEntries.length} {writtenEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {writtenEntries.length ? (
        <div className="divide-y divide-[#e8dfd1] px-5 sm:px-7">
          {writtenEntries.map((entry, index) => (
            <details key={entry.dayDate} open={index === 0} className="group py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-serif text-xl marker:content-none">
                {formatJournalDay(entry.dayDate)}
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-5 pb-6 text-base leading-7 text-[#514b42]">
                {entry.amEntry?.trim() ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#176b4a]">
                      Morning
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{entry.amEntry}</p>
                  </div>
                ) : null}
                {entry.pmEntry?.trim() ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7658ad]">
                      Evening
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{entry.pmEntry}</p>
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="p-6 sm:p-8">
          <p className="font-serif text-2xl">Your first saved reflection will live here.</p>
          <p className="mt-2 text-sm leading-relaxed text-[#625b50]">
            This is a private archive, not a publishing feed.
          </p>
        </div>
      )}
    </section>
  );
}

function formatJournalDay(dayDate: string): string {
  const [year, month, day] = dayDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year!, month! - 1, day!, 12));
}
