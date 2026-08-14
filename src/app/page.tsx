import { and, desc, eq } from 'drizzle-orm';
import { ArrowRight, Check, Circle, Clock3, ListChecks, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LocalRootExperience } from '~/components/local-root-experience';
import { TimezoneSync } from '~/components/timezone-sync';
import { bucketListItems, habitLogs, habits, journalEntries, users } from '~/db/schema';
import { dayKeyIn } from '~/lib/day';
import { lifeInWeeksFromDate, parseBirthDate } from '~/lib/life-in-weeks';
import { LOCAL_WORKSPACE_COOKIE } from '~/lib/local-workspace-cookie';
import { BRAND_NAME } from '~/lib/site-metadata';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${BRAND_NAME} — Your Hobby Journey`,
  description:
    'Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.',
  alternates: { canonical: 'https://significanthobbies.com' },
};

export default async function HomePage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    const cookieStore = await cookies();
    return (
      <LocalRootExperience
        initialComplete={cookieStore.get(LOCAL_WORKSPACE_COOKIE)?.value === '1'}
      />
    );
  }

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { name: true, timezone: true, birthDate: true, onboardingCompletedAt: true },
  });
  if (!me?.onboardingCompletedAt) redirect('/onboarding');
  const today = dayKeyIn(me?.timezone);
  const [activeHabits, logs, journal, bucketItems] = await Promise.all([
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.status, 'active')))
      .limit(8),
    db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, session.user.id), eq(habitLogs.dayDate, today))),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, session.user.id), eq(journalEntries.dayDate, today)))
      .limit(1),
    db
      .select()
      .from(bucketListItems)
      .where(eq(bucketListItems.userId, session.user.id))
      .orderBy(desc(bucketListItems.updatedAt))
      .limit(4),
  ]);

  const completed = new Set(logs.filter((log) => log.completed).map((log) => log.habitId));
  const journalStarted = Boolean(journal[0]?.amEntry?.trim() || journal[0]?.pmEntry?.trim());
  const firstName = (me?.name ?? session.user.name ?? 'there').split(' ')[0];
  const nextItem =
    bucketItems.find((item) => item.status === 'in_progress') ??
    bucketItems.find((item) => item.status === 'planned');
  const birthDate = me?.birthDate ? parseBirthDate(me.birthDate) : null;
  const life = birthDate ? lifeInWeeksFromDate(birthDate) : null;
  const quotes = [
    'Today is the first day of the rest of your life.',
    'The way we spend our days is, of course, the way we spend our lives.',
    'Life is what happens while you are busy making other plans.',
    'Do not wait for a special occasion. Being alive is the special occasion.',
  ];
  const quote = quotes[Number(today.replaceAll('-', '')) % quotes.length];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fbf8ef] px-4 py-8 text-[#211e18] sm:py-12">
      <TimezoneSync storedTimezone={me?.timezone ?? null} />
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] bg-[#f7e957] shadow-[0_18px_45px_rgba(85,72,24,0.10)]">
          <div className="grid lg:grid-cols-[1fr_22rem]">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em]">Today · {today}</p>
              <div className="mt-3">
                <h1 className="font-serif text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
                  Live it, {firstName}.
                </h1>
                <blockquote className="mt-5 max-w-2xl font-serif text-xl leading-snug text-[#3e3924] sm:text-2xl">
                  “{quote}”
                </blockquote>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-[#211e18] p-6 text-white sm:p-8">
              <Clock3 className="size-6 text-[#f7e957]" />
              <div className="mt-10">
                {life ? (
                  <>
                    <p className="font-serif text-5xl tabular-nums text-[#f7e957]">
                      {life.weeksRemaining.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      Saturdays, roughly. Not a prediction.
                    </p>
                  </>
                ) : (
                  <p className="font-serif text-2xl">Make the time visible.</p>
                )}
              </div>
              <Link
                href="/life-in-weeks"
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b-2 border-[#f7e957] font-bold"
              >
                {life ? 'See your life in weeks' : 'Add your birth date'}{' '}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.75rem] border border-[#d9cfbd] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#176b4a]">Today&apos;s practice</p>
                <h2 className="mt-1 font-serif text-3xl">Habits</h2>
              </div>
              <Link href="/daily" className="text-sm font-bold underline underline-offset-4">
                Check in
              </Link>
            </div>
            {activeHabits.length ? (
              <ul className="mt-5 divide-y divide-[#ece5d8]">
                {activeHabits.map((habit) => {
                  const done = completed.has(habit.id);
                  return (
                    <li key={habit.id} className="flex items-center gap-3 py-3 text-base">
                      <span
                        className={`flex size-8 items-center justify-center rounded-full ${done ? 'bg-[#176b4a] text-white' : 'border-2 border-[#cfc5b3] text-[#9c927f]'}`}
                      >
                        {done ? <Check className="size-4" /> : <Circle className="size-3" />}
                      </span>
                      <span className={done ? 'text-[#716b60] line-through' : ''}>
                        {habit.icon ? `${habit.icon} ` : ''}
                        {habit.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty
                copy="Start with one small thing worth repeating."
                href="/daily"
                action="Create a habit"
              />
            )}
          </section>

          <section className="rounded-[1.75rem] bg-[#c5abfa] p-6 sm:p-8">
            <NotebookPen className="size-6" />
            <p className="mt-5 text-sm font-bold">Journal</p>
            <h2 className="mt-1 font-serif text-3xl">
              {journalStarted ? 'You left a note for today.' : 'What is alive for you?'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#44375c]">
              One honest sentence is enough. Morning focus and evening reflection live together.
            </p>
            <Link
              href="/daily"
              className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-bold"
            >
              {journalStarted ? 'Continue writing' : 'Begin today'}{' '}
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>

        <div>
          <section className="rounded-[1.75rem] bg-[#ffd0bd] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <ListChecks className="size-6" />
              <Link href="/live-more" className="text-sm font-bold underline underline-offset-4">
                Manage in Live More
              </Link>
            </div>
            <p className="mt-8 text-sm font-bold">What&apos;s next?</p>
            <h2 className="mt-2 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              {nextItem?.title ?? 'Choose one thing you do not want to leave unlived.'}
            </h2>
            <Link
              href={nextItem ? '/bucket-list' : '/live-more#discover'}
              className="mt-7 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-bold"
            >
              {nextItem ? 'Move it forward' : 'Discover what is possible'}{' '}
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function Empty({ copy, href, action }: { copy: string; href: string; action: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[#cfc5b3] bg-[#fffdf8] p-6">
      <p className="text-[#625b50]">{copy}</p>
      <Link href={href} className="mt-3 inline-flex font-bold underline underline-offset-4">
        {action} →
      </Link>
    </div>
  );
}
