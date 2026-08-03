import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { completeLocalOnboarding } from './fixtures/local-onboarding';

test.describe('Life Atlas shell', () => {
  test.beforeEach(async ({ page }) => {
    await completeLocalOnboarding(page);
  });

  test('uses two product modes and one history destination without dropdowns', async ({ page }) => {
    await page.goto('/live-more');
    const nav = page.getByRole('navigation').first();
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(nav.getByRole('link', { name: 'Live More' })).toHaveAttribute(
      'href',
      '/live-more'
    );
    await expect(nav.getByRole('link', { name: 'Daily', exact: true }).first()).toHaveAttribute(
      'href',
      '/daily'
    );
    await expect(nav.getByRole('link', { name: 'History', exact: true }).first()).toHaveAttribute(
      'href',
      '/history'
    );
    await expect(page.getByRole('button', { name: /Live More|History/ })).toHaveCount(0);
  });

  test('Live More makes discovery and the action paths coherent', async ({ page }) => {
    await page.goto('/live-more');
    await expect(
      page.getByRole('heading', { name: /What do you still want to live/ })
    ).toBeVisible();
    await expect(page.getByText('More than 5,000 possibilities')).toBeVisible();
    for (const name of [
      'Discover a life you have not thought of yet.',
      'Life Bingo',
      'Give “someday” a first step.',
    ]) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }

    await page.getByLabel('I want to…').fill('Learn to sail');
    await page.getByRole('button', { name: 'Add to my list' }).click();
    await expect(page.getByText('Learn to sail', { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole('link', { name: /Make a Side Quest/ })
        .filter({ hasText: 'Make a Side Quest' })
        .first()
    ).toBeVisible();

    const firstPossibility = page.locator('#discover article').first();
    const title = await firstPossibility.getByRole('heading', { level: 3 }).innerText();
    await firstPossibility.getByRole('link', { name: 'Small first step' }).click();
    await expect(page).toHaveURL(/\/side-quests\?tab=pick&possibility=/);
    await expect(page.getByText('Make this possibility smaller')).toBeVisible();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });

  test('a dismissed possibility can be recovered', async ({ page }) => {
    await page.goto('/live-more');
    const firstPossibility = page.locator('#discover article').first();
    const title = await firstPossibility.getByRole('heading', { level: 3 }).innerText();
    await firstPossibility.getByRole('button', { name: `Dismiss ${title}` }).click();
    await expect(page.getByText(`${title} dismissed. You can undo this.`)).toBeVisible();
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('a large possibility becomes a related small quest', async ({ page }) => {
    await page.goto(
      '/side-quests?tab=pick&possibility=Do%20a%20serious%20meditation%20retreat%20(10%2B%20days)'
    );
    await expect(page.getByText('Make this possibility smaller')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ten Minutes of Silence' })).toBeVisible();
  });

  test('History joins mortality, trajectory, timeline, and narrative history', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByRole('heading', { name: 'Your life so far' })).toBeVisible();
    await expect(page.getByLabel('Life in weeks overview')).toBeVisible();
    await expect(page.getByText(/direction framed|path you are choosing/i)).toBeVisible();
    await expect(page.getByText(/Personal timeline/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Read the record/ })).toHaveAttribute(
      'href',
      '/daily#journal-history'
    );
  });

  test('/timeline resolves to the timeline inside History', async ({ page }) => {
    await page.goto('/timeline');
    await expect(page).toHaveURL(/\/history#personal-timeline$/);
    await expect(page.locator('#personal-timeline')).toContainText(/The chapters that/);
  });

  test('merged pages do not overflow on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/live-more', '/history']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('Live More meets the automated accessibility baseline', async ({ page }) => {
    await page.goto('/live-more');
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
    for (const path of ['/daily', '/history', '/trajectory']) {
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
