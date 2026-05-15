"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sh-cost-calculator-v1";

interface LineItem {
  id: string;
  label: string;
  amount: number;
  cadence: "once" | "monthly" | "yearly";
}

const SEED_ITEMS: LineItem[] = [
  { id: "1", label: "Starter kit", amount: 200, cadence: "once" },
  { id: "2", label: "Lessons / classes", amount: 80, cadence: "monthly" },
  { id: "3", label: "Consumables / supplies", amount: 25, cadence: "monthly" },
  { id: "4", label: "Annual subscription / membership", amount: 120, cadence: "yearly" },
];

const PRESETS: Record<string, LineItem[]> = {
  Photography: [
    { id: "p1", label: "Camera body", amount: 900, cadence: "once" },
    { id: "p2", label: "Lens", amount: 400, cadence: "once" },
    { id: "p3", label: "Editing software (yearly)", amount: 120, cadence: "yearly" },
    { id: "p4", label: "Prints / paper", amount: 15, cadence: "monthly" },
  ],
  "Rock climbing": [
    { id: "rc1", label: "Shoes + harness", amount: 220, cadence: "once" },
    { id: "rc2", label: "Gym membership", amount: 85, cadence: "monthly" },
    { id: "rc3", label: "Outdoor trip / gear", amount: 200, cadence: "yearly" },
  ],
  Painting: [
    { id: "pt1", label: "Paint + brushes starter kit", amount: 120, cadence: "once" },
    { id: "pt2", label: "Canvases / surfaces", amount: 20, cadence: "monthly" },
    { id: "pt3", label: "Class / workshop", amount: 200, cadence: "yearly" },
  ],
  "Home cooking": [
    { id: "hc1", label: "Cookware upgrade", amount: 300, cadence: "once" },
    { id: "hc2", label: "Specialty ingredients", amount: 40, cadence: "monthly" },
    { id: "hc3", label: "Cookbook / class", amount: 60, cadence: "yearly" },
  ],
};

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function annualize(items: LineItem[]): {
  oneTime: number;
  annual: number;
  monthly: number;
  yearOne: number;
} {
  let oneTime = 0;
  let annual = 0;
  for (const it of items) {
    const amt = Number.isFinite(it.amount) ? it.amount : 0;
    if (it.cadence === "once") oneTime += amt;
    else if (it.cadence === "monthly") annual += amt * 12;
    else if (it.cadence === "yearly") annual += amt;
  }
  return {
    oneTime,
    annual,
    monthly: annual / 12,
    yearOne: oneTime + annual,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CostCalculatorClient() {
  const [items, setItems] = useState<LineItem[]>(SEED_ITEMS);
  const [hobbyName, setHobbyName] = useState("My hobby");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(parsed.items)) setItems(parsed.items);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof parsed.hobbyName === "string") setHobbyName(parsed.hobbyName);
    } catch {
      /* ignore corrupt state */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, hobbyName }));
  }, [items, hobbyName]);

  const totals = useMemo(() => annualize(items), [items]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: uid(), label: "New line item", amount: 0, cadence: "monthly" },
    ]);
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function loadPreset(name: string) {
    setHobbyName(name);
    setItems(
      PRESETS[name].map((it) => ({ ...it, id: uid() })),
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        Free tool
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        Hobby cost calculator
      </h1>
      <p className="mt-2 text-stone-500">
        Add every cost in one place — equipment, lessons, subscriptions, supplies — and
        see the honest year-one and steady-state numbers before you commit.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-stone-500">Try a preset:</span>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => loadPreset(name)}
            className="rounded-full border border-stone-200 bg-white px-3 py-1 font-medium text-stone-700 hover:border-emerald-300 hover:bg-emerald-50"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
          Hobby
        </label>
        <input
          value={hobbyName}
          onChange={(e) => setHobbyName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base focus:border-emerald-400 focus:outline-none"
          placeholder="e.g. Watercolor painting"
        />

        <div className="mt-6 space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-12 gap-2 rounded-lg border border-stone-200 bg-stone-50/40 p-3"
            >
              <input
                value={it.label}
                onChange={(e) => updateItem(it.id, { label: e.target.value })}
                className="col-span-12 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-sm sm:col-span-5"
                placeholder="What is it?"
              />
              <input
                type="number"
                inputMode="decimal"
                value={Number.isFinite(it.amount) ? it.amount : 0}
                onChange={(e) =>
                  updateItem(it.id, { amount: Number(e.target.value) || 0 })
                }
                className="col-span-6 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-sm sm:col-span-3"
                min={0}
                step={5}
              />
              <select
                value={it.cadence}
                onChange={(e) =>
                  updateItem(it.id, { cadence: e.target.value as LineItem["cadence"] })
                }
                className="col-span-4 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-sm sm:col-span-3"
              >
                <option value="once">one-time</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="col-span-2 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                aria-label="Remove line item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          + Add line item
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="One-time" value={fmt(totals.oneTime)} hint="up-front gear" />
        <Stat label="Recurring / year" value={fmt(totals.annual)} hint="lessons + subscriptions" />
        <Stat label="≈ Per month" value={fmt(totals.monthly)} hint="steady state" />
        <Stat label="Year one" value={fmt(totals.yearOne)} hint="real number" emphasize />
      </div>

      <p className="mt-4 text-xs text-stone-500">
        Numbers stay in your browser — nothing is uploaded.{" "}
        <button
          type="button"
          onClick={() => {
            setItems(SEED_ITEMS);
            setHobbyName("My hobby");
          }}
          className="underline hover:text-stone-700"
        >
          Reset
        </button>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  emphasize = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        emphasize
          ? "border-emerald-300 bg-emerald-50"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          emphasize ? "text-emerald-700" : "text-stone-900"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-stone-500">{hint}</div>
      )}
    </div>
  );
}
