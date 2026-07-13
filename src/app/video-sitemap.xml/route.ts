import { type ContentPackage, getPublishedPackages } from '~/lib/content-packages';

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]!
  );
}

export function buildVideoSitemap(packages: ContentPackage[]): string {
  const entries = packages
    .filter((pkg) => pkg.youtube)
    .map((pkg) => {
      const video = pkg.youtube!;
      return `<url><loc>https://significanthobbies.com/blog/${escapeXml(pkg.slug)}</loc><video:video>${video.thumbnailUrl ? `<video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>` : ''}<video:title>${escapeXml(pkg.title)}</video:title><video:description>${escapeXml(pkg.excerpt)}</video:description><video:content_loc>${escapeXml(video.url)}</video:content_loc><video:publication_date>${escapeXml(video.publishedAt)}</video:publication_date></video:video></url>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries}</urlset>`;
}

export function GET() {
  return new Response(buildVideoSitemap(getPublishedPackages()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
