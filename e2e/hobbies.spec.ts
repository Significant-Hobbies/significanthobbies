import { test, expect } from "@playwright/test";

test.describe("Hobby directory", () => {
  test("loads and shows categories", async ({ page }) => {
    await page.goto("/hobbies");
    await expect(page.locator("h1")).toContainText("Hobby");
    await expect(page.getByText("Creative")).toBeVisible();
    await expect(page.getByText("Physical")).toBeVisible();
  });

  test("hobby detail page loads", async ({ page }) => {
    await page.goto("/hobbies/guitar");
    await expect(page.locator("h1")).toContainText("Guitar");
    await expect(page.getByText("Music")).toBeVisible();
  });

  test("category page loads", async ({ page }) => {
    await page.goto("/hobbies/category/creative");
    await expect(page.locator("h1")).toContainText("Creative");
  });
});
