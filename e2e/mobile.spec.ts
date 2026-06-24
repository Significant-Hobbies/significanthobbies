import { expect, test } from '@playwright/test';

/**
 * Mobile-viewport regression checks. The Playwright config's `mobile` project
 * (Pixel 7) is the Wave 1 target; these focus on the timeline builder — the
 * hard drag-drop component — staying usable on a small touch screen.
 *
 * Run only the mobile project:  pnpm exec playwright test --project=mobile
 */

test.describe('SignificantHobbies mobile', () => {
  test('landing page has no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('timeline builder is usable at mobile width', async ({ page }) => {
    await page.goto('/timeline/new');

    // Pick the blank starting point to reach the builder.
    const blank = page.getByRole('button', { name: /start blank|empty/i });
    if (await blank.count()) {
      await blank.first().click();
    } else {
      // Templates render as buttons; first one is fine for a layout check.
      await page.getByRole('button').first().click();
    }

    // No sideways scroll on the builder screen.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // The drag handle must be a comfortable touch target (>= 44px).
    const handle = page.getByRole('button', { name: /drag to reorder/i }).first();
    await expect(handle).toBeVisible();
    const box = await handle.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  });
});
