// Display formatting, in one place so every page writes numbers the same way.

import type { BodyStyle, Powertrain } from "../../../shared/carTypes";

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const plainNumber = new Intl.NumberFormat("en-US");

export const formatPrice = (amount: number) => dollars.format(amount);
export const formatNumber = (value: number) => plainNumber.format(value);

export const BODY_STYLE_LABELS: Record<BodyStyle, string> = {
  sedan: "Sedan",
  suv: "SUV",
  truck: "Truck",
  minivan: "Minivan",
  hatchback: "Hatchback",
  coupe: "Coupe",
  wagon: "Wagon",
  convertible: "Convertible",
};

export const POWERTRAIN_LABELS: Record<Powertrain, string> = {
  gas: "Gas",
  hybrid: "Hybrid",
  "plug-in hybrid": "Plug-in hybrid",
  electric: "Electric",
};

/** Electric cars are rated in MPGe, everything else in MPG. */
export function formatEfficiency(mpg: number | undefined, powertrain: Powertrain): string | undefined {
  if (mpg === undefined) return undefined;
  const unit = powertrain === "electric" || powertrain === "plug-in hybrid" ? "MPGe" : "MPG";
  return `${mpg} ${unit}`;
}

/** "2026-10-01" becomes "October 1, 2026". Parsed as UTC so the day doesn't shift by timezone. */
export function formatUpdatedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
