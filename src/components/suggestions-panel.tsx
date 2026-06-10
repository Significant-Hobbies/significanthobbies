import { getCategoryForHobby, getSuggestedHobbies, HOBBY_CATEGORIES } from "~/lib/hobbies";

interface Props {
  existingHobbies: string[];
}

export function SuggestionsPanel({ existingHobbies }: Props) {
  const suggestions = getSuggestedHobbies(existingHobbies, 8);
  if (!suggestions.length) return null;

  // Determine the top category from existing hobbies
  const categoryCounts: Record<string, number> = {};
  for (const hobby of existingHobbies) {
    const cat = getCategoryForHobby(hobby);
    if (cat) {
      categoryCounts[cat.name] = (categoryCounts[cat.name] ?? 0) + 1;
    }
  }
  const topCategoryName = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategory = topCategoryName
    ? HOBBY_CATEGORIES.find((c) => c.name === topCategoryName)
    : undefined;

  const headerText = topCategory
    ? `Based on your ${topCategory.emoji} ${topCategory.name} interests`
    : "Expand your horizons";

  // Group suggestions by category
  const grouped: Array<{ name: string; emoji: string; hobbies: string[] }> = [];
  const seenCategories = new Set<string>();

  for (const hobby of suggestions) {
    const cat = getCategoryForHobby(hobby);
    if (!cat) {
      // Uncategorized fallback
      const existing = grouped.find((g) => g.name === "Other");
      if (existing) {
        existing.hobbies.push(hobby);
      } else {
        grouped.push({ name: "Other", emoji: "✨", hobbies: [hobby] });
      }
      continue;
    }
    if (!seenCategories.has(cat.name)) {
      seenCategories.add(cat.name);
      grouped.push({ name: cat.name, emoji: cat.emoji, hobbies: [hobby] });
    } else {
      grouped.find((g) => g.name === cat.name)!.hobbies.push(hobby);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
      <h2 className="mb-4 text-sm font-medium text-stone-700">
        {headerText}
      </h2>
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.name}>
            <p className="mb-2 text-xs font-medium text-stone-500 uppercase tracking-wide">
              {group.emoji} {group.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-default"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
