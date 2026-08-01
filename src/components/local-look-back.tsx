'use client';

import { useEffect, useState } from 'react';

import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { HistoryAtlas } from '~/components/life-atlas/history-atlas';
import { browserRecordAdapter, readLocalRecord } from '~/lib/local-record-store';
import { readLocalTrajectory } from '~/lib/local-trajectory';
import { generateLookBack, type LookBackData, type NarrativeSection } from '~/lib/look-back';
import type { TrajectoryContractRecord } from '~/lib/trajectory-contract';
import type { Phase } from '~/lib/types';

export function LocalLookBack({ today }: { today: string }) {
  const [sections, setSections] = useState<NarrativeSection[]>([]);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryContractRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    async function load() {
      const adapter = browserRecordAdapter();
      const [daily, commitments, timeline, onboarding, profile, trajectoryState] =
        await Promise.all([
          readLocalRecord(adapter, 'daily:state', 'daily', isObject),
          readLocalRecord(adapter, 'commitments:state', 'commitments', Array.isArray),
          readLocalRecord(adapter, 'timeline-draft-new', 'timelines', isObject),
          readLocalRecord(adapter, 'onboarding:draft', 'onboarding', isObject),
          readLocalRecord(adapter, 'profile:draft', 'profile', isObject),
          readLocalTrajectory(),
        ]);
      const data: LookBackData = {
        name: typeof profile?.name === 'string' ? profile.name : null,
        creed: null,
        birthYear: typeof onboarding?.birthYear === 'number' ? onboarding.birthYear : null,
        today,
        phases: Array.isArray(timeline?.phases) ? (timeline.phases as Phase[]) : [],
        pins: [],
        completedQuests: [],
        activeQuests: [],
        abandonedQuests: [],
        habits: Array.isArray(daily?.habits)
          ? daily.habits.map((habit: Record<string, unknown>) => ({
              id: String(habit.id),
              name: String(habit.name),
              icon: typeof habit.icon === 'string' ? habit.icon : null,
              targetFrequency: String(habit.targetFrequency ?? 'daily'),
              createdAt: new Date(),
            }))
          : [],
        habitLogs: Array.isArray(daily?.logs) ? (daily.logs as LookBackData['habitLogs']) : [],
        journalEntries: Array.isArray(daily?.journals)
          ? (daily.journals as LookBackData['journalEntries'])
          : [],
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
      setTrajectory(trajectoryState.active);
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
        <HistoryAtlas birthYear={birthYear} trajectory={trajectory} />
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
