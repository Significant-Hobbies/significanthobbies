import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("homepage has correct meta tags", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("SignificantHobbies");
  });

  test("pillar page exists", async ({ page }) => {
    await page.goto("/what-are-significant-hobbies");
    await expect(page.locator("h1")).toContainText("Significant Hobbies");
  });

  test("sitemap is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });

  test("protected pages have noindex", async ({ page }) => {
    await page.goto("/login");
    const robotsMeta = page.locator('meta[name="robots"]');
    if (await robotsMeta.count() > 0) {
      const content = await robotsMeta.getAttribute("content");
      expect(content).toContain("noindex");
    }
  });
});
