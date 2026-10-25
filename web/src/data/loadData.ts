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

export async function loadModel(modelId: string): Promise<ModelFile> {
  // The index version is added to the URL so a monthly refresh never mixes
  // a fresh index with a cached model file from last month.
  const { version } = await loadIndex();
  const url = `${DATA_ROOT}/models/${encodeURIComponent(modelId)}.json?v=${version}`;

  let request = modelRequests.get(url);
  if (!request) {
    request = fetchJson<ModelFile>(url);
    request.catch(() => modelRequests.delete(url));
    modelRequests.set(url, request);
  }
  return request;
}
