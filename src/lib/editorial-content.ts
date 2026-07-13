import { type BlogPost, blogPosts, type ContentBlock } from '~/lib/blog-posts';
import {
  type ContentPackage,
  getPackageBySlug,
  getPackagesForHobby,
  getPublishedPackages,
} from '~/lib/content-packages';

export type EditorialArticle = BlogPost & { package?: ContentPackage };

function packageBlocks(pkg: ContentPackage): ContentBlock[] {
  return pkg.sections.flatMap((section) => [
    { type: 'heading' as const, level: 2 as const, text: section.heading },
    ...section.paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
  ]);
}

export function packageToArticle(pkg: ContentPackage): EditorialArticle {
  return {
    slug: pkg.slug,
    title: pkg.title,
    excerpt: pkg.excerpt,
    category: pkg.category,
    emoji: pkg.emoji,
    readTime: pkg.readTime,
    publishedAt: pkg.publishedAt!,
    content: packageBlocks(pkg),
    package: pkg,
  };
}

function assertNoDuplicateSlugs(articles: EditorialArticle[]): EditorialArticle[] {
  const seen = new Set<string>();
  for (const article of articles) {
    if (seen.has(article.slug)) throw new Error(`duplicate editorial slug: ${article.slug}`);
    seen.add(article.slug);
  }
  return articles;
}

export const editorialArticles = assertNoDuplicateSlugs([
  ...getPublishedPackages().map(packageToArticle),
  ...blogPosts,
]);

export function getEditorialArticle(slug: string): EditorialArticle | undefined {
  const pkg = getPackageBySlug(slug);
  return pkg ? packageToArticle(pkg) : blogPosts.find((post) => post.slug === slug);
}

export function getEditorialArticlesForHobby(hobby: string): EditorialArticle[] {
  const packageArticles = getPackagesForHobby(hobby).map(packageToArticle);
  const search = hobby.toLowerCase();
  const legacy = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(search) ||
      post.excerpt.toLowerCase().includes(search) ||
      post.content.some(
        (block) => block.type === 'paragraph' && block.text.toLowerCase().includes(search)
      )
  );
  return assertNoDuplicateSlugs([...packageArticles, ...legacy]).slice(0, 4);
}
