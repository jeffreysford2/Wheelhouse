import { describe, expect, it } from "vitest";
import type { Model } from "../../shared/carTypes";
import { validateModels } from "../validate";

function makeModel(overrides: Partial<Model> = {}): Model {
  return {
    id: "toyota-camry-2026", make: "Toyota", name: "Camry", year: 2026, bodyStyle: "sedan",
    imageUrl: "/images/placeholder-car.svg",
    trims: [{ id: "toyota-camry-2026-le", name: "LE", msrp: 28_400, powertrain: "hybrid", drivetrain: "FWD", seats: 5 }],
    ...overrides,
  };
}

describe("validateModels", () => {
  it("accepts a sensible model", () => {
    expect(validateModels([makeModel()])).toEqual({ ok: true });
  });

  it("rejects an empty dataset, which usually means a source failed quietly", () => {
    expect(validateModels([]).ok).toBe(false);
  });

  it("rejects duplicate ids", () => {
    const result = validateModels([makeModel(), makeModel()]);
    expect(result.ok).toBe(false);
  });

  it("catches a price that looks like cents instead of dollars", () => {
    const model = makeModel();
    model.trims[0]!.msrp = 2_840_000;
    const result = validateModels([model]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problems[0]).toContain("msrp");
  });

  it("flags a gas trim with an electric range as a likely mismatch", () => {
    const model = makeModel();
    model.trims[0] = { ...model.trims[0]!, powertrain: "gas", electricRangeMiles: 40 };
    expect(validateModels([model]).ok).toBe(false);
  });
});
