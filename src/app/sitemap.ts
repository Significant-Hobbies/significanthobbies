import { type MetadataRoute } from "next";
import { db } from "~/server/db";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";
import { blogPosts } from "~/lib/blog-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://significanthobbies.com";
  const now = new Date();

  const publicTimelines = await db.timeline.findMany({
    where: { visibility: "PUBLIC" },
    select: { id: true, slug: true, updatedAt: true, user: { select: { username: true } } },
  });

  const users = await db.user.findMany({
    where: { username: { not: null } },
    select: { username: true },
  });

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
    ...publicTimelines.map((t) => ({
      url: t.user?.username && t.slug
        ? `${baseUrl}/u/${t.user.username}/${t.slug}`
        : `${baseUrl}/timeline/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...users
      .filter((u) => u.username !== null)
      .map((u) => ({
        url: `${baseUrl}/u/${u.username!}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}
