import { describe, expect, it } from "vitest";
import type { Model } from "../../shared/carTypes";
import { makeBuildStamp, toIndexModel } from "../build";

describe("toIndexModel", () => {
  it("leaves charging details out of the index to keep the first download small", () => {
    const model: Model = {
      id: "tesla-model-y-2026", make: "Tesla", name: "Model Y", year: 2026, bodyStyle: "suv", imageUrl: "x",
      trims: [{
        id: "tesla-model-y-2026-lr", name: "LR", msrp: 45_000, powertrain: "electric", drivetrain: "RWD",
        seats: 5, electricRangeMiles: 357, fastChargeKw: 250, chargeTimeHours: 8,
      }],
    };
    const trim = toIndexModel(model).trims[0];
    expect(trim).toMatchObject({ electricRangeMiles: 357 });
    expect(trim).not.toHaveProperty("fastChargeKw");
    expect(trim).not.toHaveProperty("chargeTimeHours");
  });
});

describe("makeBuildStamp", () => {
  it("uses a plain date for the 'prices updated' note", () => {
    expect(makeBuildStamp(new Date("2026-10-01T12:30:00Z")).updatedAt).toBe("2026-10-01");
  });
});
