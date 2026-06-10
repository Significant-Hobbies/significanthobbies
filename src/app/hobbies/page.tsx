import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";

export const metadata = {
  title: "Hobby Directory — SignificantHobbies",
  description: "Browse 110+ hobbies across 10 categories. Find your next passion — from creative arts and music to outdoor adventures and making.",
};

// Left-border accent colors cycling through hues per category index
const CATEGORY_BORDER_COLORS = [
  "border-l-emerald-500",
  "border-l-blue-500",
  "border-l-purple-500",
  "border-l-orange-500",
  "border-l-pink-500",
  "border-l-teal-500",
  "border-l-amber-500",
  "border-l-violet-500",
  "border-l-sky-500",
  "border-l-rose-500",
];

// Full-border colors for category card grid
const CATEGORY_CARD_BORDER_COLORS = [
  "border-emerald-400",
  "border-blue-400",
  "border-purple-400",
  "border-orange-400",
  "border-pink-400",
  "border-teal-400",
  "border-amber-400",
  "border-violet-400",
  "border-sky-400",
  "border-rose-400",
];

export default function HobbiesPage() {
  const totalCategories = HOBBY_CATEGORIES.length;
  const totalHobbies = HOBBY_CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="scroll-reveal mb-10">
        <h1 className="text-3xl font-bold text-stone-900">Hobby directory</h1>
        <p className="mt-2 text-stone-500">
          Explore hobbies across every category. Click to see community timelines.
        </p>
        {/* Summary counts */}
        <p className="mt-3 text-sm font-medium text-stone-500">
          <span className="text-stone-800">{totalCategories}</span>
          <span className="text-stone-400"> categories</span>
          <span className="mx-2 text-stone-300">·</span>
          <span className="text-stone-800">{totalHobbies}</span>
          <span className="text-stone-400"> hobbies</span>
        </p>
      </div>

      {/* Browse by category */}
      <div className="scroll-reveal mb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Browse by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {HOBBY_CATEGORIES.map((category, idx) => {
            const catSlug = category.name.toLowerCase().replace(/\s+/g, "-");
            const cardBorderColor = CATEGORY_CARD_BORDER_COLORS[idx % CATEGORY_CARD_BORDER_COLORS.length];
            return (
              <Link key={category.name} href={`/hobbies/category/${catSlug}`}>
                <div className={`group rounded-xl border-2 ${cardBorderColor} bg-white p-3 text-center transition-all hover:shadow-sm cursor-pointer`}>
                  <span className="text-2xl block mb-1">{category.emoji}</span>
                  <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">
                    {category.hobbies.length} hobbies
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-10">
        {HOBBY_CATEGORIES.map((category, idx) => {
          const borderColor = CATEGORY_BORDER_COLORS[idx % CATEGORY_BORDER_COLORS.length];
          const catSlug = category.name.toLowerCase().replace(/\s+/g, "-");
          return (
            <div
              key={category.name}
              className={`scroll-reveal border-l-2 pl-5 ${borderColor}`}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <Link href={`/hobbies/category/${catSlug}`}>
                  <h2 className="text-xl font-semibold text-stone-800 hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h2>
                </Link>
                <Badge
                  variant="outline"
                  className="border-stone-200 text-xs text-stone-400"
                >
                  {category.hobbies.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.hobbies.map((hobby) => (
                  <Link
                    key={hobby}
                    href={`/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, "-"))}`}
                    title={`${category.emoji} ${category.name}`}
                  >
                    <span className="inline-block rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition-colors hover:border-emerald-400 hover:text-emerald-600 cursor-pointer">
                      {hobby}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Famous Hobby Journeys link */}
      <div className="mt-12 rounded-xl border border-stone-200 bg-emerald-50 p-6 text-center">
        <h2 className="text-lg font-bold text-stone-900 mb-2">Famous Hobby Journeys</h2>
        <p className="text-sm text-stone-600 mb-4">See how remarkable people&apos;s hobbies shaped who they became.</p>
        <Link href="/journeys" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          Explore journeys →
        </Link>
      </div>
    </div>
  );
}
