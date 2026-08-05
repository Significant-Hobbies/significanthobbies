import { type EditorialArticle, editorialArticles } from '~/lib/editorial-content';
import { BRAND_NAME } from '~/lib/site-metadata';

export function buildLlmArticleIndex(articles: EditorialArticle[]): string {
  const entries = articles
    .map(
      (article) =>
        `- [${article.title}](https://significanthobbies.com/blog/${article.slug}): ${article.excerpt}`
    )
    .join('\n');
  return `# ${BRAND_NAME} article index\n\nCanonical articles for agents and language models. Package-backed articles use the same URLs as human-facing blog pages.\n\n${entries}\n`;
}

export function GET(request: Request) {
  const acceptsMarkdown = request.headers.get('accept')?.includes('text/markdown') ?? false;
  return new Response(buildLlmArticleIndex(editorialArticles), {
    headers: {
      'Content-Type': `${acceptsMarkdown ? 'text/markdown' : 'text/plain'}; charset=utf-8`,
      Vary: 'Accept',
    },
  });
}
