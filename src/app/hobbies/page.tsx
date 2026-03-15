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

      <div className="space-y-10">
        {HOBBY_CATEGORIES.map((category, idx) => {
          const borderColor = CATEGORY_BORDER_COLORS[idx % CATEGORY_BORDER_COLORS.length];
          return (
            <div
              key={category.name}
              className={`scroll-reveal border-l-2 pl-5 ${borderColor}`}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <h2 className="text-xl font-semibold text-stone-800">
                  {category.name}
                </h2>
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
    </div>
  );
}
