// Shown when no car matches. Rather than a dead end, it offers the one
// filter change that brings back the most cars.

import type { ActiveFilter } from "../data/activeFilters";
import type { FilterState } from "../data/filters";
import "./EmptyResults.css";

type Props = {
  suggestion: { filter: ActiveFilter; resultCount: number } | undefined;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClearAll: () => void;
};

export function EmptyResults({ suggestion, filters, onChange, onClearAll }: Props) {
  return (
    <div className="empty-results" role="status">
      <h2>No cars match all of those filters</h2>
      {suggestion ? (
        <>
          <p>
            Removing <strong>{suggestion.filter.label}</strong> would show {suggestion.resultCount}{" "}
            {suggestion.resultCount === 1 ? "car" : "cars"}.
          </p>
          <button type="button" className="button button-primary" onClick={() => onChange(suggestion.filter.without(filters))}>
            Remove {suggestion.filter.label}
          </button>
        </>
      ) : (
        <>
          <p>No single change brings any back, so try starting over.</p>
          <button type="button" className="button button-primary" onClick={onClearAll}>
            Clear all filters
          </button>
        </>
      )}
    </div>
  );
}
