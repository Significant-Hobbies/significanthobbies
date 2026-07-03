/**
 * Owner-facing analytics — the fixed 4-event taxonomy.
 *
 * Every fleet project emits exactly these four events — `signup`, `activated`,
 * `core_action`, `returned` — so a single PostHog project can build one
 * cross-fleet funnel (signup -> activated -> core_action) and a D1/D7
 * retention insight, with no custom dashboard.
 *
 * Every event carries `project_id: "significanthobbies"`.
 *
 *  - `signup`      — first session after a SignificantHobbies account is created.
 *  - `activated`   — first real value: the user saves their first timeline.
 *  - `core_action` — the thing the product exists to do: saving a hobby
 *                    timeline, or exporting a timeline share card.
 *  - `returned`    — a later session for a user who already has prior activity.
 *
 * It is isomorphic: in the browser it routes through `posthog-js`
 * (`track`); inside a server action it POSTs directly to the PostHog capture
 * API. The server path uses a plain `fetch` rather than importing
 * `posthog-node`, which keeps the Node-only module out of the client bundle.
 */
import posthog from 'posthog-js';

const PROJECT = 'significanthobbies' as const;

// Shared PostHog project for the whole fleet.
const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_qgiAarw4Co4pw9fz3Fxj4UJaHmqzFetqs4JrXhGc35Nd';
const POSTHOG_HOST = 'https://us.i.posthog.com';

/** The product-specific action behind a `core_action` event. */
export type CoreAction = 'timeline_saved' | 'timeline_exported';

interface AnalyticsEventMap {
  /** First session after an account is created. */
  signup: { project_id: typeof PROJECT };
  /** The user reaches first real value — their first saved timeline. */
  activated: { project_id: typeof PROJECT };
  /** The thing the product exists to do. */
  core_action: { project_id: typeof PROJECT; action: CoreAction };
  /** A return session by a user with prior activity. */
  returned: { project_id: typeof PROJECT };
}

function emitServer(event: string, props: Record<string, unknown>, distinctId?: string) {
  // Fire-and-forget: analytics must never block or break a server action.
  void fetch(`${POSTHOG_HOST}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: distinctId ?? `${PROJECT}-server`,
      properties: props,
    }),
  }).catch(() => {
    // Swallow — best-effort only.
  });
}

export function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  distinctId?: string
): void {
  const payload = { project_id: PROJECT, ...properties };
  try {
    if (typeof window === 'undefined') {
      emitServer(event, payload, distinctId);
    } else {
      posthog.capture(event, payload);
    }
  } catch {
    // Analytics must NEVER break a user flow. Swallow and move on.
  }
}

function emit<K extends keyof AnalyticsEventMap>(
  event: K,
  props: Omit<AnalyticsEventMap[K], 'project_id'>,
  distinctId?: string
): void {
  trackEvent(event, props, distinctId);
}

/** Fire once, on the first session after an account is created. */
export function trackSignup(): void {
  emit('signup', {});
}

/**
 * Fire once, when the user first reaches real value (their first saved
 * timeline). Pass `distinctId` when firing from a server action so the
 * event attaches to the right user.
 */
export function trackActivated(distinctId?: string): void {
  emit('activated', {}, distinctId);
}

/** Fire on each completion of the core product action. */
export function trackCoreAction(action: CoreAction, distinctId?: string): void {
  emit('core_action', { action }, distinctId);
}

/** Fire on session start for a user who has prior activity. */
export function trackReturned(): void {
  emit('returned', {});
}

/**
 * Discovery funnel — quiz → recommendations → timeline (2026-07-03 refocus).
 *
 * One event per step, named `discovery_<step>`, all carrying `project_id`:
 *  - `discovery_land`                   — anon landing page viewed (fired from
 *                                         the Astro overlay, see landing-astro/).
 *  - `discovery_quiz_start`             — first quiz question answered.
 *  - `discovery_quiz_complete`          — last quiz question answered.
 *  - `discovery_recommendations_viewed` — quiz results (personalized recs) shown.
 *  - `discovery_timeline_start`         — new-timeline builder opened (`source`
 *                                         distinguishes quiz vs direct).
 *  - `discovery_shared`                 — quiz result or timeline shared/exported.
 *
 * Measurement plan + decision rule live in PROJECT_STATUS.md.
 */
export type DiscoveryStep =
  | 'land'
  | 'quiz_start'
  | 'quiz_complete'
  | 'recommendations_viewed'
  | 'timeline_start'
  | 'shared';

export function trackDiscovery(
  step: DiscoveryStep,
  properties: Record<string, unknown> = {}
): void {
  trackEvent(`discovery_${step}`, properties);
}
