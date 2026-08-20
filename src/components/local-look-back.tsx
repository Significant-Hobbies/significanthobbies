'use client';

import { useEffect, useState } from 'react';

import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { HistoryAtlas } from '~/components/life-atlas/history-atlas';
import { PhaseSwimlane } from '~/components/timeline-view/phase-swimlane';
import { browserRecordAdapter, readLocalRecord } from '~/lib/local-record-store';
import { readLocalTrajectory } from '~/lib/local-trajectory';
import { generateLookBack, type LookBackData, type NarrativeSection } from '~/lib/look-back';
import type { TrajectoryContractRecord } from '~/lib/trajectory-contract';
import type { Phase } from '~/lib/types';

export function LocalLookBack({ today }: { today: string }) {
  const [sections, setSections] = useState<NarrativeSection[]>([]);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryContractRecord | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    async function load() {
      const adapter = browserRecordAdapter();
      const [commitments, timeline, onboarding, profile, birthDateRecord, trajectoryState] =
        await Promise.all([
          readLocalRecord(adapter, 'commitments:state', 'commitments', Array.isArray),
          readLocalRecord(adapter, 'timeline-draft-new', 'timelines', isObject),
          readLocalRecord(adapter, 'onboarding:draft', 'onboarding', isObject),
          readLocalRecord(adapter, 'profile:draft', 'profile', isObject),
          readLocalRecord(adapter, 'profile:birth-date', 'profile', isObject),
          readLocalTrajectory(),
        ]);
      const data: LookBackData = {
        name: typeof profile?.name === 'string' ? profile.name : null,
        creed: null,
        birthYear:
          typeof birthDateRecord?.birthDate === 'string'
            ? Number(birthDateRecord.birthDate.slice(0, 4))
            : typeof onboarding?.birthYear === 'number'
              ? onboarding.birthYear
              : null,
        today,
        phases: Array.isArray(timeline?.phases) ? (timeline.phases as Phase[]) : [],
        pins: [],
        completedQuests: [],
        activeQuests: [],
        abandonedQuests: [],
        habits: [],
        habitLogs: [],
        journalEntries: [],
        commitments: Array.isArray(commitments)
          ? commitments.map((item: Record<string, unknown>) => ({
              hobbyName: String(item.hobbyName),
              goalDays: Number(item.goalDays),
              status: String(item.status),
              startDate: new Date(String(item.startDate)),
              stamps: Array.isArray(item.stamps)
                ? item.stamps.map((stamp: Record<string, unknown>) => String(stamp.dayDate))
                : [],
            }))
          : [],
        onboarding: onboarding
          ? {
              droppedHobby:
                typeof onboarding.droppedHobby === 'string' ? onboarding.droppedHobby : undefined,
            }
          : null,
        onboardingCompletedAt: null,
      };
      // The local narrative can use the durable activity without requiring identity fields.
      setSections(generateLookBack(data));
      setBirthYear(data.birthYear);
      setBirthDate(
        typeof birthDateRecord?.birthDate === 'string' ? birthDateRecord.birthDate : null
      );
      setTrajectory(trajectoryState.active);
      setPhases(data.phases);
      setLoaded(true);
    }
    void load();
  }, [today]);
  if (!loaded)
    return <p className="p-8 text-sm text-muted-foreground">Reading your local story…</p>;
  return (
    <StorageModeProvider mode="local">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:py-14">
        <StorageModeStatus />
        <HistoryAtlas birthYear={birthYear} birthDate={birthDate} trajectory={trajectory} />
        <section
          id="personal-timeline"
          className="scroll-mt-24 rounded-[1.75rem] border border-[#d9cfbd] bg-white p-5 sm:p-8"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#176b4a]">Personal timeline</p>
              <h2 className="mt-1 font-serif text-3xl">The chapters that shaped you</h2>
            </div>
          </div>
          {phases.length ? (
            <PhaseSwimlane phases={phases} />
          ) : (
            <p className="leading-relaxed text-muted-foreground">
              Add remembered hobbies during onboarding or build your first timeline.
            </p>
          )}
        </section>
        <div className="mx-auto max-w-4xl space-y-5 pt-6">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className={`rounded-2xl px-6 py-8 sm:px-10 sm:py-10 ${
                index % 3 === 0
                  ? 'bg-[#ffd0bd]'
                  : index % 3 === 1
                    ? 'bg-[#d8c8fa]'
                    : 'bg-white shadow-[0_10px_30px_rgba(66,55,22,0.08)]'
              }`}
            >
              <h2 className="font-serif text-3xl font-medium">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-7 text-foreground/75">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </StorageModeProvider>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
