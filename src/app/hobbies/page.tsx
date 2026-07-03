import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { Badge } from '~/components/ui/badge';
import { categoryImageSrc } from '~/lib/category-images';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';

export const metadata = {
  title: 'Hobby Directory — SignificantHobbies',
  description:
    'Browse 110+ hobbies across 10 categories. Find your next passion — from creative arts and music to outdoor adventures and making.',
};

export default function HobbiesPage() {
  const totalCategories = HOBBY_CATEGORIES.length;
  const totalHobbies = HOBBY_CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero header with grid background */}
      <div className="relative mb-10 overflow-hidden rounded-2xl">
        <GridBackground variant="dots" size={22} />
        <FadeIn className="relative px-2 pt-8 pb-6 sm:px-6">
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
        </FadeIn>
      </div>

      {/* Browse by category */}
      <FadeIn className="mb-10" delay={0.1}>
        <h2 className="mb-4 text-sm font-medium text-foreground">Browse by category</h2>
        <StaggerContainer
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
          staggerDelay={0.05}
        >
          {HOBBY_CATEGORIES.map((category) => {
            const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
            const imgSrc = categoryImageSrc(category.name, 400);
            return (
              <StaggerItem key={category.name}>
                <Link href={`/hobbies/category/${catSlug}`} prefetch={false} className="block">
                  <CardHoverEffect className="overflow-hidden rounded-lg p-0">
                    {imgSrc ? (
                      <div className="relative h-20 w-full overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={`${category.name} hobbies`}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
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
                  </CardHoverEffect>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </FadeIn>

      <StaggerContainer className="space-y-10" staggerDelay={0.08}>
        {HOBBY_CATEGORIES.map((category) => {
          const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <StaggerItem key={category.name}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <Link href={`/hobbies/category/${catSlug}`} prefetch={false}>
                  <h2 className="text-xl font-semibold text-foreground hover:text-foreground transition-colors">
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
                    prefetch={false}
                  >
                    <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground cursor-pointer">
                      {hobby}
                    </span>
                  </Link>
                ))}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Famous Hobby Journeys link */}
      <div className="mt-12 rounded-xl border border-border bg-foreground/10 p-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Famous Hobby Journeys</h2>
        <p className="text-sm text-muted-foreground mb-4">
          See how remarkable people&apos;s hobbies shaped who they became.
        </p>
        <Link
          href="/journeys"
          className="text-sm font-semibold text-foreground hover:text-foreground"
        >
          Explore journeys →
        </Link>
      </div>
    </div>
  );
}
