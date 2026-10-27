import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, type FilterState } from "./filters";
import { filtersFromParams, paramsFromState, sortFromParams } from "./filterUrl";

describe("filter URLs", () => {
  it("round-trips filters and sort through the URL", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      bodyStyles: ["suv", "truck"],
      powertrains: ["electric"],
      priceMax: 50_000,
      minSeats: 7,
    };
    const params = paramsFromState(filters, "range");
    expect(params.toString()).toBe("body=suv&body=truck&power=electric&maxPrice=50000&seats=7&sort=range");
    expect(filtersFromParams(params)).toEqual(filters);
    expect(sortFromParams(params)).toBe("range");
  });

  it("leaves the default sort out of the URL and ignores junk numbers", () => {
    expect(paramsFromState(EMPTY_FILTERS, "price").toString()).toBe("");
    expect(filtersFromParams(new URLSearchParams("maxPrice=lots")).priceMax).toBeUndefined();
    // An empty value must not become a $0 limit that hides every car.
    expect(filtersFromParams(new URLSearchParams("maxPrice=&seats=")).priceMax).toBeUndefined();
    expect(filtersFromParams(new URLSearchParams("maxPrice=&seats=")).minSeats).toBeUndefined();
    expect(sortFromParams(new URLSearchParams("sort=bogus"))).toBe("price");
  });
});
