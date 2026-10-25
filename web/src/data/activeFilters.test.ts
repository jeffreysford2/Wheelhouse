import { describe, expect, it } from "vitest";
import { describeActiveFilters, suggestFilterToRemove } from "./activeFilters";
import { EMPTY_FILTERS, type FilterState } from "./filters";
import { allTestModels } from "./testFixtures";

describe("describeActiveFilters", () => {
  it("makes one removable chip per choice", () => {
    const filters: FilterState = { ...EMPTY_FILTERS, powertrains: ["hybrid", "electric"], priceMax: 40_000 };
    const chips = describeActiveFilters(filters);
    expect(chips.map((chip) => chip.label)).toEqual(["Under $40,000", "Hybrid", "Electric"]);
    expect(chips[1]!.without(filters).powertrains).toEqual(["electric"]);
  });
});

describe("suggestFilterToRemove", () => {
  it("suggests the filter whose removal brings back the most cars", () => {
    // Nothing is an electric SUV that seats 7. Dropping the seat minimum
    // brings back the Tesla; dropping either other filter brings back nothing
    // or less, so the seat minimum is the suggestion.
    const filters: FilterState = { ...EMPTY_FILTERS, bodyStyles: ["suv"], powertrains: ["electric"], minSeats: 7 };
    const suggestion = suggestFilterToRemove(allTestModels, filters);
    expect(suggestion?.filter.label).toBe("7+ seats");
    expect(suggestion?.resultCount).toBe(1);
  });

  it("returns nothing when no single removal helps", () => {
    const filters: FilterState = { ...EMPTY_FILTERS, minSeats: 9, minRangeMiles: 500 };
    expect(suggestFilterToRemove(allTestModels, filters)).toBeUndefined();
  });
});
