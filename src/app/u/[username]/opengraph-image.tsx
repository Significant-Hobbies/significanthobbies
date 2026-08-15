import { eq } from 'drizzle-orm';
import { ImageResponse } from 'next/og';

import { timelines, users } from '~/db/schema';
import {
  fallbackTimelineImage,
  timelineOgImageContentType,
  timelineOgImageSize,
} from '~/lib/timeline-og-image';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

export const runtime = 'nodejs';
export const size = timelineOgImageSize;
export const contentType = timelineOgImageContentType;

function UserProfileOgStats({
  publicTimelines,
  hobbyCount,
}: {
  publicTimelines: Array<{ phases: string; visibility: string }>;
  hobbyCount: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div
        style={{
          padding: '12px 28px',
          borderRadius: 12,
          background: '#ECFDF5',
          color: '#059669',
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {publicTimelines.length} timeline{publicTimelines.length !== 1 ? 's' : ''}
      </div>
      <div
        style={{
          padding: '12px 28px',
          borderRadius: 12,
          background: '#FEF3C7',
          color: '#D97706',
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {hobbyCount} hobb{hobbyCount !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}

export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  let user: Awaited<ReturnType<typeof db.query.users.findFirst>>;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  } catch (err) {
    console.error('opengraph-image[u]: user lookup failed', err);
    return fallbackTimelineImage('Significant Hobbies');
  }

  if (!user) return fallbackTimelineImage('User not found');

  let userTimelines: Array<{ phases: string; visibility: string }> = [];
  try {
    userTimelines = await db.select().from(timelines).where(eq(timelines.userId, user.id)).limit(3);
  } catch (err) {
    console.error('opengraph-image[u]: timelines fetch failed', err);
  }

  const publicTimelines = userTimelines.filter((t) => t.visibility === 'PUBLIC');

  const allHobbies = new Set<string>();
  for (const t of publicTimelines) {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], 'user-og-image:phases');
    for (const p of phases) for (const h of p.hobbies) allHobbies.add(h.name);
  }

  const initial = (user.name?.[0] ?? username[0] ?? '?').toUpperCase();

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #FEFDF8 0%, #ECFDF5 50%, #FFF8EE 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Site label */}
      <div
        style={{
          fontSize: 22,
          color: '#059669',
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        significanthobbies.com
      </div>

      {/* Avatar circle */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 40,
          fontWeight: 800,
          marginBottom: 24,
        }}
      >
        {initial}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: '#1C1917',
          marginBottom: 8,
        }}
      >
        {user.name ?? username}
      </div>

      {/* Username handle */}
      <div style={{ fontSize: 28, color: '#78716C', marginBottom: 40 }}>@{username}</div>

      <UserProfileOgStats publicTimelines={publicTimelines} hobbyCount={allHobbies.size} />
    </div>,
    { width: 1200, height: 630 }
  );
}
