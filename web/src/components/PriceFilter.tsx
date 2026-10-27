// Price range as two dropdowns. Fixed steps read better than a slider on a
// phone and are easier to use with a keyboard.

import { useId } from "react";
import { formatPrice } from "../data/format";

type Props = {
  priceMin: number | undefined;
  priceMax: number | undefined;
  dataRange: { min: number; max: number };
  onChange: (priceMin: number | undefined, priceMax: number | undefined) => void;
};

const STEP = 5_000;

function priceSteps(dataRange: { min: number; max: number }): number[] {
  const steps: number[] = [];
  const first = Math.ceil(dataRange.min / STEP) * STEP;
  // Coarser steps above $100k, where shoppers think in bigger jumps.
  for (let price = first; price < dataRange.max; price += price >= 100_000 ? 25_000 : STEP) steps.push(price);
  return steps;
}

export function PriceFilter({ priceMin, priceMax, dataRange, onChange }: Props) {
  const id = useId();
  // A shared link can carry a price that isn't one of our steps ($42,000).
  // Add it to the list so the dropdown shows it instead of "No max".
  const picked = [priceMin, priceMax].filter((price) => price !== undefined);
  const steps = [...new Set([...priceSteps(dataRange), ...picked])].sort((a, b) => a - b);
  const toNumber = (raw: string) => (raw === "" ? undefined : Number(raw));

  return (
    <fieldset className="filter-group">
      <legend>Price</legend>
      <div className="price-filter">
        <label htmlFor={`${id}-min`} className="visually-hidden">
          Minimum price
        </label>
        <select
          id={`${id}-min`}
          className="filter-select"
          value={priceMin ?? ""}
          onChange={(event) => onChange(toNumber(event.target.value), priceMax)}
        >
          <option value="">No min</option>
          {steps.map((price) => (
            <option key={price} value={price} disabled={priceMax !== undefined && price >= priceMax}>
              {formatPrice(price)}
            </option>
          ))}
        </select>
        <span aria-hidden="true">to</span>
        <label htmlFor={`${id}-max`} className="visually-hidden">
          Maximum price
        </label>
        <select
          id={`${id}-max`}
          className="filter-select"
          value={priceMax ?? ""}
          onChange={(event) => onChange(priceMin, toNumber(event.target.value))}
        >
          <option value="">No max</option>
          {steps.map((price) => (
            <option key={price} value={price} disabled={priceMin !== undefined && price <= priceMin}>
              {formatPrice(price)}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
