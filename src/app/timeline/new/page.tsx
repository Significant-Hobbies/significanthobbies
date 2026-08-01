import { eq } from 'drizzle-orm';
import Link from 'next/link';

import { SpotlightCard } from '~/components/aceternity';
import { JsonLd } from '~/components/json-ld';
import { TimelineBuilder } from '~/components/timeline-builder/builder';
import { users } from '~/db/schema';
import { buildFirstTimelineStarter } from '~/lib/first-timeline';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = { title: 'New Timeline — SignificantHobbies' };

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function NewTimelinePage({ searchParams }: Props) {
  const { from } = await searchParams;
  const session = await getServerAuthSession();
  let starter = null;

  if (from === 'setup') {
    if (session?.user?.id) {
      const profile = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { onboardingData: true },
      });
      const onboarding = parseJSONColumn<{ droppedHobby?: unknown }>(
        profile?.onboardingData,
        {},
        'new-timeline:onboardingData'
      );
      starter = buildFirstTimelineStarter(onboarding.droppedHobby);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SignificantHobbies Timeline Builder',
          description:
            'Build a visual timeline of your hobbies across life phases. Discover your hobby personality and share your journey.',
          url: 'https://significanthobbies.com/timeline/new',
          applicationCategory: 'LifestyleApplication',
          offers: { '@type': 'Offer', price: '0' },
        }}
      />
      <div className="relative mb-8 rounded-[1.75rem] bg-[#b9dcf5] px-6 py-9 text-[#192a36] shadow-[0_14px_40px_rgba(39,74,97,0.10)] sm:px-9">
        <div className="relative max-w-2xl">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <h1 className="font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em]">
            Build your hobby timeline
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#405b6c]">
            {starter
              ? `We started with ${starter.hobbyName}. Shape it into a story that feels true.`
              : 'Add life phases and the hobbies that defined each one.'}
          </p>
        </div>
      </div>
      {/* Builder panel with spotlight glow */}
      <SpotlightCard className="shadow-soft" innerClassName="p-1">
        <div className="relative overflow-hidden rounded-xl">
          <TimelineBuilder starter={starter} isAuthenticated={Boolean(session?.user)} />
        </div>
      </SpotlightCard>
    </div>
  );
}
