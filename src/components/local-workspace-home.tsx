'use client';

import { ArrowRight, Check, Circle, Clock3, ListChecks, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { lifeInWeeksFromDate, parseBirthDate } from '~/lib/life-in-weeks';
import { browserRecordAdapter, readLocalRecord } from '~/lib/local-record-store';

type LocalHabit = { id: string; name: string; icon?: string | null; status?: string };
type LocalLog = { habitId: string; dayDate: string; completed: boolean };
type LocalJournal = { dayDate: string; amEntry?: string | null; pmEntry?: string | null };
type LocalDaily = { habits: LocalHabit[]; logs: LocalLog[]; journals: LocalJournal[] };
type LocalProfile = { name?: string; birthDate?: string };
type LocalBucketItem = { title: string };
type LocalBucket = { items?: LocalBucketItem[] };

const EMPTY_DAILY: LocalDaily = { habits: [], logs: [], journals: [] };

export function LocalWorkspaceHome({ title = 'Your dashboard' }: { title?: string }) {
  const [profile, setProfile] = useState<LocalProfile>({});
  const [daily, setDaily] = useState<LocalDaily>(EMPTY_DAILY);
  const [bucket, setBucket] = useState<LocalBucket>({});
  const [loaded, setLoaded] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  useEffect(() => {
    const adapter = browserRecordAdapter();
    Promise.all([
      readLocalRecord(adapter, 'onboarding:profile', 'onboarding', isProfile),
      readLocalRecord(adapter, 'daily:state', 'daily', isDaily),
      readLocalRecord(adapter, 'onboarding:bucket-items', 'bucket-list', isBucket),
    ]).then(([nextProfile, nextDaily, nextBucket]) => {
      setProfile(nextProfile ?? {});
      setDaily(nextDaily ?? EMPTY_DAILY);
      setBucket(nextBucket ?? {});
      setLoaded(true);
    });
  }, []);

  const activeHabits = daily.habits.filter((habit) => habit.status !== 'archived').slice(0, 6);
  const completed = new Set(
    daily.logs.filter((log) => log.dayDate === today && log.completed).map((log) => log.habitId)
  );
  const todayJournal = daily.journals.find((entry) => entry.dayDate === today);
  const journalStarted = Boolean(todayJournal?.amEntry?.trim() || todayJournal?.pmEntry?.trim());
  const nextItem = bucket.items?.find((item) => item.title.trim());
  const firstName = profile.name?.trim().split(/\s+/)[0] || 'there';
  const birthDate = profile.birthDate ? parseBirthDate(profile.birthDate) : null;
  const life = birthDate ? lifeInWeeksFromDate(birthDate) : null;
  const quotes = [
    'Today is the first day of the rest of your life.',
    'The way we spend our days is, of course, the way we spend our lives.',
    'Life is what happens while you are busy making other plans.',
    'Do not wait for a special occasion. Being alive is the special occasion.',
  ];
  const quote = quotes[Number(today.replaceAll('-', '')) % quotes.length];

  return (
    <StorageModeProvider mode="local">
      <main className="min-h-[calc(100vh-4rem)] bg-[#fbf8ef] px-4 py-8 text-[#211e18] sm:py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="overflow-hidden rounded-[2rem] bg-[#f7e957] shadow-[0_18px_45px_rgba(85,72,24,0.10)]">
            <div className="grid lg:grid-cols-[1fr_22rem]">
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.18em]">Today · {today}</p>
                  <StorageModeStatus />
                </div>
                <h1 className="mt-5 font-serif text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
                  <span className="sr-only">Your dashboard. </span>
                  {title === 'Your dashboard'
                    ? loaded
                      ? `Live it, ${firstName}.`
                      : 'Your dashboard'
                    : title}
                </h1>
                <blockquote className="mt-5 max-w-2xl font-serif text-xl leading-snug text-[#3e3924] sm:text-2xl">
                  “{quote}”
                </blockquote>
              </div>
              <div className="flex flex-col justify-between bg-[#211e18] p-6 text-white sm:p-8">
                <Clock3 className="size-6 text-[#f7e957]" />
                <div className="mt-10">
                  {life ? (
                    <>
                      <p className="font-serif text-5xl tabular-nums text-[#f7e957]">
                        {life.weeksRemaining.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        Saturdays, roughly. Not a prediction.
                      </p>
                    </>
                  ) : (
                    <p className="font-serif text-2xl">Make the time visible.</p>
                  )}
                </div>
                <Link
                  href="/life-in-weeks"
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b-2 border-[#f7e957] font-bold"
                >
                  {life ? 'See your life in weeks' : 'Add your birth date'}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[1.75rem] border border-[#d9cfbd] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#176b4a]">Today&apos;s practice</p>
                  <h2 className="mt-1 font-serif text-3xl">Habits</h2>
                </div>
                <Link href="/daily" className="text-sm font-bold underline underline-offset-4">
                  Check in
                </Link>
              </div>
              {!loaded ? (
                <p className="mt-6 text-sm text-[#716b60]">Opening today from this device…</p>
              ) : activeHabits.length ? (
                <ul className="mt-5 divide-y divide-[#ece5d8]">
                  {activeHabits.map((habit) => {
                    const done = completed.has(habit.id);
                    return (
                      <li key={habit.id} className="flex items-center gap-3 py-3 text-base">
                        <span
                          className={`flex size-8 items-center justify-center rounded-full ${done ? 'bg-[#176b4a] text-white' : 'border-2 border-[#cfc5b3] text-[#9c927f]'}`}
                        >
                          {done ? <Check className="size-4" /> : <Circle className="size-3" />}
                        </span>
                        <span className={done ? 'text-[#716b60] line-through' : ''}>
                          {habit.icon ? `${habit.icon} ` : ''}
                          {habit.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty copy="Start with one small thing worth repeating." action="Create a habit" />
              )}
            </section>

            <section className="rounded-[1.75rem] bg-[#c5abfa] p-6 sm:p-8">
              <NotebookPen className="size-6" />
              <p className="mt-5 text-sm font-bold">Journal</p>
              <h2 className="mt-1 font-serif text-3xl">
                {journalStarted ? 'You left a note for today.' : 'What is alive for you?'}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#44375c]">
                One honest sentence is enough. Morning focus and evening reflection live together.
              </p>
              <DashboardLink href="/daily">
                {journalStarted ? 'Continue writing' : 'Begin today'}
              </DashboardLink>
            </section>
          </div>

          <div>
            <section className="rounded-[1.75rem] bg-[#ffd0bd] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <ListChecks className="size-6" />
                <Link href="/live-more" className="text-sm font-bold underline underline-offset-4">
                  Manage in Live More
                </Link>
              </div>
              <p className="mt-8 text-sm font-bold">What&apos;s next?</p>
              <h2 className="mt-2 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
                {nextItem?.title ?? 'Choose one thing you do not want to leave unlived.'}
              </h2>
              <DashboardLink href={nextItem ? '/live-more' : '/live-more#discover'}>
                {nextItem ? 'Move it forward' : 'Discover what is possible'}
              </DashboardLink>
            </section>
          </div>

          <p className="px-2 text-sm text-[#716b60]">
            This dashboard is saved on this device. Sign in only for backup, cross-device access, or
            publishing.
          </p>
        </div>
      </main>
    </StorageModeProvider>
  );
}

function DashboardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-bold"
    >
      {children} <ArrowRight className="size-4" />
    </Link>
  );
}

function Empty({ copy, action }: { copy: string; action: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[#cfc5b3] bg-[#fffdf8] p-6">
      <p className="text-[#625b50]">{copy}</p>
      <Link href="/daily" className="mt-3 inline-flex font-bold underline underline-offset-4">
        {action} →
      </Link>
    </div>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isProfile(value: unknown): value is LocalProfile {
  return isObject(value);
}

function isDaily(value: unknown): value is LocalDaily {
  return (
    isObject(value) &&
    Array.isArray(value.habits) &&
    Array.isArray(value.logs) &&
    Array.isArray(value.journals)
  );
}

function isBucket(value: unknown): value is LocalBucket {
  return isObject(value) && (value.items === undefined || Array.isArray(value.items));
}
