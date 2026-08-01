import { expect, test } from '@playwright/test';

test('anonymous private work imports into a newly signed-in account', async ({ page }) => {
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByPlaceholder('Habit name (e.g. Read 20 pages)').fill('Imported local walk');
  await page.getByRole('button', { name: 'Add habit' }).click();
  await expect(page.getByText('Imported local walk')).toBeVisible();

  await page.goto('/commitments');
  await page.getByRole('button', { name: 'Start a commitment' }).click();
  await page.getByPlaceholder('e.g. Guitar, Running, Spanish').fill('Imported local guitar');
  await page.getByRole('button', { name: 'Begin commitment' }).click();
  await expect(page.getByText('Imported local guitar')).toBeVisible();

  await page.goto('/settings');
  await page.getByLabel('Display name').fill('Local Import Person');
  await page.getByRole('button', { name: /save/i }).click();

  const email = `e2e-local-import-${Date.now()}-${crypto.randomUUID()}@significanthobbies.test`;
  const signUp = await page.request.post('/api/auth/sign-up/email', {
    headers: { Origin: 'http://localhost:3000' },
    data: { email, password: 'e2e-test-password-not-a-secret', name: 'Import Test' },
    failOnStatusCode: false,
  });
  if (signUp.status() === 404) test.skip(true, 'Test auth disabled');
  expect(signUp.ok(), `sign-up failed (${signUp.status()}): ${await signUp.text()}`).toBe(true);

  await page.goto('/daily');
  await expect(page.getByRole('button', { name: 'Import private data' })).toBeVisible();
  await page.getByRole('button', { name: 'Import private data' }).click();
  await expect(page.getByRole('button', { name: 'Import private data' })).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('Imported local walk')).toBeVisible();
  await page.goto('/commitments');
  await expect(page.getByText('Imported local guitar')).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByLabel('Display name')).toHaveValue('Local Import Person');
});
