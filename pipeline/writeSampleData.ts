// Writes the hand-written sample dataset to public/data so the site can be
// built and tested before any real API is connected. Fully offline: it
// makes no network calls and costs nothing.
//
// It reuses the real merge, validate and write steps, so the sample files
// have exactly the shape the monthly pipeline will produce.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeBuildStamp, writeDataFiles } from "./build";
import { mergeSources } from "./match";
import { sampleSourceRecords } from "./sample/sampleCars";
import { validateModels } from "./validate";

const OUTPUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");

const { catalog, fuelEconomy, safety } = sampleSourceRecords();
const models = mergeSources(catalog, fuelEconomy, safety);

const result = validateModels(models);
if (!result.ok) {
  console.error("Sample data failed validation:");
  for (const problem of result.problems) console.error(`  - ${problem}`);
  process.exit(1);
}

// A fixed date keeps the committed sample files identical between runs.
await writeDataFiles(models, OUTPUT_DIR, makeBuildStamp(new Date("2026-10-01T00:00:00Z")));
console.log(`Wrote ${models.length} sample models to ${OUTPUT_DIR}`);
