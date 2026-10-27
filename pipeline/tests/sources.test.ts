import { afterEach, describe, expect, it } from "vitest";
import { CarApiCatalogSource } from "../sources/carApiCatalog";
import { EpaFuelEconomySource } from "../sources/epaFuelEconomy";
import { NhtsaSafetySource } from "../sources/nhtsaSafety";
import { COST_APPROVAL_ENV_VAR } from "../sources/notApproved";

// These tests protect the project rule that no API is called before the
// cost estimate is approved.
describe("source adapters", () => {
  afterEach(() => {
    delete process.env[COST_APPROVAL_ENV_VAR];
  });

  it("refuse to run without cost approval", async () => {
    await expect(new CarApiCatalogSource().fetchTrims([2026])).rejects.toThrow(/refusing to call/);
    await expect(new EpaFuelEconomySource().fetchFuelEconomy([2026])).rejects.toThrow(/refusing to call/);
    await expect(new NhtsaSafetySource().fetchSafetyRatings([2026])).rejects.toThrow(/refusing to call/);
  });
});
