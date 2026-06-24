import { expect, test } from '@playwright/test';

test.describe('Hobby Quiz', () => {
  test('completes quiz flow and shows results', async ({ page }) => {
    await page.goto('/find-your-hobby');
    await expect(page.locator('h1')).toContainText('Find Your Next Hobby');

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Click the first option for each question
      const options = page
        .locator('button')
        .filter({ hasText: /Make something|corner|long hike|Create something|High/ });
      const firstOption = options.first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      } else {
        // Fallback: click any option button in the quiz area
        const quizButtons = page.locator("[class*='rounded-xl']").filter({ hasText: /.+/ });
        await quizButtons.first().click();
      }

      // Click Next if visible
      const nextButton = page.getByRole('button', { name: /Next|See Results/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }

    // Should show results
    await expect(page.getByText(/recommended hobbies|Your Hobby Personality/i)).toBeVisible({
      timeout: 5000,
    });
  });
});
