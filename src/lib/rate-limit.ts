/**
 * Lightweight rate limiter using the Cloudflare Workers Cache API.
 *
 * Stores a counter + first-request timestamp per key (e.g. "comment:userId123")
 * with a sliding window. When the window expires, the counter resets.
 *
 * Falls back to always-allowed when the Cache API is unavailable (local dev,
 * non-Workers runtimes). No DB writes, no external services, no KV — just
 * the ephemeral edge cache that's already available on every Worker.
 *
 * Limits are intentionally generous to avoid false positives from shared
 * IPs or rapid legitimate use. Tighten per-endpoint if abuse is observed.
 */

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

export type RateLimitConfig = {
  /** Max actions allowed within the window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
};

/** Reasonable defaults per endpoint type. */
export const RATE_LIMITS = {
  comment: { max: 10, windowMs: 60_000 }, // 10 comments per minute
  like: { max: 60, windowMs: 60_000 }, // 60 likes per minute
  subscribe: { max: 5, windowMs: 300_000 }, // 5 subscribes per 5 minutes
  bucketList: { max: 30, windowMs: 60_000 }, // 30 bucket-list mutations per minute
  timeline: { max: 20, windowMs: 60_000 }, // 20 timeline mutations per minute
  coach: { max: 10, windowMs: 300_000 }, // 10 coach reflections per 5 minutes
} as const satisfies Record<string, RateLimitConfig>;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check whether an action is allowed under the rate limit.
 * Call this BEFORE performing the action. If allowed, the counter is
 * incremented automatically.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const cacheKey = `https://rate-limit.internal/${key}`;
  const now = Date.now();

  // Cache API is only available on Cloudflare Workers. In local dev or
  // other runtimes, allow all requests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = (globalThis as any).caches?.default as Cache | undefined;
  if (!cache) {
    return { allowed: true, remaining: config.max, resetAt: now + config.windowMs };
  }

  let entry: RateLimitEntry | null = null;
  try {
    const response = await cache.match(cacheKey);
    if (response) {
      entry = (await response.json()) as RateLimitEntry;
    }
  } catch {
    // Cache read failed — allow the request (fail open, not fail closed,
    // for a rate limiter — a broken limiter shouldn't block legitimate use).
    return { allowed: true, remaining: config.max, resetAt: now + config.windowMs };
  }

  // Reset window if expired
  if (!entry || now - entry.windowStart > config.windowMs) {
    entry = { count: 0, windowStart: now };
  }

  entry.count += 1;

  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);
  const resetAt = entry.windowStart + config.windowMs;

  // Store the updated entry. Use a short TTL so stale entries are cleaned up.
  try {
    const ttlSeconds = Math.ceil(config.windowMs / 1000) + 10;
    const storeResponse = new Response(JSON.stringify(entry), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${ttlSeconds}`,
      },
    });
    await cache.put(cacheKey, storeResponse);
  } catch {
    // Cache write failed — fail open (we already decided to allow).
  }

  return { allowed, remaining, resetAt };
}

/** Convenience: check + throw if over limit. */
export async function enforceRateLimit(
  action: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<void> {
  const config = RATE_LIMITS[action];
  const result = await checkRateLimit(`${action}:${identifier}`, config);
  if (!result.allowed) {
    const seconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${seconds}s.`);
  }
}
