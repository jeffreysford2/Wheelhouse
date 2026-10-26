// Turns the filter state into removable chips, and suggests which one to
// drop when nothing matches.

import type { IndexModel } from "../../../shared/carTypes";
import type { ListFilterKey } from "./filterOptions";
import { matchModels, type FilterState } from "./filters";
import { BODY_STYLE_LABELS, formatNumber, formatPrice, POWERTRAIN_LABELS } from "./format";

export type ActiveFilter = {
  /** Stable key for React lists and tests. */
  key: string;
  label: string;
  /** The filter state with just this filter removed. */
  without: (filters: FilterState) => FilterState;
};

/** One chip per picked option in a checkbox group, such as "SUV" and "Truck". */
function listChips<T extends string>(key: ListFilterKey, picked: readonly T[], labelOf: (value: T) => string): ActiveFilter[] {
  return picked.map((value) => ({
    key: `${key}:${value}`,
    label: labelOf(value),
    without: (current) => ({ ...current, [key]: current[key].filter((v) => v !== value) }),
  }));
}

function minimumChip(
  filters: FilterState,
  key: "minSeats" | "minMpg" | "minRangeMiles" | "minSafetyRating" | "minCargoCuFt" | "minTowingLbs",
  labelOf: (value: number) => string,
): ActiveFilter[] {
  const value = filters[key];
  if (value === undefined) return [];
  return [{ key, label: labelOf(value), without: (current) => ({ ...current, [key]: undefined }) }];
}

export function describeActiveFilters(filters: FilterState): ActiveFilter[] {
  const chips: ActiveFilter[] = [];

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const { priceMin, priceMax } = filters;
    const label =
      priceMin !== undefined && priceMax !== undefined
        ? `${formatPrice(priceMin)} to ${formatPrice(priceMax)}`
        : priceMax !== undefined
          ? `Under ${formatPrice(priceMax)}`
          : `Over ${formatPrice(priceMin!)}`;
    chips.push({ key: "price", label, without: (current) => ({ ...current, priceMin: undefined, priceMax: undefined }) });
  }

  chips.push(
    ...listChips("bodyStyles", filters.bodyStyles, (value) => BODY_STYLE_LABELS[value]),
    ...listChips("powertrains", filters.powertrains, (value) => POWERTRAIN_LABELS[value]),
    ...listChips("drivetrains", filters.drivetrains, (value) => value),
    ...listChips("makes", filters.makes, (value) => value),
    ...minimumChip(filters, "minSeats", (value) => `${value}+ seats`),
    ...minimumChip(filters, "minMpg", (value) => `${value}+ MPG`),
    ...minimumChip(filters, "minRangeMiles", (value) => `${value}+ mi electric range`),
    ...minimumChip(filters, "minSafetyRating", (value) => `${value}+ star safety`),
    ...minimumChip(filters, "minCargoCuFt", (value) => `${value}+ cu ft cargo`),
    ...minimumChip(filters, "minTowingLbs", (value) => `Tows ${formatNumber(value)}+ lbs`),
  );

  return chips;
}

/**
 * For the empty state: the single filter whose removal brings back the most
 * cars, so we can say "Try removing Electric" instead of a dead end.
 */
export function suggestFilterToRemove(
  models: IndexModel[],
  filters: FilterState,
): { filter: ActiveFilter; resultCount: number } | undefined {
  let best: { filter: ActiveFilter; resultCount: number } | undefined;
  for (const filter of describeActiveFilters(filters)) {
    const resultCount = matchModels(models, filter.without(filters)).length;
    if (resultCount > 0 && (!best || resultCount > best.resultCount)) best = { filter, resultCount };
  }
  return best;
}
