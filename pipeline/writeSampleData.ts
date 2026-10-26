// Writes the hand-written sample dataset to public/data so the site can be
// built and tested before any real API is connected. Fully offline: it
// makes no network calls and costs nothing.
//
// It reuses the real merge, validate and write steps, so the sample files
// have exactly the shape the monthly pipeline will produce.

import { makeBuildStamp, validateAndWrite } from "./build";
import { mergeSources } from "./match";
import { sampleSourceRecords } from "./sample/sampleCars";

const { catalog, fuelEconomy, safety } = sampleSourceRecords();
const models = mergeSources(catalog, fuelEconomy, safety);

// A fixed date keeps the committed sample files identical between runs.
const wrote = await validateAndWrite(models, makeBuildStamp(new Date("2026-10-01T00:00:00Z")));
if (!wrote) process.exit(1);
