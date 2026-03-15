import { test, expect } from "@playwright/test";

test.describe("Famous Journeys", () => {
  test("journeys index loads", async ({ page }) => {
    await page.goto("/journeys");
    await expect(page.locator("h1")).toContainText("Famous Hobby Journeys");
    await expect(page.getByText("Steve Jobs")).toBeVisible();
  });

  test("journey detail page loads", async ({ page }) => {
    await page.goto("/journeys/steve-jobs");
    await expect(page.locator("h1")).toContainText("Steve Jobs");
  });
});
