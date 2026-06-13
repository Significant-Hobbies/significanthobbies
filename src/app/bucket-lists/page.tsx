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
  travel: "from-sky-400/20 to-sky-600/5",
  adventure: "from-orange-400/20 to-orange-600/5",
  creative: "from-purple-400/20 to-purple-600/5",
  achievement: "from-amber-400/20 to-amber-600/5",
  social: "from-rose-400/20 to-rose-600/5",
  humanitarian: "from-emerald-400/20 to-emerald-600/5",
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

export default function BucketListsPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        {/* Star field */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[
            [12, 8], [85, 15], [35, 25], [65, 10], [20, 45], [78, 30],
            [45, 18], [92, 55], [8, 65], [55, 70], [30, 80], [70, 85],
            [15, 92], [88, 92], [50, 5], [25, 55], [75, 60],
          ].map(([x, y], i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: i % 3 === 0 ? "2px" : "1px",
                height: i % 3 === 0 ? "2px" : "1px",
                opacity: 0.3 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center space-y-8">
          {/* Lumi mascot */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-3xl scale-[2]" />
              <Lumi size={108} glow float className="relative" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
              Guided by Lumi
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              What would you do<br />
              <span className="text-amber-400">if you knew you</span><br />
              couldn&apos;t fail?
            </h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              The world&apos;s most remarkable people have written theirs down.
              Browse their lists — then build yours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors shadow-[0_0_24px_rgba(245,158,11,0.4)]"
            >
              ✨ Open my bucket list
            </Link>
            <a
              href="#lists"
              className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:border-stone-500 hover:text-white transition-colors"
            >
              Browse famous lists ↓
            </a>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {Object.entries(BUCKET_ITEM_CATEGORIES).map(([key, { label, emoji }]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900/80 px-3 py-1 text-xs text-stone-400"
              >
                {emoji} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Fade to white */}
        <div className="h-16 bg-gradient-to-b from-stone-950 to-white" />
      </section>

      {/* ── Person grid ──────────────────────────────────────────── */}
      <section id="lists" className="mx-auto max-w-5xl px-4 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-stone-900">Famous bucket lists</h2>
          <p className="text-stone-500">Click any person to see their full list — and borrow items for yours.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FAMOUS_BUCKET_LISTS.map((person) => {
            const done = person.items.filter((i) => i.status === "done").length;
            const total = person.items.length;
            const pct = Math.round((done / total) * 100);
            const dom = getDominantCategory(person.slug);
            const gradient = dom ? (CATEGORY_GRADIENTS[dom] ?? "") : "";
            // Circular SVG progress
            const r = 20;
            const circ = 2 * Math.PI * r;
            const offset = circ * (1 - pct / 100);

            return (
              <Link
                key={person.slug}
                href={`/bucket-lists/${person.slug}`}
                className={`group relative flex flex-col rounded-2xl border border-stone-200 bg-gradient-to-br ${gradient} bg-white p-6 shadow-sm hover:shadow-lg hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
              >
                {/* Subtle pattern */}
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-white/60 to-transparent" />

                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="text-4xl">{person.emoji}</span>
                  {/* Circular progress */}
                  <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0 -rotate-90">
                    <circle cx="26" cy="26" r={r} fill="none" stroke="#e7e5e4" strokeWidth="4" />
                    <circle
                      cx="26"
                      cy="26"
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
                      x="26"
                      y="26"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="rotate-90 origin-center"
                      style={{ fontSize: "10px", fill: "#78716c", fontWeight: 600, transform: "rotate(90deg)", transformOrigin: "26px 26px" }}
                    >
                      {pct}%
                    </text>
                  </svg>
                </div>

                <h2 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  {person.name}
                </h2>
                <p className="mt-1 text-sm text-stone-500 line-clamp-2 flex-1">
                  {person.knownFor}
                </p>

                {/* Top 2 items preview */}
                <ul className="mt-4 space-y-1.5">
                  {person.items.slice(0, 2).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-stone-600">
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                          item.status === "done"
                            ? "border-amber-400 bg-amber-400"
                            : "border-stone-300"
                        }`}
                      />
                      <span className={item.status === "done" ? "line-through text-stone-400" : ""}>
                        {item.title.length > 48 ? item.title.slice(0, 48) + "…" : item.title}
                      </span>
                    </li>
                  ))}
                  {total > 2 && (
                    <li className="text-xs text-stone-400 pl-5">
                      +{total - 2} more →
                    </li>
                  )}
                </ul>

                {/* Hover arrow */}
                <div className="mt-4 text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  See full list →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Lumi CTA ─────────────────────────────────────────────── */}
      <section className="bg-amber-50 border-t border-amber-100">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow className="mx-auto" />
          <h2 className="text-3xl font-bold text-stone-900">
            Your turn.
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Lumi will help you discover what belongs on your list — based on who you are,
            not who everyone else expects you to be.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors"
            >
              ✨ Start my bucket list
            </Link>
            <Link
              href="/find-your-hobby"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:border-amber-400 transition-colors"
            >
              Take the hobby quiz →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
