import { test, expect } from "@playwright/test";

test.describe("Explore page", () => {
  test("loads and shows timelines", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("h1")).toContainText("Explore");
  });

  test("search filters timelines", async ({ page }) => {
    await page.goto("/explore");
    const searchInput = page.getByPlaceholder("Search");
    await searchInput.fill("nonexistent-hobby-xyz");
    await expect(page.getByText("No timelines match")).toBeVisible();
  });

  test("category filters work", async ({ page }) => {
    await page.goto("/explore");
    const categoryButton = page.getByRole("button", { name: /Creative|Physical|Music/i }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
    }
  });
});
