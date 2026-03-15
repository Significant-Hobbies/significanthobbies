"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

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
    id: "work",
    label: "Work / School",
    emoji: "💼",
    min: 0,
    max: 80,
    default: 40,
    color: "#3B82F6",
  },
  {
    id: "commute",
    label: "Commute",
    emoji: "🚗",
    min: 0,
    max: 20,
    default: 5,
    color: "#6366F1",
  },
  {
    id: "sleep",
    label: "Sleep",
    emoji: "😴",
    min: 28,
    max: 70,
    default: 56,
    color: "#8B5CF6",
  },
  {
    id: "eating",
    label: "Cooking & Eating",
    emoji: "🍳",
    min: 0,
    max: 20,
    default: 10,
    color: "#F59E0B",
  },
  {
    id: "chores",
    label: "Chores & Errands",
    emoji: "🧹",
    min: 0,
    max: 20,
    default: 5,
    color: "#78716C",
  },
  {
    id: "family",
    label: "Family & Relationships",
    emoji: "❤️",
    min: 0,
    max: 30,
    default: 10,
    color: "#EC4899",
  },
  {
    id: "exercise",
    label: "Exercise",
    emoji: "🏃",
    min: 0,
    max: 15,
    default: 3,
    color: "#10B981",
  },
  {
    id: "screen",
    label: "Screen Time (social media, TV)",
    emoji: "📱",
    min: 0,
    max: 40,
    default: 15,
    color: "#EF4444",
  },
];

function getHobbyFits(hours: number): string[] {
  if (hours <= 0) return [];
  const hobbies: Array<{ name: string; minHours: number }> = [
    { name: "Daily journaling", minHours: 0.5 },
    { name: "Meditation", minHours: 0.5 },
    { name: "Learning a language (Duolingo)", minHours: 0.5 },
    { name: "Reading", minHours: 1 },
    { name: "Sketching / drawing", minHours: 1 },
    { name: "Cooking new recipes", minHours: 2 },
    { name: "Yoga", minHours: 2 },
    { name: "Photography", minHours: 2 },
    { name: "Painting / watercolors", minHours: 3 },
    { name: "Creative writing", minHours: 3 },
    { name: "Podcast production", minHours: 3 },
    { name: "Learning guitar", minHours: 3 },
    { name: "Gardening", minHours: 3 },
    { name: "Running / training for a race", minHours: 4 },
    { name: "Board game nights", minHours: 4 },
    { name: "Learning to code", minHours: 5 },
    { name: "Side project / coding", minHours: 5 },
    { name: "Woodworking", minHours: 6 },
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

  const used = useMemo(
    () => Object.values(values).reduce((sum, v) => sum + v, 0),
    [values]
  );
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
      id: "free",
      label: "Free time",
      color: "#059669",
      hours: freeTime,
      pct: (freeTime / TOTAL_HOURS) * 100,
    },
  ].filter((s) => s.hours > 0);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:py-24"
        style={{
          background:
            "linear-gradient(160deg, #ECFDF5 0%, #F5F5F4 50%, #ECFDF5 100%)",
        }}
      >
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free Tool
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Hobby Time Calculator
          </h1>
          <p className="mx-auto max-w-xl text-lg text-stone-500">
            Find out how many hours you actually have for hobbies each week —
            and where your time is really going.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Sliders */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-bold text-stone-900">
              Your weekly schedule
            </h2>
            <div className="space-y-6">
              {INPUTS.map((inp) => {
                const val = values[inp.id] ?? inp.default;
                const sleepNote =
                  inp.id === "sleep"
                    ? `(${Math.round((val / 7) * 10) / 10}h/night)`
                    : null;
                return (
                  <div key={inp.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-stone-700">
                        <span className="text-base">{inp.emoji}</span>
                        {inp.label}
                        {sleepNote && (
                          <span className="text-xs font-normal text-stone-400">
                            {sleepNote}
                          </span>
                        )}
                      </label>
                      <span className="shrink-0 min-w-[3.5rem] text-right text-sm font-bold text-stone-900">
                        {val}h/wk
                      </span>
                    </div>
                    <input
                      type="range"
                      min={inp.min}
                      max={inp.max}
                      value={val}
                      onChange={(e) =>
                        handleChange(inp.id, parseInt(e.target.value, 10))
                      }
                      className="w-full cursor-pointer appearance-none rounded-full bg-stone-100 outline-none"
                      style={{
                        height: "6px",
                        accentColor: inp.color,
                      }}
                    />
                    <div className="mt-1 flex justify-between text-xs text-stone-300">
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
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            {overBudget ? (
              <>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-red-500">
                  Over budget
                </p>
                <p className="text-5xl font-black text-red-600 sm:text-6xl">
                  {used - TOTAL_HOURS}h
                </p>
                <p className="mt-2 text-base font-medium text-red-700">
                  over 168 hours — try reducing some categories
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                  Your weekly hobby time
                </p>
                <p className="text-6xl font-black text-emerald-700 sm:text-7xl">
                  {freeTime}
                  <span className="text-3xl font-bold">h</span>
                </p>
                <p className="mt-2 text-base font-medium text-stone-600">
                  per week available for hobbies
                </p>
                {freeTime > 0 && (
                  <p className="mt-1 text-sm text-stone-400">
                    That&apos;s {Math.round((freeTime / 7) * 10) / 10}h per day
                  </p>
                )}
              </>
            )}
          </div>

          {/* Time bar */}
          {!overBudget && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-400">
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
                      minWidth: seg.hours > 0 ? "2px" : "0",
                    }}
                    className="transition-all duration-300"
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {barSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex items-center gap-1.5 text-xs text-stone-600"
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
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h3 className="font-bold text-stone-900">
                      That&apos;s enough time for:
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {hobbyFits.map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-2 text-sm text-stone-600"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {screenTime > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <h3 className="font-bold text-stone-900">
                      Screen time swap
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600">
                    Cut your screen time in half and you&apos;d gain{" "}
                    <span className="font-bold text-amber-700">
                      {screenSaving} more hours
                    </span>{" "}
                    per week — that&apos;s{" "}
                    <span className="font-semibold">
                      {freeTime + screenSaving}h total
                    </span>{" "}
                    for hobbies.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <h3 className="font-bold text-stone-900">
                    The 30-minute rule
                  </h3>
                </div>
                <p className="text-sm text-stone-600">
                  Even 30 minutes a day ={" "}
                  <span className="font-bold text-blue-700">
                    3.5 hours/week
                  </span>{" "}
                  of hobby time. Consistency beats marathon sessions every time.
                </p>
              </div>
            </>
          )}

          {/* CTAs */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
            <p className="mb-4 text-sm font-medium text-stone-600">
              Ready to use your hobby time?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/timeline/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
              >
                Start your hobby journey →
              </Link>
              <Link
                href="/find-your-hobby"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
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
