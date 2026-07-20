// Maps hobby categories to their header images (optimized WebP in /public/categories).
// Photos are curated from Unsplash (free license). See scripts/optimize-images.mjs
// for the source JPGs and resize pipeline.

const CATEGORY_IMAGE_SLUGS: Record<string, string> = {
  Creative: 'creative',
  Music: 'music',
  Physical: 'physical',
  Intellectual: 'intellectual',
  Gaming: 'gaming',
  Outdoor: 'outdoor',
  Culinary: 'culinary',
  Collecting: 'collecting',
  Making: 'making',
  Social: 'social',
};

export function categoryImageSrc(name: string, width: number = 800): string | null {
  const slug = CATEGORY_IMAGE_SLUGS[name];
  if (!slug) return null;
  // Use the closest available width (400, 800, 1200)
  const available = [400, 800, 1200];
  const closest = available.reduce((prev, curr) =>
    Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
  );
  return `/categories/${slug}-${closest}.webp`;
}

export function categoryImageSrcSet(name: string): string | null {
  const slug = CATEGORY_IMAGE_SLUGS[name];
  if (!slug) return null;
  return `/categories/${slug}-400.webp 400w, /categories/${slug}-800.webp 800w, /categories/${slug}-1200.webp 1200w`;
}
