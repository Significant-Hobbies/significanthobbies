import { editorialArticles } from '~/lib/editorial-content';

export function GET() {
  const articles = editorialArticles
    .map(
      (article) =>
        `- [${article.title}](https://significanthobbies.com/blog/${article.slug}): ${article.excerpt}`
    )
    .join('\n');
  return new Response(
    `# SignificantHobbies article index\n\nCanonical articles for agents and language models. Package-backed articles use the same URLs as human-facing blog pages.\n\n${articles}\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  );
}
