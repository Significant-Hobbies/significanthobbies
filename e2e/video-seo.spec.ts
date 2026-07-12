import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Video and agent discovery", () => {
  test("renders the video library with canonical metadata and no placeholder indexing", async ({ page }) => {
    await page.goto("/videos");
    await expect(page.getByRole("heading", { name: "Watch something. Then do something." })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://significanthobbies.com/videos");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("publishes LLM indexes and a valid draft-safe video sitemap", async ({ request }) => {
    const llms = await request.get("/llms.txt");
    expect(llms.ok()).toBe(true);
    expect(llms.headers()["content-signal"]).toBe("search=yes, ai-train=no, use=reference");
    expect(await llms.text()).toContain("/api/hobbies");

    const sitemap = await request.get("/video-sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\"");
  });

  test("negotiates public hobby pages to Markdown with canonical provenance", async ({ request }) => {
    const response = await request.get("/hobbies/photography", { headers: { Accept: "text/markdown" } });
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(response.headers()["vary"]).toContain("Accept");
    const markdown = await response.text();
    expect(markdown).toContain("canonical: https://significanthobbies.com/hobbies/photography");
    expect(markdown).toContain("## A practical way to begin");
  });

  test("does not negotiate protected pages", async ({ request }) => {
    const response = await request.get("/dashboard", { headers: { Accept: "text/markdown" }, maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/login");
  });

  test("has no serious accessibility issues or mobile overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/videos");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  });
});
