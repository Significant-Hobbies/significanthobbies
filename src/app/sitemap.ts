import { and, eq, isNotNull, max, sql } from 'drizzle-orm';
import type { MetadataRoute } from 'next';

import { timelines, users } from '~/db/schema';
import { editorialArticles } from '~/lib/editorial-content';
import { FAMOUS_BUCKET_LISTS } from '~/lib/famous-bucket-lists';
import { FAMOUS_JOURNEYS } from '~/lib/famous-journeys';
import { PAGED_EXPERIENCES } from '~/lib/experiences';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';
import { db } from '~/server/db';

export const revalidate = 3600;

/**
 * Public profiles that have something to show.
 *
 * Only users with a username and at least one PUBLIC timeline are listed —
 * an empty profile is a thin page, and PRIVATE/UNLISTED content must never be
 * advertised to crawlers. `lastModified` is the newest public timeline update,
 * so a profile's freshness tracks the work behind it.
 *
 * Returns [] on failure: a database hiccup should degrade the sitemap, never
 * 500 it and lose the static entries with it.
 */
async function publicProfileEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await db
      .select({
        username: users.username,
        lastUpdated: max(timelines.updatedAt),
      })
      .from(users)
      .innerJoin(timelines, eq(timelines.userId, users.id))
      .where(and(isNotNull(users.username), eq(timelines.visibility, 'PUBLIC')))
      .groupBy(users.username)
      .orderBy(sql`max(${timelines.updatedAt}) desc`)
      .limit(5000);

    return rows.flatMap((row) =>
      row.username
        ? [
            {
              url: `${baseUrl}/u/${encodeURIComponent(row.username)}`,
              lastModified: row.lastUpdated ? new Date(row.lastUpdated) : new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.6,
            },
          ]
        : []
    );
  } catch (err) {
    // Server-side log, not `captureError` from ~/lib/foundry-monitoring: that
    // module is 'use client' and wraps posthog-js. Importing it here made the
    // sitemap route a client boundary, and `next build` failed prerendering
    // /sitemap.xml with "Attempted to call captureError() from the server".
    // The whole deploy died at the build step because of it.
    console.error('[sitemap] public_profiles query failed', err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://significanthobbies.com';
  const now = new Date();
  const profilePages = await publicProfileEntries(baseUrl);

  const categoryPages = [
    'creative',
    'music',
    'physical',
    'intellectual',
    'gaming',
    'outdoor',
    'culinary',
    'collecting',
    'making',
    'social',
  ].map((slug) => ({
    url: `${baseUrl}/hobbies/category/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const hobbyPages = HOBBY_CATEGORIES.flatMap((cat) =>
    cat.hobbies.map((hobby) => ({
      url: `${baseUrl}/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, '-'))}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  const blogPages = editorialArticles.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const bucketListPages = FAMOUS_BUCKET_LISTS.map((l) => ({
    url: `${baseUrl}/bucket-lists/${l.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/hobbies`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/what-are-significant-hobbies`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/manifesto`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/life-in-weeks`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Only the entries with written prose. The bare ideas are browsable on the
    // index but have no page, so listing them here would point crawlers at
    // 404s — and thin pages are a site-wide signal worth protecting the 122
    // hobby pages from.
    ...PAGED_EXPERIENCES.map((e) => ({
      url: `${baseUrl}/experiences/${e.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // /journeys and its 36 detail pages were absent entirely — the largest
    // content file in the repo (famous-journeys.ts: 36 lives, 127 phases) was
    // invisible to crawlers as well as to users.
    {
      url: `${baseUrl}/journeys`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...FAMOUS_JOURNEYS.map((j) => ({
      url: `${baseUrl}/journeys/${j.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...categoryPages,
    {
      url: `${baseUrl}/hobbies-for-adults`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-for-mental-health`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-for-resume`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-to-try`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cheap-hobbies`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/starter-kits`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Free tools + acquisition funnels
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/time-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/cost-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/find-your-hobby`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/hobbies/random`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/index.md`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/side-quests`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bucket-lists`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bucket-list-ideas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-to-make-a-bucket-list`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/bucket-list-before-30`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/bucket-list-before-50`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/travel-bucket-list`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/life-bingo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...bucketListPages,
    ...hobbyPages,
    ...blogPages,
    ...profilePages,
  ];
}
