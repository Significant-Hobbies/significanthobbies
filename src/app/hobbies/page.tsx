import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { categoryImageSrc, categoryImageSrcSet } from '~/lib/category-images';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';
import { cn } from '~/lib/utils';

export const metadata = {
  title: 'Hobby Directory — SignificantHobbies',
  description:
    'Browse 110+ hobbies across 10 categories. Find your next passion — from creative arts and music to outdoor adventures and making.',
  alternates: { canonical: '/hobbies' },
};

export default function HobbiesPage() {
  const totalCategories = HOBBY_CATEGORIES.length;
  const totalHobbies = HOBBY_CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* ─── Premium editorial header ─────────────────────────────────────── */}
      <div className="relative mb-14 overflow-hidden rounded-3xl border border-border/60">
        <GridBackground variant="dots" size={22} />
        {/* Soft gold glow at top */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'oklch(0.82 0.13 88 / 0.5)' }}
          aria-hidden="true"
        />
        <FadeIn className="relative px-6 pt-16 pb-12 text-center sm:px-10">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Hobby Directory
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            A curated index of pursuits worth a life. Browse by category, then dive into the
            community timeline behind each one.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {totalHobbies} hobbies across {totalCategories} categories.
          </p>
        </FadeIn>
      </div>

      {/* ─── Browse by category — image cards ─────────────────────────────── */}
      <FadeIn className="mb-16" delay={0.1}>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
            Browse by category
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Ten worlds, one hundred plus crafts
          </p>
        </div>
        <StaggerContainer
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
          staggerDelay={0.05}
        >
          {HOBBY_CATEGORIES.map((category) => {
            const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
            const imgSrc = categoryImageSrc(category.name, 600);
            const srcSet = categoryImageSrcSet(category.name);
            return (
              <StaggerItem key={category.name}>
                <Link href={`/hobbies/category/${catSlug}`} prefetch={false} className="block">
                  <CardHoverEffect className="overflow-hidden rounded-2xl p-0 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                    <div className="relative h-40 w-full overflow-hidden sm:h-44">
                      {imgSrc ? (
                        <>
                          <img
                            src={imgSrc}
                            srcSet={srcSet ?? undefined}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                            alt={`${category.name} hobbies`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Dark gradient overlay: charcoal 80% at bottom → transparent at top */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card">
                          <span className="text-3xl">{category.emoji}</span>
                        </div>
                      )}
                      {/* Overlaid content at the bottom of the image */}
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                            {category.hobbies.length}
                          </span>
                        </div>
                        <p className="font-serif text-sm font-semibold leading-tight text-foreground drop-shadow-sm">
                          {category.name}
                        </p>
                      </div>
                    </div>
                  </CardHoverEffect>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </FadeIn>

      {/* ─── Category sections with hobby cards ────────────────────────────── */}
      <StaggerContainer className="space-y-14" staggerDelay={0.08}>
        {HOBBY_CATEGORIES.map((category) => {
          const catSlug = category.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <StaggerItem key={category.name}>
              {/* Section header */}
              <div className="mb-5 flex items-center gap-3">
                <Link href={`/hobbies/category/${catSlug}`} prefetch={false} className="group">
                  <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </h2>
                </Link>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {category.hobbies.length} hobbies
                </span>
              </div>
              {/* Divider */}
              <div className="mb-5 h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
              {/* Hobby cards grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {category.hobbies.map((hobby) => (
                  <Link
                    key={hobby}
                    href={`/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, '-'))}`}
                    title={category.name}
                    prefetch={false}
                  >
                    <div
                      className={cn(
                        'group flex items-center justify-between gap-2 rounded-lg border border-border bg-transparent px-4 py-3',
                        'transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-soft'
                      )}
                    >
                      <span className="text-sm font-medium text-foreground/90 transition-colors group-hover:text-foreground">
                        {hobby}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* ─── Famous Hobby Journeys callout ─────────────────────────────────── */}
      <FadeIn className="mt-16" delay={0.1}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-background p-8 text-center shadow-soft sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-10 blur-2xl"
            style={{ background: 'oklch(0.82 0.13 88)' }}
            aria-hidden="true"
          />
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Famous Hobby Journeys
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            See how remarkable people&apos;s hobbies shaped who they became.
          </p>
          <Link
            href="/journeys"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.02]"
          >
            Explore journeys
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
