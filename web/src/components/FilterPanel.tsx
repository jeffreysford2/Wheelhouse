// All results-page filters. Only filters backed by data are shown (see
// findAvailableFilters); cargo and towing sit under "Advanced" because few
// shoppers start there.

import type { IndexModel } from "../../../shared/carTypes";
import type { FilterState } from "../data/filters";
import { countForOption, type AvailableFilters, type ListFilterKey } from "../data/filterOptions";
import { BODY_STYLE_LABELS, formatNumber, POWERTRAIN_LABELS } from "../data/format";
import { CheckboxGroup } from "./CheckboxGroup";
import { MinimumSelect } from "./MinimumSelect";
import { PriceFilter } from "./PriceFilter";
import "./FilterPanel.css";

type Props = {
  models: IndexModel[];
  available: AvailableFilters;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

const SEAT_CHOICES = [2, 4, 5, 6, 7, 8];
const MPG_CHOICES = [20, 25, 30, 35, 40, 50];
const RANGE_CHOICES = [25, 50, 200, 250, 300, 350];
const SAFETY_CHOICES = [4, 5];
const CARGO_CHOICES = [15, 25, 35, 50, 75];
const TOWING_CHOICES = [1_500, 3_500, 5_000, 7_500, 10_000];

export function FilterPanel({ models, available, filters, onChange }: Props) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filters, [key]: value });

  // Clicking a checkbox adds the option to its group, or removes it if already picked.
  const toggle = <K extends ListFilterKey>(key: K, value: FilterState[K][number]) => {
    const current = filters[key] as FilterState[K][number][];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set(key, next as FilterState[K]);
  };

  const optionsFor = <K extends ListFilterKey>(key: K, values: FilterState[K][number][], labelOf: (value: FilterState[K][number]) => string) =>
    values.map((value) => ({ value, label: labelOf(value), count: countForOption(models, filters, key, value) }));

  return (
    <div className="filter-panel">
      <PriceFilter
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        dataRange={available.priceRange}
        onChange={(priceMin, priceMax) => onChange({ ...filters, priceMin, priceMax })}
      />

      <CheckboxGroup
        legend="Body style"
        options={optionsFor("bodyStyles", available.bodyStyles, (value) => BODY_STYLE_LABELS[value])}
        selected={filters.bodyStyles}
        onToggle={(value) => toggle("bodyStyles", value)}
      />

      <CheckboxGroup
        legend="Powertrain"
        options={optionsFor("powertrains", available.powertrains, (value) => POWERTRAIN_LABELS[value])}
        selected={filters.powertrains}
        onToggle={(value) => toggle("powertrains", value)}
      />

      <MinimumSelect
        label="Seats"
        value={filters.minSeats}
        choices={SEAT_CHOICES}
        formatChoice={(value) => `${value} or more`}
        onChange={(value) => set("minSeats", value)}
      />

      <CheckboxGroup
        legend="Drivetrain"
        options={optionsFor("drivetrains", available.drivetrains, (value) => value)}
        selected={filters.drivetrains}
        onToggle={(value) => toggle("drivetrains", value)}
      />

      {available.hasMpg && (
        <MinimumSelect
          label="Fuel economy"
          value={filters.minMpg}
          choices={MPG_CHOICES}
          formatChoice={(value) => `${value}+ MPG combined`}
          onChange={(value) => set("minMpg", value)}
        />
      )}

      {available.hasElectricRange && (
        <MinimumSelect
          label="Electric range"
          value={filters.minRangeMiles}
          choices={RANGE_CHOICES}
          formatChoice={(value) => `${value}+ miles`}
          onChange={(value) => set("minRangeMiles", value)}
        />
      )}

      <CheckboxGroup
        legend="Brand"
        options={optionsFor("makes", available.makes, (value) => value)}
        selected={filters.makes}
        onToggle={(value) => toggle("makes", value)}
      />

      {available.hasSafetyRating && (
        <MinimumSelect
          label="NHTSA safety rating"
          value={filters.minSafetyRating}
          choices={SAFETY_CHOICES}
          formatChoice={(value) => (value === 5 ? "5 stars" : `${value} stars or more`)}
          onChange={(value) => set("minSafetyRating", value)}
        />
      )}

      {(available.hasCargo || available.hasTowing) && (
        <details className="filter-advanced" open={filters.minCargoCuFt !== undefined || filters.minTowingLbs !== undefined}>
          <summary>Advanced</summary>
          {available.hasCargo && (
            <MinimumSelect
              label="Cargo space"
              value={filters.minCargoCuFt}
              choices={CARGO_CHOICES}
              formatChoice={(value) => `${value}+ cu ft`}
              onChange={(value) => set("minCargoCuFt", value)}
            />
          )}
          {available.hasTowing && (
            <MinimumSelect
              label="Towing capacity"
              value={filters.minTowingLbs}
              choices={TOWING_CHOICES}
              formatChoice={(value) => `${formatNumber(value)}+ lbs`}
              onChange={(value) => set("minTowingLbs", value)}
            />
          )}
        </details>
      )}
    </div>
  );
}
