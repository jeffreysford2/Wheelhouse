import { loadIndex } from "./loadData";
import { useAsync } from "./useAsync";

/** The index file, shared by every component that needs it (one fetch per visit). */
export function useIndexData() {
  return useAsync(loadIndex, []);
}
