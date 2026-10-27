// The header search: match brand and model as the visitor types.
//
// A plain word match is enough for a few hundred models and has no
// dependency. If fuzzy matching becomes worth it (typos like "camery"), swap
// this function for Fuse.js or MiniSearch; the signature can stay the same.

import type { IndexModel } from "../../../shared/carTypes";

export function searchModels(models: IndexModel[], query: string, limit = 8): IndexModel[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored = models.flatMap((model) => {
    const haystack = `${model.make} ${model.name} ${model.year}`.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) return [];
    // Models whose name starts with the query rank above those that merely contain it.
    const name = `${model.make} ${model.name}`.toLowerCase();
    const startsWith = name.startsWith(words[0]!) || model.name.toLowerCase().startsWith(words[0]!);
    return [{ model, score: startsWith ? 0 : 1 }];
  });

  return scored
    .sort((a, b) => a.score - b.score || b.model.year - a.model.year || a.model.name.localeCompare(b.model.name))
    .slice(0, limit)
    .map((entry) => entry.model);
}
