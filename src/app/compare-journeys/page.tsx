import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { timelines,users } from "~/db/schema";
import type { Phase } from "~/lib/types";
import { db } from "~/server/db";

import { CompareJourneysClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Compare Hobby Journeys — SignificantHobbies",
  description:
    "Compare your hobby timeline with a friend. See what hobbies you share, what's unique to each of you, and discover your combined personality.",
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function CompareJourneysPage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  const usernameA = a?.trim() ?? null;
  const usernameB = b?.trim() ?? null;

  let userA: { username: string; phases: Phase[] } | null = null;
  let userB: { username: string; phases: Phase[] } | null = null;

  if (usernameA) {
    const raw = await db.query.users.findFirst({
      where: eq(users.username, usernameA),
      columns: { id: true, username: true },
    });
    if (raw) {
      const properTimelines = await db
        .select({ phases: timelines.phases, visibility: timelines.visibility })
        .from(timelines)
        .where(eq(timelines.userId, raw.id));

      const phases: Phase[] = properTimelines
        .filter((t) => t.visibility === "PUBLIC" || t.visibility === "UNLISTED")
        .flatMap((t) => {
          try { return JSON.parse(t.phases) as Phase[]; } catch { return []; }
        });
      userA = { username: raw.username ?? usernameA, phases };
    }
  }

  if (usernameB) {
    const raw = await db.query.users.findFirst({
      where: eq(users.username, usernameB),
      columns: { id: true, username: true },
    });
    if (raw) {
      const properTimelines = await db
        .select({ phases: timelines.phases, visibility: timelines.visibility })
        .from(timelines)
        .where(eq(timelines.userId, raw.id));

      const phases: Phase[] = properTimelines
        .filter((t) => t.visibility === "PUBLIC" || t.visibility === "UNLISTED")
        .flatMap((t) => {
          try { return JSON.parse(t.phases) as Phase[]; } catch { return []; }
        });
      userB = { username: raw.username ?? usernameB, phases };
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-stone-900">Compare hobby journeys</h1>
        <p className="mt-2 text-stone-500">
          See shared hobbies, diverging paths, and your combined personality archetype.
        </p>
      </div>
      <CompareJourneysClient
        userA={userA}
        userB={userB}
        paramA={usernameA}
        paramB={usernameB}
      />
    </div>
  );
}
