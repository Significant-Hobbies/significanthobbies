"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Layers3,
  LayoutList,
  Search,
  Sparkles,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollReveal } from "~/components/scroll-reveal";
import type { TimelineData } from "~/lib/types";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";
import { getTimelineUrl } from "~/lib/timeline-url";

// Phase strip colors cycling through warm/cool hues
const PHASE_COLORS = [
  "bg-emerald-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-pink-400",
  "bg-teal-400",
  "bg-amber-400",
  "bg-violet-400",
];

type SortOption = "all" | "most-phases" | "most-hobbies" | "recent" | "most-liked";

interface ExploreClientProps {
  timelines: (TimelineData & { likeCount?: number })[];
}

function categoryForHobby(hobby: string) {
  const lower = hobby.toLowerCase();
  return HOBBY_CATEGORIES.find((category) =>
    category.hobbies.some((name) => name.toLowerCase() === lower),
  );
}

function timelineSpan(phases: TimelineData["phases"]) {
  const years = phases
    .flatMap((phase) => [phase.yearStart, phase.yearEnd])
    .filter((year): year is number => typeof year === "number");
  if (years.length > 0) return `${Math.min(...years)}-${Math.max(...years)}`;

  const ages = phases
    .flatMap((phase) => [phase.ageStart, phase.ageEnd])
    .filter((age): age is number => typeof age === "number");
  if (ages.length > 0) return `ages ${Math.min(...ages)}-${Math.max(...ages)}`;

  return `${phases.length} phase${phases.length !== 1 ? "s" : ""}`;
}

function ExploreTimelineCard({ timeline }: { timeline: TimelineData & { likeCount?: number } }) {
  const { phases } = timeline;
  const totalHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  ).size;

  // Collect top 3 hobby names for tags
  const hobbyFreq: Record<string, number> = {};
  for (const p of phases) {
    for (const h of p.hobbies) {
      hobbyFreq[h.name] = (hobbyFreq[h.name] ?? 0) + 1;
    }
  }
  const top3Hobbies = Object.entries(hobbyFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const username = timeline.user?.username ?? timeline.user?.name;
  const visiblePhases = phases.slice(0, 3);
  const categories = Array.from(
    new Map(
      top3Hobbies.flatMap((hobby) => {
        const category = categoryForHobby(hobby);
        return category ? [[category.name, category] as const] : [];
      }),
    ).values(),
  ).slice(0, 3);

  return (
    <Link href={getTimelineUrl(timeline)} prefetch={false}>
      <div className="group flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm">
        {/* Phase color strip */}
        {phases.length > 0 && (
          <div className="mb-4 flex h-1.5 w-full overflow-hidden rounded-full gap-px">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className={`flex-1 rounded-full ${PHASE_COLORS[i % PHASE_COLORS.length]}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight text-stone-800 transition-colors group-hover:text-emerald-600">
              {timeline.title ?? "Hobby Timeline"}
            </h3>
            {username && <p className="mt-1 text-xs text-stone-400">@{username}</p>}
          </div>
          <div className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Span</div>
            <div className="text-xs font-semibold text-stone-700">{timelineSpan(phases)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <MiniStat icon={<Layers3 className="h-3.5 w-3.5" />} label="Phases" value={String(phases.length)} />
          <MiniStat icon={<Sparkles className="h-3.5 w-3.5" />} label="Hobbies" value={String(totalHobbies)} />
          <MiniStat icon={<Heart className="h-3.5 w-3.5" />} label="Likes" value={String(timeline.likeCount ?? 0)} />
        </div>

        {/* Top hobby tags */}
        {top3Hobbies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {top3Hobbies.map((hobby) => (
              <span
                key={hobby}
                className="inline-block rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-600"
              >
                {hobby}
              </span>
            ))}
          </div>
        )}

        {visiblePhases.length > 0 && (
          <div className="mt-4 space-y-2">
            {visiblePhases.map((phase, index) => (
              <div key={phase.id} className="rounded-lg border border-stone-100 bg-stone-50/70 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${PHASE_COLORS[index % PHASE_COLORS.length]}`} />
                  <p className="truncate text-xs font-semibold text-stone-700">{phase.label}</p>
                </div>
                <p className="mt-1 truncate text-xs text-stone-500">
                  {phase.hobbies.slice(0, 3).map((hobby) => hobby.name).join(" · ") || "No hobbies listed"}
                </p>
              </div>
            ))}
            {phases.length > visiblePhases.length && (
              <p className="pl-3 text-xs text-stone-400">
                +{phases.length - visiblePhases.length} more phase{phases.length - visiblePhases.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span key={category.name} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {category.emoji} {category.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Updated {new Date(timeline.updatedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            View <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50 px-2 py-2">
      <div className="flex items-center gap-1 text-stone-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-semibold text-stone-800">{value}</div>
    </div>
  );
}

function ExploreBackfill({ hasResults }: { hasResults: boolean }) {
  return (
    <section className="mt-10 grid gap-4 md:grid-cols-3">
      {[
        {
          title: "Deep hobby arcs",
          body: "Find timelines where one interest returns across school, work, family, and later chapters.",
          href: "/hobbies",
          cta: "Browse hobbies",
        },
        {
          title: "Quest sparks",
          body: "Use short experiments to turn a thin phase into a fuller story with evidence and notes.",
          href: "/side-quests",
          cta: "Open quests",
        },
        {
          title: hasResults ? "Share your map" : "Start the index",
          body: "Public timelines make Explore better: phases, hobby tags, and updates all feed this page.",
          href: "/timeline/new",
          cta: "Build timeline",
        },
      ].map((item) => (
        <Link
          key={item.title}
          href={item.href}
          prefetch={false}
          className="group rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-emerald-400"
        >
          <h3 className="font-semibold text-stone-800">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">{item.body}</p>
          <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
            {item.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </p>
        </Link>
      ))}
    </section>
  );
}

function ExploreFooter() {
  return (
    <section className="mt-10 rounded-xl border border-stone-200 bg-stone-900 px-5 py-6 text-white md:flex md:items-center md:justify-between md:gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Community signal</p>
        <h2 className="mt-2 text-xl font-semibold">Explore grows with every public phase.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
          Add a timeline with hobbies, dates, and phase labels so other people can discover patterns beyond a flat list of interests.
        </p>
      </div>
      <Link
        href="/timeline/new"
        prefetch={false}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 md:mt-0"
      >
        Build your timeline
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

export function ExploreClient({ timelines }: ExploreClientProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = timelines;

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((t) => {
        const titleMatch = (t.title ?? "Hobby Timeline").toLowerCase().includes(q);
        const userMatch =
          (t.user?.username ?? "").toLowerCase().includes(q) ||
          (t.user?.name ?? "").toLowerCase().includes(q);
        const hobbyMatch = t.phases.some((p) =>
          p.hobbies.some((h) => h.name.toLowerCase().includes(q)),
        );
        return titleMatch || userMatch || hobbyMatch;
      });
    }

    // Filter by category
    if (categoryFilter) {
      const category = HOBBY_CATEGORIES.find((c) => c.name === categoryFilter);
      if (category) {
        const categoryHobbies = new Set(category.hobbies.map((h) => h.toLowerCase()));
        result = result.filter((t) =>
          t.phases.some((p) =>
            p.hobbies.some((h) => categoryHobbies.has(h.name.toLowerCase())),
          ),
        );
      }
    }

    // Sort
    if (sort === "most-phases") {
      result = [...result].sort((a, b) => b.phases.length - a.phases.length);
    } else if (sort === "most-hobbies") {
      const countHobbies = (t: TimelineData) =>
        new Set(t.phases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase()))).size;
      result = [...result].sort((a, b) => countHobbies(b) - countHobbies(a));
    } else if (sort === "recent") {
      result = [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } else if (sort === "most-liked") {
      result = [...result].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    }

    return result;
  }, [timelines, query, sort, categoryFilter]);

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: "All", value: "all" },
    { label: "Most phases", value: "most-phases" },
    { label: "Most hobbies", value: "most-hobbies" },
    { label: "Recent", value: "recent" },
    { label: "Most liked", value: "most-liked" },
  ];

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search timelines, hobbies, or people..."
          className="h-11 border-stone-300 bg-white pl-10 placeholder:text-stone-400"
        />
      </div>

      {/* Sort chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSort(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              sort === opt.value
                ? "bg-emerald-600 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            categoryFilter === null
              ? "bg-stone-800 text-white"
              : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-800"
          }`}
        >
          All categories
        </button>
        {HOBBY_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === cat.name ? null : cat.name)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              categoryFilter === cat.name
                ? "bg-stone-800 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-800"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-6 py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white">
            <LayoutList className="h-5 w-5 text-stone-400" />
          </div>
          <p className="text-stone-600 font-medium">
            {query ? `No timelines match "${query}"` : categoryFilter ? `No timelines in ${categoryFilter}` : "No public timelines yet"}
          </p>
          <p className="mt-1 text-sm text-stone-400">
            {query ? "Try a different search term" : categoryFilter ? "Try a different category" : "Be the first to share yours"}
          </p>
          {!query && !categoryFilter && (
            <Link
              href="/timeline/new"
              prefetch={false}
              className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Build your timeline
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-stone-400">
            {filtered.length} timeline{filtered.length !== 1 ? "s" : ""}
            {query && ` for "${query}"`}
            {categoryFilter && ` in ${categoryFilter}`}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((timeline, i) => (
              <ScrollReveal key={timeline.id} animation="fade-up" delay={i * 60} duration={450}>
                <ExploreTimelineCard timeline={timeline} />
              </ScrollReveal>
            ))}
          </div>
        </>
      )}

      <ExploreBackfill hasResults={filtered.length > 0} />
      <ExploreFooter />
    </div>
  );
}
