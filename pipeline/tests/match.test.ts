import { describe, expect, it } from "vitest";
import { distinctTrimNames, mergeSources, modelId, normalizeName, pickFuelEconomyRecord } from "../match";
import type { CatalogTrimRecord, FuelEconomyRecord } from "../sources/sourceRecords";

const camryLe: CatalogTrimRecord = {
  year: 2026, make: "Toyota", model: "Camry", trim: "LE", msrp: 28_400,
  bodyStyle: "sedan", powertrain: "hybrid", drivetrain: "FWD", seats: 5,
};

describe("normalizeName", () => {
  it("treats punctuation and spacing differences as the same name", () => {
    expect(normalizeName("F-150")).toBe(normalizeName("F150"));
    expect(normalizeName("Mercedes-Benz")).toBe(normalizeName("Mercedes Benz"));
  });
});

describe("modelId", () => {
  it("builds the URL id used by the site", () => {
    expect(modelId("Toyota", "Camry", 2026)).toBe("toyota-camry-2026");
    expect(modelId("Mazda", "MX-5 Miata", 2026)).toBe("mazda-mx-5-miata-2026");
  });
});

describe("pickFuelEconomyRecord", () => {
  const base = { year: 2026, make: "Toyota", model: "Camry" } as const;

  it("never gives a trim figures from a different powertrain", () => {
    const gasOnly: FuelEconomyRecord[] = [{ ...base, powertrain: "gas", drivetrain: "FWD", mpgCombined: 32 }];
    expect(pickFuelEconomyRecord(camryLe, gasOnly)).toBeUndefined();
  });

  it("prefers the matching drivetrain", () => {
    const records: FuelEconomyRecord[] = [
      { ...base, powertrain: "hybrid", drivetrain: "AWD", mpgCombined: 44 },
      { ...base, powertrain: "hybrid", drivetrain: "FWD", mpgCombined: 51 },
    ];
    expect(pickFuelEconomyRecord(camryLe, records)?.mpgCombined).toBe(51);
  });

  it("prefers an exact trim name over a partial one", () => {
    const sportTouring = { ...camryLe, trim: "Sport Touring Hybrid" };
    const records: FuelEconomyRecord[] = [
      { ...base, powertrain: "hybrid", drivetrain: "FWD", description: "Sport Hybrid", mpgCombined: 49 },
      { ...base, powertrain: "hybrid", drivetrain: "FWD", description: "Sport Touring Hybrid", mpgCombined: 47 },
    ];
    expect(pickFuelEconomyRecord(sportTouring, records)?.mpgCombined).toBe(47);
  });
});

describe("distinctTrimNames", () => {
  it("adds the drivetrain when a catalog repeats a trim name", () => {
    const xleFwd = { ...camryLe, trim: "XLE", drivetrain: "FWD" } as const;
    const xleAwd = { ...camryLe, trim: "XLE", drivetrain: "AWD" } as const;
    expect(distinctTrimNames([camryLe, xleFwd, xleAwd])).toEqual(["LE", "XLE FWD", "XLE AWD"]);
  });

  it("adds the powertrain when the drivetrain is the same too", () => {
    const gas = { ...camryLe, trim: "XLE", powertrain: "gas" } as const;
    const hybrid = { ...camryLe, trim: "XLE", powertrain: "hybrid" } as const;
    expect(distinctTrimNames([gas, hybrid])).toEqual(["XLE FWD Gas", "XLE FWD Hybrid"]);
  });
});

describe("mergeSources", () => {
  it("joins sources even when they spell the model differently", () => {
    const f150: CatalogTrimRecord = {
      year: 2026, make: "Ford", model: "F-150", trim: "XL", msrp: 38_800,
      bodyStyle: "truck", powertrain: "gas", drivetrain: "RWD", seats: 3,
    };
    const [model] = mergeSources(
      [f150],
      [{ year: 2026, make: "FORD", model: "F150", powertrain: "gas", drivetrain: "RWD", mpgCombined: 20 }],
      [{ year: 2026, make: "Ford", model: "F 150", overallRating: 4 }],
    );
    expect(model?.id).toBe("ford-f-150-2026");
    expect(model?.safetyRating).toBe(4);
    expect(model?.trims[0]?.mpgCombined).toBe(20);
  });

  it("gives same-named trims separate ids so the run doesn't fail validation", () => {
    const xleFwd = { ...camryLe, trim: "XLE", drivetrain: "FWD" } as const;
    const xleAwd = { ...camryLe, trim: "XLE", drivetrain: "AWD", msrp: 30_000 } as const;
    const [model] = mergeSources([xleFwd, xleAwd], [], []);
    expect(model?.trims.map((trim) => trim.id)).toEqual(["toyota-camry-2026-xle-fwd", "toyota-camry-2026-xle-awd"]);
  });

  it("keeps the lowest safety rating when NHTSA rates a model more than once", () => {
    const camry = { year: 2026, make: "Toyota", model: "Camry" } as const;
    const [model] = mergeSources([camryLe], [], [{ ...camry, overallRating: 5 }, { ...camry, overallRating: 4 }]);
    expect(model?.safetyRating).toBe(4);
  });

  it("keeps a catalog trim that has no EPA match, just without fuel economy", () => {
    const [model] = mergeSources([camryLe], [], []);
    expect(model?.trims[0]?.id).toBe("toyota-camry-2026-le");
    expect(model?.trims[0]).not.toHaveProperty("mpgCombined");
    expect(model).not.toHaveProperty("safetyRating");
  });
});
