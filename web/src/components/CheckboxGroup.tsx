// A titled list of checkboxes where each option shows how many models it
// would return. Options that would return nothing stay visible but dimmed,
// so the list doesn't jump around as filters change.

type Option<T extends string> = { value: T; label: string; count: number };

type Props<T extends string> = {
  legend: string;
  options: Option<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
};

export function CheckboxGroup<T extends string>({ legend, options, selected, onToggle }: Props<T>) {
  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
      {options.map((option) => {
        const isChecked = selected.includes(option.value);
        return (
          <label key={option.value} className={`filter-option${option.count === 0 && !isChecked ? " is-empty" : ""}`}>
            <input type="checkbox" checked={isChecked} onChange={() => onToggle(option.value)} />
            <span>{option.label}</span>
            <span className="filter-count figures" aria-label={`${option.count} models`}>
              {option.count}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
