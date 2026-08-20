import { eq } from 'drizzle-orm';
import { ArrowRight, Dice5, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BucketInsights } from '~/components/bucket-list/bucket-insights';
import { DailyNewThing } from '~/components/daily-new-thing';
import { DailyNewThingHistory } from '~/components/daily-new-thing-history';
import { LiveMoreBucketFocus } from '~/components/live-more-bucket-focus';
import { LiveMoreDiscovery } from '~/components/live-more-discovery';
import { LocalLiveMore } from '~/components/local-live-more';
import { LocalOnboardingGate } from '~/components/local-onboarding-gate';
import { bucketListItems, users } from '~/db/schema';
import { getAllJournalEntries, setDailyNovelty } from '~/lib/actions/daily';
import { getBucketListSuggestions } from '~/lib/bucket-list-insights';
import { dayKeyIn } from '~/lib/day';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Live More — Significant Hobbies',
  robots: { index: false, follow: false },
};

const fitReasons: Record<string, string> = {
  travel: 'A change of place may be the contrast your current list is missing.',
  adventure: 'This adds courage, novelty, and a story worth remembering.',
  creative: 'Your hands and attention get to make something real.',
  achievement: 'A meaningful stretch can become part of this year’s chapter.',
  social: 'This is really an excuse to make a memory with other people.',
  humanitarian: 'A possibility that leaves something useful behind.',
};

export default async function LiveMorePage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    const localSuggestions = getBucketListSuggestions([], 24, new Date().getFullYear()).map(
      (suggestion) => ({
        ...suggestion,
        reason: fitReasons[suggestion.category] ?? 'A different kind of life experience.',
      })
    );
    return (
      <LocalOnboardingGate>
        <LocalLiveMore suggestions={localSuggestions} />
      </LocalOnboardingGate>
    );
  }

  const account = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { onboardingCompletedAt: true, timezone: true },
  });
  if (!account?.onboardingCompletedAt) redirect('/onboarding');

  const [items, journalEntries] = await Promise.all([
    db.query.bucketListItems.findMany({
      where: eq(bucketListItems.userId, session.user.id),
      orderBy: (item, { desc }) => [desc(item.updatedAt)],
    }),
    getAllJournalEntries(),
  ]);
  const active = items.filter((item) => item.status !== 'done');
  const year = new Date().getFullYear();
  const yearFocus = active.filter(
    (item) => item.targetYear === year || item.status === 'in_progress'
  );
  const suggestions = getBucketListSuggestions(items, 24, year).map((suggestion) => ({
    ...suggestion,
    reason:
      fitReasons[suggestion.category] ??
      'This introduces a different kind of experience to your current list.',
  }));
  const today = dayKeyIn(account.timezone);

  return (
    <div className="bg-[#fbf8ef] px-4 py-8 text-[#211e18] sm:py-12">
      <div className="mx-auto max-w-6xl space-y-10 sm:space-y-14">
        <LiveMoreBucketFocus
          name={session.user.name?.split(' ')[0]}
          mode="account"
          initialItems={active.map((item) => ({ id: item.id, title: item.title }))}
          goals={yearFocus.map((item) => item.title)}
        />

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <DailyNewThing
            today={today}
            selectedDate={today}
            seed={session.user.id}
            records={journalEntries}
            persist={setDailyNovelty}
          />
          <DailyNewThingHistory records={journalEntries} />
        </section>

        <LiveMoreDiscovery suggestions={suggestions} />

        <section className="grid gap-4 sm:grid-cols-2">
          <ActionPath
            href="/life-bingo"
            color="bg-[#f7e957]"
            icon={<Dice5 className="size-6" />}
            title="Make the year playful"
            copy="Turn possibility into a Bingo board of small, surprising wins."
            action="Play Life Bingo"
          />
          <ActionPath
            href="/find-your-hobby"
            color="bg-[#b9dcf5]"
            icon={<Sparkles className="size-6" />}
            title="Find another interest"
            copy="Use the focused hobby quiz when you want a new recurring practice."
            action="Find my hobby"
          />
        </section>

        {items.length > 0 ? <BucketInsights items={items} /> : null}
      </div>
    </div>
  );
}

function ActionPath({
  href,
  color,
  icon,
  title,
  copy,
  action,
}: {
  href: string;
  color: string;
  icon: React.ReactNode;
  title: string;
  copy: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-72 flex-col justify-between rounded-[1.5rem] p-6 ${color}`}
    >
      {icon}
      <div>
        <h2 className="font-serif text-3xl leading-tight">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-70">{copy}</p>
        <span className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-bold">
          {action} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
