// The vehicle catalog, read from hand-collected CSV files in pipeline/curated.
//
// Jeff chose a $0 start over a paid catalog API (2026-10-26), so trims and
// prices for the 40 best-selling 2026 models were collected by hand from
// manufacturer press sites and pricing articles. Every row keeps the link it
// came from. Reading local files costs nothing and makes no network calls,
// so this source needs no cost approval.
//
// To refresh prices, edit trims-2026.csv (keep source_url and checked_on
// current) and run `npm run pipeline`.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BodyStyle, Drivetrain, ModelYear, Powertrain } from "../../shared/carTypes";
import { parseCsv } from "./csv";
import type { CatalogSource, CatalogTrimRecord, ModelYearRequest } from "./sourceRecords";

export const CURATED_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../curated");

// The CSVs use plain-English labels so they are easy to edit in a
// spreadsheet. These maps turn them into the site's values, and anything
// unrecognized stops the run instead of being guessed.

const POWERTRAINS: Record<string, Powertrain> = {
  Gas: "gas",
  Diesel: "gas", // The site has no diesel filter yet; diesel trucks count as gas.
  Hybrid: "hybrid",
  "Plug-in hybrid": "plug-in hybrid",
  Electric: "electric",
};

const DRIVETRAINS: Record<string, Drivetrain> = { FWD: "FWD", RWD: "RWD", AWD: "AWD", "4WD": "4WD" };

/** The models file says "Compact SUV (EV)" or "Midsize car"; the site only needs the body style. */
export function bodyStyleFromLabel(label: string): BodyStyle {
  const text = label.toLowerCase();
  if (text.includes("pickup")) return "truck";
  if (text.includes("minivan")) return "minivan";
  if (text.includes("suv")) return "suv";
  if (text.includes("car")) return "sedan";
  throw new Error(`Unknown body type "${label}" in models-2026.csv`);
}

function lookup<T>(table: Record<string, T>, value: string, column: string, where: string): T {
  const found = table[value];
  if (found === undefined) throw new Error(`${where}: unknown ${column} "${value}"`);
  return found;
}

/** Empty cells mean "we don't know", so they become undefined rather than 0. */
function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Not a number: "${value}"`);
  return number;
}

const modelKeyOf = (make: string, model: string) => `${make}|${model}`;

/**
 * Turn the two curated CSV files into catalog records. Exported separately
 * from the file reading so tests can feed it small inline CSVs.
 */
export function curatedTrimRecords(modelsCsv: string, trimsCsv: string): CatalogTrimRecord[] {
  const bodyStyleByModel = new Map<string, BodyStyle>();
  for (const row of parseCsv(modelsCsv)) {
    bodyStyleByModel.set(modelKeyOf(row.make!, row.model!), bodyStyleFromLabel(row.body_type!));
  }

  return parseCsv(trimsCsv).map((row) => {
    const where = `${row.year} ${row.make} ${row.model} ${row.trim}`;
    const bodyStyle = bodyStyleByModel.get(modelKeyOf(row.make!, row.model!));
    if (!bodyStyle) throw new Error(`${where}: model is missing from models-2026.csv`);

    const msrp = optionalNumber(row.msrp_usd);
    if (msrp === undefined) throw new Error(`${where}: missing msrp_usd`);
    if (!row.source_url) throw new Error(`${where}: missing source_url`);

    return {
      year: Number(row.year) as ModelYear,
      make: row.make!,
      model: row.model!,
      trim: row.trim!,
      msrp,
      destinationFee: optionalNumber(row.destination_usd),
      bodyStyle,
      powertrain: lookup(POWERTRAINS, row.powertrain!, "powertrain", where),
      drivetrain: lookup(DRIVETRAINS, row.drive!, "drive", where),
      seats: optionalNumber(row.seats),
      electricRangeMiles: optionalNumber(row.ev_range_mi),
      priceSourceUrl: row.source_url,
      priceCheckedOn: row.checked_on,
    };
  });
}

export class CuratedCatalogSource implements CatalogSource {
  readonly name = "Hand-collected catalog (pipeline/curated)";

  async fetchTrims(years: ModelYearRequest): Promise<CatalogTrimRecord[]> {
    const [modelsCsv, trimsCsv] = await Promise.all([
      readFile(path.join(CURATED_DIR, "models-2026.csv"), "utf8"),
      readFile(path.join(CURATED_DIR, "trims-2026.csv"), "utf8"),
    ]);
    return curatedTrimRecords(modelsCsv, trimsCsv).filter((record) => years.includes(record.year));
  }
}
