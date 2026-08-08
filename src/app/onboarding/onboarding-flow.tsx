'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Footprints,
  History,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { AmbientMusic } from '~/components/ambient-music';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { completeOnboarding } from '~/lib/actions/onboarding';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';
import { createLocalTrajectory } from '~/lib/local-trajectory';
import { syncLocalWorkspaceCookie } from '~/lib/local-workspace-cookie';
import type { StorageMode } from '~/lib/storage-mode';

type Possibility = {
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
};

type Draft = {
  version: 2;
  step: number;
  name: string;
  birthDate: string;
  pastHobbies: string[];
  pastInput: string;
  desiredExperiences: Possibility[];
  desireInput: string;
  annualFocus: string;
  annualGoals: string[];
  goalInput: string;
  habit: string;
  trajectoryIntent: string;
  trajectoryConstraint: string;
};

const pastExamples = ['Drawing', 'Football', 'Gaming', 'Piano', 'Reading', 'Cycling', 'Cooking'];
const profiles = [
  { name: 'Steve Jobs', path: 'Calligraphy → electronics → walking' },
  { name: 'Albert Einstein', path: 'Violin → sailing → puzzles' },
  { name: 'Richard Feynman', path: 'Bongos → drawing → safecracking' },
];

function emptyDraft(name: string): Draft {
  return {
    version: 2,
    step: 0,
    name,
    birthDate: '',
    pastHobbies: [],
    pastInput: '',
    desiredExperiences: [],
    desireInput: '',
    annualFocus: '',
    annualGoals: [],
    goalInput: '',
    habit: '',
    trajectoryIntent: '',
    trajectoryConstraint: '',
  };
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<Draft>;
  return draft.version === 2 && typeof draft.step === 'number' && Array.isArray(draft.pastHobbies);
}

function goalsFromDraft(draft: Draft): string[] {
  return Array.isArray(draft.annualGoals) && draft.annualGoals.length > 0
    ? draft.annualGoals
    : draft.annualFocus
      ? [draft.annualFocus]
      : [];
}

export function OnboardingFlow({
  user,
  storageMode,
  possibilities,
}: {
  user: { name?: string | null; image?: string | null };
  storageMode: StorageMode;
  possibilities: Possibility[];
}) {
  const router = useRouter();
  const initialName = user.name?.trim() ?? '';
  const [draft, setDraft] = useState(() => emptyDraft(initialName));
  const [loaded, setLoaded] = useState(storageMode === 'account');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [possibilityQuery, setPossibilityQuery] = useState('');

  useEffect(() => {
    if (storageMode !== 'local') return;
    readLocalRecord(browserRecordAdapter(), 'onboarding:draft', 'onboarding', isDraft).then(
      (saved) => {
        setDraft(
          saved
            ? {
                ...saved,
                annualGoals: Array.isArray(saved.annualGoals)
                  ? saved.annualGoals
                  : saved.annualFocus
                    ? [saved.annualFocus]
                    : [],
                goalInput: typeof saved.goalInput === 'string' ? saved.goalInput : '',
              }
            : emptyDraft(initialName)
        );
        setLoaded(true);
      }
    );
  }, [initialName, storageMode]);

  useEffect(() => {
    if (loaded)
      void writeLocalRecord(browserRecordAdapter(), 'onboarding:draft', 'onboarding', draft);
  }, [draft, loaded]);

  const setStep = (step: number) => setDraft((current) => ({ ...current, step }));
  const togglePast = (hobby: string) =>
    setDraft((current) => ({
      ...current,
      pastHobbies: current.pastHobbies.includes(hobby)
        ? current.pastHobbies.filter((item) => item !== hobby)
        : [...current.pastHobbies, hobby],
    }));
  const togglePossibility = (possibility: Possibility) =>
    setDraft((current) => {
      const selected = current.desiredExperiences.some((item) => item.title === possibility.title);
      return {
        ...current,
        desiredExperiences: selected
          ? current.desiredExperiences.filter((item) => item.title !== possibility.title)
          : current.desiredExperiences.length < 50
            ? [...current.desiredExperiences, possibility]
            : current.desiredExperiences,
      };
    });

  function addPastInput() {
    const values = draft.pastInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (!values.length) return;
    setDraft((current) => ({
      ...current,
      pastHobbies: [...new Set([...current.pastHobbies, ...values])].slice(0, 12),
      pastInput: '',
    }));
  }

  function addDesireInput() {
    const titles = draft.desireInput
      .split(/\r?\n/)
      .map((title) => title.replace(/^\s*\d+[.)]\s*/, '').trim())
      .filter(Boolean);
    if (!titles.length) return;
    setDraft((current) => ({
      ...current,
      desiredExperiences: [
        ...current.desiredExperiences,
        ...titles.map((title) => ({
          title,
          category: 'achievement' as const,
          emoji: '✨',
        })),
      ]
        .filter(
          (item, index, items) =>
            items.findIndex(
              (candidate) => candidate.title.toLowerCase() === item.title.toLowerCase()
            ) === index
        )
        .slice(0, 50),
      desireInput: '',
    }));
  }

  function addAnnualGoal() {
    const goal = draft.goalInput.trim();
    if (!goal) return;
    setDraft((current) => {
      const currentGoals = goalsFromDraft(current);
      return {
        ...current,
        annualFocus: currentGoals[0] ?? goal,
        annualGoals:
          currentGoals.length >= 8 ||
          currentGoals.some((item) => item.toLowerCase() === goal.toLowerCase())
            ? currentGoals
            : [...currentGoals, goal],
        goalInput: '',
      };
    });
  }

  async function complete() {
    setError(null);
    const annualGoals = goalsFromDraft(draft);
    const trajectoryIntent = annualGoals.join('; ');
    const trajectory = {
      constraintsText: draft.trajectoryConstraint,
      intentText: trajectoryIntent,
      decisionPolicyText:
        'When time, energy, or money opens up, choose the next feasible step toward any current goal.',
      feedbackLoopText: 'Once a month, notice what created energy and adjust the next choice.',
      cadence: 'monthly' as const,
    };
    if (storageMode === 'account') {
      const result = await completeOnboarding({
        name: draft.name,
        birthDate: draft.birthDate,
        pastHobbies: draft.pastHobbies,
        desiredExperiences: draft.desiredExperiences.map(({ title, category }) => ({
          title,
          category,
        })),
        annualGoals,
        habit: draft.habit,
        trajectoryIntent,
        trajectoryConstraint: draft.trajectoryConstraint,
      });
      if (!result.success) {
        setError(result.error ?? 'Your starting point could not be saved.');
        return;
      }
    } else {
      const adapter = browserRecordAdapter();
      await Promise.all([
        writeLocalRecord(adapter, 'profile:draft', 'profile', { name: draft.name }),
        writeLocalRecord(adapter, 'profile:birth-date', 'profile', { birthDate: draft.birthDate }),
        writeLocalRecord(adapter, 'onboarding:profile', 'onboarding', {
          name: draft.name,
          birthDate: draft.birthDate,
          pastHobbies: draft.pastHobbies,
          desiredExperiences: draft.desiredExperiences,
          annualFocus: annualGoals[0] ?? '',
          annualGoals,
        }),
        writeLocalRecord(adapter, 'timeline-draft-new', 'timelines', {
          title: 'My life so far',
          phases: [
            {
              id: `local-earlier-${crypto.randomUUID()}`,
              label: 'Earlier chapters',
              hobbies: draft.pastHobbies.map((name) => ({ name })),
              order: 0,
            },
          ],
        }),
        writeLocalRecord(adapter, 'onboarding:bucket-items', 'bucket-list', {
          items: draft.desiredExperiences,
          annualFocus: annualGoals[0] ?? '',
          annualGoals,
        }),
      ]);
      const daily = (await readLocalRecord(adapter, 'daily:state', 'daily', isDailyState)) ?? {
        habits: [],
        logs: [],
        journals: [],
      };
      if (
        draft.habit.trim() &&
        !daily.habits.some(
          (habit) => String(habit.name).toLowerCase() === draft.habit.toLowerCase()
        )
      ) {
        daily.habits.push({
          id: `local-habit-${crypto.randomUUID()}`,
          name: draft.habit,
          status: 'active',
          targetFrequency: 'daily',
          icon: null,
          sourceQuestId: null,
          commitmentId: null,
        });
      }
      await writeLocalRecord(adapter, 'daily:state', 'daily', daily);
      await createLocalTrajectory(trajectory, adapter).catch(() => undefined);
      syncLocalWorkspaceCookie(true);
    }
    router.push('/');
    router.refresh();
  }

  const firstName = draft.name.trim().split(' ')[0] || 'there';
  const validBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate);
  const annualGoals = goalsFromDraft(draft);
  const normalizedPossibilityQuery = possibilityQuery.trim().toLowerCase();
  const matchingPossibilities = normalizedPossibilityQuery
    ? possibilities.filter(
        (possibility) =>
          possibility.title.toLowerCase().includes(normalizedPossibilityQuery) ||
          possibility.category.toLowerCase().includes(normalizedPossibilityQuery)
      )
    : possibilities.slice(0, 18);
  const visiblePossibilities = matchingPossibilities.slice(0, 60);
  const stepBackgrounds = [
    'bg-[#fff8d6]',
    'bg-[#211e18]',
    'bg-[#b9dcf5]',
    'bg-[#ffd0bd]',
    'bg-[#c5abfa]',
    'bg-[#dceabf]',
    'bg-[#f7e957]',
  ];

  const steps = [
    <Step
      key="identity"
      icon={<UserRound />}
      eyebrow="You, not a user profile"
      title="Let’s make time personal."
      copy="Google gives us a starting name when available. You stay in control of both details."
      action="Begin my story"
      onNext={() => setStep(1)}
      disabled={!draft.name.trim() || !validBirthDate}
    >
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="What should we call you?">
          <input
            autoFocus
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            className="field-input"
          />
        </Field>
        <Field label="When were you born?">
          <input
            type="date"
            value={draft.birthDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) =>
              setDraft((current) => ({ ...current, birthDate: event.target.value }))
            }
            className="field-input"
          />
        </Field>
      </div>
      <p className="mt-3 text-sm text-[#625b50]">Your birth date stays private.</p>
    </Step>,
    <Step
      key="frame"
      dark
      icon={<Clock3 />}
      eyebrow="Before the planning"
      title="The rest is still unwritten."
      copy="You do not need to optimize your life. You only need to notice that it is happening."
      action="I’m ready"
      onNext={() => setStep(2)}
      secondaryAction="Skip this moment"
      onSecondary={() => setStep(2)}
    >
      <div className="relative mt-7 min-h-64 overflow-hidden rounded-2xl">
        <Image
          src="/images/live-more/lake-jump-v1.webp"
          alt="Friends jumping into a lake together"
          fill
          className="object-cover"
          sizes="(min-width: 640px) 640px, 100vw"
        />
        <div className="absolute inset-0 bg-[#111827]/55" />
        <blockquote className="absolute inset-x-0 bottom-0 p-6 font-serif text-2xl leading-snug text-white sm:text-3xl">
          “Today is the first day of the rest of your life.”
        </blockquote>
      </div>
    </Step>,
    <Step
      key="past"
      icon={<History />}
      eyebrow="Your past"
      title="What used to make you lose track of time?"
      copy="These are not résumé entries. They are the raw material of your private life timeline."
      action="Build this chapter"
      onNext={() => setStep(3)}
      disabled={!draft.pastHobbies.length}
    >
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {profiles.map((profile) => (
          <div key={profile.name} className="rounded-xl bg-[#eef6fb] p-3">
            <p className="text-sm font-bold">{profile.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#4d6070]">{profile.path}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {pastExamples.map((hobby) => (
          <ChoiceChip
            key={hobby}
            selected={draft.pastHobbies.includes(hobby)}
            onClick={() => togglePast(hobby)}
          >
            {hobby}
          </ChoiceChip>
        ))}
      </div>
      <InlineAdd
        value={draft.pastInput}
        onChange={(value) => setDraft((current) => ({ ...current, pastInput: value }))}
        onAdd={addPastInput}
        placeholder="Add your own, separated by commas"
      />
      <SelectionList values={draft.pastHobbies} />
    </Step>,
    <Step
      key="future"
      icon={<Compass />}
      eyebrow="Your future"
      title="What would make you glad you said yes?"
      copy="Start with a few sparks, search thousands of paths, or paste the personal list you already carry. Strange and specific is welcome."
      action="Keep these possibilities"
      onNext={() => setStep(4)}
      disabled={!draft.desiredExperiences.length}
    >
      {draft.desiredExperiences.length ? (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Your chosen possibilities">
          {draft.desiredExperiences.map((possibility) => (
            <button
              key={possibility.title}
              type="button"
              onClick={() => togglePossibility(possibility)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7e957] px-4 text-left text-sm font-bold text-[#211e18] focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={`Remove ${possibility.title}`}
            >
              <span aria-hidden="true">{possibility.emoji}</span>
              <span>{possibility.title}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}
      <label className="relative mt-5 block">
        <span className="sr-only">Search possibilities</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#625b50]"
        />
        <input
          type="search"
          value={possibilityQuery}
          onChange={(event) => setPossibilityQuery(event.target.value)}
          placeholder="Search travel, creative projects, adventures…"
          className="field-input pl-12"
        />
      </label>
      <div className="mt-3 grid max-h-[25rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {visiblePossibilities.map((possibility) => {
          const selected = draft.desiredExperiences.some(
            (item) => item.title === possibility.title
          );
          return (
            <button
              key={possibility.title}
              type="button"
              data-possibility-option
              data-possibility-category={possibility.category}
              aria-pressed={selected}
              onClick={() => togglePossibility(possibility)}
              className={`flex min-h-20 items-center gap-3 rounded-xl border-2 p-3 text-left ${selected ? 'border-[#211e18] bg-[#f7e957]' : 'border-[#dfd5c4] bg-white'}`}
            >
              <span className="text-2xl">{possibility.emoji}</span>
              <span className="flex-1 text-sm font-bold leading-snug">{possibility.title}</span>
              {selected ? <Check className="size-4" /> : null}
            </button>
          );
        })}
        {!normalizedPossibilityQuery ? (
          <div className="rounded-xl bg-[#dceabf] px-4 py-5 text-center sm:col-span-2">
            <p className="font-serif text-lg font-medium">This is only the beginning.</p>
            <p className="mt-1 text-sm leading-relaxed text-[#405032]">
              Search 5,000+ paths—or add something only you could imagine. The possibilities are
              nearly endless.
            </p>
          </div>
        ) : null}
        {!visiblePossibilities.length ? (
          <div className="rounded-xl bg-[#fff8d6] p-5 sm:col-span-2">
            <p className="font-serif text-xl">Nothing in the atlas matches that yet.</p>
            <p className="mt-1 text-sm text-[#625b50]">Add your own possibility below.</p>
          </div>
        ) : null}
      </div>
      {matchingPossibilities.length > visiblePossibilities.length ? (
        <p className="mt-3 text-sm text-[#625b50]">
          Showing the first {visiblePossibilities.length}. Add another word to narrow the search.
        </p>
      ) : null}
      <div className="mt-5 rounded-2xl bg-[#fff8d6] p-4">
        <label className="block text-sm font-bold" htmlFor="onboarding-bucket-list-input">
          Add your own possibilities
        </label>
        <p className="mt-1 text-sm text-[#625b50]">
          Add one idea, or paste a numbered list. Each line becomes its own item.
        </p>
        <textarea
          id="onboarding-bucket-list-input"
          value={draft.desireInput}
          onChange={(event) =>
            setDraft((current) => ({ ...current, desireInput: event.target.value }))
          }
          placeholder={'1. Start my band\n2. Fly a plane\n3. Write a song'}
          className="field-input mt-3 min-h-28 resize-y py-3"
          disabled={draft.desiredExperiences.length >= 50}
        />
        <button
          type="button"
          onClick={addDesireInput}
          disabled={draft.desiredExperiences.length >= 50 || !draft.desireInput.trim()}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#211e18] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" /> Add to my bucket list
        </button>
      </div>
      {draft.desiredExperiences.length >= 50 ? (
        <p className="mt-2 text-sm text-[#625b50]">
          Fifty is enough for onboarding. You can keep growing the list inside Live More.
        </p>
      ) : null}
    </Step>,
    <Step
      key="year"
      icon={<Target />}
      eyebrow={`Goals for ${new Date().getFullYear()}`}
      title="What matters this year?"
      copy="These do not have to come from your bucket list. Name one or several nearer-term goals in your own words."
      action="Keep these goals"
      onNext={() => setStep(5)}
      disabled={!annualGoals.length}
    >
      {annualGoals.length ? (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Goals for this year">
          {annualGoals.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() =>
                setDraft((current) => {
                  const nextGoals = goalsFromDraft(current).filter((item) => item !== goal);
                  return {
                    ...current,
                    annualFocus: nextGoals[0] ?? '',
                    annualGoals: nextGoals,
                  };
                })
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7e957] px-4 text-sm font-bold"
              aria-label={`Remove goal ${goal}`}
            >
              {goal} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}
      <InlineAdd
        value={draft.goalInput}
        onChange={(value) => setDraft((current) => ({ ...current, goalInput: value }))}
        onAdd={addAnnualGoal}
        placeholder="A goal for this year"
        label="Add a goal for this year"
        buttonLabel="Add yearly goal"
        disabled={annualGoals.length >= 8}
      />
      <p className="mt-7 text-sm font-bold text-[#625b50]">
        Or borrow something from your bucket list
      </p>
      <div className="mt-3 grid gap-2">
        {draft.desiredExperiences.map((item) => (
          <button
            key={item.title}
            type="button"
            data-focus-option
            aria-pressed={annualGoals.includes(item.title)}
            disabled={!annualGoals.includes(item.title) && annualGoals.length >= 8}
            onClick={() =>
              setDraft((current) => {
                const currentGoals = goalsFromDraft(current);
                const nextGoals = currentGoals.includes(item.title)
                  ? currentGoals.filter((goal) => goal !== item.title)
                  : [...currentGoals, item.title];
                return {
                  ...current,
                  annualFocus: nextGoals[0] ?? '',
                  annualGoals: nextGoals,
                };
              })
            }
            className={`flex min-h-14 items-center justify-between rounded-xl border-2 px-4 text-left font-serif text-lg disabled:cursor-not-allowed disabled:opacity-40 ${annualGoals.includes(item.title) ? 'border-[#211e18] bg-[#f7e957]' : 'border-[#d6c9e8] bg-white/70'}`}
          >
            <span>
              {item.emoji} {item.title}
            </span>
            {annualGoals.includes(item.title) ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
    </Step>,
    <Step
      key="habit"
      icon={<NotebookPen />}
      eyebrow="Only if it helps"
      title="Would a daily practice support any of these goals?"
      copy="Some goals benefit from a small daily practice; others happen occasionally. Leave this blank when one would be artificial."
      action={draft.habit.trim() ? 'Keep this practice' : 'Continue without a daily practice'}
      onNext={() => setStep(6)}
    >
      <Field label="Optional daily practice">
        <input
          autoFocus
          value={draft.habit}
          onChange={(event) => setDraft((current) => ({ ...current, habit: event.target.value }))}
          placeholder={
            annualGoals[0]
              ? `A small practice that supports “${annualGoals[0]}”`
              : 'Read five pages'
          }
          className="field-input mt-6"
        />
      </Field>
    </Step>,
    <Step
      key="trajectory"
      icon={<Footprints />}
      eyebrow="Your trajectory"
      title={`What could shape the path, ${firstName}?`}
      copy="Your goals for this year are the direction. Add what is true about life right now, and we will turn both into a flexible decision policy and feedback loop."
      action={pending ? 'Building your life atlas…' : 'Enter my life'}
      onNext={() => startTransition(complete)}
      disabled={pending || !draft.trajectoryConstraint.trim()}
    >
      <div className="mt-7 grid gap-4">
        <div className="rounded-2xl bg-[#c5abfa] p-4">
          <p className="text-sm font-bold">Direction · goals for {new Date().getFullYear()}</p>
          <ul className="mt-3 space-y-1 font-serif text-xl leading-snug">
            {annualGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
        <Field label="What is true about my life right now">
          <textarea
            value={draft.trajectoryConstraint}
            onChange={(event) =>
              setDraft((current) => ({ ...current, trajectoryConstraint: event.target.value }))
            }
            placeholder="My weekdays are busy, but I can protect one evening and part of Sunday."
            className="field-input min-h-24 resize-none py-3"
          />
        </Field>
        <div className="rounded-2xl bg-[#dceabf] p-4 text-sm leading-relaxed">
          <p>
            <strong>Decision policy:</strong> when time, energy, or money opens up, choose the next
            feasible step toward any current goal.
          </p>
          <p className="mt-2">
            <strong>Feedback loop:</strong> once a month, notice what created energy and adjust.
          </p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </Step>,
  ];

  if (!loaded) return <p className="p-10 text-center">Reading your saved starting point…</p>;

  return (
    <StorageModeProvider mode={storageMode}>
      <div
        className={`relative min-h-screen overflow-hidden px-4 py-5 text-[#211e18] transition-colors duration-500 sm:py-8 ${stepBackgrounds[draft.step] ?? 'bg-[#fbf8ef]'}`}
      >
        <div
          aria-hidden="true"
          className="absolute -left-28 top-24 size-72 rounded-full bg-white/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 size-96 rounded-full bg-[#f7e957]/30 blur-3xl"
        />
        <header
          className={`relative mx-auto flex max-w-6xl items-center justify-between ${draft.step === 1 ? 'text-white' : ''}`}
        >
          <span className="font-serif text-lg font-bold sm:text-xl">Significant Hobbies</span>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <StorageModeStatus />
            </div>
            <AmbientMusic autoPlay={draft.step === 1} />
          </div>
        </header>
        <main className="relative mx-auto mt-5 max-w-6xl sm:mt-7">
          <div
            className={`mb-4 flex items-center justify-between ${draft.step === 1 ? 'text-white' : ''}`}
          >
            <button
              type="button"
              onClick={() => setStep(Math.max(0, draft.step - 1))}
              disabled={draft.step === 0}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold disabled:invisible"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <span className="text-sm font-bold">
              {draft.step + 1} of {steps.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/45">
            <div
              className="h-full rounded-full bg-[#176b4a] transition-all"
              style={{ width: `${((draft.step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="grid items-stretch gap-5 lg:grid-cols-[1.18fr_0.82fr]">
            {steps[draft.step]}
            <JourneyCanvas draft={draft} />
          </div>
        </main>
      </div>
    </StorageModeProvider>
  );
}

function JourneyCanvas({ draft }: { draft: Draft }) {
  const annualGoals = goalsFromDraft(draft);
  const chapters = [
    {
      label: 'PAST',
      title: draft.pastHobbies.join(', ') || 'Remember what shaped you',
      color: 'bg-[#b9dcf5]',
    },
    {
      label: 'FUTURE',
      title:
        draft.desiredExperiences.map((possibility) => possibility.title).join(' · ') ||
        'Choose what still calls you',
      color: 'bg-[#ff9d7d]',
    },
    {
      label: 'TODAY',
      title: draft.habit || 'No regular practice needed',
      color: 'bg-[#c5abfa]',
    },
    {
      label: 'DIRECTION',
      title: annualGoals.join(' · ') || 'Notice where the path is going',
      color: 'bg-[#dceabf]',
    },
  ];
  return (
    <aside className="relative mt-5 hidden min-h-[38rem] overflow-hidden rounded-[2rem] bg-[#211e18] p-7 text-white shadow-[0_24px_70px_rgba(46,38,27,0.18)] lg:flex lg:flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Your life atlas
        </p>
        <span className="font-serif text-3xl text-[#f7e957]">0{draft.step + 1}</span>
      </div>
      <div className="my-auto space-y-3">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.label}
            className={`rounded-2xl p-5 text-[#211e18] ${chapter.color} ${index <= Math.max(0, draft.step - 2) ? 'ring-2 ring-white/35' : ''}`}
          >
            <p className="text-[0.68rem] font-bold tracking-[0.18em]">{chapter.label}</p>
            <p className="mt-2 line-clamp-4 font-serif text-xl leading-tight">{chapter.title}</p>
          </div>
        ))}
      </div>
      <p className="max-w-sm font-serif text-xl leading-snug text-white/80">
        A life worth remembering is built in both directions—from what shaped you and toward what
        still calls.
      </p>
    </aside>
  );
}

function Step({
  icon,
  eyebrow,
  title,
  copy,
  action,
  onNext,
  secondaryAction,
  onSecondary,
  disabled,
  dark,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  copy: string;
  action: string;
  onNext: () => void;
  secondaryAction?: string;
  onSecondary?: () => void;
  disabled?: boolean;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`mt-5 rounded-[2rem] border p-6 shadow-[0_22px_65px_rgba(72,58,38,0.09)] sm:p-10 ${dark ? 'border-white/15 bg-[#15140f] text-white' : 'border-[#d9cfbd] bg-[#fffdf8]'}`}
    >
      <div
        className={`flex size-12 items-center justify-center rounded-full ${dark ? 'bg-[#f7e957] text-[#211e18]' : 'bg-[#f7e957]'}`}
      >
        {icon}
      </div>
      <p
        className={`mt-7 text-sm font-bold uppercase tracking-[0.18em] ${dark ? 'text-[#a8dc91]' : 'text-[#176b4a]'}`}
      >
        {eyebrow}
      </p>
      <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
        {title}
      </h1>
      <p
        className={`mt-4 max-w-xl text-base leading-relaxed ${dark ? 'text-white/68' : 'text-[#625b50]'}`}
      >
        {copy}
      </p>
      {children}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold disabled:opacity-40 sm:w-auto ${dark ? 'bg-[#f7e957] text-[#211e18]' : 'bg-[#211e18] text-white'}`}
      >
        {action} <ArrowRight className="size-4" />
      </button>
      {secondaryAction && onSecondary ? (
        <button
          type="button"
          onClick={onSecondary}
          className={`mt-3 flex min-h-11 w-full items-center justify-center text-sm font-bold underline underline-offset-4 sm:w-auto ${dark ? 'text-white/70' : 'text-[#625b50]'}`}
        >
          {secondaryAction}
        </button>
      ) : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold ${selected ? 'border-[#211e18] bg-[#f7e957]' : 'border-[#d9cfbd] bg-white'}`}
    >
      {selected ? <Check className="size-3.5" /> : null}
      {children}
    </button>
  );
}

function InlineAdd({
  value,
  onChange,
  onAdd,
  placeholder,
  label,
  buttonLabel = 'Add',
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  label?: string;
  buttonLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
        className="field-input min-w-0 flex-1"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#211e18] text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={buttonLabel}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function SelectionList({ values }: { values: string[] }) {
  if (!values.length) return null;
  return (
    <p className="mt-4 text-sm text-[#625b50]">
      Your chapters begin with: <strong>{values.join(' · ')}</strong>
    </p>
  );
}

function isDailyState(
  value: unknown
): value is { habits: Array<Record<string, unknown>>; logs: unknown[]; journals: unknown[] } {
  if (!value || typeof value !== 'object') return false;
  const state = value as { habits?: unknown; logs?: unknown; journals?: unknown };
  return Array.isArray(state.habits) && Array.isArray(state.logs) && Array.isArray(state.journals);
}
