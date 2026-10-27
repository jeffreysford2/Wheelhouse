// The pipeline: read the catalog, merge, validate, write files.
//
// Today the catalog is the hand-collected CSVs in pipeline/curated, which
// are local files, so this run is offline and free. EPA fuel economy and
// NHTSA safety ratings are free too but not wired in yet (their adapters are
// still stubs), so MPG and safety filters stay hidden until they are.
//
// Paid sources (CarAPI) still refuse to run without cost approval; see
// sources/notApproved.ts.

import { makeBuildStamp, validateAndWrite } from "./build";
import { mergeSources } from "./match";
import { CuratedCatalogSource } from "./sources/curatedCatalog";
import type { CatalogTrimRecord, ModelYearRequest } from "./sources/sourceRecords";

// Jeff chose 2026 only for the first version (2026-10-26).
const MODEL_YEARS: ModelYearRequest = [2026];

/**
 * The site says "Prices updated on <date>". With hand-collected prices that
 * must be the oldest check date, not the run date, so no price is presented
 * as fresher than it is.
 */
function oldestCheckDate(records: CatalogTrimRecord[]): string | undefined {
  const dates = records.map((record) => record.priceCheckedOn).filter((date): date is string => Boolean(date));
  return dates.sort()[0];
}

async function runPipeline(): Promise<void> {
  const catalog = await new CuratedCatalogSource().fetchTrims(MODEL_YEARS);
  const models = mergeSources(catalog, [], []);

  const wrote = await validateAndWrite(models, makeBuildStamp(new Date(), oldestCheckDate(catalog)));
  if (!wrote) process.exit(1);
}

runPipeline().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
