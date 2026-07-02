// Convert and resize images to WebP using sharp.
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

async function processDir(inputDir, outputDir, widths) {
  await mkdir(outputDir, { recursive: true });
  const files = (await readdir(inputDir)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of files) {
    const stem = basename(file, extname(file));
    const input = join(inputDir, file);

    for (const width of widths) {
      const out = join(outputDir, `${stem}-${width}.webp`);
      await sharp(input)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
      console.log(`  ${out}`);
    }
    // Also a full-res WebP
    const fullOut = join(outputDir, `${stem}.webp`);
    await sharp(input).webp({ quality: 80 }).toFile(fullOut);
    console.log(`  ${fullOut}`);
  }
}

const ROOT = process.cwd();

// Hero — large for full-bleed landing
console.log('Hero:');
await processDir(
  join(ROOT, 'landing-astro/public/hero'),
  join(ROOT, 'landing-astro/public/hero'),
  [640, 1280, 1920, 2560]
);

// Categories — header banners
console.log('Categories:');
await processDir(
  join(ROOT, 'public/categories/raw'),
  join(ROOT, 'public/categories'),
  [400, 800, 1200]
);

console.log('Done.');
