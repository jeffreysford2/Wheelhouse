// Trim-aware filtering, the core of the results page.
//
// Filters apply to trims, not models: a model is shown when at least one of
// its trims passes every active filter. That way an "AWD" filter never hides
// a model just because its cheapest trim is front-wheel drive.

import type { BodyStyle, Drivetrain, IndexModel, IndexTrim, Powertrain } from "../../../shared/carTypes";

export type FilterState = {
  priceMin?: number;
  priceMax?: number;
  bodyStyles: BodyStyle[];
  powertrains: Powertrain[];
  drivetrains: Drivetrain[];
  makes: string[];
  minSeats?: number;
  minMpg?: number;
  minRangeMiles?: number;
  minSafetyRating?: number;
  minCargoCuFt?: number;
  minTowingLbs?: number;
};

export const EMPTY_FILTERS: FilterState = {
  bodyStyles: [],
  powertrains: [],
  drivetrains: [],
  makes: [],
};

/** The result of matching one model: which of its trims passed, and which one the card should feature. */
export type ModelMatch = {
  model: IndexModel;
  matchingTrims: IndexTrim[];
  /** The cheapest trim that passed every filter. */
  featuredTrim: IndexTrim;
  /** True when the featured trim is also the model's cheapest trim, so the card can just say "From $X". */
  featuredIsBaseTrim: boolean;
};

/** An empty list means "no preference", so it lets everything through. */
function allowedBy<T>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

/**
 * A minimum filter on a field some trims don't have. A trim with no figure
 * fails, because we can't promise it meets the minimum.
 */
function meetsMinimum(minimum: number | undefined, value: number | undefined): boolean {
  if (minimum === undefined) return true;
  return value !== undefined && value >= minimum;
}

/** Filters that describe the whole model (body, brand, safety) rather than one trim. */
function modelPassesModelLevelFilters(model: IndexModel, filters: FilterState): boolean {
  return (
    allowedBy(filters.bodyStyles, model.bodyStyle) &&
    allowedBy(filters.makes, model.make) &&
    meetsMinimum(filters.minSafetyRating, model.safetyRating)
  );
}

export function trimPassesFilters(trim: IndexTrim, filters: FilterState): boolean {
  return (
    (filters.priceMin === undefined || trim.msrp >= filters.priceMin) &&
    (filters.priceMax === undefined || trim.msrp <= filters.priceMax) &&
    allowedBy(filters.powertrains, trim.powertrain) &&
    allowedBy(filters.drivetrains, trim.drivetrain) &&
    meetsMinimum(filters.minSeats, trim.seats) &&
    meetsMinimum(filters.minMpg, trim.mpgCombined) &&
    meetsMinimum(filters.minRangeMiles, trim.electricRangeMiles) &&
    meetsMinimum(filters.minCargoCuFt, trim.cargoCuFt) &&
    meetsMinimum(filters.minTowingLbs, trim.towingLbs)
  );
}

function cheapest(trims: IndexTrim[]): IndexTrim | undefined {
  return trims.reduce<IndexTrim | undefined>((best, trim) => (!best || trim.msrp < best.msrp ? trim : best), undefined);
}

/** The "From $X" price: the model's cheapest trim, whatever the filters. */
export function startingPrice(model: { trims: { msrp: number }[] }): number {
  return Math.min(...model.trims.map((trim) => trim.msrp));
}

/** Returns how a model matches, or undefined when no trim does. */
export function matchModel(model: IndexModel, filters: FilterState): ModelMatch | undefined {
  if (!modelPassesModelLevelFilters(model, filters)) return undefined;

  const matchingTrims = model.trims.filter((trim) => trimPassesFilters(trim, filters));
  const featuredTrim = cheapest(matchingTrims);
  if (!featuredTrim) return undefined;

  return {
    model,
    matchingTrims,
    featuredTrim,
    featuredIsBaseTrim: featuredTrim.id === cheapest(model.trims)?.id,
  };
}

export function matchModels(models: IndexModel[], filters: FilterState): ModelMatch[] {
  return models.flatMap((model) => {
    const match = matchModel(model, filters);
    return match ? [match] : [];
  });
}
