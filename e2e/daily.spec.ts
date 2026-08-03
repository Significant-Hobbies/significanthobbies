import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { completeLocalOnboarding } from './fixtures/local-onboarding';

test.describe('Daily ritual & manifesto', () => {
  test('/daily provides a local ritual instead of walling it off', async ({ page }) => {
    await completeLocalOnboarding(page);
    const res = await page.goto('/daily');
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain('/login');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.locator('#daily-journal-entry')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Good (morning|evening), Local\./ })
    ).toBeVisible();
  });

  test('/daily has no serious accessibility violations', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/daily');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(({ impact }) =>
      ['critical', 'serious'].includes(impact ?? '')
    );
    expect(serious).toEqual([]);
  });

  test('/daily restores anonymous habits and journal writing after reload', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/daily');
    await page.getByRole('button', { name: 'Manage' }).click();
    await page.getByPlaceholder('Habit name (e.g. Read 20 pages)').fill('Walk after lunch');
    await page.getByRole('button', { name: 'Add habit' }).click();
    await expect(page.getByText('Walk after lunch')).toBeVisible();

    await page.locator('#daily-journal-entry').fill('I made room for a slower afternoon.');
    await page.getByRole('button', { name: /Save (morning|evening)/ }).click();
    await page.reload();
    await expect(page.getByText('Walk after lunch')).toBeVisible();
    await expect(page.locator('#daily-journal-entry')).toHaveValue(
      'I made room for a slower afternoon.'
    );
    await expect(
      page
        .getByRole('region', { name: 'Journal history' })
        .getByText('I made room for a slower afternoon.', { exact: true })
    ).toBeVisible();
  });

  test('/daily keeps a small new thing beside the journal', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/daily');

    const newThing = page.locator('aside').filter({ hasText: 'Make today different' });
    await expect(newThing).toBeVisible();
    const firstIdea = await newThing.getByRole('heading', { level: 2 }).textContent();

    await newThing.getByRole('button', { name: 'Suggest another' }).click();
    await expect(newThing.getByRole('heading', { level: 2 })).not.toHaveText(firstIdea ?? '');
    const chosenIdea = await newThing.getByRole('heading', { level: 2 }).textContent();

    await page
      .locator('#daily-journal-entry')
      .fill('A small new thing changed the shape of today.');
    await page.getByRole('button', { name: /Save (morning|evening)/ }).click();
    await newThing.getByRole('button', { name: 'I did this' }).click();
    await expect(newThing.getByRole('button', { name: 'Mark this open again' })).toBeVisible();

    await page.reload();
    await expect(
      page.locator('aside').filter({ hasText: 'Make today different' }).getByRole('heading', {
        level: 2,
      })
    ).toHaveText(chosenIdea ?? '');
    await expect(page.locator('#daily-journal-entry')).toHaveValue(
      'A small new thing changed the shape of today.'
    );
    await expect(page.getByRole('button', { name: 'Mark this open again' })).toBeVisible();

    await page.getByRole('button', { name: 'Previous journal day' }).click();
    await expect(page.getByText('No new thing was kept for this day.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suggest another' })).toHaveCount(0);
  });

  test('/daily lets a person keep their own list for today', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/daily');
    const card = page.locator('aside').filter({ hasText: 'Make today different' });

    await card.getByRole('button', { name: 'Choose my own' }).click();
    await page
      .getByLabel('What do you want to try today?')
      .fill('1. Call an old friend\n2. Cook one new dish\n3. Walk somewhere unfamiliar');
    await card.getByRole('button', { name: 'Keep my list' }).click();
    await expect(card.getByRole('heading', { level: 2 })).toContainText('Your list for today');
    await expect(card.getByRole('listitem')).toHaveCount(3);
    await expect(card.getByRole('button', { name: 'I did these' })).toBeVisible();
    await card.getByRole('button', { name: 'I did these' }).click();

    const livedCollection = page.getByRole('region', { name: "Things I've done" });
    await expect(livedCollection.getByText('Call an old friend', { exact: true })).toBeVisible();
    await expect(livedCollection.getByText('Cook one new dish', { exact: true })).toBeVisible();
    await expect(
      livedCollection.getByText('Walk somewhere unfamiliar', { exact: true })
    ).toBeVisible();

    await page.reload();
    const restored = page.locator('aside').filter({ hasText: 'Make today different' });
    await expect(restored.getByRole('heading', { name: /Your list for today/ })).toBeVisible();
    await expect(restored.getByRole('listitem')).toHaveCount(3);
    await expect(
      page.getByRole('region', { name: "Things I've done" }).getByRole('listitem')
    ).toHaveCount(3);
  });

  test('/manifesto loads and shows the mortality frame', async ({ page }) => {
    await page.goto('/manifesto');
    await expect(page.locator('h1')).toContainText('Manifesto');
    // The 4,000 weeks truth
    await expect(page.getByText(/4,000 weeks/)).toBeVisible();
    // Two dimensions — match the bold labels in the manifesto body
    await expect(page.locator('article').getByText('Daily.')).toBeVisible();
    await expect(page.locator('article').getByText('Living.')).toBeVisible();
    // The journal as bridge
    await expect(page.getByText(/journal is the bridge/i)).toBeVisible();
  });

  test('/manifesto has working CTAs', async ({ page }) => {
    await page.goto('/manifesto');
    // Scoped to the article: the nav also carries a "Find a Hobby" link, and an
    // unscoped accessible-name lookup matched both and failed strict mode.
    const article = page.locator('article');

    const hobbiesLink = article.getByRole('link', { name: 'Find a hobby' });
    await expect(hobbiesLink).toBeVisible();
    // "Working" should mean it points somewhere, not merely that it renders.
    // /hobbies is deliberately deep-link-only (see docs/product/discovery-funnel.md)
    // — reachable from here, absent from nav and footer.
    await expect(hobbiesLink).toHaveAttribute('href', '/hobbies');

    const bucketListLink = article.getByRole('link', { name: 'Start a bucket list' });
    await expect(bucketListLink).toBeVisible();
    await expect(bucketListLink).toHaveAttribute('href', '/bucket-lists');
  });

  test('nav includes Daily link', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/hobbies');
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(page.getByRole('link', { name: 'Daily' }).first()).toBeVisible();
  });

  test('public footer keeps private workspace links out', async ({ page }) => {
    await page.goto('/hobbies');
    const footer = page.locator('[data-site-footer]');
    await expect(footer.getByRole('link', { name: 'Daily', exact: true })).toHaveCount(0);
    await expect(footer.getByRole('link', { name: 'Find your hobby' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Things to try' })).toBeVisible();
  });
});
