// Writes the published JSON files: one slim index for the results grid and
// one full file per model for the detail and compare pages.

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IndexFile, IndexModel, IndexTrim, Model, ModelFile } from "../shared/carTypes";

/** Strip the fields only the detail page needs, to keep the first download small. */
export function toIndexModel(model: Model): IndexModel {
  const trims: IndexTrim[] = model.trims.map(({ fastChargeKw: _kw, chargeTimeHours: _hours, ...indexFields }) => indexFields);
  return { ...model, trims };
}

export type BuildStamp = {
  /** ISO date shown on the site as "Prices updated on ...". */
  updatedAt: string;
  version: string;
};

export function makeBuildStamp(now: Date): BuildStamp {
  return {
    updatedAt: now.toISOString().slice(0, 10),
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
