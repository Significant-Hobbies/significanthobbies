import { db } from "~/server/db";
import { LandingClient } from "./_components/landing-client";
import { eq, asc } from "drizzle-orm";
import { timelines, users } from "~/db/schema";

// ISR — the demo timelines change rarely (curated public PUBLIC rows), so
// we render this page at build/edge revalidate cadence instead of
// re-reading Turso on every request. Signed-in redirect lives in
// middleware.ts now, so this route stays statically renderable.

async function getDemoTimelines() {
  try {
    const rows = await db
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
    return rows;
  } catch {
    return [];
  }
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
