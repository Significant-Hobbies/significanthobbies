import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

import {
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { timelines, users } from '~/db/schema';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

export const metadata = {
  title: 'Recent timelines — Significant Hobbies',
  description: 'Newest public timelines, newest first. Discover what people are mapping.',
};

export const dynamic = 'force-dynamic';

interface Phase {
  id?: string;
  label?: string;
  hobbies?: Array<{ name?: string }>;
}

function parsePhases(raw: string): Phase[] {
  const v = parseJSONColumn<unknown>(raw, null, 'recent-timelines:phases');
  return Array.isArray(v) ? v : [];
}

export default async function RecentTimelinesPage() {
  const rows = await db
    .select({
      id: timelines.id,
      slug: timelines.slug,
      title: timelines.title,
      phases: timelines.phases,
      updatedAt: timelines.updatedAt,
      username: users.username,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(eq(timelines.visibility, 'PUBLIC'))
    .orderBy(desc(timelines.updatedAt))
    .limit(40);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {/* Header with grid background + fade-in */}
      <div className="relative mb-2">
        <GridBackground />
        <FadeIn className="relative">
          <Link href="/" className="text-xs text-muted-foreground hover:underline">
            ← Significant Hobbies
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            Recent public timelines
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Newest first. Browse how other people have mapped their hobby phases.
          </p>
        </FadeIn>
      </div>

      {rows.length === 0 ? (
        <FadeIn>
          <p className="mt-8 text-sm text-muted-foreground">
            No public timelines yet — be the first to flip yours public from the timeline editor.
          </p>
        </FadeIn>
      ) : (
        <StaggerContainer className="mt-6 space-y-3">
          {rows.map((t) => {
            const phases = parsePhases(t.phases);
            const labels = phases
              .map((p) => p.label)
              .filter(Boolean)
              .slice(0, 4);
            return (
              <StaggerItem key={t.id}>
                <SpotlightCard className="shadow-soft" innerClassName="p-4">
                  <div className="flex items-baseline gap-4 text-sm">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={t.slug ? `/timeline/${t.slug}` : `/timeline/${t.id}`}
                        className="block truncate text-base font-medium text-foreground hover:underline"
                      >
                        {t.title?.trim() || 'Untitled timeline'}
                      </Link>
                      {t.username && (
                        <Link
                          href={`/u/${t.username}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          @{t.username}
                        </Link>
                      )}
                      {labels.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {labels.join(' · ')}
                          {phases.length > labels.length && ` (+${phases.length - labels.length})`}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
                      {(t.updatedAt instanceof Date
                        ? t.updatedAt
                        : new Date(Number(t.updatedAt) * 1000)
                      )
                        .toISOString()
                        .slice(0, 10)}
                    </span>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </main>
  );
}
