import { expect, type Locator } from '@playwright/test';

/**
 * Waits until React has hydrated a specific element.
 *
 * `toBeVisible()` only proves the server HTML arrived. Interacting before
 * hydration is silent rather than loud, and it fails in two different ways
 * depending on the element:
 *
 * - **A controlled input** takes the `fill()` into the DOM but not into
 *   component state. Hydration reverts it, the form compares against its
 *   unchanged initial prop, skips the write, and still reports success.
 * - **A button** simply has no handler attached, so the click does nothing and
 *   whatever it was supposed to reveal never appears.
 *
 * Both reproduce only where the route pays a cold `next dev` compile — which is
 * CI, under two workers, and almost never a warm local run. Both cost a long
 * time to diagnose because the symptom looks like a product bug.
 *
 * Gated on React's own marker rather than a timeout: it attaches
 * `__reactFiber$…` / `__reactProps$…` keys to each host node as it hydrates,
 * so this waits for the actual condition instead of guessing a budget.
 */
export async function waitForHydrated(target: Locator, timeout = 60_000) {
  await target.first().waitFor({ state: 'attached', timeout });
  await expect
    .poll(
      async () =>
        target
          .first()
          .evaluate((el) => Object.keys(el).some((k) => k.startsWith('__react')))
          .catch(() => false),
      { timeout, message: 'element never hydrated' }
    )
    .toBe(true);
}
