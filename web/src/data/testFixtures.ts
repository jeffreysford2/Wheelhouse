// Tiny hand-made models for unit tests. Kept separate from the published
// data so a price refresh never breaks a filter test.

import type { IndexModel, IndexTrim } from "../../../shared/carTypes";

export function makeTrim(overrides: Partial<IndexTrim> & Pick<IndexTrim, "id" | "msrp">): IndexTrim {
  return { name: overrides.id, powertrain: "gas", drivetrain: "FWD", seats: 5, ...overrides };
}

export function makeModel(overrides: Partial<IndexModel> & Pick<IndexModel, "id" | "trims">): IndexModel {
  return { make: "Test", name: overrides.id, year: 2026, bodyStyle: "suv", imageUrl: "", ...overrides };
}

/** A crossover whose base trim is FWD gas and whose pricier trims add AWD and hybrid. */
export const crossover = makeModel({
  id: "honda-cr-v-2026",
  make: "Honda",
  name: "CR-V",
  safetyRating: 5,
  trims: [
    makeTrim({ id: "lx", name: "LX", msrp: 30_900, mpgCombined: 30 }),
    makeTrim({ id: "ex-awd", name: "EX AWD", msrp: 34_000, drivetrain: "AWD", mpgCombined: 29 }),
    makeTrim({ id: "hybrid", name: "Sport Hybrid", msrp: 35_500, drivetrain: "AWD", powertrain: "hybrid", mpgCombined: 37 }),
  ],
});

export const electricSuv = makeModel({
  id: "tesla-model-y-2026",
  make: "Tesla",
  name: "Model Y",
  safetyRating: 5,
  trims: [
    makeTrim({ id: "lr-rwd", msrp: 45_000, powertrain: "electric", drivetrain: "RWD", mpgCombined: 123, electricRangeMiles: 357 }),
    makeTrim({ id: "lr-awd", msrp: 49_000, powertrain: "electric", drivetrain: "AWD", mpgCombined: 117, electricRangeMiles: 327 }),
  ],
});

export const sedan = makeModel({
  id: "toyota-camry-2025",
  make: "Toyota",
  name: "Camry",
  year: 2025,
  bodyStyle: "sedan",
  trims: [makeTrim({ id: "le", msrp: 28_400, powertrain: "hybrid", mpgCombined: 51 })],
});

export const allTestModels = [crossover, electricSuv, sedan];
