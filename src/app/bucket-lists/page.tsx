import type { Metadata } from "next";
import Link from "next/link";

import { Lumi } from "~/components/lumi";
import { BUCKET_ITEM_CATEGORIES, FAMOUS_BUCKET_LISTS } from "~/lib/famous-bucket-lists";

export const metadata: Metadata = {
  title: "Bucket Lists — SignificantHobbies",
  description:
    "Explore the bucket lists of presidents, athletes, billionaires, and icons. Find the life you want to live.",
  openGraph: {
    title: "What do the world's most remarkable people want to do before they die?",
    description:
      "Browse verified bucket lists from Will Smith, Obama, Serena Williams, Elon Musk and more. Find your next great ambition.",
  },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  travel: "from-sky-500/10 to-sky-700/5",
  adventure: "from-orange-500/10 to-orange-700/5",
  creative: "from-purple-500/10 to-purple-700/5",
  achievement: "from-amber-500/10 to-amber-700/5",
  social: "from-rose-500/10 to-rose-700/5",
  humanitarian: "from-emerald-500/10 to-emerald-700/5",
};

const CATEGORY_BORDER_HOVER: Record<string, string> = {
  travel: "hover:border-sky-400/50",
  adventure: "hover:border-orange-400/50",
  creative: "hover:border-purple-400/50",
  achievement: "hover:border-amber-400/50",
  social: "hover:border-rose-400/50",
  humanitarian: "hover:border-emerald-400/50",
};

function getDominantCategory(slug: string) {
  const list = FAMOUS_BUCKET_LISTS.find((l) => l.slug === slug);
  if (!list) return null;
  const counts: Record<string, number> = {};
  for (const item of list.items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// Computed from source data so it never drifts
const TOTAL_ITEMS = FAMOUS_BUCKET_LISTS.reduce((sum, p) => sum + p.items.length, 0);
const TOTAL_PEOPLE = FAMOUS_BUCKET_LISTS.length;
const TOTAL_CATEGORIES = Object.keys(BUCKET_ITEM_CATEGORIES).length;

export default function BucketListsPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-stone-950 text-white min-h-[80vh] flex flex-col justify-center">

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="animate-orb-float absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-amber-500/8 blur-3xl" />
          <div className="animate-orb-float absolute right-[8%] bottom-[20%] h-56 w-56 rounded-full bg-amber-400/6 blur-3xl" style={{ animationDelay: "-4s" }} />
          <div className="animate-orb-float absolute left-[55%] top-[60%] h-40 w-40 rounded-full bg-orange-500/5 blur-2xl" style={{ animationDelay: "-8s" }} />
        </div>

        {/* Star field */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {([
            [12, 8], [85, 15], [35, 25], [65, 10], [20, 45], [78, 30],
            [45, 18], [92, 55], [8, 65], [55, 70], [30, 80], [70, 85],
            [15, 92], [88, 92], [50, 5], [25, 55], [75, 60],
            [40, 40], [60, 22], [5, 38], [95, 72],
          ] as [number, number][]).map(([x, y], i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: i % 4 === 0 ? "2px" : "1px",
                height: i % 4 === 0 ? "2px" : "1px",
                opacity: 0.2 + (i % 5) * 0.08,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center space-y-10">
          {/* Lumi with large radial glow */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Radial amber glow behind Lumi */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(245,158,11,0.08) 50%, transparent 70%)",
                  width: "200px",
                  height: "200px",
                  transform: "translate(-50%, -50%)",
                  top: "60%",
                  left: "50%",
                  filter: "blur(32px)",
                }}
                aria-hidden
              />
              <Lumi size={120} glow float className="relative drop-shadow-[0_0_48px_rgba(245,158,11,0.6)]" />
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
              Guided by Lumi
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Your bucket list is a{" "}
              <span className="text-amber-400">love letter</span>
              <br className="hidden sm:block" /> to your future self.
            </h1>
            <p className="text-stone-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              The world&apos;s most remarkable people have written theirs down.
              Browse their lists — then build yours.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-sm font-bold text-stone-950 hover:bg-amber-300 active:scale-95 transition-all duration-150 shadow-[0_0_32px_rgba(245,158,11,0.45)]"
            >
              ✨ Start my list
            </Link>
            <a
              href="#lists"
              className="inline-flex items-center gap-2 rounded-full border border-stone-600 px-8 py-3.5 text-sm font-medium text-stone-300 hover:border-amber-400/60 hover:text-amber-300 transition-colors duration-200"
            >
              Browse famous lists ↓
            </a>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {Object.entries(BUCKET_ITEM_CATEGORIES).map(([key, { label, emoji }]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900/80 px-3 py-1 text-xs text-stone-500 backdrop-blur-sm"
              >
                {emoji} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-stone-900/60 pointer-events-none" aria-hidden />
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-stone-800 bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { value: TOTAL_PEOPLE, label: "famous people" },
              { value: TOTAL_ITEMS, label: "verified items" },
              { value: TOTAL_CATEGORIES, label: "categories" },
              { value: "100%", label: "free" },
            ].map(({ value, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-xl font-bold text-amber-400">{value}</span>
                <span className="text-stone-500">{label}</span>
                {i < 3 && (
                  <span className="hidden sm:inline-block ml-8 text-stone-700 select-none">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Person grid ──────────────────────────────────────────────────── */}
      <section id="lists" className="bg-stone-950 pb-24 pt-16">
        <div className="mx-auto max-w-5xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Famous bucket lists</h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              Click any person to see their full list — and borrow items for yours.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FAMOUS_BUCKET_LISTS.map((person) => {
              const done = person.items.filter((i) => i.status === "done").length;
              const total = person.items.length;
              const pct = Math.round((done / total) * 100);
              const dom = getDominantCategory(person.slug);
              const gradient = dom ? (CATEGORY_GRADIENTS[dom] ?? "") : "";
              const borderHover = dom ? (CATEGORY_BORDER_HOVER[dom] ?? "hover:border-amber-400/50") : "hover:border-amber-400/50";

              // Circular SVG progress ring — 60px
              const r = 24;
              const circ = 2 * Math.PI * r;
              const offset = circ * (1 - pct / 100);

              return (
                <Link
                  key={person.slug}
                  href={`/bucket-lists/${person.slug}`}
                  className={`group relative flex flex-col rounded-2xl border border-stone-800 bg-gradient-to-br ${gradient} bg-stone-900 p-6 shadow-sm hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)] ${borderHover} hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
                >
                  {/* Corner pattern */}
                  <div className="pointer-events-none absolute top-0 right-0 h-28 w-28 rounded-bl-full bg-gradient-to-bl from-white/4 to-transparent" aria-hidden />

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="text-4xl leading-none">{person.emoji}</span>
                    {/* Circular progress — 60px */}
                    <svg width="60" height="60" viewBox="0 0 60 60" className="shrink-0 -rotate-90">
                      <circle cx="30" cy="30" r={r} fill="none" stroke="#292524" strokeWidth="4" />
                      <circle
                        cx="30"
                        cy="30"
                        r={r}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        className="transition-all duration-700"
                      />
                      <text
                        x="30"
                        y="30"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: "11px",
                          fill: "#a8a29e",
                          fontWeight: 600,
                          transform: "rotate(90deg)",
                          transformOrigin: "30px 30px",
                        }}
                      >
                        {pct}%
                      </text>
                    </svg>
                  </div>

                  <h2 className="text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors leading-snug">
                    {person.name}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500 line-clamp-2 flex-1 leading-relaxed">
                    {person.knownFor}
                  </p>

                  {/* Top 2 items preview */}
                  <ul className="mt-5 space-y-2">
                    {person.items.slice(0, 2).map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-stone-400">
                        <span
                          className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                            item.status === "done"
                              ? "border-amber-400 bg-amber-400"
                              : "border-stone-600"
                          }`}
                        />
                        <span className={item.status === "done" ? "line-through text-stone-600" : ""}>
                          {item.title.length > 46 ? item.title.slice(0, 46) + "…" : item.title}
                        </span>
                      </li>
                    ))}
                    {total > 2 && (
                      <li className="text-xs text-stone-600 pl-6">
                        +{total - 2} more
                      </li>
                    )}
                  </ul>

                  {/* Hover CTA */}
                  <div className="mt-5 text-sm font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    View list →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-amber-400">
        {/* Subtle grain / texture overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-300/60 via-amber-400 to-amber-500/80" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center space-y-6">
          <div className="flex justify-center">
            <Lumi size={80} glow float className="drop-shadow-[0_0_24px_rgba(120,53,15,0.4)]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 leading-tight">
            Your turn. What do you want to do<br className="hidden sm:block" /> before you die?
          </h2>
          <p className="text-amber-900/80 text-base max-w-sm mx-auto">
            Lumi will help you discover what belongs on your list — based on who you are,
            not who everyone else expects you to be.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-7 py-3.5 text-sm font-bold text-amber-400 hover:bg-stone-800 active:scale-95 transition-all duration-150 shadow-lg"
            >
              ✨ Start my bucket list
            </Link>
            <Link
              href="/find-your-hobby"
              className="inline-flex items-center gap-2 rounded-full border-2 border-stone-950/20 bg-amber-300/50 px-7 py-3.5 text-sm font-semibold text-stone-900 hover:bg-amber-300 transition-colors duration-150"
            >
              Take the hobby quiz →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
