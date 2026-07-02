'use client';

import { ArrowRight, Search, User, UserCheck, Users, UsersRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Input } from '~/components/ui/input';
import { getCategoryForHobby } from '~/lib/hobbies';
import { ALL_COMPARABLE_HOBBIES, HOBBY_DETAILS, type HobbyDetail } from '~/lib/hobby-details';

// ── Helpers ────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function CostBadge({ cost }: { cost: HobbyDetail['cost'] }) {
  const map: Record<HobbyDetail['cost'], { label: string; className: string }> = {
    free: { label: 'Free', className: 'bg-lumi-500/15 text-lumi-400 border-lumi-500/30' },
    low: { label: 'Low ($)', className: 'bg-lumi-500/15 text-lumi-400 border-lumi-500/30' },
    medium: { label: 'Medium ($$)', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    high: {
      label: 'High ($$$)',
      className: 'bg-destructive/15 text-destructive border-destructive/30',
    },
  };
  const { label, className } = map[cost];
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function DifficultyDots({ level }: { level: HobbyDetail['difficulty'] }) {
  const filled = level === 'easy' ? 1 : level === 'moderate' ? 2 : 3;
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full border ${
            i <= filled ? 'border-lumi-500/60 bg-lumi-500/100' : 'border-border bg-transparent'
          }`}
        />
      ))}
      <span className="ml-1 text-muted-foreground capitalize">{level}</span>
    </span>
  );
}

function PhysicalBar({ level }: { level: HobbyDetail['physical'] }) {
  const widthMap: Record<HobbyDetail['physical'], string> = {
    none: 'w-0',
    light: 'w-1/4',
    moderate: 'w-2/4',
    intense: 'w-full',
  };
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-2 w-24 overflow-hidden rounded-full bg-foreground/10">
        <span
          className={`absolute left-0 top-0 h-full rounded-full bg-lumi-500/100 transition-all ${widthMap[level]}`}
        />
      </span>
      <span className="text-muted-foreground capitalize">{level === 'none' ? 'None' : level}</span>
    </span>
  );
}

function SocialIcon({ level }: { level: HobbyDetail['socialLevel'] }) {
  const map: Record<HobbyDetail['socialLevel'], { Icon: React.ElementType; label: string }> = {
    solo: { Icon: User, label: 'Solo' },
    optional: { Icon: UserCheck, label: 'Optional' },
    social: { Icon: Users, label: 'Social' },
    team: { Icon: UsersRound, label: 'Team' },
  };
  const { Icon, label } = map[level];
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-4 w-4 text-muted-foreground/60" />
      {label}
    </span>
  );
}

function LocationTags({ indoor, outdoor }: { indoor: boolean; outdoor: boolean }) {
  return (
    <span className="flex flex-wrap gap-1">
      {indoor && (
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
          Indoor
        </span>
      )}
      {outdoor && (
        <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
          Outdoor
        </span>
      )}
    </span>
  );
}

// ── Combobox ───────────────────────────────────────────────────────────────

interface HobbyComboboxProps {
  label: string;
  value: string | null;
  onChange: (hobby: string | null) => void;
  exclude?: string | null;
}

function HobbyCombobox({ label, value, onChange, exclude }: HobbyComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = ALL_COMPARABLE_HOBBIES.filter(
    (h) =>
      h !== exclude && (query.trim() === '' || h.toLowerCase().includes(query.trim().toLowerCase()))
  );

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(hobby: string) {
    onChange(hobby);
    setQuery('');
    setOpen(false);
  }

  function clear() {
    onChange(null);
    setQuery('');
  }

  const category = value ? getCategoryForHobby(value) : null;

  return (
    <div ref={containerRef} className="relative flex-1">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </p>

      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-lumi-500/40 bg-card px-4 py-3">
          <span className="font-medium text-foreground">
            {category?.emoji} {value}
          </span>
          <button
            type="button"
            onClick={clear}
            className="ml-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search a hobby…"
              className="h-11 border-border bg-card pl-10 placeholder:text-muted-foreground/60"
            />
          </div>

          {open && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {options.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground/60">No hobbies found</p>
              ) : (
                options.map((hobby) => {
                  const cat = getCategoryForHobby(hobby);
                  return (
                    <button
                      key={hobby}
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-card/40 transition-colors"
                      onClick={() => select(hobby)}
                    >
                      <span>{cat?.emoji}</span>
                      <span>{hobby}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Comparison row ─────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

function CompareRow({ label, left, right }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border py-4 last:border-0">
      <div className="flex justify-end">{left}</div>
      <div className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </div>
      <div className="flex justify-start">{right}</div>
    </div>
  );
}

// ── Comparison card ────────────────────────────────────────────────────────

function ComparisonCard({ a, b }: { a: HobbyDetail; b: HobbyDetail }) {
  const catA = getCategoryForHobby(a.name);
  const catB = getCategoryForHobby(b.name);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] border-b border-border bg-card/40">
        <div className="p-5 text-right">
          <p className="text-2xl">{catA?.emoji}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{a.name}</p>
          <p className="text-xs text-muted-foreground/60">{catA?.name ?? 'Hobby'}</p>
        </div>
        <div className="flex items-center justify-center px-4">
          <span className="text-sm font-semibold text-muted-foreground/40">vs</span>
        </div>
        <div className="p-5 text-left">
          <p className="text-2xl">{catB?.emoji}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{b.name}</p>
          <p className="text-xs text-muted-foreground/60">{catB?.name ?? 'Hobby'}</p>
        </div>
      </div>

      {/* Rows */}
      <div className="px-6 py-2">
        <CompareRow
          label="Cost"
          left={<CostBadge cost={a.cost} />}
          right={<CostBadge cost={b.cost} />}
        />
        <CompareRow
          label="Time / session"
          left={<span className="text-sm text-foreground">{a.timePerSession}</span>}
          right={<span className="text-sm text-foreground">{b.timePerSession}</span>}
        />
        <CompareRow
          label="Social"
          left={<SocialIcon level={a.socialLevel} />}
          right={<SocialIcon level={b.socialLevel} />}
        />
        <CompareRow
          label="Difficulty"
          left={<DifficultyDots level={a.difficulty} />}
          right={<DifficultyDots level={b.difficulty} />}
        />
        <CompareRow
          label="Physical"
          left={<PhysicalBar level={a.physical} />}
          right={<PhysicalBar level={b.physical} />}
        />
        <CompareRow
          label="Location"
          left={<LocationTags indoor={a.indoor} outdoor={a.outdoor} />}
          right={<LocationTags indoor={b.indoor} outdoor={b.outdoor} />}
        />
        <CompareRow
          label="Gear"
          left={<span className="text-right text-sm text-muted-foreground">{a.gear}</span>}
          right={<span className="text-sm text-muted-foreground">{b.gear}</span>}
        />
        <CompareRow
          label="Best for"
          left={
            <span className="text-right text-sm italic text-muted-foreground">{a.bestFor}</span>
          }
          right={<span className="text-sm italic text-muted-foreground">{b.bestFor}</span>}
        />
      </div>

      {/* Footer */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 border-t border-border bg-card/40 p-5">
        <div className="flex justify-end">
          <Link
            href={`/hobbies/${toSlug(a.name)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:border-lumi-500/50 hover:text-lumi-400 transition-colors"
          >
            {a.name} detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <Link
            href="/timeline/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-lumi-300 transition-colors"
          >
            Try both
          </Link>
        </div>
        <div className="flex justify-start">
          <Link
            href={`/hobbies/${toSlug(b.name)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:border-lumi-500/50 hover:text-lumi-400 transition-colors"
          >
            {b.name} detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main client component ──────────────────────────────────────────────────

export function CompareClient() {
  const [hobbyA, setHobbyA] = useState<string | null>(null);
  const [hobbyB, setHobbyB] = useState<string | null>(null);

  const detailA = hobbyA ? HOBBY_DETAILS[hobbyA] : null;
  const detailB = hobbyB ? HOBBY_DETAILS[hobbyB] : null;

  return (
    <div>
      {/* Selectors */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <HobbyCombobox label="Hobby A" value={hobbyA} onChange={setHobbyA} exclude={hobbyB} />
        <div className="flex items-center justify-center pb-1 text-sm font-bold text-muted-foreground/40 sm:pb-3">
          VS
        </div>
        <HobbyCombobox label="Hobby B" value={hobbyB} onChange={setHobbyB} exclude={hobbyA} />
      </div>

      {/* Prompt when none selected */}
      {!detailA && !detailB && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="text-2xl">⚖️</p>
          <p className="mt-3 font-medium text-muted-foreground">Select two hobbies to compare</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Use the dropdowns above to pick Hobby A and Hobby B
          </p>
        </div>
      )}

      {/* Partial selection */}
      {(detailA || detailB) && !(detailA && detailB) && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-muted-foreground">
            Now pick{' '}
            <span className="font-semibold text-foreground">{detailA ? 'Hobby B' : 'Hobby A'}</span>{' '}
            to see the comparison
          </p>
        </div>
      )}

      {/* Full comparison */}
      {detailA && detailB && <ComparisonCard a={detailA} b={detailB} />}

      {/* Quick picks */}
      {!hobbyA && !hobbyB && (
        <div className="mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Popular comparisons
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ['Running', 'Cycling'],
              ['Guitar', 'Piano'],
              ['Chess', 'Reading'],
              ['Cooking', 'Baking'],
              ['Yoga', 'Dance'],
              ['Drawing', 'Painting'],
            ].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => {
                  setHobbyA(a);
                  setHobbyB(b);
                }}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground hover:border-lumi-500/50 hover:text-lumi-400 transition-colors"
              >
                {a} vs {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
