import { expect, test } from '@playwright/test';

test.describe('Onboarding', () => {
  test('anonymous setup restores its local draft after reload', async ({ page }) => {
    await page.goto('/setup');
    await page.getByRole('button', { name: /begin/i }).click();
    await page.getByPlaceholder('yourname').fill('local-person');
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.getByPlaceholder('yourname')).toHaveValue('local-person');
    await expect(page.locator('body')).toContainText('this device');
  });

  test('uses focused chrome instead of the global navigation and footer', async ({
    page,
  }, testInfo) => {
    const hydrationErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });

    const email = `e2e-onboarding-${testInfo.project.name}-${testInfo.workerIndex}-${Date.now()}-${crypto.randomUUID()}@significanthobbies.test`;
    const signUp = await page.request.post('/api/auth/sign-up/email', {
      data: {
        email,
        password: 'e2e-test-password-not-a-secret',
        name: 'Onboarding Test',
      },
      failOnStatusCode: false,
    });

    if (signUp.status() === 404) {
      test.skip(true, 'Test auth disabled — run the dev server with ENABLE_TEST_AUTH=1');
    }
    expect(signUp.ok(), `test user sign-up returned ${signUp.status()}`).toBe(true);

    await page.goto('/setup');
    await expect(page.getByRole('heading', { name: /Hey, Onboarding!/ })).toBeVisible();
    await expect(page.locator('[data-site-nav]')).toHaveCount(0);
    await expect(page.locator('[data-site-footer]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'SignificantHobbies' })).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
});
