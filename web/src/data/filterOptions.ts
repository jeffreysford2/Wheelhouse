// Works out which filters and options to offer, from the data itself.
//
// The plan says to hide a filter rather than show it half-empty, so a
// filter only appears when at least one car has the figure behind it. When
// the real data arrives, filters light up on their own.

import type { BodyStyle, Drivetrain, IndexModel, Powertrain } from "../../../shared/carTypes";
import { matchModels, type FilterState } from "./filters";

export type AvailableFilters = {
  makes: string[];
  bodyStyles: BodyStyle[];
  powertrains: Powertrain[];
  drivetrains: Drivetrain[];
  priceRange: { min: number; max: number };
  hasSeats: boolean;
  hasMpg: boolean;
  hasElectricRange: boolean;
  hasSafetyRating: boolean;
  hasCargo: boolean;
  hasTowing: boolean;
};

// Fixed display orders, so options don't shuffle when data changes.
const BODY_STYLE_ORDER: BodyStyle[] = ["suv", "sedan", "truck", "minivan", "hatchback", "wagon", "coupe", "convertible"];
const POWERTRAIN_ORDER: Powertrain[] = ["gas", "hybrid", "plug-in hybrid", "electric"];
const DRIVETRAIN_ORDER: Drivetrain[] = ["FWD", "RWD", "AWD", "4WD"];

export function findAvailableFilters(models: IndexModel[]): AvailableFilters {
  const trims = models.flatMap((model) => model.trims);
  const prices = trims.map((trim) => trim.msrp);
  const present = <T>(order: T[], values: T[]) => order.filter((option) => values.includes(option));

  return {
    makes: [...new Set(models.map((model) => model.make))].sort((a, b) => a.localeCompare(b)),
    bodyStyles: present(BODY_STYLE_ORDER, models.map((model) => model.bodyStyle)),
    powertrains: present(POWERTRAIN_ORDER, trims.map((trim) => trim.powertrain)),
    drivetrains: present(DRIVETRAIN_ORDER, trims.map((trim) => trim.drivetrain)),
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    hasSeats: trims.some((trim) => trim.seats !== undefined),
    hasMpg: trims.some((trim) => trim.mpgCombined !== undefined),
    hasElectricRange: trims.some((trim) => trim.electricRangeMiles !== undefined),
    hasSafetyRating: models.some((model) => model.safetyRating !== undefined),
    hasCargo: trims.some((trim) => trim.cargoCuFt !== undefined),
    hasTowing: trims.some((trim) => trim.towingLbs !== undefined),
  };
}

export type ListFilterKey = "bodyStyles" | "powertrains" | "drivetrains" | "makes";

/**
 * How many models would show if the visitor picked this option, keeping all
 * their other filters. Options in the same group are alternatives (body
 * style is SUV or truck), so the group's current picks are replaced, not
 * added to. Cheap enough to run on every change at a few hundred models.
 */
export function countForOption(models: IndexModel[], filters: FilterState, key: ListFilterKey, option: string): number {
  return matchModels(models, { ...filters, [key]: [option] }).length;
}
