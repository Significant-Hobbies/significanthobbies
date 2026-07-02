import Link from 'next/link';

import { Badge } from '~/components/ui/badge';
import { categoryImageSrc } from '~/lib/category-images';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';

export const metadata = {
  title: 'Hobby Directory — SignificantHobbies',
  description:
    'Browse 110+ hobbies across 10 categories. Find your next passion — from creative arts and music to outdoor adventures and making.',
};

// Left-border accent colors cycling through hues per category index
const CATEGORY_BORDER_COLORS = [
  'border-l-emerald-500',
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-pink-500',
  'border-l-teal-500',
  'border-l-amber-500',
  'border-l-violet-500',
  'border-l-sky-500',
  'border-l-rose-500',
];

export default function HobbiesPage() {
  const totalCategories = HOBBY_CATEGORIES.length;
  const totalHobbies = HOBBY_CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="scroll-reveal mb-10">
        <h1 className="text-3xl font-bold text-foreground">Hobby directory</h1>
        <p className="mt-2 text-muted-foreground">
          Explore hobbies across every category. Click to see community timelines.
        </p>
        {/* Summary counts */}
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          <span className="text-foreground">{totalCategories}</span>
          <span className="text-muted-foreground/60"> categories</span>
          <span className="mx-2 text-muted-foreground/40">·</span>
          <span className="text-foreground">{totalHobbies}</span>
          <span className="text-muted-foreground/60"> hobbies</span>
        </p>
      </div>

      {/* Browse by category */}
      <div className="scroll-reveal mb-10">
        <h2 className="mb-4 text-sm font-medium text-foreground">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {HOBBY_CATEGORIES.map((category) => {
            const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
            const imgSrc = categoryImageSrc(category.name, 400);
            return (
              <Link key={category.name} href={`/hobbies/category/${catSlug}`}>
                <div className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30">
                  {imgSrc ? (
                    <div className="relative h-20 w-full overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={`${category.name} hobbies`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to top, rgba(12, 43, 41, 0.7), transparent)',
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 text-xl">{category.emoji}</span>
                    </div>
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center bg-card">
                      <span className="text-xl">{category.emoji}</span>
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground">{category.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {category.hobbies.length} hobbies
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-10">
        {HOBBY_CATEGORIES.map((category, idx) => {
          const borderColor = CATEGORY_BORDER_COLORS[idx % CATEGORY_BORDER_COLORS.length];
          const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <div key={category.name} className={`scroll-reveal border-l-2 pl-5 ${borderColor}`}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <Link href={`/hobbies/category/${catSlug}`}>
                  <h2 className="text-xl font-semibold text-foreground hover:text-lumi-400 transition-colors">
                    {category.name}
                  </h2>
                </Link>
                <Badge variant="outline" className="border-border text-xs text-muted-foreground/60">
                  {category.hobbies.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.hobbies.map((hobby) => (
                  <Link
                    key={hobby}
                    href={`/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, '-'))}`}
                    title={`${category.emoji} ${category.name}`}
                  >
                    <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-lumi-500/50 hover:text-lumi-400 cursor-pointer">
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
      <div className="mt-12 rounded-xl border border-border bg-lumi-500/10 p-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Famous Hobby Journeys</h2>
        <p className="text-sm text-muted-foreground mb-4">
          See how remarkable people&apos;s hobbies shaped who they became.
        </p>
        <Link href="/journeys" className="text-sm font-semibold text-lumi-400 hover:text-lumi-400">
          Explore journeys →
        </Link>
      </div>
    </div>
  );
}
