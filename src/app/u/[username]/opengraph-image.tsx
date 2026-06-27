import { eq } from 'drizzle-orm';
import { ImageResponse } from 'next/og';

import { timelines, users } from '~/db/schema';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function fallbackImage(message: string) {
  return new ImageResponse(
    <div
      style={{
        background: '#FEFDF8',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        fontFamily: 'system-ui, sans-serif',
        color: '#78716C',
      }}
    >
      {message}
    </div>,
    { width: 1200, height: 630 }
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
    return fallbackImage('Significant Hobbies');
  }

  if (!user) return fallbackImage('User not found');

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

      {/* Stats */}
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
          {allHobbies.size} hobb{allHobbies.size !== 1 ? 'ies' : 'y'}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
