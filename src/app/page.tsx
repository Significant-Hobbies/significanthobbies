import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { LandingClient } from "./_components/landing-client";

async function getDemoTimelines() {
  try {
    return await db.timeline.findMany({
      where: { visibility: "PUBLIC" },
      include: { user: { select: { name: true, username: true } } },
      orderBy: { createdAt: "asc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Logged in but no username → onboarding
    if (!session.user.username) {
      redirect("/setup");
    }
    // Logged in with username → dashboard
    redirect("/dashboard");
  }

  const rawDemos = await getDemoTimelines();

  const demos = rawDemos.map((t) => ({
    id: t.id,
    title: t.title,
    phases: typeof t.phases === "string" ? t.phases : JSON.stringify(t.phases),
    user: t.user ?? null,
  }));

  return <LandingClient demos={demos} />;
}
