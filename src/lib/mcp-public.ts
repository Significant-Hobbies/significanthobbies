import { HOBBY_CATEGORIES, HOBBY_FACETS } from '@/lib/hobbies';
import {
  EXPERIENCE_ENTRIES,
  findExperience,
  firstSteps,
  relatedExperiences,
} from '@/lib/experiences';

export const MCP_PAGE_MAX = 50;

export function boundedPage(searchParams: URLSearchParams) {
  const parsedLimit = Number(searchParams.get('limit') ?? 10);
  const parsedOffset = Number(searchParams.get('offset') ?? 0);
  return {
    limit: Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MCP_PAGE_MAX) : 10,
    offset: Number.isInteger(parsedOffset) ? Math.min(Math.max(parsedOffset, 0), 10_000) : 0,
  };
}

function page<T>(items: T[], limit: number, offset: number) {
  const selected = items.slice(offset, offset + limit);
  return {
    generatedAt: new Date().toISOString(),
    items: selected,
    total: items.length,
    nextOffset: offset + selected.length < items.length ? offset + selected.length : null,
  };
}

export function searchPublicHobbies(searchParams: URLSearchParams) {
  const q = searchParams.get('q')?.trim().toLocaleLowerCase() ?? '';
  const category = searchParams.get('category')?.trim().toLocaleLowerCase() ?? '';
  const facet = searchParams.get('facet')?.trim().toLocaleLowerCase() ?? '';
  const { limit, offset } = boundedPage(searchParams);
  const hobbies = HOBBY_CATEGORIES.flatMap((group) =>
    group.hobbies.map((name) => ({
      id: name
        .toLocaleLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-|-$/g, ''),
      name,
      category: group.name,
      emoji: group.emoji,
      facets: HOBBY_FACETS[name] ?? [],
      canonicalUrl: `https://significanthobbies.com/hobbies/${encodeURIComponent(name.toLocaleLowerCase().replaceAll(' ', '-'))}`,
    }))
  ).filter(
    (item) =>
      (!q ||
        `${item.name} ${item.category} ${item.facets.join(' ')}`.toLocaleLowerCase().includes(q)) &&
      (!category || item.category.toLocaleLowerCase() === category) &&
      (!facet || item.facets.includes(facet as (typeof item.facets)[number]))
  );
  return page(hobbies, limit, offset);
}

export function searchPublicExperiences(searchParams: URLSearchParams) {
  const q = searchParams.get('q')?.trim().toLocaleLowerCase() ?? '';
  const category = searchParams.get('category')?.trim().toLocaleLowerCase() ?? '';
  const { limit, offset } = boundedPage(searchParams);
  const experiences = EXPERIENCE_ENTRIES.filter(
    (item) =>
      (!q || `${item.title} ${item.description ?? ''}`.toLocaleLowerCase().includes(q)) &&
      (!category || item.category.toLocaleLowerCase() === category)
  ).map((item) => ({
    ...item,
    canonicalUrl: `https://significanthobbies.com/experiences/${item.slug}`,
  }));
  return page(experiences, limit, offset);
}

export function getPublicExperience(slug: string) {
  const experience = findExperience(slug);
  if (!experience) return null;
  return {
    ...experience,
    firstSteps: firstSteps(experience),
    related: relatedExperiences(experience).map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.category,
      canonicalUrl: `https://significanthobbies.com/experiences/${item.slug}`,
    })),
    canonicalUrl: `https://significanthobbies.com/experiences/${experience.slug}`,
  };
}

export function publicTimelineRecord(row: {
  id: string;
  title: string | null;
  visibility: string;
  slug: string | null;
  phases: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userUsername: string | null;
}) {
  if (row.visibility !== 'PUBLIC') return null;
  let phases: unknown[] = [];
  try {
    const parsed = JSON.parse(row.phases) as unknown;
    if (Array.isArray(parsed)) phases = parsed;
  } catch {
    phases = [];
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    phases,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: row.userName ? { name: row.userName, username: row.userUsername } : null,
    canonicalUrl:
      row.userUsername && row.slug
        ? `https://significanthobbies.com/u/${encodeURIComponent(row.userUsername)}/${encodeURIComponent(row.slug)}`
        : `https://significanthobbies.com/timeline/${encodeURIComponent(row.id)}`,
  };
}
