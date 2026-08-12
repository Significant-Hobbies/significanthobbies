import { and, count, desc, eq, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { timelines, users } from '~/db/schema';
import { db } from '~/server/db';
import { boundedPage, publicTimelineRecord } from '@/lib/mcp-public';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const { limit, offset } = boundedPage(searchParams);
  const q = searchParams.get('q')?.trim().replaceAll(/[%_]/g, '').slice(0, 120) ?? '';
  const where = q
    ? and(eq(timelines.visibility, 'PUBLIC'), like(timelines.title, `%${q}%`))
    : eq(timelines.visibility, 'PUBLIC');
  const [rows, totals] = await Promise.all([
    db
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
      .where(where)
      .orderBy(desc(timelines.updatedAt), desc(timelines.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(timelines).where(where),
  ]);
  const total = totals[0]?.value ?? 0;
  const items = rows.map(publicTimelineRecord).filter((item) => item !== null);
  const nextOffset = offset + items.length < total ? offset + items.length : null;
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    items,
    total,
    nextOffset,
  });
}
