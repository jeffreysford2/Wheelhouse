import type { ActiveFilter } from "../data/activeFilters";
import type { FilterState } from "../data/filters";
import "./FilterChips.css";

type Props = {
  chips: ActiveFilter[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClearAll: () => void;
};

export function FilterChips({ chips, filters, onChange, onClearAll }: Props) {
  if (chips.length === 0) return null;
  return (
    <ul className="filter-chips" aria-label="Applied filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button type="button" className="filter-chip" onClick={() => onChange(chip.without(filters))}>
            {chip.label}
            <span aria-hidden="true">×</span>
            <span className="visually-hidden">, remove filter</span>
          </button>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <button type="button" className="filter-chip-clear" onClick={onClearAll}>
            Clear all
          </button>
        </li>
      )}
    </ul>
  );
}
