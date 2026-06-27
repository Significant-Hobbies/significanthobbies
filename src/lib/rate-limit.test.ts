import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkRateLimit, enforceRateLimit, RATE_LIMITS } from './rate-limit';

// ─── Mock Cache API ──────────────────────────────────────────────────────────

type CacheEntry = { count: number; windowStart: number };

function createMockCache() {
  const store = new Map<string, CacheEntry>();
  const cache = {
    async match(key: string): Promise<Response | undefined> {
      const entry = store.get(key);
      if (!entry) return undefined;
      return new Response(JSON.stringify(entry), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
    async put(key: string, response: Response): Promise<void> {
      const entry = (await response.json()) as CacheEntry;
      store.set(key, entry);
    },
  };
  return { cache, store };
}

describe('rate-limit', () => {
  let originalCaches: unknown;

  beforeEach(() => {
    originalCaches = (globalThis as Record<string, unknown>).caches;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).caches = originalCaches;
    vi.restoreAllMocks();
  });

  // ─── checkRateLimit ─────────────────────────────────────────────────────

  it('allows all requests when Cache API is unavailable (fail open)', async () => {
    delete (globalThis as Record<string, unknown>).caches;
    const result = await checkRateLimit('test-key', { max: 1, windowMs: 1000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('allows requests under the limit', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    const result = await checkRateLimit('user:comment', { max: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests over the limit', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    const config = { max: 3, windowMs: 60_000 };
    await checkRateLimit('user:like', config);
    await checkRateLimit('user:like', config);
    await checkRateLimit('user:like', config);
    const result = await checkRateLimit('user:like', config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets the counter after the window expires', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    // Use a very short window
    const config = { max: 2, windowMs: 50 };
    await checkRateLimit('user:reset', config);
    await checkRateLimit('user:reset', config);
    // Should be blocked now
    const blocked = await checkRateLimit('user:reset', config);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 60));
    const afterReset = await checkRateLimit('user:reset', config);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it('tracks separate keys independently', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    const config = { max: 2, windowMs: 60_000 };
    await checkRateLimit('user-A', config);
    await checkRateLimit('user-A', config);
    const userA = await checkRateLimit('user-A', config);
    const userB = await checkRateLimit('user-B', config);
    expect(userA.allowed).toBe(false);
    expect(userB.allowed).toBe(true);
  });

  it('fails open when cache.match throws', async () => {
    const brokenCache = {
      async match(): Promise<Response | undefined> {
        throw new Error('cache broken');
      },
      async put(): Promise<void> {},
    };
    (globalThis as Record<string, unknown>).caches = { default: brokenCache };

    const result = await checkRateLimit('broken', { max: 1, windowMs: 1000 });
    expect(result.allowed).toBe(true);
  });

  it('fails open when cache.put throws (still allows the already-decided request)', async () => {
    const store = new Map<string, CacheEntry>();
    const brokenPutCache = {
      async match(key: string): Promise<Response | undefined> {
        const entry = store.get(key);
        if (!entry) return undefined;
        return new Response(JSON.stringify(entry), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
      async put(): Promise<void> {
        throw new Error('put broken');
      },
    };
    (globalThis as Record<string, unknown>).caches = { default: brokenPutCache };

    const result = await checkRateLimit('broken-put', { max: 1, windowMs: 1000 });
    expect(result.allowed).toBe(true);
  });

  // ─── enforceRateLimit ────────────────────────────────────────────────────

  it('does not throw when under the limit', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    await expect(enforceRateLimit('comment', 'user-1')).resolves.toBeUndefined();
  });

  it('throws when over the limit', async () => {
    const { cache } = createMockCache();
    (globalThis as Record<string, unknown>).caches = { default: cache };

    // Exhaust the comment limit (10 per minute)
    for (let i = 0; i < RATE_LIMITS.comment.max; i++) {
      await enforceRateLimit('comment', 'user-2');
    }
    await expect(enforceRateLimit('comment', 'user-2')).rejects.toThrow('Rate limit exceeded');
  });

  it('does not throw when Cache API is unavailable', async () => {
    delete (globalThis as Record<string, unknown>).caches;
    await expect(enforceRateLimit('like', 'user-3')).resolves.toBeUndefined();
  });

  // ─── RATE_LIMITS config ──────────────────────────────────────────────────

  it('has sensible limits for all configured actions', () => {
    expect(RATE_LIMITS.comment.max).toBeGreaterThan(0);
    expect(RATE_LIMITS.comment.windowMs).toBeGreaterThan(0);
    expect(RATE_LIMITS.like.max).toBeGreaterThan(RATE_LIMITS.comment.max);
    expect(RATE_LIMITS.subscribe.max).toBeLessThan(RATE_LIMITS.comment.max);
    expect(RATE_LIMITS.coach.max).toBeGreaterThan(0);
  });
});
