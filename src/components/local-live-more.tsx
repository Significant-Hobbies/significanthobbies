'use client';

import { ArrowRight, Dice5 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DailyNewThing } from '~/components/daily-new-thing';
import { DailyNewThingHistory } from '~/components/daily-new-thing-history';
import { LiveMoreBucketFocus } from '~/components/live-more-bucket-focus';
import { LiveMoreDiscovery } from '~/components/live-more-discovery';
import type { LocalDailyState } from '~/components/local-personal-practice-surfaces';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import {
  areDailyIntentionsValid,
  dailyNoveltyById,
  normalizeDailyIntentions,
} from '~/lib/daily-novelty';
import { dayKeyIn } from '~/lib/day';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';

type Suggestion = {
  title: string;
  category:
    | 'travel'
    | 'adventure'
    | 'creative'
    | 'achievement'
    | 'relationships'
    | 'contribution'
    | 'food'
    | 'health'
    | 'mindfulness'
    | 'reflection';
  emoji: string;
  reason: string;
};

export function LocalLiveMore({ suggestions }: { suggestions: Suggestion[] }) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [bucket, setBucket] = useState<Record<string, unknown> | null>(null);
  const [daily, setDaily] = useState<LocalDailyState>({ habits: [], logs: [], journals: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const adapter = browserRecordAdapter();
    Promise.all([
      readLocalRecord(adapter, 'onboarding:profile', 'onboarding', isObject),
      readLocalRecord(adapter, 'onboarding:bucket-items', 'bucket-list', isObject),
      readLocalRecord(adapter, 'daily:state', 'daily', isDailyState),
    ]).then(([nextProfile, nextBucket, nextDaily]) => {
      setProfile(nextProfile);
      setBucket(nextBucket);
      setDaily(nextDaily ?? { habits: [], logs: [], journals: [] });
      setLoaded(true);
    });
  }, []);

  const name = typeof profile?.name === 'string' ? profile.name.split(' ')[0] : null;
  const rawItems = Array.isArray(bucket?.items) ? bucket.items : [];
  const items = rawItems.flatMap((item, index) =>
    isObject(item) &&
    typeof item.title === 'string' &&
    (typeof item.status !== 'string' || item.status !== 'done')
      ? [{ id: `local-${index}`, title: item.title }]
      : []
  );
  const goals = Array.isArray(bucket?.annualGoals)
    ? bucket.annualGoals.filter((value): value is string => typeof value === 'string')
    : typeof bucket?.annualFocus === 'string'
      ? [bucket.annualFocus]
      : [];
  const today = dayKeyIn(null);

  async function setDailyNovelty(
    dayDate: string,
    noveltyId: string | null,
    noveltyText: string | null,
    completed: boolean
  ) {
    const customText = normalizeDailyIntentions(noveltyText);
    const validNoveltyId = noveltyId ? dailyNoveltyById(noveltyId)?.id : null;
    if (
      Boolean(validNoveltyId) === Boolean(customText) ||
      (Boolean(customText) && !areDailyIntentionsValid(customText))
    )
      return false;

    const existing = daily.journals.find((entry) => entry.dayDate === dayDate);
    const entry = {
      id: existing?.id ?? `local-journal-${crypto.randomUUID()}`,
      dayDate,
      amEntry: existing?.amEntry ?? null,
      pmEntry: existing?.pmEntry ?? null,
      timelineId: null,
      commitmentId: null,
      noveltyId: validNoveltyId,
      noveltyText: customText || null,
      noveltyCompleted: completed,
    };
    const next = {
      ...daily,
      journals: existing
        ? daily.journals.map((item) => (item.id === existing.id ? entry : item))
        : [...daily.journals, entry],
    };
    setDaily(next);
    await writeLocalRecord(browserRecordAdapter(), 'daily:state', 'daily', next);
    return true;
  }

  return (
    <StorageModeProvider mode="local">
      <div className="bg-[#fbf8ef] px-4 py-8 text-[#211e18] sm:py-12">
        <div className="mx-auto max-w-6xl space-y-10 sm:space-y-14">
          <div className="flex justify-end">
            <StorageModeStatus />
          </div>
          {loaded ? (
            <LiveMoreBucketFocus initialItems={items} goals={goals} mode="local" name={name} />
          ) : null}
          {loaded ? (
            <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <DailyNewThing
                today={today}
                selectedDate={today}
                seed="this-device"
                records={daily.journals}
                persist={setDailyNovelty}
              />
              <DailyNewThingHistory records={daily.journals} />
            </section>
          ) : null}
          <LiveMoreDiscovery suggestions={suggestions} mode="local" />
          <section className="grid gap-4">
            <LocalPath
              href="/life-bingo"
              icon={<Dice5 />}
              title="Life Bingo"
              color="bg-[#f7e957]"
            />
          </section>
        </div>
      </div>
    </StorageModeProvider>
  );
}

function LocalPath({
  href,
  icon,
  title,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-36 items-end justify-between rounded-2xl p-6 ${color}`}
    >
      <div>
        {icon}
        <h2 className="mt-4 font-serif text-3xl">{title}</h2>
      </div>
      <ArrowRight className="size-5" />
    </Link>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isDailyState(value: unknown): value is LocalDailyState {
  return (
    isObject(value) &&
    Array.isArray(value.habits) &&
    Array.isArray(value.logs) &&
    Array.isArray(value.journals)
  );
}
