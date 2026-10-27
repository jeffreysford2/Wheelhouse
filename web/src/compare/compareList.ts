// The list of trims picked for comparison, as plain functions so the rules
// (no duplicates, at most six) are easy to test apart from React.

export const MAX_COMPARE_TRIMS = 6;

/** Adds a trim to the end. Ignores a trim that is already listed or a full list. */
export function addTrim(trimIds: readonly string[], trimId: string): string[] {
  if (trimIds.includes(trimId) || trimIds.length >= MAX_COMPARE_TRIMS) return [...trimIds];
  return [...trimIds, trimId];
}

export function removeTrim(trimIds: readonly string[], trimId: string): string[] {
  return trimIds.filter((id) => id !== trimId);
}

/**
 * Reads a comma-separated list, as written in the compare page URL
 * (?trims=a,b) and in saved storage. Drops blanks and repeats, and keeps
 * only the first six so a hand-edited link can't overflow the table.
 */
export function parseTrimIds(text: string | null | undefined): string[] {
  if (!text) return [];
  const unique = [...new Set(text.split(",").map((id) => id.trim()).filter(Boolean))];
  return unique.slice(0, MAX_COMPARE_TRIMS);
}

export function serializeTrimIds(trimIds: readonly string[]): string {
  return trimIds.join(",");
}

export function compareUrl(trimIds: readonly string[]): string {
  return trimIds.length === 0 ? "/compare" : `/compare?trims=${serializeTrimIds(trimIds)}`;
}
