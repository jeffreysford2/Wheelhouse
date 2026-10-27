// Looks up full details for the picked trims. The index says which model
// each trim belongs to; the model files add the charging figures the index
// leaves out.

import type { IndexFile } from "../../../shared/carTypes";
import { loadIndex, loadModel } from "../data/loadData";
import type { TrimWithModel } from "../data/trimSpecs";
import { useAsync } from "../data/useAsync";

/** Maps each trim id to the id of the model it belongs to. */
export function modelIdsByTrimId(index: IndexFile): Map<string, string> {
  return new Map(index.models.flatMap((model) => model.trims.map((trim) => [trim.id, model.id] as const)));
}

async function loadCompareTrims(trimIds: string[]): Promise<TrimWithModel[]> {
  const modelIdFor = modelIdsByTrimId(await loadIndex());
  const modelIds = [...new Set(trimIds.map((id) => modelIdFor.get(id)).filter((id) => id !== undefined))];
  const files = await Promise.all(modelIds.map((id) => loadModel(id)));
  const models = new Map(files.map((file) => [file.model.id, file.model]));

  return trimIds.flatMap((trimId) => {
    const model = models.get(modelIdFor.get(trimId) ?? "");
    const trim = model?.trims.find((candidate) => candidate.id === trimId);
    return model && trim ? [{ model, trim }] : [];
  });
}

/** Trims in the order given, skipping any the data doesn't have. */
export function useCompareTrims(trimIds: string[]) {
  return useAsync(() => loadCompareTrims(trimIds), [trimIds.join(",")]);
}
