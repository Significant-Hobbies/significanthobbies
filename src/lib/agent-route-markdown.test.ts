import { describe, expect, it, vi } from 'vitest';

import sitemap from '~/app/sitemap';
import { editorialArticles } from '~/lib/editorial-content';
import { PAGED_EXPERIENCES } from '~/lib/experiences';
import { FAMOUS_JOURNEYS } from '~/lib/famous-journeys';
import apiCatalog from '../../public/api-ai.json';
import {
  handlePublicRouteMarkdown,
  htmlPathFromMarkdown,
  isAgentReadableSitemapPath,
  isPublicAgentDocumentPath,
  markdownPathFor,
} from '../../agent-route-markdown.mjs';
import { renderPublicRouteMarkdown } from '~/lib/public-route-markdown';

describe('public route Markdown boundary', () => {
  it('maps explicit Markdown alternates to their public documents', () => {
    expect(markdownPathFor('/hobbies/painting')).toBe('/hobbies/painting.md');
    expect(htmlPathFromMarkdown('/hobbies/painting.md')).toBe('/hobbies/painting');
    expect(htmlPathFromMarkdown('/hobbies/painting/index.md')).toBe('/hobbies/painting');
    expect(markdownPathFor('/')).toBe('/index.md');
  });

  it('covers public route families but excludes private application routes', () => {
    expect(isPublicAgentDocumentPath('/experiences/see-the-northern-lights')).toBe(true);
    expect(isPublicAgentDocumentPath('/hobbies/category/creative')).toBe(true);
    expect(isPublicAgentDocumentPath('/u/public-person')).toBe(true);
    expect(isPublicAgentDocumentPath('/u/public-person/unlisted-timeline')).toBe(false);
    expect(isPublicAgentDocumentPath('/daily')).toBe(false);
    expect(isPublicAgentDocumentPath('/settings')).toBe(false);
    expect(isPublicAgentDocumentPath('/timeline/private-id')).toBe(false);
  });

  it('negotiates Markdown from the canonical route source', async () => {
    const load = vi.fn(async (path: string) => renderPublicRouteMarkdown(path));
    const response = await handlePublicRouteMarkdown(
      new Request('https://significanthobbies.com/hobbies/painting', {
        headers: { Accept: 'text/markdown, text/html;q=0.1' },
      }),
      load
    );

    expect(response?.status).toBe(200);
    expect(response?.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response?.headers.get('content-location')).toBe('/hobbies/painting.md');
    expect(await response?.text()).toContain('# Painting');
    expect(load).toHaveBeenCalledWith('/hobbies/painting', expect.any(Request));
  });

  it('returns explicit Markdown failures instead of exposing private or empty shells', async () => {
    const privateResponse = await handlePublicRouteMarkdown(
      new Request('https://significanthobbies.com/daily.md'),
      vi.fn()
    );
    expect(privateResponse?.status).toBe(404);
    expect(privateResponse?.headers.get('content-type')).toContain('text/markdown');

    const emptyResponse = await handlePublicRouteMarkdown(
      new Request('https://significanthobbies.com/explore.md'),
      async () => null
    );
    expect(emptyResponse?.status).toBe(404);
    expect(await emptyResponse?.text()).not.toContain('<html>');
  });

  it('renders every generated public corpus route from canonical source data', async () => {
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    const uncovered = paths.filter((path) => !isAgentReadableSitemapPath(path));
    const staticCorpus = paths.filter(
      (path) =>
        !path.startsWith('/u/') && !['/index.md', '/llms-full.txt', '/llms.txt'].includes(path)
    );
    const rendered = await Promise.all(
      staticCorpus.map(async (path) => [path, await renderPublicRouteMarkdown(path)] as const)
    );

    expect(entries.length).toBeGreaterThan(500);
    expect(uncovered).toEqual([]);
    expect(rendered.filter(([, markdown]) => markdown === null).map(([path]) => path)).toEqual([]);
  });

  it('renders substantive Markdown for each public content family', async () => {
    const hobby = await renderPublicRouteMarkdown('/hobbies/drawing');
    const experience = await renderPublicRouteMarkdown(
      `/experiences/${PAGED_EXPERIENCES[0]!.slug}`
    );
    const journey = await renderPublicRouteMarkdown(`/journeys/${FAMOUS_JOURNEYS[0]!.slug}`);
    const blog = await renderPublicRouteMarkdown(`/blog/${editorialArticles[0]!.slug}`);

    expect(hobby).toContain('## A path from today to three months');
    expect(hobby).toContain('## Resources');
    expect(experience).toContain('## How to start');
    expect(journey).toContain(FAMOUS_JOURNEYS[0]!.name);
    expect(blog).toContain('> Source: https://significanthobbies.com/blog/');
    expect(await renderPublicRouteMarkdown('/daily')).toBeNull();
  });

  it('advertises only bounded surfaces with real same-origin Markdown targets', () => {
    const publicRoutes = new Set(['/', '/explore']);

    expect(apiCatalog.surfaces).toHaveLength(2);
    for (const surface of apiCatalog.surfaces) {
      const url = new URL(surface.url);
      const markdown = new URL(surface.md);
      expect(url.origin).toBe(apiCatalog.url);
      expect(markdown.origin).toBe(apiCatalog.url);
      expect(publicRoutes.has(url.pathname)).toBe(true);
      expect(
        markdown.pathname === '/index.md' ||
          isPublicAgentDocumentPath(htmlPathFromMarkdown(markdown.pathname))
      ).toBe(true);
    }
  });
});
