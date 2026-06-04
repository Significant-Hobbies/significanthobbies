import { db } from "~/server/db";
import { LandingClient } from "./_components/landing-client";
import { eq, asc } from "drizzle-orm";
import { timelines, users } from "~/db/schema";

// ISR — the demo timelines change rarely (curated public PUBLIC rows), so
// we render this page at build/edge revalidate cadence instead of
// re-reading Turso on every request. Signed-in redirect lives in
// middleware.ts now, so this route stays statically renderable.
export const revalidate = 3600;

// Edge cache key for the demo timelines list. Bump the version suffix
// when the underlying schema or rendering changes so old CF Edge entries
// are invalidated naturally.
const DEMO_TIMELINES_CACHE_URL =
  "https://internal-cache/demo-timelines:v1";
const DEMO_TIMELINES_TTL_SECONDS = 3600;

type DemoTimelineRow = {
  id: string;
  title: string | null;
  slug: string | null;
  phases: string;
  userName: string | null;
  userUsername: string | null;
};

async function getDemoTimelines(): Promise<DemoTimelineRow[]> {
  // Wrap the Turso read in caches.default so warm CF Edge requests skip
  // the DB round-trip (~500ms → ~50ms). ISR (revalidate above) handles
  // the Next.js fetch cache layer; this wrapper guards the Worker layer.
  // Guarded with try/catch + a globalThis check so `next build` (Node,
  // no Workers runtime) doesn't crash.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = (globalThis as any).caches?.default as Cache | undefined;

  if (cache) {
    try {
      const cached = await cache.match(DEMO_TIMELINES_CACHE_URL);
      if (cached) {
        return (await cached.json()) as DemoTimelineRow[];
      }
    } catch {
      // Cache read failure — fall through to DB.
    }
  }

  let rows: DemoTimelineRow[] = [];
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
    return [];
  }

  if (cache) {
    try {
      const response = new Response(JSON.stringify(rows), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${DEMO_TIMELINES_TTL_SECONDS}, s-maxage=${DEMO_TIMELINES_TTL_SECONDS}`,
        },
      });
      // Server-component fire-and-forget — no ctx.waitUntil available.
      void cache.put(DEMO_TIMELINES_CACHE_URL, response);
    } catch {
      // Cache put failure is non-fatal — request continues.
    }
  }

  return rows;
}

export default async function HomePage() {
  const rawDemos = await getDemoTimelines();

  const demos = rawDemos.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    phases: t.phases,
    user: t.userName ? { name: t.userName, username: t.userUsername } : null,
  }));

  return <LandingClient demos={demos} />;
}
