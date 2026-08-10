import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { timelines, users } from '~/db/schema';
import { db } from '~/server/db';
import { publicTimelineRecord } from '@/lib/mcp-public';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [row] = await db
    .select({
      id: timelines.id,
      title: timelines.title,
      visibility: timelines.visibility,
      slug: timelines.slug,
      phases: timelines.phases,
      createdAt: timelines.createdAt,
      updatedAt: timelines.updatedAt,
      userName: users.name,
      userUsername: users.username,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(and(eq(timelines.id, id), eq(timelines.visibility, 'PUBLIC')))
    .limit(1);
  const item = row ? publicTimelineRecord(row) : null;
  return item
    ? NextResponse.json({ item }, { headers: { 'Cache-Control': 'public, max-age=300' } })
    : NextResponse.json(
        { code: 'NOT_FOUND', message: 'Public timeline not found.' },
        { status: 404 }
      );
}
