import type { Page } from '@playwright/test';

export async function completeLocalOnboarding(page: Page) {
  await page.goto('/onboarding');
  await page.context().addCookies([
    {
      name: 'sh_local_workspace',
      value: '1',
      url: new URL(page.url()).origin,
      sameSite: 'Lax',
    },
  ]);
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('significant-hobbies-local', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('records');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('records', 'readwrite');
      transaction.objectStore('records').put(
        {
          key: 'onboarding:profile',
          domain: 'onboarding',
          schemaVersion: 1,
          installationId: 'e2e-device',
          updatedAt: new Date().toISOString(),
          value: { name: 'Local Tester', birthDate: '1990-01-01' },
        },
        'onboarding:profile'
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
}
