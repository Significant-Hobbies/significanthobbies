// Screenshot helper — captures pages for visual review.
// Usage: node scripts/screenshot.mjs
import { chromium } from '@playwright/test';

const SHOTS = [
  { name: 'landing', url: 'http://localhost:4321/', fullPage: false },
  { name: 'hobbies', url: 'http://localhost:3002/hobbies', fullPage: false },
  {
    name: 'category-creative',
    url: 'http://localhost:3002/hobbies/category/creative',
    fullPage: false,
  },
  {
    name: 'category-outdoor',
    url: 'http://localhost:3002/hobbies/category/outdoor',
    fullPage: false,
  },
  { name: 'category-music', url: 'http://localhost:3002/hobbies/category/music', fullPage: false },
  { name: 'login', url: 'http://localhost:3002/login', fullPage: false },
  { name: 'commitments', url: 'http://localhost:3002/commitments', fullPage: false },
  { name: 'manifesto', url: 'http://localhost:3002/manifesto', fullPage: true },
  { name: 'hobbies-fullpage', url: 'http://localhost:3002/hobbies', fullPage: true },
];

const browser = await chromium.launch();
const outDir = 'screenshots';

import { mkdirSync } from 'node:fs';
mkdirSync(outDir, { recursive: true });

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500); // let fonts + images settle
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
