import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, matchModels } from "./filters";
import { sortMatches } from "./sort";
import { allTestModels } from "./testFixtures";

const idsSortedBy = (order: Parameters<typeof sortMatches>[1], filters = EMPTY_FILTERS) =>
  sortMatches(matchModels(allTestModels, filters), order).map((match) => match.model.id);

describe("sortMatches", () => {
  it("sorts by the cheapest matching trim", () => {
    expect(idsSortedBy("price")).toEqual(["toyota-camry-2025", "honda-cr-v-2026", "tesla-model-y-2026"]);
  });

  it("ranks fuel economy by the best matching trim, not the base trim", () => {
    // Under an AWD filter the Tesla's best match is 117 MPGe and the CR-V's is 37.
    expect(idsSortedBy("mpg", { ...EMPTY_FILTERS, drivetrains: ["AWD"] })).toEqual(["tesla-model-y-2026", "honda-cr-v-2026"]);
  });

  it("puts models with no electric range last", () => {
    expect(idsSortedBy("range")[0]).toBe("tesla-model-y-2026");
  });

  it("shows newer model years first, then cheaper", () => {
    expect(idsSortedBy("newest")).toEqual(["honda-cr-v-2026", "tesla-model-y-2026", "toyota-camry-2025"]);
  });
});
