// The specs shown for a trim, in display order. Shared by the model page's
// trim table and the compare table, so both label and format figures alike.

import type { Model, Trim } from "../../../shared/carTypes";
import { BODY_STYLE_LABELS, formatEfficiency, formatNumber, formatPrice, POWERTRAIN_LABELS } from "./format";

export type TrimSpec = {
  /** Stable name, so a table can draw a spec specially (powertrain gets its icon). */
  id: string;
  label: string;
  /** Undefined when the data has no figure for this trim. */
  format: (trim: Trim, model: Model) => string | undefined;
  /** True for specs that are the same for every trim of a model, which the model page shows once in its header instead. */
  isModelWide?: boolean;
};

export const TRIM_SPECS: TrimSpec[] = [
  {
    id: "destination",
    label: "Destination fee",
    format: (trim) => (trim.destinationFee === undefined ? undefined : formatPrice(trim.destinationFee)),
  },
  { id: "body", label: "Body style", format: (_trim, model) => BODY_STYLE_LABELS[model.bodyStyle], isModelWide: true },
  { id: "powertrain", label: "Powertrain", format: (trim) => POWERTRAIN_LABELS[trim.powertrain] },
  { id: "drivetrain", label: "Drivetrain", format: (trim) => trim.drivetrain },
  { id: "seats", label: "Seats", format: (trim) => (trim.seats === undefined ? undefined : String(trim.seats)) },
  { id: "efficiency", label: "Fuel economy", format: (trim) => formatEfficiency(trim.mpgCombined, trim.powertrain) },
  { id: "range", label: "Electric range", format: (trim) => withUnit(trim.electricRangeMiles, "mi") },
  { id: "fastCharge", label: "DC fast charging", format: (trim) => withUnit(trim.fastChargeKw, "kW") },
  { id: "chargeTime", label: "Charging time", format: (trim) => withUnit(trim.chargeTimeHours, "hrs") },
  { id: "towing", label: "Towing", format: (trim) => withUnit(trim.towingLbs, "lbs") },
  { id: "cargo", label: "Cargo space", format: (trim) => withUnit(trim.cargoCuFt, "cu ft") },
  {
    id: "safety",
    label: "NHTSA safety",
    format: (_trim, model) => (model.safetyRating === undefined ? undefined : `${model.safetyRating} of 5 stars`),
    isModelWide: true,
  },
];

function withUnit(value: number | undefined, unit: string): string | undefined {
  return value === undefined ? undefined : `${formatNumber(value)} ${unit}`;
}

export type TrimWithModel = { trim: Trim; model: Model };

/** A spec row with one value per trim. */
export type SpecRow = { id: string; label: string; values: (string | undefined)[] };

/**
 * Builds the rows for a set of trims. A spec no trim has a figure for is
 * left out, so a table of gas cars has no empty charging rows.
 */
export function buildSpecRows(columns: TrimWithModel[], specs: TrimSpec[] = TRIM_SPECS): SpecRow[] {
  return specs
    .map((spec) => ({ id: spec.id, label: spec.label, values: columns.map(({ trim, model }) => spec.format(trim, model)) }))
    .filter((row) => row.values.some((value) => value !== undefined));
}

/** True when the trims don't all share one value. A missing figure counts as its own value. */
export function rowDiffers(row: SpecRow): boolean {
  return new Set(row.values).size > 1;
}
