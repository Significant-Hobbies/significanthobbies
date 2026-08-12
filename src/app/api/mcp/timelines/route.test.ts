import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  total: 10,
  rows: [] as Array<Record<string, unknown>>,
}));

vi.mock('~/server/db', () => ({
  db: {
    select(selection: Record<string, unknown>) {
      if ('value' in selection) {
        return {
          from: () => ({ where: async () => [{ value: state.total }] }),
        };
      }
      return {
        from: () => ({
          leftJoin: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () => ({ offset: async () => state.rows }),
              }),
            }),
          }),
        }),
      };
    },
  },
}));

import { GET } from './route';

function timeline(id: number) {
  return {
    id: `timeline-${id}`,
    title: `Timeline ${id}`,
    visibility: 'PUBLIC',
    slug: `timeline-${id}`,
    phases: '[]',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date(`2026-01-${String(id).padStart(2, '0')}T00:00:00.000Z`),
    userName: 'Owner',
    userUsername: 'owner',
  };
}

async function page(offset: number) {
  const response = await GET(
    new Request(`https://significanthobbies.com/api/mcp/timelines?limit=2&offset=${offset}`)
  );
  return response.json() as Promise<{
    items: Array<{ id: string }>;
    total: number;
    nextOffset: number | null;
  }>;
}

describe('public timeline MCP pagination', () => {
  beforeEach(() => {
    state.total = 10;
    state.rows = [];
  });

  it('keeps the exact total stable across first, middle, and terminal pages', async () => {
    state.rows = [timeline(1), timeline(2)];
    const first = await page(0);
    state.rows = [timeline(5), timeline(6)];
    const middle = await page(4);
    state.rows = [timeline(9), timeline(10)];
    const terminal = await page(8);

    expect(first).toMatchObject({ total: 10, nextOffset: 2 });
    expect(middle).toMatchObject({ total: 10, nextOffset: 6 });
    expect(terminal).toMatchObject({ total: 10, nextOffset: null });
    expect(
      new Set([...first.items, ...middle.items, ...terminal.items].map((item) => item.id)).size
    ).toBe(6);
  });
});
