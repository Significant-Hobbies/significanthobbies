import { describe, expect, it } from "vitest";
import { GET as getAgentContent } from "../app/api/agent-content/route";
import { GET as getVideoSitemap } from "../app/video-sitemap.xml/route";
import { buildLlmsIndex, renderAgentContent } from "./agent-content";
import { isAgentReadablePath } from "./agent-routes";

describe("agent-readable content", () => {
  it("allowlists public knowledge routes and excludes private surfaces", () => {
    expect(isAgentReadablePath("/")).toBe(true);
    expect(isAgentReadablePath("/hobbies/photography")).toBe(true);
    expect(isAgentReadablePath("/blog/hobbies-heal-brain-rot")).toBe(true);
    expect(isAgentReadablePath("/bucket-list/private-id")).toBe(false);
    expect(isAgentReadablePath("/dashboard")).toBe(false);
    expect(isAgentReadablePath("/api/hobbies")).toBe(false);
  });

  it("renders canonical, useful Markdown for a hobby", () => {
    const markdown = renderAgentContent("/hobbies/photography");
    expect(markdown).toContain("canonical: https://significanthobbies.com/hobbies/photography");
    expect(markdown).toContain("## A practical way to begin");
    expect(markdown).toContain("Take 36 photos");
    expect(markdown).toContain("ai-train=no");
  });

  it("does not render unknown or unpublished video slugs", () => {
    expect(renderAgentContent("/videos/not-a-published-video")).toBeNull();
  });

  it("publishes concise and expanded LLM indexes", () => {
    const concise = buildLlmsIndex(false);
    const expanded = buildLlmsIndex(true);
    expect(concise).toContain("/api/hobbies");
    expect(concise).toContain("Search and reference use are allowed");
    expect(expanded).toContain("## All hobby entities");
    expect(expanded).toContain("/hobbies/photography");
    expect(expanded.length).toBeGreaterThan(concise.length);
  });

  it("serves negotiated content with provenance and policy headers", async () => {
    const response = getAgentContent(new Request("https://significanthobbies.com/api/agent-content?path=%2Flife-bingo"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-signal")).toBe("search=yes, ai-train=no, use=reference");
    expect(response.headers.get("vary")).toBe("Accept");
    expect(await response.text()).toContain("Canonical source: https://significanthobbies.com/life-bingo");
  });

  it("returns a valid, draft-safe video sitemap", async () => {
    const response = getVideoSitemap();
    const xml = await response.text();
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\"");
    expect(xml).not.toContain("not-a-published-video");
  });
});
