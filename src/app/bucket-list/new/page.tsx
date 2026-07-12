import type { Metadata } from "next";
import { BucketListWorkspace } from "~/components/bucket-list/bucket-list-workspace";
import { getServerAuthSession } from "~/server/auth";
import { getQuestById } from "~/lib/side-quests";

export const metadata: Metadata = {
  title: "Make Your Bucket List",
  description: "Create a personal bucket list and turn it into a playable Life Bingo board.",
  robots: { index: false, follow: false },
};

export default async function NewBucketListPage({ searchParams }: { searchParams: Promise<{ quest?: string; idea?: string; source?: string }> }) {
  const session = await getServerAuthSession();
  const { quest: questId, idea, source } = await searchParams;
  const quest = questId ? getQuestById(questId) : null;
  const queuedIdea = idea?.trim().slice(0, 140);
  return (
    <BucketListWorkspace
      isAuthenticated={Boolean(session?.user)}
      queuedQuest={quest
        ? { id: quest.id, title: quest.title }
        : queuedIdea
          ? { id: `video:${source?.trim().slice(0, 80) || "idea"}`, title: queuedIdea }
          : null}
    />
  );
}
