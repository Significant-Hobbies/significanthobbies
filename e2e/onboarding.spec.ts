import { expect, test } from '@playwright/test';

test.describe('Onboarding', () => {
  test('signed-in people who have not onboarded enter onboarding from home', async ({
    page,
  }, testInfo) => {
    const email = `e2e-onboarding-gate-${testInfo.project.name}-${Date.now()}-${crypto.randomUUID()}@significanthobbies.test`;
    const signUp = await page.request.post('/api/auth/sign-up/email', {
      data: {
        email,
        password: 'e2e-test-password-not-a-secret',
        name: 'New Person',
      },
      failOnStatusCode: false,
    });
    if (signUp.status() === 404) {
      test.skip(true, 'Test auth disabled — run the dev server with ENABLE_TEST_AUTH=1');
    }
    expect(signUp.ok()).toBe(true);

    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole('heading', { name: /make time personal/i })).toBeVisible();
  });

  test('anonymous onboarding restores its local draft after reload', async ({ page }) => {
    await page.goto('/onboarding');
    const dismissImport = page.getByRole('button', { name: 'Not now' });
    if (await dismissImport.isVisible()) await dismissImport.click();
    await page.getByLabel('What should we call you?').fill('Local Person');
    await page.getByLabel('When were you born?').fill('1994-04-12');
    await page.getByRole('button', { name: /Begin my story/i }).click();
    await page.getByRole('button', { name: /Skip this moment/i }).click();
    await page.getByRole('button', { name: 'Drawing' }).click();
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Drawing' })).toBeVisible();
    await expect(page.getByText('3 of 7')).toBeVisible();
    await expect(page.locator('body')).toContainText('this device');
  });

  test('searches the full possibility atlas and keeps every custom choice visible', async ({
    page,
  }) => {
    await page.goto('/onboarding');
    const dismissImport = page.getByRole('button', { name: 'Not now' });
    if (await dismissImport.isVisible()) await dismissImport.click();
    await page.getByLabel('What should we call you?').fill('Local Explorer');
    await page.getByLabel('When were you born?').fill('1994-04-12');
    await page.getByRole('button', { name: /Begin my story/i }).click();
    await page.getByRole('button', { name: /Skip this moment/i }).click();
    await page.getByRole('button', { name: 'Drawing' }).click();
    await page.getByRole('button', { name: /Build this chapter/i }).click();

    await page.getByLabel('Search possibilities').fill('northern lights');
    await expect(page.locator('[data-possibility-option]')).toContainText('Northern Lights');
    await page.getByLabel('Search possibilities').fill('Revisit Drawing from childhood');
    await expect(page.locator('[data-possibility-option]')).toContainText(
      'Revisit Drawing from childhood'
    );

    const customInput = page.getByLabel('Add your own possibilities');
    await customInput.fill('1. Solo trip for one week\n2. Write a short story');
    await page.getByRole('button', { name: 'Add to my bucket list' }).click();

    await expect(page.getByRole('button', { name: 'Remove Solo trip for one week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove Write a short story' })).toBeVisible();
    await expect(page.locator('aside')).toContainText('Solo trip for one week');
    await expect(page.locator('aside')).toContainText('Write a short story');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Remove Solo trip for one week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove Write a short story' })).toBeVisible();

    await page.getByRole('button', { name: /Keep these possibilities/i }).click();
    await page.getByLabel('Add a goal for this year').fill('Build a calmer work week');
    await page.getByRole('button', { name: 'Add yearly goal' }).click();
    await page.locator('[data-focus-option]').nth(0).click();
    await page.getByRole('button', { name: /Keep these goals/i }).click();
    await page.getByRole('button', { name: /Continue without a daily practice/i }).click();
    await page
      .getByLabel('What is true about my life right now')
      .fill('Travel needs advance planning, while writing fits into quiet weekends.');
    await page.getByRole('button', { name: /Enter my life/i }).click();
    await expect(page).toHaveURL(/\/$/);

    const saved = await page.evaluate(async () => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('significant-hobbies-local', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const read = (key: string) =>
        new Promise<{ value?: Record<string, unknown> } | undefined>((resolve, reject) => {
          const request = database.transaction('records').objectStore('records').get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      const bucket = await read('onboarding:bucket-items');
      const daily = await read('daily:state');
      database.close();
      return { bucket: bucket?.value, daily: daily?.value };
    });
    expect(saved.bucket?.annualGoals).toEqual([
      'Build a calmer work week',
      'Solo trip for one week',
    ]);
    expect(saved.daily?.habits).toEqual([]);

    await page.goto('/live-more');
    const yearlyGoals = page.getByRole('complementary').filter({ hasText: 'Goals for this year' });
    await expect(yearlyGoals).toContainText('Build a calmer work week');
    await expect(yearlyGoals).toContainText('Solo trip for one week');
  });

  test('starts with varied popular possibilities and offers real YouTube songs', async ({
    page,
  }) => {
    await page.goto('/onboarding');
    const dismissImport = page.getByRole('button', { name: 'Not now' });
    if (await dismissImport.isVisible()) await dismissImport.click();
    await page.getByLabel('What should we call you?').fill('Local Listener');
    await page.getByLabel('When were you born?').fill('1994-04-12');
    await page.getByRole('button', { name: /Begin my story/i }).click();

    await expect(page.getByRole('dialog', { name: 'Music player' })).toBeVisible();
    await expect(page.locator('iframe[title="Springtime by Vlad Gluschenko"]')).toHaveAttribute(
      'src',
      /youtube-nocookie\.com.*autoplay=1/
    );
    await page.getByRole('radio', { name: /Lights/ }).click();
    await expect(page.locator('iframe[title="Lights by Ikson"]')).toBeVisible();
    await page.getByRole('button', { name: 'Choose music' }).click();

    await page.getByRole('button', { name: /Skip this moment/i }).click();
    await page.getByRole('button', { name: 'Drawing' }).click();
    await page.getByRole('button', { name: /Build this chapter/i }).click();

    const options = page.locator('[data-possibility-option]');
    await expect(options).toHaveCount(18);
    await options.last().scrollIntoViewIfNeeded();
    await expect(page.getByText('This is only the beginning.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Feedback' })).toBeVisible();
    const categories = await options.evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute('data-possibility-category'))),
    ]);
    expect(categories.sort()).toEqual(
      [
        'achievement',
        'adventure',
        'contribution',
        'creative',
        'food',
        'health',
        'relationships',
        'travel',
      ].sort()
    );

    for (const option of await options.all()) await option.click();
    await expect(page.getByLabel('Your chosen possibilities').getByRole('button')).toHaveCount(18);
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

    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: /make time personal/i })).toBeVisible();
    await expect(page.locator('[data-site-nav]')).toHaveCount(0);
    await expect(page.locator('[data-site-footer]')).toHaveCount(0);
    await expect(page.getByText('Significant Hobbies', { exact: true })).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });

  test('creates a private past, future, yearly goals, and trajectory without forcing a habit', async ({
    page,
  }, testInfo) => {
    const email = `e2e-onboarding-complete-${testInfo.project.name}-${Date.now()}-${crypto.randomUUID()}@significanthobbies.test`;
    const signUp = await page.request.post('/api/auth/sign-up/email', {
      data: {
        email,
        password: 'e2e-test-password-not-a-secret',
        name: 'Complete Journey',
      },
      failOnStatusCode: false,
    });
    if (signUp.status() === 404) {
      test.skip(true, 'Test auth disabled — run the dev server with ENABLE_TEST_AUTH=1');
    }
    expect(signUp.ok()).toBe(true);

    await page.goto('/onboarding');
    const dismissImport = page.getByRole('button', { name: 'Not now' });
    await dismissImport.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => undefined);
    if (await dismissImport.isVisible()) await dismissImport.click();
    await page.getByLabel('When were you born?').fill('1992-08-15');
    await page.getByRole('button', { name: /Begin my story/i }).click();
    await page.getByRole('button', { name: /Skip this moment/i }).click();
    await page.getByRole('button', { name: 'Drawing' }).click();
    await page.getByRole('button', { name: /Build this chapter/i }).click();
    await page.locator('[data-possibility-option]').nth(0).click();
    await page.locator('[data-possibility-option]').nth(1).click();
    await page.getByRole('button', { name: /Keep these possibilities/i }).click();
    await page.locator('[data-focus-option]').nth(0).click();
    await page.locator('[data-focus-option]').nth(1).click();
    await page.getByRole('button', { name: /Keep these goals/i }).click();
    await page.getByRole('button', { name: /Continue without a daily practice/i }).click();
    await page
      .getByLabel('What is true about my life right now')
      .fill('Weekdays are busy, but Sunday mornings are open.');
    await page.getByRole('button', { name: /Enter my life/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Live it, Complete/i })).toBeVisible();
    await page.goto('/daily');
    await expect(page.getByText('Connect with someone today', { exact: true })).toHaveCount(0);
  });
});
