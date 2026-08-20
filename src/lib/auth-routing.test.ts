import { describe, expect, it } from 'vitest';

import { guestRouteFor, loginPath } from './auth-routing';

describe('loginPath', () => {
  it('round-trips through the callbackUrl param the login page reads', () => {
    expect(loginPath('/journal')).toBe('/login?callbackUrl=%2Fjournal');
    const parsed = new URL(loginPath('/trajectory'), 'https://significanthobbies.com');
    expect(parsed.searchParams.get('callbackUrl')).toBe('/trajectory');
  });

  it('encodes dynamic segments so ids survive the round trip', () => {
    const url = new URL(loginPath('/bucket-list/abc 123'), 'https://significanthobbies.com');
    expect(url.searchParams.get('callbackUrl')).toBe('/bucket-list/abc 123');
  });

  it('encodes a nested query so it cannot inject a second param', () => {
    // A callback carrying its own "&" must not become a sibling param the login
    // page would read as something else.
    const url = new URL(loginPath('/journal?tab=pm&x=1'), 'https://significanthobbies.com');
    expect(url.searchParams.get('callbackUrl')).toBe('/journal?tab=pm&x=1');
    expect(url.searchParams.get('x')).toBeNull();
  });
});

describe('guestRouteFor', () => {
  it('sends bucket-list intent to the anonymous board, not the guarded /bucket-list/new', () => {
    expect(guestRouteFor('/bucket-list').href).toBe('/life-bingo');
    expect(guestRouteFor('/bucket-list/xyz').href).toBe('/life-bingo');
  });

  it('sends timeline intent to the anonymous builder', () => {
    expect(guestRouteFor('/timeline').href).toBe('/timeline/new');
    expect(guestRouteFor('/timeline/xyz/edit').href).toBe('/timeline/new');
  });

  it('sends the longitudinal surfaces to the quiz, which has no account requirement', () => {
    // /journal, /habits, /trajectory and /history have no guest twin: their value is
    // accumulated history, so there is nothing honest to offer in one session.
    for (const route of ['/journal', '/habits', '/trajectory', '/history', '/commitments', '/']) {
      expect(guestRouteFor(route).href).toBe('/find-your-hobby');
    }
  });

  it('always returns a route that is reachable without a session', () => {
    const anonymous = new Set(['/life-bingo', '/timeline/new', '/find-your-hobby']);
    for (const route of [
      '/journal',
      '/habits',
      '/bucket-list',
      '/timeline',
      '/settings',
      '/anything',
    ]) {
      expect(anonymous.has(guestRouteFor(route).href)).toBe(true);
    }
  });
});
