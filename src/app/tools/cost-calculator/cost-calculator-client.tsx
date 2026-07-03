'use client';

import { useEffect, useMemo, useState } from 'react';

import { BorderBeam, FadeIn, NumberTicker, SpotlightCard } from '~/components/aceternity';

const STORAGE_KEY = 'sh-cost-calculator-v1';

interface LineItem {
  id: string;
  label: string;
  amount: number;
  cadence: 'once' | 'monthly' | 'yearly';
}

const SEED_ITEMS: LineItem[] = [
  { id: '1', label: 'Starter kit', amount: 200, cadence: 'once' },
  { id: '2', label: 'Lessons / classes', amount: 80, cadence: 'monthly' },
  { id: '3', label: 'Consumables / supplies', amount: 25, cadence: 'monthly' },
  { id: '4', label: 'Annual subscription / membership', amount: 120, cadence: 'yearly' },
];

const PRESETS: Record<string, LineItem[]> = {
  Photography: [
    { id: 'p1', label: 'Camera body', amount: 900, cadence: 'once' },
    { id: 'p2', label: 'Lens', amount: 400, cadence: 'once' },
    { id: 'p3', label: 'Editing software (yearly)', amount: 120, cadence: 'yearly' },
    { id: 'p4', label: 'Prints / paper', amount: 15, cadence: 'monthly' },
  ],
  'Rock climbing': [
    { id: 'rc1', label: 'Shoes + harness', amount: 220, cadence: 'once' },
    { id: 'rc2', label: 'Gym membership', amount: 85, cadence: 'monthly' },
    { id: 'rc3', label: 'Outdoor trip / gear', amount: 200, cadence: 'yearly' },
  ],
  Painting: [
    { id: 'pt1', label: 'Paint + brushes starter kit', amount: 120, cadence: 'once' },
    { id: 'pt2', label: 'Canvases / surfaces', amount: 20, cadence: 'monthly' },
    { id: 'pt3', label: 'Class / workshop', amount: 200, cadence: 'yearly' },
  ],
  'Home cooking': [
    { id: 'hc1', label: 'Cookware upgrade', amount: 300, cadence: 'once' },
    { id: 'hc2', label: 'Specialty ingredients', amount: 40, cadence: 'monthly' },
    { id: 'hc3', label: 'Cookbook / class', amount: 60, cadence: 'yearly' },
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
    if (it.cadence === 'once') oneTime += amt;
    else if (it.cadence === 'monthly') annual += amt * 12;
    else if (it.cadence === 'yearly') annual += amt;
  }
  return {
    oneTime,
    annual,
    monthly: annual / 12,
    yearOne: oneTime + annual,
  };
}

export default function CostCalculatorClient() {
  const [items, setItems] = useState<LineItem[]>(SEED_ITEMS);
  const [hobbyName, setHobbyName] = useState('My hobby');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(parsed.items)) setItems(parsed.items);

      if (typeof parsed.hobbyName === 'string') setHobbyName(parsed.hobbyName);
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
      { id: uid(), label: 'New line item', amount: 0, cadence: 'monthly' },
    ]);
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function loadPreset(name: string) {
    setHobbyName(name);
    setItems(PRESETS[name].map((it) => ({ ...it, id: uid() })));
  }

  return (
    <FadeIn className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/10 px-3 py-1 text-[11px] font-semibold text-foreground">
        Free tool
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Hobby cost calculator
      </h1>
      <p className="mt-2 text-muted-foreground">
        Add every cost in one place — equipment, lessons, subscriptions, supplies — and see the
        honest year-one and steady-state numbers before you commit.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Try a preset:</span>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => loadPreset(name)}
            className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground hover:border-foreground/30 hover:bg-foreground/10"
          >
            {name}
          </button>
        ))}
      </div>

      <SpotlightCard className="mt-6 rounded-2xl shadow-soft" innerClassName="p-5">
        <label className="block text-sm font-semibold text-muted-foreground">Hobby</label>
        <input
          value={hobbyName}
          onChange={(e) => setHobbyName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-base focus:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          placeholder="e.g. Watercolor painting"
        />

        <div className="mt-6 space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-12 gap-2 rounded-lg border border-border bg-card/40/40 p-3"
            >
              <input
                value={it.label}
                onChange={(e) => updateItem(it.id, { label: e.target.value })}
                className="col-span-12 rounded-md border border-border bg-card px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none sm:col-span-5"
                placeholder="What is it?"
              />
              <input
                type="number"
                inputMode="decimal"
                value={Number.isFinite(it.amount) ? it.amount : 0}
                onChange={(e) => updateItem(it.id, { amount: Number(e.target.value) || 0 })}
                className="col-span-6 rounded-md border border-border bg-card px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none sm:col-span-3"
                min={0}
                step={5}
              />
              <select
                value={it.cadence}
                onChange={(e) =>
                  updateItem(it.id, { cadence: e.target.value as LineItem['cadence'] })
                }
                className="col-span-4 rounded-md border border-border bg-card px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none sm:col-span-3"
              >
                <option value="once">one-time</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="col-span-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:col-span-1"
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
          className="mt-3 text-sm font-semibold text-foreground hover:text-foreground"
        >
          + Add line item
        </button>
      </SpotlightCard>

      <div className="relative mt-6 grid gap-3 overflow-hidden rounded-2xl sm:grid-cols-4">
        <BorderBeam size={180} duration={10} />
        <Stat label="One-time" value={totals.oneTime} hint="up-front gear" />
        <Stat label="Recurring / year" value={totals.annual} hint="lessons + subscriptions" />
        <Stat label="≈ Per month" value={totals.monthly} hint="steady state" />
        <Stat label="Year one" value={totals.yearOne} hint="real number" emphasize />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Numbers stay in your browser — nothing is uploaded.{' '}
        <button
          type="button"
          onClick={() => {
            setItems(SEED_ITEMS);
            setHobbyName('My hobby');
          }}
          className="underline hover:text-foreground"
        >
          Reset
        </button>
      </p>
    </FadeIn>
  );
}

function Stat({
  label,
  value,
  hint,
  emphasize = false,
}: {
  label: string;
  value: number;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        emphasize ? 'border-foreground/30 bg-foreground/10' : 'border-border bg-card'
      }`}
    >
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          emphasize ? 'text-foreground' : 'text-foreground'
        }`}
      >
        $<NumberTicker value={Math.round(value)} />
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
