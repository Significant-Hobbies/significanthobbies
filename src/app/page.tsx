import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { LandingClient } from "./_components/landing-client";
import { eq, asc } from "drizzle-orm";
import { timelines, users } from "~/db/schema";

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
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Logged in but no username -> onboarding
    if (!session.user.username) {
      redirect("/setup");
    }
    // Logged in with username -> dashboard
    redirect("/dashboard");
  }

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
