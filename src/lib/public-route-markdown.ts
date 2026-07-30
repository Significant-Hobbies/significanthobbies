import { and, desc, eq } from 'drizzle-orm';

import { timelines, users } from '~/db/schema';
import { getEditorialArticle, editorialArticles } from '~/lib/editorial-content';
import {
  EXPERIENCE_ENTRIES,
  findExperience,
  firstSteps,
  relatedExperiences,
} from '~/lib/experiences';
import { FAMOUS_BUCKET_LISTS, getFamousBucketList } from '~/lib/famous-bucket-lists';
import { FAMOUS_JOURNEYS } from '~/lib/famous-journeys';
import { getCategoryForHobby, HOBBY_CATEGORIES } from '~/lib/hobbies';
import { getRelatedHobbies } from '~/lib/hobby-affinities';
import { getResourcesForHobby } from '~/lib/hobby-resources';
import { getRoadmapForHobby } from '~/lib/hobby-roadmap';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';
import type { Phase } from '~/lib/types';

const SITE_URL = 'https://significanthobbies.com';

const STATIC_PAGES: Record<string, { title: string; summary: string }> = {
  '/about': {
    title: 'About Significant Hobbies',
    summary:
      'A life planner for private daily rituals and public living: hobbies, bucket lists, experiences, side quests, and opt-in profiles.',
  },
  '/bucket-list-before-30': {
    title: 'Bucket list ideas before 30',
    summary: 'Milestones and experiences people often want to make room for before 30.',
  },
  '/bucket-list-before-50': {
    title: 'Bucket list ideas before 50',
    summary: 'Meaningful experiences, relationships, and achievements to consider before 50.',
  },
  '/bucket-list-ideas': {
    title: 'Bucket list ideas',
    summary: 'A large categorized collection of travel, creative, social, and personal ambitions.',
  },
  '/changelog': {
    title: 'Significant Hobbies changelog',
    summary: 'Verified improvements to daily reflection, hobby discovery, and life planning.',
  },
  '/cheap-hobbies': {
    title: 'Free and cheap hobbies',
    summary: 'Low-cost hobbies with practical ways to begin without buying a large starter kit.',
  },
  '/compare': {
    title: 'Compare hobbies',
    summary: 'Compare two hobbies by cost, energy, setting, social style, and learning curve.',
  },
  '/find-your-hobby': {
    title: 'Find your hobby',
    summary: 'A guided quiz that matches interests, constraints, and preferred pace to hobbies.',
  },
  '/get-started': {
    title: 'Get started with Significant Hobbies',
    summary: 'Choose a username and begin a hobby timeline; guest exploration remains available.',
  },
  '/hobbies-for-adults': {
    title: 'Hobbies for adults',
    summary:
      'A practical directory of adult hobbies across creative, physical, social, and quiet pursuits.',
  },
  '/hobbies-for-mental-health': {
    title: 'Hobbies for mental health',
    summary: 'Evidence-aware hobby ideas for attention, connection, movement, and stress relief.',
  },
  '/hobbies-for-resume': {
    title: 'Hobbies for a resume',
    summary:
      'How to describe genuine hobbies when they demonstrate relevant skills or sustained commitment.',
  },
  '/hobbies-to-try': {
    title: 'New hobbies to try',
    summary:
      'Beginner-friendly and more adventurous pursuits, organized by the experience they offer.',
  },
  '/hobbies/random': {
    title: 'Random hobby',
    summary:
      'A randomized prompt from the Significant Hobbies catalog for breaking choice paralysis.',
  },
  '/how-to-make-a-bucket-list': {
    title: 'How to make a bucket list',
    summary:
      'A practical method for choosing meaningful ambitions and turning one into a next step.',
  },
  '/life-bingo': {
    title: 'Life bingo',
    summary: 'An anonymous tool for arranging experiences into a personal life-list board.',
  },
  '/life-in-weeks': {
    title: 'Your life in weeks',
    summary:
      'An anonymous life grid that uses conditional life expectancy to frame the time ahead.',
  },
  '/manifesto': {
    title: 'The Significant Hobbies manifesto',
    summary:
      'A case for treating attention and leisure as parts of a life rather than leftover time.',
  },
  '/privacy': {
    title: 'Privacy',
    summary:
      'How Significant Hobbies handles accounts, private practice, public sharing, and analytics.',
  },
  '/search': {
    title: 'Search Significant Hobbies',
    summary: 'Search public hobbies, experiences, editorial guides, and life-planning resources.',
  },
  '/side-quests': {
    title: 'Side quests',
    summary: 'Small, low-stakes experiments for exploring life outside the main obligations.',
  },
  '/starter-kits': {
    title: 'Local hobby starter kits',
    summary: 'Practical first supplies and local starting points for common hobbies.',
  },
  '/terms': {
    title: 'Terms of use',
    summary: 'The terms that govern use of Significant Hobbies.',
  },
  '/tools': {
    title: 'Hobby tools',
    summary: 'Free calculators for understanding available time and the real cost of a hobby.',
  },
  '/tools/cost-calculator': {
    title: 'Hobby cost calculator',
    summary: 'Estimate setup and ongoing costs before committing to a hobby.',
  },
  '/tools/time-calculator': {
    title: 'Hobby time calculator',
    summary:
      'Estimate realistic weekly time for a hobby around work, sleep, and existing obligations.',
  },
  '/travel-bucket-list': {
    title: 'Travel bucket list',
    summary: 'Destinations and travel experiences organized by region and type of trip.',
  },
  '/what-are-significant-hobbies': {
    title: 'What are significant hobbies?',
    summary:
      'How hobbies become meaningful through identity, relationships, seasons of life, and sustained attention.',
  },
};

export async function renderPublicRouteMarkdown(pathname: string): Promise<string | null> {
  const path = normalizePath(pathname);
  const source = `${SITE_URL}${path === '/' ? '' : path}`;

  if (path === '/') {
    return page(
      'Significant Hobbies',
      source,
      'A life planner for private daily rituals and public living.',
      [
        'Explore hobbies, experiences, bucket lists, and famous hobby journeys.',
        'Use the anonymous life-in-weeks and life-bingo tools without creating an account.',
        'Private daily practice and saved timelines require an account and are not agent-indexed.',
      ]
    );
  }
  if (path === '/explore') return renderExplore(source);
  if (path === '/hobbies') return renderHobbyIndex(source);
  if (path === '/experiences') return renderExperienceIndex(source);
  if (path === '/journeys') return renderJourneyIndex(source);
  if (path === '/bucket-lists') return renderBucketListIndex(source);
  if (path === '/blog') return renderBlogIndex(source);

  const staticPage = STATIC_PAGES[path];
  if (staticPage) return page(staticPage.title, source, staticPage.summary);

  const categoryMatch = path.match(/^\/hobbies\/category\/([^/]+)$/);
  if (categoryMatch) return renderHobbyCategory(categoryMatch[1]!, source);

  const hobbyMatch = path.match(/^\/hobbies\/([^/]+)$/);
  if (hobbyMatch) return renderHobby(hobbyMatch[1]!, source);

  const experienceMatch = path.match(/^\/experiences\/([^/]+)$/);
  if (experienceMatch) return renderExperience(experienceMatch[1]!, source);

  const journeyMatch = path.match(/^\/journeys\/([^/]+)$/);
  if (journeyMatch) return renderJourney(journeyMatch[1]!, source);

  const bucketListMatch = path.match(/^\/bucket-lists\/([^/]+)$/);
  if (bucketListMatch) return renderBucketList(bucketListMatch[1]!, source);

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return renderArticle(blogMatch[1]!, source);

  const profileMatch = path.match(/^\/u\/([^/]+)$/);
  if (profileMatch) return renderPublicProfile(profileMatch[1]!, source);

  return null;
}

async function renderExplore(source: string) {
  try {
    const rows = await db
      .select({
        title: timelines.title,
        slug: timelines.slug,
        username: users.username,
      })
      .from(timelines)
      .leftJoin(users, eq(timelines.userId, users.id))
      .where(eq(timelines.visibility, 'PUBLIC'))
      .orderBy(desc(timelines.updatedAt))
      .limit(100);
    return page(
      'Explore public hobby timelines',
      source,
      'Recent opt-in public timelines from the Significant Hobbies community.',
      rows.map((row) => {
        const href =
          row.username && row.slug
            ? `${SITE_URL}/u/${encodeURIComponent(row.username)}/${encodeURIComponent(row.slug)}`
            : null;
        const title = plain(row.title ?? 'Untitled timeline');
        return href ? `[${title}](${href})` : title;
      })
    );
  } catch {
    return page(
      'Explore public hobby timelines',
      source,
      'Recent opt-in public timelines. Live entries are temporarily unavailable.'
    );
  }
}

function renderHobbyIndex(source: string) {
  const sections = HOBBY_CATEGORIES.map(
    (category) =>
      `## ${category.emoji} ${category.name}\n\n${category.hobbies
        .map((hobby) => `- [${hobby}](${SITE_URL}/hobbies/${slugify(hobby)})`)
        .join('\n')}`
  );
  return page(
    'Hobby directory',
    source,
    `${HOBBY_CATEGORIES.reduce((sum, category) => sum + category.hobbies.length, 0)} hobbies across ${HOBBY_CATEGORIES.length} categories.`,
    sections,
    false
  );
}

function renderHobbyCategory(slug: string, source: string) {
  const category = HOBBY_CATEGORIES.find((item) => slugify(item.name) === slug);
  if (!category) return null;
  return page(
    `${category.name} hobbies`,
    source,
    `Browse ${category.hobbies.length} ${category.name.toLowerCase()} hobbies.`,
    category.hobbies.map((hobby) => `[${hobby}](${SITE_URL}/hobbies/${slugify(hobby)})`)
  );
}

function renderHobby(slug: string, source: string) {
  const hobby = HOBBY_CATEGORIES.flatMap((category) => category.hobbies).find(
    (item) => slugify(item) === slug
  );
  if (!hobby) return null;
  const category = getCategoryForHobby(hobby);
  const roadmap = getRoadmapForHobby(hobby);
  const resources = getResourcesForHobby(hobby);
  const related = getRelatedHobbies(hobby);
  const sections = [
    `## A path from today to three months\n\n${roadmap.steps
      .map((step) => `### ${step.horizon}: ${step.goal}\n\n${step.action}`)
      .join('\n\n')}`,
    resources.length
      ? `## Resources\n\n${resources
          .map(
            (resource) =>
              `- [${plain(resource.name)}](${resource.url}) — ${plain(resource.description)}`
          )
          .join('\n')}`
      : '',
    related.length
      ? `## Related hobbies\n\n${related
          .map(
            (item) =>
              `- [${plain(item.name)}](${SITE_URL}/hobbies/${slugify(item.name)}) — ${plain(item.reason)}`
          )
          .join('\n')}`
      : '',
  ].filter(Boolean);
  return page(
    hobby,
    source,
    `${category?.name ?? 'Hobby'} pursuit with a practical starting roadmap and related directions.`,
    sections,
    false
  );
}

function renderExperienceIndex(source: string) {
  const sections = EXPERIENCE_ENTRIES.map((entry) => {
    const label = `${entry.emoji} ${entry.title}`;
    return entry.description
      ? `[${label}](${SITE_URL}/experiences/${entry.slug}) — ${plain(entry.description)}`
      : label;
  });
  return page(
    'Experiences worth making room for',
    source,
    `${EXPERIENCE_ENTRIES.length} places, milestones, and ideas worth considering.`,
    sections
  );
}

function renderExperience(slug: string, source: string) {
  const entry = findExperience(slug);
  if (!entry?.description) return null;
  const steps = firstSteps(entry);
  const related = relatedExperiences(entry);
  return page(
    `${entry.emoji} ${entry.title}`,
    source,
    entry.description,
    [
      `## How to start\n\n${steps
        .map((step) => `### ${step.emoji} ${step.title}\n\n${step.body}`)
        .join('\n\n')}`,
      `## Related experiences\n\n${related
        .map((item) =>
          item.description
            ? `- [${item.emoji} ${item.title}](${SITE_URL}/experiences/${item.slug})`
            : `- ${item.emoji} ${item.title}`
        )
        .join('\n')}`,
    ],
    false
  );
}

function renderJourneyIndex(source: string) {
  return page(
    'Famous hobby journeys',
    source,
    `How hobbies changed across ${FAMOUS_JOURNEYS.length} remarkable lives.`,
    FAMOUS_JOURNEYS.map(
      (person) =>
        `[${person.emoji} ${person.name}](${SITE_URL}/journeys/${person.slug}) — ${plain(person.knownFor)}`
    )
  );
}

function renderJourney(slug: string, source: string) {
  const person = FAMOUS_JOURNEYS.find((item) => item.slug === slug);
  if (!person) return null;
  return page(
    `${person.name}'s hobby journey`,
    source,
    person.knownFor,
    person.phases.map(
      (phase) => `## ${phase.label}\n\n${phase.hobbies.map((hobby) => `- ${hobby}`).join('\n')}`
    ),
    false
  );
}

function renderBucketListIndex(source: string) {
  return page(
    'Verified public bucket lists',
    source,
    `${FAMOUS_BUCKET_LISTS.length} sourced lists from notable people.`,
    FAMOUS_BUCKET_LISTS.map(
      (list) =>
        `[${list.emoji} ${list.name}](${SITE_URL}/bucket-lists/${list.slug}) — ${plain(list.knownFor)}`
    )
  );
}

function renderBucketList(slug: string, source: string) {
  const list = getFamousBucketList(slug);
  if (!list) return null;
  const sections = [
    ...list.items.map(
      (item) =>
        `## ${item.title}\n\n${plain(item.description)}\n\nStatus: ${item.status.replaceAll('_', ' ')}${
          item.completedNote ? `\n\n${plain(item.completedNote)}` : ''
        }`
    ),
    list.sources?.length
      ? `## Sources\n\n${list.sources
          .map((item) => `- [${plain(item.label)}](${item.url})`)
          .join('\n')}`
      : '',
  ].filter(Boolean);
  return page(`${list.name}'s bucket list`, source, list.knownFor, sections, false);
}

function renderBlogIndex(source: string) {
  return page(
    'Hobby journal',
    source,
    'Long-form writing about hobbies, identity, leisure, and living curiously.',
    editorialArticles.map(
      (article) =>
        `[${article.title}](${SITE_URL}/blog/${article.slug}) — ${plain(article.excerpt)}`
    )
  );
}

function renderArticle(slug: string, source: string) {
  const article = getEditorialArticle(slug);
  if (!article) return null;
  const content = article.content
    .map((block) => {
      if (block.type === 'heading') return `${'#'.repeat(block.level)} ${plain(block.text)}`;
      if (block.type === 'paragraph') return plain(block.text);
      if (block.type === 'list') return block.items.map((item) => `- ${plain(item)}`).join('\n');
      if (block.type === 'callout') return `> ${block.emoji} ${plain(block.text)}`;
      if (block.type === 'quote') {
        return `> ${plain(block.text)}${block.attribution ? `\n>\n> — ${plain(block.attribution)}` : ''}`;
      }
      if (block.type === 'video')
        return `[Video](${block.url})${block.caption ? ` — ${plain(block.caption)}` : ''}`;
      return '---';
    })
    .join('\n\n');
  return page(article.title, source, article.excerpt, [content], false);
}

async function renderPublicProfile(rawUsername: string, source: string) {
  const username = decodeURIComponent(rawUsername);
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: { id: true, name: true, username: true, bio: true, website: true, creed: true },
    });
    if (!user?.username) return null;
    const rows = await db
      .select({ title: timelines.title, slug: timelines.slug, phases: timelines.phases })
      .from(timelines)
      .where(and(eq(timelines.userId, user.id), eq(timelines.visibility, 'PUBLIC')))
      .orderBy(desc(timelines.updatedAt));
    if (rows.length === 0) return null;
    const sections = rows.map((row) => {
      const phases = parseJSONColumn<Phase[]>(row.phases, [], `agent-profile:${user.id}`);
      return `## ${plain(row.title ?? 'Untitled timeline')}\n\n${phases
        .map(
          (phase) =>
            `### ${plain(phase.label)}\n\n${phase.hobbies.map((hobby) => `- ${plain(hobby.name)}`).join('\n')}`
        )
        .join('\n\n')}`;
    });
    const summary = [user.bio, user.creed]
      .filter((value): value is string => Boolean(value))
      .map(plain)
      .join(' ');
    return page(
      user.name ? `${plain(user.name)} (@${user.username})` : `@${user.username}`,
      source,
      summary || 'An opt-in public Significant Hobbies profile.',
      sections,
      false
    );
  } catch {
    return null;
  }
}

function page(
  title: string,
  source: string,
  summary: string,
  items: string[] = [],
  listItems = true
) {
  const content = items
    .filter(Boolean)
    .map((item) => (listItems ? `- ${item}` : item))
    .join('\n\n');
  return `# ${plain(title)}\n\n> Source: ${source}\n\n${plain(summary)}${content ? `\n\n${content}` : ''}\n`;
}

function plain(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return `/${pathname}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
}
