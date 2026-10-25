import { useId } from "react";
import { SORT_LABELS, type SortOrder } from "../data/sort";

type Props = { value: SortOrder; onChange: (order: SortOrder) => void };

export function SortSelect({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="sort-select">
      <label htmlFor={id}>Sort by</label>
      <select id={id} className="filter-select" value={value} onChange={(event) => onChange(event.target.value as SortOrder)}>
        {(Object.keys(SORT_LABELS) as SortOrder[]).map((order) => (
          <option key={order} value={order}>
            {SORT_LABELS[order]}
          </option>
        ))}
      </select>
    </div>
  );
}
