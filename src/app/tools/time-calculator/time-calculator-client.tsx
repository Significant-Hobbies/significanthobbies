'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const TOTAL_HOURS = 168;

interface SliderInput {
  id: string;
  label: string;
  emoji: string;
  min: number;
  max: number;
  default: number;
  color: string;
}

const INPUTS: SliderInput[] = [
  {
    id: 'work',
    label: 'Work / School',
    emoji: '💼',
    min: 0,
    max: 80,
    default: 40,
    color: '#3B82F6',
  },
  {
    id: 'commute',
    label: 'Commute',
    emoji: '🚗',
    min: 0,
    max: 20,
    default: 5,
    color: '#6366F1',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    min: 28,
    max: 70,
    default: 56,
    color: '#8B5CF6',
  },
  {
    id: 'eating',
    label: 'Cooking & Eating',
    emoji: '🍳',
    min: 0,
    max: 20,
    default: 10,
    color: '#F59E0B',
  },
  {
    id: 'chores',
    label: 'Chores & Errands',
    emoji: '🧹',
    min: 0,
    max: 20,
    default: 5,
    color: '#78716C',
  },
  {
    id: 'family',
    label: 'Family & Relationships',
    emoji: '❤️',
    min: 0,
    max: 30,
    default: 10,
    color: '#EC4899',
  },
  {
    id: 'exercise',
    label: 'Exercise',
    emoji: '🏃',
    min: 0,
    max: 15,
    default: 3,
    color: '#10B981',
  },
  {
    id: 'screen',
    label: 'Screen Time (social media, TV)',
    emoji: '📱',
    min: 0,
    max: 40,
    default: 15,
    color: '#EF4444',
  },
];

function getHobbyFits(hours: number): string[] {
  if (hours <= 0) return [];
  const hobbies: Array<{ name: string; minHours: number }> = [
    { name: 'Daily journaling', minHours: 0.5 },
    { name: 'Meditation', minHours: 0.5 },
    { name: 'Learning a language (Duolingo)', minHours: 0.5 },
    { name: 'Reading', minHours: 1 },
    { name: 'Sketching / drawing', minHours: 1 },
    { name: 'Cooking new recipes', minHours: 2 },
    { name: 'Yoga', minHours: 2 },
    { name: 'Photography', minHours: 2 },
    { name: 'Painting / watercolors', minHours: 3 },
    { name: 'Creative writing', minHours: 3 },
    { name: 'Podcast production', minHours: 3 },
    { name: 'Learning guitar', minHours: 3 },
    { name: 'Gardening', minHours: 3 },
    { name: 'Running / training for a race', minHours: 4 },
    { name: 'Board game nights', minHours: 4 },
    { name: 'Learning to code', minHours: 5 },
    { name: 'Side project / coding', minHours: 5 },
    { name: 'Woodworking', minHours: 6 },
  ];
  return hobbies
    .filter((h) => h.minHours <= hours)
    .slice(-5)
    .map((h) => h.name)
    .reverse();
}

export function TimeCalculatorClient() {
  const defaults = Object.fromEntries(INPUTS.map((i) => [i.id, i.default]));
  const [values, setValues] = useState<Record<string, number>>(defaults);

  const used = useMemo(() => Object.values(values).reduce((sum, v) => sum + v, 0), [values]);
  const freeTime = Math.max(0, TOTAL_HOURS - used);
  const screenTime = values.screen ?? 0;
  const screenSaving = Math.round(screenTime / 2);
  const hobbyFits = useMemo(() => getHobbyFits(freeTime), [freeTime]);
  const overBudget = used > TOTAL_HOURS;

  function handleChange(id: string, val: number) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  const barSegments = [
    ...INPUTS.map((inp) => ({
      id: inp.id,
      label: inp.label,
      color: inp.color,
      hours: values[inp.id] ?? 0,
      pct: Math.min(((values[inp.id] ?? 0) / TOTAL_HOURS) * 100, 100),
    })),
    {
      id: 'free',
      label: 'Free time',
      color: 'oklch(0.72 0.13 150)',
      hours: freeTime,
      pct: (freeTime / TOTAL_HOURS) * 100,
    },
  ].filter((s) => s.hours > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5 text-sm font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            Free Tool
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Hobby Time Calculator
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Find out how many hours you actually have for hobbies each week — and where your time is
            really going.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Sliders */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-bold text-foreground">Your weekly schedule</h2>
            <div className="space-y-6">
              {INPUTS.map((inp) => {
                const val = values[inp.id] ?? inp.default;
                const sleepNote =
                  inp.id === 'sleep' ? `(${Math.round((val / 7) * 10) / 10}h/night)` : null;
                return (
                  <div key={inp.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        <span className="text-base">{inp.emoji}</span>
                        {inp.label}
                        {sleepNote && (
                          <span className="text-xs font-normal text-muted-foreground/60">
                            {sleepNote}
                          </span>
                        )}
                      </label>
                      <span className="shrink-0 min-w-[3.5rem] text-right text-sm font-bold text-foreground">
                        {val}h/wk
                      </span>
                    </div>
                    <input
                      type="range"
                      min={inp.min}
                      max={inp.max}
                      value={val}
                      onChange={(e) => handleChange(inp.id, parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer appearance-none rounded-full bg-foreground/5 outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                      style={{
                        height: '6px',
                        accentColor: inp.color,
                      }}
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground/40">
                      <span>{inp.min}h</span>
                      <span>{inp.max}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Big number result */}
          <div
            className={`rounded-2xl border p-8 text-center shadow-sm ${
              overBudget
                ? 'border-destructive/30 bg-destructive/10'
                : 'border-foreground/20 bg-foreground/10'
            }`}
          >
            {overBudget ? (
              <>
                <p className="mb-1 text-sm font-semibold text-destructive">Over budget</p>
                <p className="text-5xl font-black text-destructive sm:text-6xl">
                  {used - TOTAL_HOURS}h
                </p>
                <p className="mt-2 text-base font-medium text-destructive">
                  over 168 hours — try reducing some categories
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-semibold text-foreground">Your weekly hobby time</p>
                <p className="text-6xl font-black text-foreground sm:text-7xl">
                  {freeTime}
                  <span className="text-3xl font-bold">h</span>
                </p>
                <p className="mt-2 text-base font-medium text-muted-foreground">
                  per week available for hobbies
                </p>
                {freeTime > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground/60">
                    That&apos;s {Math.round((freeTime / 7) * 10) / 10}h per day
                  </p>
                )}
              </>
            )}
          </div>

          {/* Time bar */}
          {!overBudget && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-muted-foreground/60">
                Where your 168 hours go
              </h3>
              <div className="flex h-8 w-full overflow-hidden rounded-full">
                {barSegments.map((seg) => (
                  <div
                    key={seg.id}
                    title={`${seg.label}: ${seg.hours}h`}
                    style={{
                      width: `${seg.pct}%`,
                      backgroundColor: seg.color,
                      minWidth: seg.hours > 0 ? '2px' : '0',
                    }}
                    className="transition-all duration-300"
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {barSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span>{seg.label}</span>
                    <span className="font-semibold">{seg.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight cards */}
          {!overBudget && freeTime > 0 && (
            <>
              {hobbyFits.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h3 className="font-bold text-foreground">That&apos;s enough time for:</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {hobbyFits.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {screenTime > 0 && (
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <h3 className="font-bold text-foreground">Screen time swap</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cut your screen time in half and you&apos;d gain{' '}
                    <span className="font-bold text-foreground">{screenSaving} more hours</span> per
                    week — that&apos;s{' '}
                    <span className="font-semibold">{freeTime + screenSaving}h total</span> for
                    hobbies.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <h3 className="font-bold text-foreground">The 30-minute rule</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Even 30 minutes a day ={' '}
                  <span className="font-bold text-blue-700">3.5 hours/week</span> of hobby time.
                  Consistency beats marathon sessions every time.
                </p>
              </div>
            </>
          )}

          {/* CTAs */}
          <div className="rounded-2xl border border-border bg-card/40 p-6 text-center">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Ready to use your hobby time?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/timeline/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                Start your hobby journey →
              </Link>
              <Link
                href="/find-your-hobby"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground"
              >
                Find your perfect hobby →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
