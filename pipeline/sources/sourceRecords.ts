// The raw records each data source hands to the pipeline, before matching.
//
// Every source adapter (CarAPI, EPA, NHTSA, or a replacement chosen in
// Phase 0) converts its own response format into these shapes. That keeps
// provider quirks inside the adapter, so swapping providers never touches
// matching, validation or the website.

import type { BodyStyle, Drivetrain, ModelYear, Powertrain } from "../../shared/carTypes";

/** One trim as the vehicle catalog describes it. The catalog is the backbone: every published trim starts here. */
export type CatalogTrimRecord = {
  year: ModelYear;
  make: string;
  model: string;
  trim: string;
  msrp: number;
  bodyStyle: BodyStyle;
  powertrain: Powertrain;
  drivetrain: Drivetrain;
  seats: number;
  towingLbs?: number;
  cargoCuFt?: number;
  imageUrl?: string;
};

/**
 * One EPA fuel economy entry. EPA lists vehicles by engine and drivetrain
 * rather than by marketing trim name, so one record can cover several trims.
 */
export type FuelEconomyRecord = {
  year: ModelYear;
  make: string;
  model: string;
  /** EPA's descriptive text, e.g. "AWD Hybrid". Used as a hint when picking between records. */
  description?: string;
  drivetrain?: Drivetrain;
  /** Required: matching never borrows figures across powertrains. */
  powertrain: Powertrain;
  mpgCombined: number;
  electricRangeMiles?: number;
  chargeTimeHours?: number;
  fastChargeKw?: number;
};

/** One NHTSA overall rating. NHTSA rates models, not trims. */
export type SafetyRecord = {
  year: ModelYear;
  make: string;
  model: string;
  overallRating: number;
};

export type ModelYearRequest = readonly ModelYear[];

/** Anything that can list every trim for the requested model years. */
export interface CatalogSource {
  readonly name: string;
  fetchTrims(years: ModelYearRequest): Promise<CatalogTrimRecord[]>;
}

export interface FuelEconomySource {
  readonly name: string;
  fetchFuelEconomy(years: ModelYearRequest): Promise<FuelEconomyRecord[]>;
}

export interface SafetySource {
  readonly name: string;
  fetchSafetyRatings(years: ModelYearRequest): Promise<SafetyRecord[]>;
}
