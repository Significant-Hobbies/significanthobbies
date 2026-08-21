import { and, count, desc, eq, gte, like, lte, or, type SQL } from 'drizzle-orm';

import { bucketListItems } from '@/db/schema';
import { db } from '@/server/db';

const MAX_PAGE_SIZE = 50;

export interface LiveReadQuery {
  q?: string;
  startYear?: number;
  endYear?: number;
  limit: number;
  offset: number;
  includeSensitive: boolean;
}

export function parseLiveReadQuery(url: URL): LiveReadQuery {
  const startYear = year(url.searchParams.get('start'));
  const endYear = year(url.searchParams.get('end'));
  if (startYear && endYear && startYear > endYear) {
    throw new LiveReadError('INVALID_RANGE', 'Start must not be after end.');
  }
  return {
    q: url.searchParams.get('q')?.trim().slice(0, 200) || undefined,
    startYear,
    endYear,
    limit: boundedInteger(url.searchParams.get('limit'), 20, 1, MAX_PAGE_SIZE),
    offset: boundedInteger(url.searchParams.get('offset'), 0, 0, 1_000_000),
    includeSensitive: url.searchParams.get('includeSensitive') === 'true',
  };
}

export async function readLiveSummary(userId: string) {
  const [total, latest] = await Promise.all([
    db.select({ value: count() }).from(bucketListItems).where(eq(bucketListItems.userId, userId)),
    db
      .select({
        id: bucketListItems.id,
        title: bucketListItems.title,
        status: bucketListItems.status,
        category: bucketListItems.category,
        targetYear: bucketListItems.targetYear,
        updatedAt: bucketListItems.updatedAt,
      })
      .from(bucketListItems)
      .where(eq(bucketListItems.userId, userId))
      .orderBy(desc(bucketListItems.updatedAt), desc(bucketListItems.id))
      .limit(1),
  ]);
  const latestItem = latest[0];
  return {
    domain: 'live',
    source: 'significant-hobbies-service',
    status: 'connected',
    activeCount: total[0]?.value ?? 0,
    latest: latestItem
      ? {
          id: latestItem.id,
          title: latestItem.title,
          status: latestItem.status,
          category: latestItem.category,
          targetYear: latestItem.targetYear,
        }
      : null,
    lastUpdatedAt: latestItem?.updatedAt.toISOString() ?? null,
  };
}

export async function readLiveRecords(userId: string, query: LiveReadQuery) {
  return loadLiveRecords(userId, query);
}

function liveRecordConditions(userId: string, query: LiveReadQuery): SQL[] {
  const conditions: SQL[] = [eq(bucketListItems.userId, userId)];
  if (query.startYear) conditions.push(gte(bucketListItems.targetYear, query.startYear));
  if (query.endYear) conditions.push(lte(bucketListItems.targetYear, query.endYear));
  if (!query.q) return conditions;

  const pattern = `%${escapeLike(query.q)}%`;
  const search = or(
    like(bucketListItems.title, pattern),
    like(bucketListItems.category, pattern),
    like(bucketListItems.status, pattern),
    ...(query.includeSensitive ? [like(bucketListItems.description, pattern)] : [])
  );
  if (search) conditions.push(search);
  return conditions;
}

export class LiveReadError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function year(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.slice(0, 4));
  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2200) {
    throw new LiveReadError('INVALID_RANGE', 'Choose a valid year range.');
  }
  return parsed;
}

function boundedInteger(value: string | null, fallback: number, minimum: number, maximum: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new LiveReadError('INVALID_PAGINATION', `Choose a value from ${minimum} to ${maximum}.`);
  }
  return parsed;
}

function escapeLike(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

async function loadLiveRecords(userId: string, query: LiveReadQuery) {
  const where = and(...liveRecordConditions(userId, query));
  const [rows, total] = await Promise.all([
    db
      .select({
        id: bucketListItems.id,
        title: bucketListItems.title,
        description: bucketListItems.description,
        category: bucketListItems.category,
        status: bucketListItems.status,
        targetYear: bucketListItems.targetYear,
        completedAt: bucketListItems.completedAt,
        createdAt: bucketListItems.createdAt,
        updatedAt: bucketListItems.updatedAt,
      })
      .from(bucketListItems)
      .where(where)
      .orderBy(desc(bucketListItems.updatedAt), desc(bucketListItems.id))
      .limit(query.limit)
      .offset(query.offset),
    db.select({ value: count() }).from(bucketListItems).where(where),
  ]);
  const totalCount = total[0]?.value ?? 0;
  return {
    domain: 'live',
    source: 'significant-hobbies-service',
    generatedAt: new Date().toISOString(),
    items: rows.map((row) => ({
      id: row.id,
      occurredAt: row.completedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      record: {
        title: row.title,
        status: row.status,
        category: row.category,
        targetYear: row.targetYear,
        ...(query.includeSensitive && row.description ? { description: row.description } : {}),
      },
    })),
    page: {
      limit: query.limit,
      offset: query.offset,
      total: totalCount,
      nextOffset: query.offset + query.limit < totalCount ? query.offset + query.limit : null,
    },
  };
}
