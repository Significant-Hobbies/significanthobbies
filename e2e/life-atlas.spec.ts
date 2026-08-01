import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Life Atlas shell', () => {
  test('uses two product modes and one history destination without dropdowns', async ({ page }) => {
    await page.goto('/life-plan');
    if (!(await page.getByRole('link', { name: 'Live More' }).isVisible())) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(page.getByRole('link', { name: 'Live More' })).toHaveAttribute(
      'href',
      '/life-plan'
    );
    await expect(page.getByRole('link', { name: 'Daily', exact: true }).first()).toHaveAttribute(
      'href',
      '/daily'
    );
    await expect(page.getByRole('link', { name: 'See History' })).toHaveAttribute(
      'href',
      '/look-back'
    );
    await expect(page.getByRole('button', { name: /Live More|See History/ })).toHaveCount(0);
  });

  test('Live More merges the four living paths', async ({ page }) => {
    await page.goto('/life-plan');
    await expect(
      page.getByRole('heading', { name: "Don't just plan a life. Go have one." })
    ).toBeVisible();
    for (const name of [
      'Find a hobby',
      'Want something bigger',
      'Make life playful',
      'Do something this week',
    ]) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
  });

  test('See History joins mortality, trajectory, and narrative history', async ({ page }) => {
    await page.goto('/look-back');
    await expect(page.getByRole('heading', { name: 'Your life so far' })).toBeVisible();
    await expect(page.getByLabel('Life in weeks overview')).toBeVisible();
    await expect(page.getByText(/direction framed|path you are choosing/i)).toBeVisible();
    await expect(page.getByText('Your life, told back to you')).toBeVisible();
  });

  test('merged pages do not overflow on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/life-plan', '/look-back']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('Live More meets the automated accessibility baseline', async ({ page }) => {
    await page.goto('/life-plan');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );
    expect(
      serious,
      serious.map((violation) => `${violation.id}: ${violation.help}`).join('\n')
    ).toEqual([]);
  });

  test('the primary light-mode destinations meet the accessibility baseline', async ({ page }) => {
    for (const path of ['/daily', '/look-back', '/trajectory']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical'
      );
      expect(
        serious,
        `${path}\n${serious.map((violation) => `${violation.id}: ${violation.help}`).join('\n')}`
      ).toEqual([]);
    }
  });
});
