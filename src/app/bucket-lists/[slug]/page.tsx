import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToMyListButton } from "~/components/add-to-my-list-button";
import { Lumi } from "~/components/lumi";
import {
  BUCKET_ITEM_CATEGORIES,
  FAMOUS_BUCKET_LISTS,
  getFamousBucketList,
} from "~/lib/famous-bucket-lists";
import { getServerAuthSession } from "~/server/auth";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return FAMOUS_BUCKET_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = getFamousBucketList(slug);
  if (!list) return {};
  return {
    title: `${list.name}'s Bucket List — SignificantHobbies`,
    description: `${list.items.length} verified bucket list items from ${list.name}. ${list.knownFor}.`,
  };
}

const CATEGORY_HERO_GRADIENT: Record<string, string> = {
  travel: "from-sky-950 via-sky-900 to-stone-950",
  adventure: "from-orange-950 via-orange-900 to-stone-950",
  creative: "from-purple-950 via-purple-900 to-stone-950",
  achievement: "from-amber-950 via-amber-900 to-stone-950",
  social: "from-rose-950 via-rose-900 to-stone-950",
  humanitarian: "from-emerald-950 via-emerald-900 to-stone-950",
};

const CATEGORY_ACCENT: Record<string, string> = {
  travel: "text-sky-400",
  adventure: "text-orange-400",
  creative: "text-purple-400",
  achievement: "text-amber-400",
  social: "text-rose-400",
  humanitarian: "text-emerald-400",
};

export default async function FamousBucketListPage({ params }: Props) {
  const { slug } = await params;
  const list = getFamousBucketList(slug);
  if (!list) notFound();

  const session = await getServerAuthSession();
  const isLoggedIn = !!session?.user?.id;

  const done = list.items.filter((i) => i.status === "done").length;
  const total = list.items.length;
  const pct = Math.round((done / total) * 100);

  // Dominant category for colour scheme
  const catCounts: Record<string, number> = {};
  for (const item of list.items) {
    catCounts[item.category] = (catCounts[item.category] ?? 0) + 1;
  }
  const domCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "achievement";
  const heroGradient = CATEGORY_HERO_GRADIENT[domCat] ?? CATEGORY_HERO_GRADIENT.achievement!;
  const accentColor = CATEGORY_ACCENT[domCat] ?? "text-amber-400";

  // Circular progress
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${heroGradient} text-white`}>
        {/* Stars */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[[10,15],[80,8],[45,20],[70,35],[25,60],[90,70],[15,85],[60,5]].map(([x,y],i) => (
            <span key={i} className="absolute h-px w-px rounded-full bg-white opacity-30"
              style={{ left:`${x}%`, top:`${y}%`, width: i%2===0?"2px":"1px", height:i%2===0?"2px":"1px" }} />
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-4 py-16 space-y-8">
          <a href="/bucket-lists" className={`inline-flex items-center gap-1.5 text-sm ${accentColor} hover:opacity-80 transition-opacity`}>
            ← All bucket lists
          </a>

          <div className="flex items-start gap-6">
            {/* Big emoji */}
            <div className="text-6xl sm:text-7xl shrink-0 drop-shadow-lg">{list.emoji}</div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold">{list.name}</h1>
              <p className={`text-sm ${accentColor} font-medium`}>{list.knownFor}</p>
            </div>
            {/* Circular progress */}
            <div className="shrink-0 hidden sm:block">
              <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
              </svg>
              <p className="text-center text-xs text-white/60 mt-1">{pct}% done</p>
            </div>
          </div>

          {list.quote && (
            <blockquote className={`border-l-4 border-current ${accentColor} pl-4 italic text-white/80 text-sm`}>
              &ldquo;{list.quote.text}&rdquo;
            </blockquote>
          )}

          {/* Mobile progress */}
          <div className="sm:hidden space-y-1">
            <div className="flex justify-between text-xs text-white/60">
              <span>{done} of {total} completed</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-white/70" style={{ width:`${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="h-12 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── Items ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        {!isLoggedIn && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
            <Lumi size={36} float />
            <p className="text-sm text-stone-700">
              <a href="/login" className="font-semibold text-amber-600 hover:underline">Sign in</a>
              {" "}to add any of these to your own bucket list.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {list.items.map((item, i) => {
            const cat = item.category ? BUCKET_ITEM_CATEGORIES[item.category] : null;
            const isDone = item.status === "done";

            return (
              <li
                key={i}
                className={`group rounded-2xl border p-5 transition-all duration-200 ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div
                    className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-stone-200 text-transparent"
                    }`}
                  >
                    ✓
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h3 className={`font-semibold text-stone-900 ${isDone ? "line-through text-stone-400" : ""}`}>
                        {item.title}
                      </h3>
                      {cat && (
                        <span className={`shrink-0 text-xs rounded-full px-2.5 py-1 font-medium border ${
                          isDone ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-stone-200 text-stone-500 bg-stone-50"
                        }`}>
                          {cat.emoji} {cat.label}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">{item.description}</p>

                    {item.completedNote && (
                      <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                        <span className="text-emerald-500 text-sm shrink-0">✓</span>
                        <p className="text-xs text-emerald-700 leading-relaxed">{item.completedNote}</p>
                      </div>
                    )}

                    {isLoggedIn && (
                      <div className="mt-3">
                        <AddToMyListButton
                          title={item.title}
                          description={item.description}
                          category={item.category}
                          sourceSlug={list.slug}
                          sourceItemTitle={item.title}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Back to all */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-100">
          <a href="/bucket-lists" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">
            ← Browse all famous lists
          </a>
          {isLoggedIn && (
            <a href="/dashboard" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
              View my bucket list →
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
