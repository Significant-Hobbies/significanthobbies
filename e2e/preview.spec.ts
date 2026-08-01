import { expect, test } from '@playwright/test';

/**
 * Signed-out previews of /daily and /trajectory.
 *
 * Both surfaces need truthful sample content to explain their value before a
 * visitor signs in. They used to redirect to /login, which made the
 * steepest step in the funnel "hand over a Google account before you have seen
 * what the practice is". They now render one stranger's sample month.
 *
 * The tests below pin the two things that make that honest: the notice is
 * present, and no affordance invites a visitor to create data that would be
 * silently discarded. Daily shows a sample month; Trajectory shows one sample
 * focus contract.
 */

test.describe('/daily preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/daily');
  });

  test('renders the ritual with a preview notice', async ({ page }) => {
    await expect(page.getByLabel('Preview notice')).toBeVisible();
    await expect(page.getByText(/looking at someone else/i)).toBeVisible();
    await expect(page.getByText(/nothing is saved/i)).toBeVisible();
  });

  test('shows real sample content, not empty states', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Habits' })).toBeVisible();
    await expect(page.getByText('Read 20 pages')).toBeVisible();
    await expect(page.getByText('Long run')).toBeVisible();
    // The journal reader has today's writing in it.
    await expect(page.getByText(/Woke before the alarm/)).toBeVisible();
    await expect(page.getByText('No habits yet.')).toHaveCount(0);
  });

  test('does not invite journal writing that would be discarded', async ({ page }) => {
    // The distinction that makes the preview defensible: ticking a checkbox
    // loses nothing, but typing an entry that evaporates is a real loss.
    await expect(page.locator('#daily-journal-entry')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Save (morning|evening)/ })).toHaveCount(0);
  });

  test('hides habit management, which router.refresh would silently undo', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Manage' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add habit' })).toHaveCount(0);
  });

  test('offers a sign-in that returns to /daily', async ({ page }) => {
    const cta = page.getByRole('link', { name: 'Start your own' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/login?callbackUrl=%2Fdaily');
  });

  test('habit ticks still respond, since nothing is lost by them', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /Mark Read 20 pages as/ }).first();
    await expect(toggle).toBeVisible();
    const before = await toggle.getAttribute('aria-label');
    await toggle.click();
    await expect(toggle).not.toHaveAttribute('aria-label', before as string);
  });

  test('stays out of the search index', async ({ page }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('/trajectory preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trajectory');
  });

  test('renders the four parts of a sample focus contract', async ({ page }) => {
    await expect(page.getByLabel('Preview notice')).toBeVisible();
    for (const part of ['Constraints', 'Intent', 'Decision policy', 'Feedback loop']) {
      await expect(page.getByText(part, { exact: true })).toBeVisible();
    }
    await expect(page.getByText(/Make and share small films consistently/).first()).toBeVisible();
  });

  test('shows the review rhythm without a score or chart', async ({ page }) => {
    await expect(page.getByText('Review weekly')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Trajectory chart' })).toHaveCount(0);
  });

  test('offers no write affordance, because those actions throw when anonymous', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Review this trajectory' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Set this trajectory' })).toHaveCount(0);
  });

  test('offers a sign-in that returns to /trajectory', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Start your own' })).toHaveAttribute(
      'href',
      '/login?callbackUrl=%2Ftrajectory'
    );
  });
});
