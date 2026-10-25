import { expect, test } from "@playwright/test";

// These run against the sample dataset in public/data.

test("filtering by AWD keeps models whose base trim is FWD", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "14 cars" })).toBeVisible();

  await page.getByRole("checkbox", { name: /AWD/ }).check();

  // The CR-V's cheapest trim is FWD, so the card names the AWD trim instead.
  const crv = page.getByRole("link", { name: /CR-V/ });
  await expect(crv).toContainText("Available on the EX AWD trim");
  await expect(page.getByRole("button", { name: /^AWD.*remove filter/ })).toBeVisible();
  await expect(page).toHaveURL(/drive=AWD/);
});

test("an impossible combination suggests which filter to remove", async ({ page }) => {
  await page.goto("/?body=convertible&power=electric");
  await expect(page.getByText("No cars match all of those filters")).toBeVisible();
  await page.getByRole("button", { name: /^Remove / }).click();
  await expect(page.getByRole("heading", { name: /\d+ cars?/ })).toBeVisible();
});

test("search jumps to a model page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Search by brand or model" }).fill("ioniq");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/cars\/hyundai-ioniq-5-2026$/);
  await expect(page.getByRole("heading", { level: 1, name: "Ioniq 5" })).toBeVisible();
});

test("sorting by longest range puts electric cars first", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sort by").selectOption("range");
  // The Rivian's Tri Max trim has the longest range in the sample data.
  await expect(page.locator(".model-card").first()).toContainText("R1S");
});
