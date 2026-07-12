import { describe, expect, it } from "vitest";
import {
  formatTimestamp,
  getVideoJsonLd,
  getYouTubePublishingPackage,
  validatePublishedVideoCatalog,
  type PublishedVideo,
} from "./videos";

const fixture: PublishedVideo = {
  slug: "how-to-start-a-creative-hobby",
  youtubeId: "abcdefghijk",
  title: "How to Start a Creative Hobby When You Feel Stuck",
  shortTitle: "Start a creative hobby",
  description: "A practical field guide to choosing one creative hobby, lowering the stakes, and completing a first small project this week.",
  searchIntent: "how to start a creative hobby as a complete beginner",
  hobbySlug: "drawing",
  creatorName: "Significant Hobbies",
  uploadDate: "2026-07-12",
  duration: "PT8M30S",
  thumbnailUrl: "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg",
  summary: [
    "Starting a creative hobby is easier when the first project is deliberately small and concrete instead of tied to a new identity.",
    "This guide turns curiosity into one low-pressure session, a visible result, and a next step worth repeating.",
  ],
  takeaways: [
    "Choose a result you can finish in one sitting.",
    "Use constraints to make the first decision easier.",
    "Save the next idea before the session ends.",
  ],
  chapters: [
    { title: "Why starting feels difficult", startSeconds: 0 },
    { title: "Choose a tiny first project", startSeconds: 95 },
    { title: "Create your next step", startSeconds: 360 },
  ],
  transcript: [{ heading: "Start smaller than your ambition", paragraphs: ["A useful first creative session produces evidence that you can begin, not proof that you are already excellent at the craft."] }],
  relatedArticleSlugs: [],
  bucketListPrompt: "Finish one tiny drawing in a single sitting",
};

describe("video catalog", () => {
  it("accepts a complete published record", () => {
    expect(validatePublishedVideoCatalog([fixture])).toEqual([fixture]);
  });

  it("rejects incomplete records", () => {
    expect(() => validatePublishedVideoCatalog([{ ...fixture, description: "Too short" }])).toThrow();
  });

  it("rejects duplicate slugs, search intents, and YouTube ids", () => {
    expect(() => validatePublishedVideoCatalog([fixture, fixture])).toThrow("Duplicate video slug");
    expect(() => validatePublishedVideoCatalog([fixture, { ...fixture, slug: "another-video" }])).toThrow("Duplicate video search intent");
    expect(() => validatePublishedVideoCatalog([fixture, { ...fixture, slug: "another-video", searchIntent: "another sufficiently specific intent" }])).toThrow("Duplicate YouTube id");
  });

  it("requires chapters to begin at zero and remain ordered", () => {
    expect(() => validatePublishedVideoCatalog([{ ...fixture, chapters: [{ title: "Late opening chapter", startSeconds: 20 }, ...fixture.chapters.slice(1)] }])).toThrow("must start");
    expect(() => validatePublishedVideoCatalog([{ ...fixture, chapters: [fixture.chapters[0], { title: "Later section", startSeconds: 120 }, { title: "Earlier section", startSeconds: 90 }] }])).toThrow("ascending");
  });

  it("keeps schema, chapters, and YouTube publishing metadata aligned", () => {
    const jsonLd = getVideoJsonLd(fixture);
    const publishing = getYouTubePublishingPackage(fixture);
    expect(jsonLd.name).toBe(fixture.title);
    expect(jsonLd.hasPart[1]).toMatchObject({ name: "Choose a tiny first project", startOffset: 95 });
    expect(publishing.canonicalUrl).toBe("https://significanthobbies.com/videos/how-to-start-a-creative-hobby");
    expect(publishing.chapters).toContain("01:35 Choose a tiny first project");
    expect(formatTimestamp(3661)).toBe("1:01:01");
  });
});
