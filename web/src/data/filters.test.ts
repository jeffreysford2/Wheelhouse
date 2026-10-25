import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, matchModel, matchModels } from "./filters";
import { allTestModels, crossover, electricSuv, sedan } from "./testFixtures";

describe("matchModel", () => {
  it("shows every model when no filters are set, featuring the base trim", () => {
    const match = matchModel(crossover, EMPTY_FILTERS);
    expect(match?.featuredTrim.id).toBe("lx");
    expect(match?.featuredIsBaseTrim).toBe(true);
  });

  it("keeps a model whose base trim is FWD when the visitor wants AWD", () => {
    const match = matchModel(crossover, { ...EMPTY_FILTERS, drivetrains: ["AWD"] });
    expect(match?.featuredTrim.id).toBe("ex-awd");
    expect(match?.featuredIsBaseTrim).toBe(false);
  });

  it("requires a single trim to pass every filter, not different trims passing different ones", () => {
    // The CR-V has an AWD trim and a 35+ MPG trim; only the hybrid is both.
    const match = matchModel(crossover, { ...EMPTY_FILTERS, drivetrains: ["AWD"], minMpg: 35 });
    expect(match?.matchingTrims.map((trim) => trim.id)).toEqual(["hybrid"]);

    const noMatch = matchModel(crossover, { ...EMPTY_FILTERS, drivetrains: ["FWD"], minMpg: 35 });
    expect(noMatch).toBeUndefined();
  });

  it("treats a missing figure as not meeting a minimum", () => {
    // The Camry has no safety rating in the fixtures.
    expect(matchModel(sedan, { ...EMPTY_FILTERS, minSafetyRating: 4 })).toBeUndefined();
  });

  it("applies price limits per trim", () => {
    const match = matchModel(electricSuv, { ...EMPTY_FILTERS, priceMin: 46_000 });
    expect(match?.featuredTrim.id).toBe("lr-awd");
  });
});

describe("matchModels", () => {
  it("treats options within one filter as alternatives", () => {
    const matches = matchModels(allTestModels, { ...EMPTY_FILTERS, powertrains: ["hybrid", "electric"] });
    expect(matches.map((match) => match.model.id)).toEqual(["honda-cr-v-2026", "tesla-model-y-2026", "toyota-camry-2025"]);
  });

  it("filters by model-level fields like body style and brand", () => {
    expect(matchModels(allTestModels, { ...EMPTY_FILTERS, bodyStyles: ["sedan"] })).toHaveLength(1);
    expect(matchModels(allTestModels, { ...EMPTY_FILTERS, makes: ["Tesla", "Honda"] })).toHaveLength(2);
  });
});
