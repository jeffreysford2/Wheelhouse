// A small hand-written dataset for building the site before real data
// exists. Prices and figures are illustrative only: close enough to look
// realistic, but NOT checked against any manufacturer or EPA source.
//
// It deliberately covers the awkward cases the site must handle:
// - models whose cheapest trim is FWD but a pricier trim is AWD
// - models with gas, hybrid and plug-in trims side by side
// - models with no safety rating, and trims with no towing or cargo data
//
// The data is written as source records (not finished Models) so it flows
// through the same matching, validation and file-writing code as real data.

import type { BodyStyle, Drivetrain, ModelYear, Powertrain } from "../../shared/carTypes";
import type { CatalogTrimRecord, FuelEconomyRecord, SafetyRecord } from "../sources/sourceRecords";

type SampleTrim = {
  trim: string;
  msrp: number;
  powertrain: Powertrain;
  drivetrain: Drivetrain;
  seats: number;
  mpg: number;
  rangeMiles?: number;
  fastChargeKw?: number;
  chargeHours?: number;
  towingLbs?: number;
  cargoCuFt?: number;
};

type SampleModel = {
  year: ModelYear;
  make: string;
  model: string;
  bodyStyle: BodyStyle;
  safetyRating?: number;
  trims: SampleTrim[];
};

const sampleModels: SampleModel[] = [
  {
    year: 2026, make: "Toyota", model: "Camry", bodyStyle: "sedan", safetyRating: 5,
    trims: [
      { trim: "LE", msrp: 28_400, powertrain: "hybrid", drivetrain: "FWD", seats: 5, mpg: 51, cargoCuFt: 15 },
      { trim: "SE", msrp: 31_000, powertrain: "hybrid", drivetrain: "FWD", seats: 5, mpg: 47, cargoCuFt: 15 },
      { trim: "XLE AWD", msrp: 35_000, powertrain: "hybrid", drivetrain: "AWD", seats: 5, mpg: 44, cargoCuFt: 15 },
      { trim: "XSE AWD", msrp: 36_000, powertrain: "hybrid", drivetrain: "AWD", seats: 5, mpg: 44, cargoCuFt: 15 },
    ],
  },
  {
    year: 2026, make: "Honda", model: "Civic", bodyStyle: "sedan", safetyRating: 5,
    trims: [
      { trim: "LX", msrp: 24_600, powertrain: "gas", drivetrain: "FWD", seats: 5, mpg: 36, cargoCuFt: 14.8 },
      { trim: "Sport Hybrid", msrp: 29_800, powertrain: "hybrid", drivetrain: "FWD", seats: 5, mpg: 49, cargoCuFt: 14.8 },
      { trim: "Sport Touring Hybrid", msrp: 32_800, powertrain: "hybrid", drivetrain: "FWD", seats: 5, mpg: 47, cargoCuFt: 14.8 },
    ],
  },
  {
    year: 2026, make: "Honda", model: "CR-V", bodyStyle: "suv", safetyRating: 5,
    trims: [
      { trim: "LX", msrp: 30_900, powertrain: "gas", drivetrain: "FWD", seats: 5, mpg: 30, cargoCuFt: 39.3, towingLbs: 1_500 },
      { trim: "EX AWD", msrp: 34_000, powertrain: "gas", drivetrain: "AWD", seats: 5, mpg: 29, cargoCuFt: 39.3, towingLbs: 1_500 },
      { trim: "Sport Hybrid AWD", msrp: 35_500, powertrain: "hybrid", drivetrain: "AWD", seats: 5, mpg: 37, cargoCuFt: 39.3, towingLbs: 1_000 },
      { trim: "Sport Touring Hybrid", msrp: 42_000, powertrain: "hybrid", drivetrain: "AWD", seats: 5, mpg: 37, cargoCuFt: 39.3, towingLbs: 1_000 },
    ],
  },
  {
    year: 2025, make: "Toyota", model: "RAV4", bodyStyle: "suv", safetyRating: 5,
    trims: [
      { trim: "LE", msrp: 29_300, powertrain: "gas", drivetrain: "FWD", seats: 5, mpg: 30, cargoCuFt: 37.6, towingLbs: 1_500 },
      { trim: "XLE Hybrid", msrp: 34_000, powertrain: "hybrid", drivetrain: "AWD", seats: 5, mpg: 39, cargoCuFt: 37.6, towingLbs: 1_750 },
      { trim: "Prime XSE", msrp: 43_700, powertrain: "plug-in hybrid", drivetrain: "AWD", seats: 5, mpg: 94, rangeMiles: 42, chargeHours: 4.5, cargoCuFt: 33.5, towingLbs: 2_500 },
    ],
  },
  {
    year: 2026, make: "Ford", model: "F-150", bodyStyle: "truck", safetyRating: 4,
    trims: [
      { trim: "XL Regular Cab", msrp: 38_800, powertrain: "gas", drivetrain: "RWD", seats: 3, mpg: 20, towingLbs: 8_200 },
      { trim: "XLT PowerBoost", msrp: 55_000, powertrain: "hybrid", drivetrain: "4WD", seats: 6, mpg: 23, towingLbs: 12_700 },
      { trim: "Lariat", msrp: 64_000, powertrain: "gas", drivetrain: "4WD", seats: 5, mpg: 19, towingLbs: 13_000 },
    ],
  },
  {
    year: 2026, make: "Tesla", model: "Model Y", bodyStyle: "suv", safetyRating: 5,
    trims: [
      { trim: "Long Range RWD", msrp: 45_000, powertrain: "electric", drivetrain: "RWD", seats: 5, mpg: 123, rangeMiles: 357, fastChargeKw: 250, chargeHours: 8, cargoCuFt: 76, towingLbs: 3_500 },
      { trim: "Long Range AWD", msrp: 49_000, powertrain: "electric", drivetrain: "AWD", seats: 5, mpg: 117, rangeMiles: 327, fastChargeKw: 250, chargeHours: 8, cargoCuFt: 76, towingLbs: 3_500 },
      { trim: "Performance", msrp: 57_500, powertrain: "electric", drivetrain: "AWD", seats: 5, mpg: 107, rangeMiles: 306, fastChargeKw: 250, chargeHours: 8, cargoCuFt: 76, towingLbs: 3_500 },
    ],
  },
  {
    year: 2026, make: "Hyundai", model: "Ioniq 5", bodyStyle: "suv", safetyRating: 5,
    trims: [
      { trim: "SE RWD", msrp: 42_600, powertrain: "electric", drivetrain: "RWD", seats: 5, mpg: 114, rangeMiles: 318, fastChargeKw: 235, chargeHours: 7, cargoCuFt: 59.3, towingLbs: 2_000 },
      { trim: "Limited AWD", msrp: 54_000, powertrain: "electric", drivetrain: "AWD", seats: 5, mpg: 98, rangeMiles: 259, fastChargeKw: 235, chargeHours: 7, cargoCuFt: 59.3, towingLbs: 2_000 },
    ],
  },
  {
    year: 2026, make: "Rivian", model: "R1S", bodyStyle: "suv",
    trims: [
      { trim: "Dual Standard", msrp: 77_000, powertrain: "electric", drivetrain: "AWD", seats: 7, mpg: 69, rangeMiles: 270, fastChargeKw: 220, chargeHours: 10, cargoCuFt: 104.7, towingLbs: 7_700 },
      { trim: "Tri Max", msrp: 106_000, powertrain: "electric", drivetrain: "AWD", seats: 7, mpg: 66, rangeMiles: 374, fastChargeKw: 220, chargeHours: 12, cargoCuFt: 104.7, towingLbs: 7_700 },
    ],
  },
  {
    year: 2026, make: "Kia", model: "Carnival", bodyStyle: "minivan", safetyRating: 5,
    trims: [
      { trim: "LX", msrp: 37_400, powertrain: "gas", drivetrain: "FWD", seats: 8, mpg: 22, cargoCuFt: 40.2, towingLbs: 3_500 },
      { trim: "SX Hybrid", msrp: 47_500, powertrain: "hybrid", drivetrain: "FWD", seats: 7, mpg: 33, cargoCuFt: 40.2, towingLbs: 3_500 },
    ],
  },
  {
    year: 2025, make: "Chrysler", model: "Pacifica", bodyStyle: "minivan", safetyRating: 4,
    trims: [
      { trim: "Select", msrp: 43_000, powertrain: "gas", drivetrain: "FWD", seats: 7, mpg: 22, cargoCuFt: 32.3 },
      { trim: "Limited AWD", msrp: 50_500, powertrain: "gas", drivetrain: "AWD", seats: 7, mpg: 19, cargoCuFt: 32.3 },
      { trim: "Plug-in Hybrid Pinnacle", msrp: 62_000, powertrain: "plug-in hybrid", drivetrain: "FWD", seats: 7, mpg: 82, rangeMiles: 32, chargeHours: 2, cargoCuFt: 32.3 },
    ],
  },
  {
    year: 2026, make: "Subaru", model: "Outback", bodyStyle: "wagon", safetyRating: 5,
    trims: [
      { trim: "Premium", msrp: 31_000, powertrain: "gas", drivetrain: "AWD", seats: 5, mpg: 28, cargoCuFt: 32.6, towingLbs: 2_700 },
      { trim: "Wilderness", msrp: 41_500, powertrain: "gas", drivetrain: "AWD", seats: 5, mpg: 24, cargoCuFt: 32.6, towingLbs: 3_500 },
    ],
  },
  {
    year: 2026, make: "Volkswagen", model: "Golf GTI", bodyStyle: "hatchback",
    trims: [
      { trim: "S", msrp: 33_700, powertrain: "gas", drivetrain: "FWD", seats: 5, mpg: 27, cargoCuFt: 19.9 },
      { trim: "Autobahn", msrp: 40_800, powertrain: "gas", drivetrain: "FWD", seats: 5, mpg: 27, cargoCuFt: 19.9 },
    ],
  },
  {
    year: 2026, make: "Mazda", model: "MX-5 Miata", bodyStyle: "convertible",
    trims: [
      { trim: "Sport", msrp: 30_000, powertrain: "gas", drivetrain: "RWD", seats: 2, mpg: 29, cargoCuFt: 4.6 },
      { trim: "Grand Touring", msrp: 35_500, powertrain: "gas", drivetrain: "RWD", seats: 2, mpg: 29, cargoCuFt: 4.6 },
    ],
  },
  {
    year: 2026, make: "Chevrolet", model: "Corvette", bodyStyle: "coupe",
    trims: [
      { trim: "Stingray 1LT", msrp: 70_000, powertrain: "gas", drivetrain: "RWD", seats: 2, mpg: 19, cargoCuFt: 12.6 },
      { trim: "E-Ray 1LZ", msrp: 108_600, powertrain: "hybrid", drivetrain: "AWD", seats: 2, mpg: 19, cargoCuFt: 12.6 },
    ],
  },
];

/** The sample data, split into the three record types the real sources produce. */
export function sampleSourceRecords(): {
  catalog: CatalogTrimRecord[];
  fuelEconomy: FuelEconomyRecord[];
  safety: SafetyRecord[];
} {
  const catalog: CatalogTrimRecord[] = [];
  const fuelEconomy: FuelEconomyRecord[] = [];
  const safety: SafetyRecord[] = [];

  for (const model of sampleModels) {
    const { year, make, bodyStyle } = model;
    if (model.safetyRating !== undefined) {
      safety.push({ year, make, model: model.model, overallRating: model.safetyRating });
    }
    for (const t of model.trims) {
      catalog.push({
        year, make, model: model.model, bodyStyle,
        trim: t.trim, msrp: t.msrp, powertrain: t.powertrain, drivetrain: t.drivetrain, seats: t.seats,
        towingLbs: t.towingLbs, cargoCuFt: t.cargoCuFt,
      });
      fuelEconomy.push({
        year, make, model: model.model, description: t.trim,
        powertrain: t.powertrain, drivetrain: t.drivetrain, mpgCombined: t.mpg,
        electricRangeMiles: t.rangeMiles, fastChargeKw: t.fastChargeKw, chargeTimeHours: t.chargeHours,
      });
    }
  }

  return { catalog, fuelEconomy, safety };
}
