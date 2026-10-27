// The home page: every model, filtered and sorted in the browser.

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IndexModel } from "../../../shared/carTypes";
import { EmptyResults } from "../components/EmptyResults";
import { FilterChips } from "../components/FilterChips";
import { FilterPanel } from "../components/FilterPanel";
import { ModelCard } from "../components/ModelCard";
import { SortSelect } from "../components/SortSelect";
import { describeActiveFilters, suggestFilterToRemove } from "../data/activeFilters";
import { EMPTY_FILTERS, matchModels, type FilterState } from "../data/filters";
import { findAvailableFilters } from "../data/filterOptions";
import { filtersFromParams, paramsFromState, sortFromParams } from "../data/filterUrl";
import { sortMatches, type SortOrder } from "../data/sort";
import { useIndexData } from "../data/useIndexData";
import "./ResultsPage.css";

export function ResultsPage() {
  const index = useIndexData();

  if (index.status === "loading") return <p className="page muted">Loading cars…</p>;
  if (index.status === "error") {
    return (
      <div className="page" role="alert">
        <h1>We couldn't load the car list</h1>
        <p className="muted">Check your connection and reload the page.</p>
      </div>
    );
  }
  return <Results models={index.data.models} />;
}

function Results({ models }: { models: IndexModel[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const sort = sortFromParams(searchParams);
  const available = useMemo(() => findAvailableFilters(models), [models]);
  const matches = useMemo(() => sortMatches(matchModels(models, filters), sort), [models, filters, sort]);
  const chips = describeActiveFilters(filters);

  // replace: true so each filter click doesn't add a step to the back button.
  const update = (nextFilters: FilterState, nextSort: SortOrder = sort) =>
    setSearchParams(paramsFromState(nextFilters, nextSort), { replace: true });
  const clearAll = () => update(EMPTY_FILTERS);

  const resultLabel = `${matches.length} ${matches.length === 1 ? "car" : "cars"}`;

  return (
    <div className="page results-layout">
      <aside className={`results-filters${isPanelOpen ? " is-open" : ""}`} aria-label="Filters">
        <div className="results-filters-sheet">
          <div className="results-filters-sheet-header">
            <h2>Filters</h2>
            <button type="button" className="button button-primary" onClick={() => setIsPanelOpen(false)}>
              Show {resultLabel}
            </button>
          </div>
          <FilterPanel models={models} available={available} filters={filters} onChange={update} />
        </div>
      </aside>
      {isPanelOpen && <div className="results-filters-backdrop" onClick={() => setIsPanelOpen(false)} />}

      <section className="results-main" aria-labelledby="results-heading">
        <div className="results-toolbar">
          <h1 id="results-heading" aria-live="polite">
            {resultLabel}
          </h1>
          <button type="button" className="button results-filters-button" onClick={() => setIsPanelOpen(true)}>
            Filters{chips.length > 0 && ` (${chips.length})`}
          </button>
          <SortSelect value={sort} onChange={(order) => update(filters, order)} />
        </div>

        <FilterChips chips={chips} filters={filters} onChange={update} onClearAll={clearAll} />

        {matches.length === 0 ? (
          <EmptyResults
            suggestion={suggestFilterToRemove(models, filters)}
            filters={filters}
            onChange={update}
            onClearAll={clearAll}
          />
        ) : (
          <ul className="results-grid">
            {matches.map((match) => (
              <li key={match.model.id}>
                <ModelCard match={match} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
