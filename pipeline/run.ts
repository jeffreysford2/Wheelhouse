// The monthly pipeline: fetch every source, merge, validate, write files.
//
// DO NOT RUN until Jeff has approved the cost estimate. Every source checks
// for WHEELHOUSE_COST_APPROVED=yes before touching the network, and the
// adapters are still stubs, so running this today just prints why it
// stopped. To work on the site, use `npm run sample-data` instead.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeBuildStamp, writeDataFiles } from "./build";
import { mergeSources } from "./match";
import { CarApiCatalogSource } from "./sources/carApiCatalog";
import { EpaFuelEconomySource } from "./sources/epaFuelEconomy";
import { NhtsaSafetySource } from "./sources/nhtsaSafety";
import type { ModelYearRequest } from "./sources/sourceRecords";
import { validateModels } from "./validate";

const MODEL_YEARS: ModelYearRequest = [2025, 2026];
const OUTPUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");

async function runPipeline(): Promise<void> {
  const catalogSource = new CarApiCatalogSource();
  const fuelEconomySource = new EpaFuelEconomySource();
  const safetySource = new NhtsaSafetySource();

  // The catalog goes first and alone: if it fails we have nothing to
  // publish, so there is no point spending calls on the other sources.
  const catalog = await catalogSource.fetchTrims(MODEL_YEARS);
  const [fuelEconomy, safety] = await Promise.all([
    fuelEconomySource.fetchFuelEconomy(MODEL_YEARS),
    safetySource.fetchSafetyRatings(MODEL_YEARS),
  ]);

  const models = mergeSources(catalog, fuelEconomy, safety);

  const result = validateModels(models);
  if (!result.ok) {
    // Exit without writing, so the previous month's files stay live.
    console.error(`Validation failed with ${result.problems.length} problem(s); keeping the current data.`);
    for (const problem of result.problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  await writeDataFiles(models, OUTPUT_DIR, makeBuildStamp(new Date()));
  console.log(`Wrote ${models.length} models to ${OUTPUT_DIR}`);
}

runPipeline().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
