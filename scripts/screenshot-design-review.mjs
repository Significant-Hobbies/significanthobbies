import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'https://significanthobbies.com';
const SHOTS = [
  { name: 'prod-landing', url: `${BASE}/`, fullPage: true },
  { name: 'prod-hobbies', url: `${BASE}/hobbies`, fullPage: false },
  { name: 'prod-manifesto', url: `${BASE}/manifesto`, fullPage: true },
  { name: 'prod-bucket-lists', url: `${BASE}/bucket-lists`, fullPage: false },
  { name: 'prod-find-your-hobby', url: `${BASE}/find-your-hobby`, fullPage: false },
  { name: 'prod-login', url: `${BASE}/login`, fullPage: false },
  { name: 'prod-get-started', url: `${BASE}/get-started`, fullPage: false },
  { name: 'prod-hobby-detail', url: `${BASE}/hobbies/photography`, fullPage: false },
  { name: 'prod-journeys', url: `${BASE}/journeys`, fullPage: false },
  { name: 'prod-tools', url: `${BASE}/tools`, fullPage: false },
];

const browser = await chromium.launch();
const outDir = 'screenshots/design-review';
mkdirSync(outDir, { recursive: true });

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    const path = `${outDir}/${shot.name}.png`;
    await page.screenshot({ path, fullPage: shot.fullPage });
    console.log(`  ✓ ${path}`);
  } catch (e) {
    console.log(`  ✗ ${shot.name}: ${e.message}`);
  }
  await page.close();
}

await browser.close();
console.log('Done.');
