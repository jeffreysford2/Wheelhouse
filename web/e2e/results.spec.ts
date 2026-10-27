import { expect, test } from "@playwright/test";

// These run against the published data in public/data (the 40 hand-collected
// 2026 models). If a refresh changes a figure named here, update the test.

test("filtering by AWD keeps models whose base trim is FWD", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "40 cars" })).toBeVisible();

  await page.getByRole("checkbox", { name: /AWD/ }).check();

  // The CR-V's cheapest trim is FWD, so the card names the AWD trim instead.
  const crv = page.getByRole("link", { name: /CR-V/ });
  await expect(crv).toContainText("Available on the LX AWD trim");
  await expect(page.getByRole("button", { name: /^AWD.*remove filter/ })).toBeVisible();
  await expect(page).toHaveURL(/drive=AWD/);
});

test("an impossible combination suggests which filter to remove", async ({ page }) => {
  // No minivan is electric (the Sienna is a hybrid).
  await page.goto("/?body=minivan&power=electric");
  await expect(page.getByText("No cars match all of those filters")).toBeVisible();
  await page.getByRole("button", { name: /^Remove / }).click();
  await expect(page.getByRole("heading", { name: /\d+ cars?/ })).toBeVisible();
});

test("search jumps to a model page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Search by brand or model" }).fill("sienna");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/cars\/toyota-sienna-2026$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sienna" })).toBeVisible();
});

test("sorting by longest range puts electric cars first", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sort by").selectOption("range");
  // The Model 3 Premium RWD (363 miles) has the longest range in the data.
  await expect(page.locator(".model-card").first()).toContainText("Model 3");
});

test("a price from a shared link shows in the dropdown, and an empty one is ignored", async ({ page }) => {
  await page.goto("/?maxPrice=42000");
  await expect(page.getByLabel("Maximum price")).toHaveValue("42000");

  await page.goto("/?maxPrice=");
  await expect(page.getByRole("heading", { name: "40 cars" })).toBeVisible();
});

test("an unknown model id says the car wasn't found", async ({ page }) => {
  await page.goto("/cars/not-a-real-car-2026");
  await expect(page.getByRole("heading", { name: "We couldn't find that car" })).toBeVisible();
});

test("a model page links each price to its source", async ({ page }) => {
  await page.goto("/cars/honda-cr-v-2026");
  await expect(page.getByRole("heading", { level: 1, name: "CR-V" })).toBeVisible();
  await expect(page.getByRole("link", { name: "kbb.com" }).first()).toHaveAttribute("href", /^https:\/\/www\.kbb\.com\//);
  // No CR-V trim has EPA figures yet, so that column is hidden rather than full of dashes.
  await expect(page.getByRole("columnheader", { name: "Fuel economy" })).toHaveCount(0);
});
