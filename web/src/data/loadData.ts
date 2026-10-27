// Fetching the published JSON. The index is fetched once per visit and kept
// in memory; every page that needs it shares the same request.

import type { IndexFile, ModelFile } from "../../../shared/carTypes";

const DATA_ROOT = "/data";

let indexRequest: Promise<IndexFile> | undefined;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
  return (await response.json()) as T;
}

export function loadIndex(): Promise<IndexFile> {
  indexRequest ??= fetchJson<IndexFile>(`${DATA_ROOT}/index.json`).catch((error: unknown) => {
    // Forget a failed request so the next attempt can retry.
    indexRequest = undefined;
    throw error;
  });
  return indexRequest;
}

const modelRequests = new Map<string, Promise<ModelFile>>();

/** Thrown for a model id the index doesn't list, so pages can say "not found" rather than "couldn't load". */
export class ModelNotFoundError extends Error {
  constructor(modelId: string) {
    super(`No model with id ${modelId}`);
    this.name = "ModelNotFoundError";
  }
}

export async function loadModel(modelId: string): Promise<ModelFile> {
  // Check the index first rather than relying on a 404: static hosts set up
  // for client-side routing answer unknown paths with the site's HTML page.
  const { version, models } = await loadIndex();
  if (!models.some((model) => model.id === modelId)) throw new ModelNotFoundError(modelId);

  // The index version is added to the URL so a monthly refresh never mixes
  // a fresh index with a cached model file from last month.
  const url = `${DATA_ROOT}/models/${encodeURIComponent(modelId)}.json?v=${version}`;

  let request = modelRequests.get(url);
  if (!request) {
    request = fetchJson<ModelFile>(url);
    request.catch(() => modelRequests.delete(url));
    modelRequests.set(url, request);
  }
  return request;
}
