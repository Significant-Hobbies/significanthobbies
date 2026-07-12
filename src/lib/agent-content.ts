import { blogPosts, type ContentBlock } from "~/lib/blog-posts";
import { ALL_HOBBIES, HOBBY_CATEGORIES, getCategoryForHobby } from "~/lib/hobbies";
import { getRoadmapForHobby } from "~/lib/hobby-roadmap";
import { getRelatedHobbies } from "~/lib/hobby-affinities";
import { SIDE_QUESTS } from "~/lib/side-quests";
import { getVideoBySlug, getVideosForHobby, publishedVideos } from "~/lib/videos";

const BASE_URL = "https://significanthobbies.com";

export type AgentContent = {
  title: string;
  description: string;
  canonical: string;
  body: string;
};

function document({ title, description, canonical, body }: AgentContent): string {
  return `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
canonical: ${canonical}
content_policy: search=yes, ai-train=no, use=reference
---

${body.trim()}

---

Canonical source: ${canonical}
`;
}

function hobbySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function hobbyFromSlug(slug: string): string | undefined {
  return ALL_HOBBIES.find((hobby) => hobbySlug(hobby) === slug);
}

function renderBlocks(blocks: ContentBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "paragraph": return block.text;
      case "heading": return `${block.level === 2 ? "##" : "###"} ${block.text}`;
      case "list": return block.items.map((item) => `- ${item}`).join("\n");
      case "callout": return `> ${block.emoji} ${block.text}`;
      case "quote": return `> ${block.text}${block.attribution ? `\n> — ${block.attribution}` : ""}`;
      case "divider": return "---";
      case "video": return `[${block.caption ?? "Watch the video"}](${block.url})`;
    }
  }).join("\n\n");
}

export function renderAgentContent(pathname: string): string | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

  if (normalized === "/") {
    return document({
      title: "Significant Hobbies",
      description: "Discover meaningful hobbies, try small Side Quests, map your hobby journey, and turn future experiences into a playable Life Bingo bucket list.",
      canonical: BASE_URL,
      body: `# Significant Hobbies

Significant Hobbies helps people make life less repetitive by moving from passive interest to real experiences.

## Start here

- [Browse the hobby directory](${BASE_URL}/hobbies)
- [Find your hobby](${BASE_URL}/find-your-hobby)
- [Try a Side Quest](${BASE_URL}/side-quests)
- [Make a Life Bingo bucket list](${BASE_URL}/life-bingo)
- [Read the Hobby Journal](${BASE_URL}/blog)
- [Watch practical hobby field films](${BASE_URL}/videos)`,
    });
  }

  if (normalized === "/hobbies") {
    const categories = HOBBY_CATEGORIES.map((category) => `## ${category.name}\n\n${category.hobbies.map((hobby) => `- [${hobby}](${BASE_URL}/hobbies/${hobbySlug(hobby)})`).join("\n")}`).join("\n\n");
    return document({ title: "Hobby directory", description: "The Significant Hobbies taxonomy, grouped into ten practical categories.", canonical: `${BASE_URL}/hobbies`, body: `# Hobby directory\n\n${categories}` });
  }

  const hobbyMatch = normalized.match(/^\/hobbies\/([a-z0-9-]+)$/);
  if (hobbyMatch) {
    const hobby = hobbyFromSlug(hobbyMatch[1]!);
    if (!hobby) return null;
    const roadmap = getRoadmapForHobby(hobby);
    const related = getRelatedHobbies(hobby);
    const videos = getVideosForHobby(hobbyMatch[1]!);
    const category = getCategoryForHobby(hobby);
    return document({
      title: `${hobby}: beginner roadmap and resources`,
      description: `A practical guide to starting ${hobby}, with concrete milestones and related hobbies.`,
      canonical: `${BASE_URL}${normalized}`,
      body: `# ${hobby}

Category: ${category?.name ?? "Hobby"}

## A practical way to begin

${roadmap.steps.map((step) => `### ${step.horizon}: ${step.goal}\n\n${step.action}`).join("\n\n")}

## Related hobbies

${related.map((item) => `- [${item.name}](${BASE_URL}/hobbies/${hobbySlug(item.name)}) — ${item.reason}`).join("\n") || "Explore the full hobby directory."}

${videos.length > 0 ? `## Watch and try\n\n${videos.map((video) => `- [${video.title}](${BASE_URL}/videos/${video.slug})`).join("\n")}` : ""}

## Next action

[Add a ${hobby} experience to your Bucket List](${BASE_URL}/bucket-list/new?idea=${encodeURIComponent(`Try ${hobby}`)})`,
    });
  }

  if (normalized === "/blog") {
    return document({ title: "The Hobby Journal", description: "Articles about hobbies, identity, curiosity, and making life less repetitive.", canonical: `${BASE_URL}/blog`, body: `# The Hobby Journal\n\n${blogPosts.map((post) => `- [${post.title}](${BASE_URL}/blog/${post.slug}) — ${post.excerpt}`).join("\n")}` });
  }

  const blogMatch = normalized.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const post = blogPosts.find((candidate) => candidate.slug === blogMatch[1]);
    if (!post) return null;
    return document({ title: post.title, description: post.excerpt, canonical: `${BASE_URL}${normalized}`, body: `# ${post.title}\n\n${post.excerpt}\n\n${renderBlocks(post.content)}\n\n[More from the Hobby Journal](${BASE_URL}/blog)` });
  }

  if (normalized === "/videos") {
    const list = publishedVideos.length > 0
      ? publishedVideos.map((video) => `- [${video.title}](${BASE_URL}/videos/${video.slug}) — ${video.description}`).join("\n")
      : "The first Significant Hobbies field films are in production. No placeholder videos are indexed.";
    return document({ title: "Significant Hobbies field films", description: "Practical hobby videos with written takeaways, chapters, and one thing to try next.", canonical: `${BASE_URL}/videos`, body: `# Watch something. Then do something.\n\n${list}` });
  }

  const videoMatch = normalized.match(/^\/videos\/([a-z0-9-]+)$/);
  if (videoMatch) {
    const video = getVideoBySlug(videoMatch[1]!);
    if (!video) return null;
    return document({
      title: video.title,
      description: video.description,
      canonical: `${BASE_URL}${normalized}`,
      body: `# ${video.title}

Creator: ${video.creatorName}  
Published: ${video.uploadDate}  
Duration: ${video.duration}  
[Watch on this page](${BASE_URL}${normalized})

## Field notes

${video.summary.join("\n\n")}

## Key takeaways

${video.takeaways.map((takeaway) => `- ${takeaway}`).join("\n")}

## Chapters

${video.chapters.map((chapter) => `- ${chapter.startSeconds}s — ${chapter.title}`).join("\n")}

${video.transcript ? `## Edited transcript\n\n${video.transcript.map((section) => `### ${section.heading}\n\n${section.paragraphs.join("\n\n")}`).join("\n\n")}` : ""}

## Do next

- [Explore the related hobby](${BASE_URL}/hobbies/${video.hobbySlug})
- [Add this experience to a Bucket List](${BASE_URL}/bucket-list/new?idea=${encodeURIComponent(video.bucketListPrompt)})`,
    });
  }

  if (normalized === "/life-bingo") {
    return document({ title: "Life Bingo", description: "A playable Bucket List that turns a life chapter into nine or twenty-five concrete experiences.", canonical: `${BASE_URL}/life-bingo`, body: `# Life Bingo\n\nLife Bingo is a visual way to use the same personal Bucket List. Choose a chapter, edit the suggested experiences, live them, and keep a small reflection for each completed square.\n\n## How it works\n\n1. Choose a month, season, year, or open-ended chapter.\n2. Generate nine or twenty-five editable experiences.\n3. Complete squares and keep the stories.\n4. Export or share the finished artifact.\n\n[Make your Life Bingo](${BASE_URL}/bucket-list/new)` });
  }

  if (normalized === "/side-quests") {
    return document({ title: "Side Quests", description: "Fifty small, concrete adventures that make an ordinary week more memorable.", canonical: `${BASE_URL}/side-quests`, body: `# Side Quests\n\n${SIDE_QUESTS.map((quest) => `## ${quest.emoji} ${quest.title}\n\n${quest.description}\n\nTime: ${quest.timeEstimate}. Difficulty: ${quest.difficulty}. Related hobbies: ${quest.relatedHobbies.join(", ")}.`).join("\n\n")}` });
  }

  if (normalized === "/what-are-significant-hobbies") {
    return document({ title: "What are significant hobbies?", description: "Significant hobbies are interests that shape identity, relationships, skills, and the stories a person remembers.", canonical: `${BASE_URL}/what-are-significant-hobbies`, body: `# What are significant hobbies?\n\nA significant hobby is not defined by prestige or productivity. It matters because it changes how a person spends attention, builds skill, meets people, or remembers a period of life.\n\n## The useful test\n\nA hobby is significant when it leaves evidence: a skill, a community, a body of work, a changed routine, or a story worth keeping.\n\n[Browse hobbies](${BASE_URL}/hobbies) or [map your hobby journey](${BASE_URL}/timeline/new).` });
  }

  return null;
}

export function buildLlmsIndex(expanded = false): string {
  const core = `# Significant Hobbies

> Significant Hobbies helps people discover meaningful hobbies, try concrete Side Quests, map their hobby history, and create playable Bucket Lists called Life Bingo.

## Core guides

- [What are significant hobbies?](${BASE_URL}/what-are-significant-hobbies): Definition and philosophy.
- [Hobby directory](${BASE_URL}/hobbies): ${ALL_HOBBIES.length} hobbies grouped by category.
- [Hobby Journal](${BASE_URL}/blog): Editorial guides and research-backed essays.
- [Side Quests](${BASE_URL}/side-quests): Fifty small adventures.
- [Life Bingo](${BASE_URL}/life-bingo): A shareable, playable Bucket List.
- [Field films](${BASE_URL}/videos): Practical videos with written notes and next actions.

## Machine-readable resources

- [Hobby taxonomy JSON](${BASE_URL}/api/hobbies)
- [XML sitemap](${BASE_URL}/sitemap.xml)
- [Video sitemap](${BASE_URL}/video-sitemap.xml)

## Content policy

Search and reference use are allowed. Model training is not allowed. Canonical HTML pages remain the source of truth.`;

  if (!expanded) return `${core}\n`;

  const hobbies = HOBBY_CATEGORIES.map((category) => `### ${category.name}\n${category.hobbies.map((hobby) => `- [${hobby}](${BASE_URL}/hobbies/${hobbySlug(hobby)})`).join("\n")}`).join("\n\n");
  const articles = blogPosts.map((post) => `- [${post.title}](${BASE_URL}/blog/${post.slug}): ${post.excerpt}`).join("\n");
  const videos = publishedVideos.map((video) => `- [${video.title}](${BASE_URL}/videos/${video.slug}): ${video.description}`).join("\n") || "- No published field films yet; drafts are intentionally excluded.";
  return `${core}\n\n## All hobby entities\n\n${hobbies}\n\n## All journal articles\n\n${articles}\n\n## All published field films\n\n${videos}\n`;
}
