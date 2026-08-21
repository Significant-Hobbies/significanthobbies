import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  session: null as null | { user: { id: string; email: string } },
  appleSubject: null as string | null,
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: async () => state.session } },
}));

vi.mock('@/server/db', () => ({
  db: {
    query: {
      account: {
        findFirst: async () =>
          state.appleSubject === null ? undefined : { accountId: state.appleSubject },
      },
    },
  },
}));

import { GET } from './route';

describe('Personal Platform identity session', () => {
  beforeEach(() => {
    state.session = null;
    state.appleSubject = null;
  });

  it('fails closed without a Better Auth bearer session', async () => {
    const response = await GET(
      new Request('https://significanthobbies.com/api/personal-platform/session')
    );
    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns the permanent user ID and linked Apple subject', async () => {
    state.session = { user: { id: 'shared-user', email: 'owner@example.com' } };
    state.appleSubject = 'apple-subject';

    const response = await GET(
      new Request('https://significanthobbies.com/api/personal-platform/session', {
        headers: { Authorization: 'Bearer signed-session' },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      userId: 'shared-user',
      email: 'owner@example.com',
      appleSubject: 'apple-subject',
    });
  });
});
