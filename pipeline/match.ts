// Rules for joining records from different sources into one Model per
// year/make/model.
//
// Sources rarely spell names the same way ("F-150" vs "F150", "Mercedes-Benz"
// vs "Mercedes Benz"), and the plan flags this as the most likely place for
// bugs. All of the name rules live in this one file, with tests beside it,
// so a mismatch found in real data gets fixed here and nowhere else.

import { PLACEHOLDER_IMAGE_URL, type Model, type Trim } from "../shared/carTypes";
import type { CatalogTrimRecord, FuelEconomyRecord, SafetyRecord } from "./sources/sourceRecords";

/**
 * Reduce a make or model name to a comparison form: lowercase, letters and
 * digits only. "F-150", "F150" and "f 150" all become "f150".
 */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Turn a display name into a URL-safe id piece: "CR-V Hybrid" becomes "cr-v-hybrid". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function modelId(make: string, model: string, year: number): string {
  return `${slugify(make)}-${slugify(model)}-${year}`;
}

/** The key used to line up records from different sources. */
export function modelKey(record: { year: number; make: string; model: string }): string {
  return `${record.year}|${normalizeName(record.make)}|${normalizeName(record.model)}`;
}

/**
 * Pick the EPA record that best describes one catalog trim.
 *
 * EPA does not use trim names, so we score each candidate for the same
 * model: a matching powertrain matters most (a hybrid trim must not get gas
 * MPG), then drivetrain, then how closely EPA's description matches the trim name.
 * Only records with the same powertrain are considered, and it returns
 * undefined rather than guessing when there are none, because a wrong MPG is
 * worse than a missing one.
 */
export function pickFuelEconomyRecord(
  trim: CatalogTrimRecord,
  candidates: FuelEconomyRecord[],
): FuelEconomyRecord | undefined {
  let best: { record: FuelEconomyRecord; score: number } | undefined;

  for (const record of candidates) {
    if (record.powertrain !== trim.powertrain) continue;

    let score = 0;
    if (record.drivetrain === trim.drivetrain) score += 2;
    if (record.description) {
      const description = normalizeName(record.description);
      const trimName = normalizeName(trim.trim);
      // An exact name beats a partial one, so "Sport Touring" isn't given
      // the plain "Sport" figures just because it was listed first.
      if (description === trimName) score += 3;
      else if (description.includes(trimName)) score += 1;
    }

    if (!best || score > best.score) best = { record, score };
  }

  return best?.record;
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/**
 * Catalogs often list one trim name once per drivetrain ("XLE" FWD and "XLE"
 * AWD). Repeated names get the drivetrain added, then the powertrain if they
 * still clash, so every trim has a unique id and a name visitors can tell
 * apart. A name that is still repeated after that is a real duplicate, and
 * validation will stop the run.
 */
export function distinctTrimNames(records: CatalogTrimRecord[]): string[] {
  const addSuffixToRepeats = (names: string[], suffixOf: (record: CatalogTrimRecord) => string) =>
    names.map((name, position) =>
      names.indexOf(name) !== names.lastIndexOf(name) ? `${name} ${suffixOf(records[position]!)}` : name,
    );

  const withDrivetrain = addSuffixToRepeats(
    records.map((record) => record.trim),
    (record) => record.drivetrain,
  );
  return addSuffixToRepeats(withDrivetrain, (record) => capitalize(record.powertrain));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * NHTSA can rate one model several times (for example 2WD and 4WD). We show
 * one rating per model, so keep the lowest: never overstate how safe a car is.
 */
function lowestSafetyRatingByModel(safety: SafetyRecord[]): Map<string, number> {
  const ratings = new Map<string, number>();
  for (const record of safety) {
    const key = modelKey(record);
    ratings.set(key, Math.min(record.overallRating, ratings.get(key) ?? Infinity));
  }
  return ratings;
}

/**
 * Combine all sources into Models. The catalog decides which models and
 * trims exist; EPA and NHTSA only add detail, so a car missing from EPA still
 * appears, just without fuel economy.
 */
export function mergeSources(
  catalogTrims: CatalogTrimRecord[],
  fuelEconomy: FuelEconomyRecord[],
  safety: SafetyRecord[],
): Model[] {
  const fuelEconomyByModel = groupBy(fuelEconomy, modelKey);
  const safetyRatingByModel = lowestSafetyRatingByModel(safety);
  const catalogByModel = groupBy(catalogTrims, modelKey);

  const models: Model[] = [];
  for (const [key, trimRecords] of catalogByModel) {
    const first = trimRecords[0]!;
    const id = modelId(first.make, first.model, first.year);
    const epaCandidates = fuelEconomyByModel.get(key) ?? [];

    const trimNames = distinctTrimNames(trimRecords);

    const trims: Trim[] = trimRecords.map((record, position) => {
      const epa = pickFuelEconomyRecord(record, epaCandidates);
      const name = trimNames[position]!;
      return withoutUndefined({
        id: `${id}-${slugify(name)}`,
        name,
        msrp: record.msrp,
        powertrain: record.powertrain,
        drivetrain: record.drivetrain,
        seats: record.seats,
        mpgCombined: epa?.mpgCombined,
        electricRangeMiles: epa?.electricRangeMiles,
        fastChargeKw: epa?.fastChargeKw,
        chargeTimeHours: epa?.chargeTimeHours,
        towingLbs: record.towingLbs,
        cargoCuFt: record.cargoCuFt,
      });
    });

    models.push(
      withoutUndefined({
        id,
        make: first.make,
        name: first.model,
        year: first.year,
        bodyStyle: first.bodyStyle,
        imageUrl: trimRecords.find((record) => record.imageUrl)?.imageUrl ?? PLACEHOLDER_IMAGE_URL,
        safetyRating: safetyRatingByModel.get(key),
        trims,
      }),
    );
  }

  return models;
}

/** Drop keys whose value is undefined, so the JSON files stay small and tidy. */
function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
