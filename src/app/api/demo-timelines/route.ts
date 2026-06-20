import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { timelines, users } from "~/db/schema";
import { db } from "~/server/db";

const DEMO_TIMELINES_CACHE_URL = "https://internal-cache/demo-timelines:v1";
const DEMO_TIMELINES_TTL_SECONDS = 3600;

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = (globalThis as any).caches?.default as Cache | undefined;

  if (cache) {
    try {
      const cached = await cache.match(DEMO_TIMELINES_CACHE_URL);
      if (cached) {
        return cached;
      }
    } catch {
      // fall through to DB
    }
  }

  let rows: Array<{
    id: string;
    title: string | null;
    slug: string | null;
    phases: string;
    userName: string | null;
    userUsername: string | null;
  }> = [];

  try {
    rows = await db
      .select({
        id: timelines.id,
        title: timelines.title,
        slug: timelines.slug,
        phases: timelines.phases,
        userName: users.name,
        userUsername: users.username,
      })
      .from(timelines)
      .leftJoin(users, eq(timelines.userId, users.id))
      .where(eq(timelines.visibility, "PUBLIC"))
      .orderBy(asc(timelines.createdAt))
      .limit(3);
  } catch {
    rows = [];
  }

  const body = rows.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    phases: t.phases,
    user: t.userName ? { name: t.userName, username: t.userUsername } : null,
  }));

  const response = NextResponse.json(body, {
    headers: {
      "Cache-Control": `public, max-age=${DEMO_TIMELINES_TTL_SECONDS}, s-maxage=${DEMO_TIMELINES_TTL_SECONDS}`,
    },
  });

  if (cache) {
    void cache.put(DEMO_TIMELINES_CACHE_URL, response.clone());
  }

  return response;
}