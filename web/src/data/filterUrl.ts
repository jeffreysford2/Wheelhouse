// Keeps filters and sort in the page URL (?body=suv&power=electric&sort=range).
//
// Why the URL rather than React state alone: the back button from a model
// page returns to the same filtered list, and a filtered search can be
// bookmarked or shared.

import type { BodyStyle, Drivetrain, Powertrain } from "../../../shared/carTypes";
import { EMPTY_FILTERS, type FilterState } from "./filters";
import { DEFAULT_SORT, isSortOrder, type SortOrder } from "./sort";

// Short, readable parameter names for each filter.
const LIST_PARAMS = {
  bodyStyles: "body",
  powertrains: "power",
  drivetrains: "drive",
  makes: "brand",
} as const;

const NUMBER_PARAMS = {
  priceMin: "minPrice",
  priceMax: "maxPrice",
  minSeats: "seats",
  minMpg: "mpg",
  minRangeMiles: "range",
  minSafetyRating: "safety",
  minCargoCuFt: "cargo",
  minTowingLbs: "towing",
} as const;

export function filtersFromParams(params: URLSearchParams): FilterState {
  const filters: FilterState = { ...EMPTY_FILTERS };

  // Values are trusted only as far as the filter logic goes: an unknown
  // body style in a hand-edited URL simply matches nothing.
  filters.bodyStyles = params.getAll(LIST_PARAMS.bodyStyles) as BodyStyle[];
  filters.powertrains = params.getAll(LIST_PARAMS.powertrains) as Powertrain[];
  filters.drivetrains = params.getAll(LIST_PARAMS.drivetrains) as Drivetrain[];
  filters.makes = params.getAll(LIST_PARAMS.makes);

  for (const [key, param] of Object.entries(NUMBER_PARAMS) as [keyof typeof NUMBER_PARAMS, string][]) {
    const raw = params.get(param);
    const value = raw === null ? NaN : Number(raw);
    if (Number.isFinite(value)) filters[key] = value;
  }

  return filters;
}

export function sortFromParams(params: URLSearchParams): SortOrder {
  const value = params.get("sort");
  return isSortOrder(value) ? value : DEFAULT_SORT;
}

export function paramsFromState(filters: FilterState, sort: SortOrder): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, param] of Object.entries(LIST_PARAMS) as [keyof typeof LIST_PARAMS, string][]) {
    for (const value of filters[key]) params.append(param, value);
  }
  for (const [key, param] of Object.entries(NUMBER_PARAMS) as [keyof typeof NUMBER_PARAMS, string][]) {
    const value = filters[key];
    if (value !== undefined) params.set(param, String(value));
  }
  // Leave the default out so the plain results URL stays clean.
  if (sort !== DEFAULT_SORT) params.set("sort", sort);

  return params;
}
