"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, LayoutList } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollReveal } from "~/components/scroll-reveal";
import type { TimelineData } from "~/lib/types";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";

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

  return (
    <Link href={`/timeline/${timeline.id}`}>
      <div className="group flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-emerald-400 hover:shadow-sm">
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

        {/* Title */}
        <h3 className="mb-1 font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors leading-tight">
          {timeline.title ?? "Hobby Timeline"}
        </h3>

        {/* User */}
        {username && (
          <p className="mb-3 text-xs text-stone-400">@{username}</p>
        )}

        {/* Top hobby tags */}
        {top3Hobbies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
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

        {/* Stats footer */}
        <p className="mt-auto pt-2 text-xs text-stone-400">
          {phases.length} phase{phases.length !== 1 ? "s" : ""} &middot;{" "}
          {totalHobbies} hobb{totalHobbies !== 1 ? "ies" : "y"}
          {timeline.likeCount !== undefined && timeline.likeCount > 0 && (
            <> &middot; {timeline.likeCount} like{timeline.likeCount !== 1 ? "s" : ""}</>
          )}
        </p>
      </div>
    </Link>
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
    </div>
  );
}
