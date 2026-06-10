export const dynamic = "force-dynamic";

import { type MetadataRoute } from "next";
import { db } from "~/server/db";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";
import { blogPosts } from "~/lib/blog-posts";
import { eq, isNotNull } from "drizzle-orm";
import { timelines, users } from "~/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://significanthobbies.com";
  const now = new Date();

  // The static portion of the sitemap (landing, category pages, blog) must
  // ship even if Turso is unreachable. Dynamic rows degrade to empty.
  let publicTimelineRows: Array<{
    id: string;
    slug: string | null;
    updatedAt: Date;
    userUsername: string | null;
  }> = [];
  let userRows: Array<{ username: string | null }> = [];

  try {
    publicTimelineRows = await db
      .select({
        id: timelines.id,
        slug: timelines.slug,
        updatedAt: timelines.updatedAt,
        userUsername: users.username,
      })
      .from(timelines)
      .leftJoin(users, eq(timelines.userId, users.id))
      .where(eq(timelines.visibility, "PUBLIC"));

    userRows = await db
      .select({ username: users.username })
      .from(users)
      .where(isNotNull(users.username));
  } catch (err) {
    console.error("sitemap: dynamic rows fetch failed; returning static only", err);
  }

  const categoryPages = [
    "creative",
    "music",
    "physical",
    "intellectual",
    "gaming",
    "outdoor",
    "culinary",
    "collecting",
    "making",
    "social",
  ].map((slug) => ({
    url: `${baseUrl}/hobbies/category/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const hobbyPages = HOBBY_CATEGORIES.flatMap((cat) =>
    cat.hobbies.map((hobby) => ({
      url: `${baseUrl}/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/hobbies`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/what-are-significant-hobbies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...categoryPages,
    {
      url: `${baseUrl}/hobbies-for-adults`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-for-mental-health`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-for-resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hobbies-to-try`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cheap-hobbies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/starter-kits`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/side-quests`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...hobbyPages,
    ...blogPages,
    ...publicTimelineRows.map((t) => ({
      url: t.userUsername && t.slug
        ? `${baseUrl}/u/${t.userUsername}/${t.slug}`
        : `${baseUrl}/timeline/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...userRows
      .filter((u) => u.username !== null)
      .map((u) => ({
        url: `${baseUrl}/u/${u.username!}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}
