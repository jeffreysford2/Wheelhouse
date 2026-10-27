// Writes the published JSON files: one slim index for the results grid and
// one full file per model for the detail and compare pages.

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IndexFile, IndexModel, IndexTrim, Model, ModelFile } from "../shared/carTypes";
import { validateModels } from "./validate";

/** Where the site reads its data from (the repo-level public/data folder). */
export const PUBLIC_DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");

/** Strip the fields only the detail page needs, to keep the first download small. */
export function toIndexModel(model: Model): IndexModel {
  const trims: IndexTrim[] = model.trims.map(
    ({ fastChargeKw: _kw, chargeTimeHours: _hours, destinationFee: _fee, priceSourceUrl: _url, ...indexFields }) =>
      indexFields,
  );
  return { ...model, trims };
}

export type BuildStamp = {
  /** ISO date shown on the site as "Prices updated on ...". */
  updatedAt: string;
  version: string;
};

/**
 * `pricesCheckedOn` is the date prices were last checked against their
 * sources. It defaults to the run date, but hand-collected prices can be
 * older than the run, and the site must not claim they are fresher.
 */
export function makeBuildStamp(now: Date, pricesCheckedOn?: string): BuildStamp {
  return {
    updatedAt: pricesCheckedOn ?? now.toISOString().slice(0, 10),
    // A timestamp is enough to tell one monthly run from the next.
    version: now.toISOString().replace(/[-:.TZ]/g, ""),
  };
}

export async function writeDataFiles(models: Model[], outputDir: string, stamp: BuildStamp): Promise<void> {
  const modelsDir = path.join(outputDir, "models");

  // Start from an empty models folder so a car dropped from the catalog
  // doesn't leave an orphan page behind.
  await rm(modelsDir, { recursive: true, force: true });
  await mkdir(modelsDir, { recursive: true });

  const sortedModels = [...models].sort((a, b) => a.id.localeCompare(b.id));

  const index: IndexFile = { ...stamp, models: sortedModels.map(toIndexModel) };
  await writeJson(path.join(outputDir, "index.json"), index);

  for (const model of sortedModels) {
    const file: ModelFile = { ...stamp, model };
    await writeJson(path.join(modelsDir, `${model.id}.json`), file);
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  // Pretty-printed so a monthly diff of the data is readable in review.
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * The last step of the pipeline run. Writes nothing if validation fails,
 * so the files already published stay live. Returns whether it wrote.
 */
export async function validateAndWrite(models: Model[], stamp: BuildStamp, outputDir = PUBLIC_DATA_DIR): Promise<boolean> {
  const result = validateModels(models);
  if (!result.ok) {
    console.error(`Validation failed with ${result.problems.length} problem(s); keeping the current data.`);
    for (const problem of result.problems) console.error(`  - ${problem}`);
    return false;
  }

  await writeDataFiles(models, outputDir, stamp);
  console.log(`Wrote ${models.length} models to ${outputDir}`);
  return true;
}
