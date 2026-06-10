import { expect,test } from "@playwright/test";

test.describe("Blog", () => {
  test("blog index loads with posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toContainText("Hobby Journal");
  });

  test("blog post loads", async ({ page }) => {
    await page.goto("/blog/side-quests");
    await expect(page.locator("h1")).toContainText("Side Quests");
  });
});
