import { expect, test } from "@playwright/test";

// These run against the published data in public/data.

test("trims picked on two model pages are compared side by side", async ({ page }) => {
  await page.goto("/cars/honda-cr-v-2026");
  await page.getByRole("button", { name: "Add CR-V LX FWD to compare" }).click();
  await page.getByRole("button", { name: "Add CR-V EX AWD to compare" }).click();

  // The tray keeps the picks while browsing to another car.
  const tray = page.getByRole("complementary", { name: "Trims to compare" });
  await expect(tray).toContainText("2 of 6");
  await page.goto("/cars/tesla-model-3-2026");
  await expect(tray).toContainText("CR-V LX FWD");
  await page.getByRole("button", { name: "Add Model 3 Standard RWD to compare" }).click();
  await expect(tray).toContainText("3 of 6");

  await tray.getByRole("link", { name: /Compare/ }).click();
  await expect(page).toHaveURL(/\/compare\?trims=honda-cr-v-2026-lx-fwd,honda-cr-v-2026-ex-awd,tesla-model-3-2026-standard-rwd$/);
  await expect(page.getByRole("columnheader")).toHaveCount(3);
  await expect(page.getByRole("rowheader", { name: "Electric range" })).toBeVisible();
});

test("only show differences hides the specs every trim shares", async ({ page }) => {
  await page.goto("/compare?trims=honda-cr-v-2026-lx-fwd,honda-cr-v-2026-lx-awd");
  await expect(page.getByRole("rowheader", { name: "Body style" })).toBeVisible();

  await page.getByLabel("Only show differences").check();
  await expect(page.getByRole("rowheader", { name: "Body style" })).toHaveCount(0);
  await expect(page.getByRole("rowheader", { name: "Drivetrain" })).toBeVisible();
});

test("a shared compare link fills the tray, and removing a trim updates the link", async ({ page }) => {
  await page.goto("/compare?trims=honda-cr-v-2026-lx-fwd,honda-cr-v-2026-ex-awd");
  await page.getByRole("button", { name: "Remove 2026 Honda CR-V LX FWD" }).click();
  await expect(page).toHaveURL(/\/compare\?trims=honda-cr-v-2026-ex-awd$/);

  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "Trims to compare" })).toContainText("CR-V EX AWD");
});

test("the add buttons turn off once six trims are picked", async ({ page }) => {
  // Each pick renames its button to "Remove ...", so .first() is always the next unpicked trim.
  const nextAddButton = page.getByRole("button", { name: /^Add .* to compare$/ }).first();

  await page.goto("/cars/honda-cr-v-2026"); // twelve trims
  for (let picked = 0; picked < 6; picked++) await nextAddButton.click();

  await expect(page.getByRole("complementary", { name: "Trims to compare" })).toContainText("6 of 6");
  await expect(nextAddButton).toBeDisabled();
});

test("the compare page explains how to start when nothing is picked", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByText("Nothing to compare yet")).toBeVisible();
});
