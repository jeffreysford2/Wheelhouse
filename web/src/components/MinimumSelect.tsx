// A dropdown for "at least N" filters such as seats or fuel economy.

import { useId } from "react";

type Props = {
  label: string;
  value: number | undefined;
  choices: number[];
  formatChoice: (value: number) => string;
  onChange: (value: number | undefined) => void;
  anyLabel?: string;
};

export function MinimumSelect({ label, value, choices, formatChoice, onChange, anyLabel = "Any" }: Props) {
  const id = useId();
  return (
    <div className="filter-group">
      <label htmlFor={id} className="filter-label">
        {label}
      </label>
      <select
        id={id}
        className="filter-select"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      >
        <option value="">{anyLabel}</option>
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {formatChoice(choice)}
          </option>
        ))}
      </select>
    </div>
  );
}
