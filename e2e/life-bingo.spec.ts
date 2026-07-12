import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Life Bingo and Bucket List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/life-bingo');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('introduces the product and starts without an account', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Make life less repetitive.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Make my Life Bingo/i })).toBeVisible();
    await expect(page.getByLabel(/My season of saying yes Bingo board/i)).toBeVisible();
  });

  test('creates, edits, completes, and recovers a guest bucket list', async ({ page }) => {
    await page.goto('/bucket-list/new');
    await page.getByRole('button', { name: /This month/i }).click();
    await page.getByRole('button', { name: /Keep it cozy/i }).click();
    await page.getByRole('button', { name: 'Make my Life Bingo' }).click();

    const board = page.getByRole('region', { name: /Bingo board/i });
    await expect(board).toBeVisible();
    const firstSquare = board.getByRole('button').first();
    await firstSquare.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Mark this lived/i }).click();
    await expect(page.getByRole('button', { name: /Completed/i })).toBeVisible();
    await page.getByRole('button', { name: 'Save changes' }).click();

    await page.getByRole('button', { name: 'List', exact: true }).click();
    await page.getByPlaceholder('Add something you want to do…').fill('Learn to make fresh pasta');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('Learn to make fresh pasta')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Learn to make fresh pasta')).toBeVisible();
    await expect(page.getByText(/1 of 10 lived/i)).toBeVisible();
  });

  test('remixes a shared board without copying its completed state', async ({ page }) => {
    await page.goto('/b/demo');
    await expect(page.getByRole('heading', { name: 'A season of saying yes' })).toBeVisible();
    await page.getByRole('button', { name: /Make my version/i }).click();
    await expect(page).toHaveURL(/\/bucket-list\/new/);
    await expect(page.getByLabel(/Bingo board/i)).toBeVisible();
    await expect(page.locator('[aria-label$=", completed"]')).toHaveCount(0);
  });

  test('has no horizontal overflow on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/life-bingo');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('meets the automated accessibility baseline', async ({ page }) => {
    await page.goto('/life-bingo');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );
    expect(
      serious,
      serious.map((violation) => `${violation.id}: ${violation.help}`).join('\n')
    ).toEqual([]);
  });
});
