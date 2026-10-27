// Sort orders for the results grid. Each one looks at the trims that
// matched, not every trim, so "best fuel economy" ranks by the best figure
// the visitor could actually buy under their current filters.

import type { ModelMatch } from "./filters";

export type SortOrder = "price" | "mpg" | "range" | "newest";

export const SORT_LABELS: Record<SortOrder, string> = {
  price: "Price, low to high",
  // Electric MPGe and gas MPG share one ranking, so electric cars come
  // first; the label says so rather than implying a like-for-like figure.
  mpg: "Best MPG or MPGe",
  range: "Longest electric range",
  newest: "Newest",
};

export const DEFAULT_SORT: SortOrder = "price";

function bestOf(match: ModelMatch, field: "mpgCombined" | "electricRangeMiles"): number {
  // Missing figures count as -1 so those models sink to the bottom.
  return Math.max(-1, ...match.matchingTrims.map((trim) => trim[field] ?? -1));
}

const byPrice = (a: ModelMatch, b: ModelMatch) => a.featuredTrim.msrp - b.featuredTrim.msrp;

const comparators: Record<SortOrder, (a: ModelMatch, b: ModelMatch) => number> = {
  price: byPrice,
  mpg: (a, b) => bestOf(b, "mpgCombined") - bestOf(a, "mpgCombined") || byPrice(a, b),
  range: (a, b) => bestOf(b, "electricRangeMiles") - bestOf(a, "electricRangeMiles") || byPrice(a, b),
  newest: (a, b) => b.model.year - a.model.year || byPrice(a, b),
};

export function sortMatches(matches: ModelMatch[], order: SortOrder): ModelMatch[] {
  // Copy first: callers often hold the unsorted list in React state.
  return [...matches].sort(comparators[order]);
}

export function isSortOrder(value: string | null): value is SortOrder {
  return value !== null && value in SORT_LABELS;
}
