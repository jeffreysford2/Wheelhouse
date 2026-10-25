// Sanity checks run before anything is published.
//
// If any check fails the pipeline stops and last month's files stay live.
// Showing slightly old prices is much better than showing a $0 car or a
// broken page, so these checks err on the side of failing loudly.

import type { Model } from "../shared/carTypes";

// Ranges are generous on purpose: they exist to catch unit mix-ups and
// parsing errors (cents instead of dollars, liters instead of cu ft), not to
// second-guess real cars.
const SANE_RANGES = {
  msrp: [10_000, 500_000],
  seats: [1, 15],
  mpgCombined: [5, 200],
  electricRangeMiles: [5, 600],
  fastChargeKw: [3, 500],
  chargeTimeHours: [0.5, 48],
  towingLbs: [0, 40_000],
  cargoCuFt: [1, 200],
  safetyRating: [1, 5],
} as const;

type RangedField = keyof typeof SANE_RANGES;

export type ValidationResult = { ok: true } | { ok: false; problems: string[] };

export function validateModels(models: Model[]): ValidationResult {
  const problems: string[] = [];
  const seenIds = new Set<string>();

  const checkUniqueId = (id: string) => {
    if (seenIds.has(id)) problems.push(`Duplicate id: ${id}`);
    seenIds.add(id);
  };

  const checkRange = (where: string, field: RangedField, value: number | undefined) => {
    if (value === undefined) return;
    const [min, max] = SANE_RANGES[field];
    if (!Number.isFinite(value) || value < min || value > max) {
      problems.push(`${where}: ${field} ${value} is outside ${min} to ${max}`);
    }
  };

  if (models.length === 0) problems.push("No models at all. A source probably returned nothing.");

  for (const model of models) {
    checkUniqueId(model.id);
    checkRange(model.id, "safetyRating", model.safetyRating);
    if (model.trims.length === 0) problems.push(`${model.id}: has no trims`);

    for (const trim of model.trims) {
      checkUniqueId(trim.id);
      if (!trim.id.startsWith(`${model.id}-`)) {
        problems.push(`${trim.id}: trim id should start with its model id ${model.id}`);
      }
      // Every trim must have a price: "from $X" is on every card.
      if (trim.msrp === undefined) problems.push(`${trim.id}: missing msrp`);
      checkRange(trim.id, "msrp", trim.msrp);
      checkRange(trim.id, "seats", trim.seats);
      checkRange(trim.id, "mpgCombined", trim.mpgCombined);
      checkRange(trim.id, "electricRangeMiles", trim.electricRangeMiles);
      checkRange(trim.id, "fastChargeKw", trim.fastChargeKw);
      checkRange(trim.id, "chargeTimeHours", trim.chargeTimeHours);
      checkRange(trim.id, "towingLbs", trim.towingLbs);
      checkRange(trim.id, "cargoCuFt", trim.cargoCuFt);

      if (trim.powertrain === "gas" && trim.electricRangeMiles !== undefined) {
        problems.push(`${trim.id}: gas trim has an electric range, so sources were probably mismatched`);
      }
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
}
