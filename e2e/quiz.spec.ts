import { expect, test } from '@playwright/test';

/**
 * The quiz is the single primary discovery UX
 * (docs/product/discovery-funnel.md), so this is the highest-value flow in the
 * anonymous funnel and deserves a test that actually walks it.
 *
 * The previous version clicked `[class*='rounded-xl']` blindly inside
 * `if (await x.isVisible())` guards, so every step could silently no-op, and it
 * asserted on "Your Hobby Personality" / "recommended hobbies" — copy that does
 * not exist. The real results heading is "Hobbies picked for you". It had been
 * failing unnoticed because CI never ran Playwright.
 */
test.describe('Hobby Quiz', () => {
  test('completes the quiz and shows recommendations', async ({ page }) => {
    await page.goto('/find-your-hobby');
    await expect(page.locator('h1')).toContainText('Find Your Perfect Hobby');
    await expect(page.locator('[data-site-footer]')).toHaveCount(0);

    // Selecting an option does not advance on its own (handleSelect only records
    // it; handleNext scores and moves on), so each question is a pick then a Next.
    const progress = page.getByText(/^Question \d+ of \d+$/);
    await expect(progress).toBeVisible();
    await expect(progress).toHaveText('Question 1 of 9');

    for (let guard = 0; guard < 12; guard += 1) {
      if (!(await progress.isVisible().catch(() => false))) break;

      // The option buttons are the ones inside the question card; the first is
      // always a valid answer, and picking any option is enough to score.
      const option = page.locator('[data-quiz-option]').first();
      await expect(option, 'each question must offer options').toBeVisible();
      await option.click();

      const next = page.getByRole('button', { name: /^(Next|See my results)/i }).first();
      await expect(next, 'a scored answer must be advanceable').toBeEnabled();
      await next.click();
    }

    // Results, asserted on copy the page actually renders.
    await expect(page.getByRole('heading', { name: 'Hobbies picked for you' })).toBeVisible();
  });
});
