// Holds the visitor's compare picks for the whole site, so the tray stays
// filled while they browse between model pages.
//
// Why localStorage: picks survive a reload or a closed tab, and other open
// tabs pick up changes through the "storage" event.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIndexData } from "../data/useIndexData";
import { addTrim, MAX_COMPARE_TRIMS, parseTrimIds, removeTrim, serializeTrimIds } from "./compareList";

const STORAGE_KEY = "wheelhouse-compare";

type CompareList = {
  trimIds: string[];
  isFull: boolean;
  has: (trimId: string) => boolean;
  add: (trimId: string) => void;
  remove: (trimId: string) => void;
  /** Swaps in a whole list, such as one from a shared compare link. */
  replace: (trimIds: string[]) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareList | undefined>(undefined);

function readSaved(): string[] {
  try {
    return parseTrimIds(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage can be blocked; the list then lasts for this visit only.
    return [];
  }
}

function save(trimIds: string[]) {
  try {
    if (trimIds.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, serializeTrimIds(trimIds));
  } catch {
    // Not saving is fine; the picks still work until the page is closed.
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [trimIds, setTrimIds] = useState<string[]>(readSaved);

  useEffect(() => save(trimIds), [trimIds]);

  // Follow changes made in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setTrimIds(parseTrimIds(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // A monthly data refresh can retire a trim. Drop saved picks the current
  // data no longer has, so the tray never shows a blank chip.
  const index = useIndexData();
  useEffect(() => {
    if (index.status !== "ready") return;
    const knownTrimIds = new Set(index.data.models.flatMap((model) => model.trims.map((trim) => trim.id)));
    setTrimIds((current) => {
      const known = current.filter((id) => knownTrimIds.has(id));
      return known.length === current.length ? current : known;
    });
  }, [index, trimIds]);

  const add = useCallback((trimId: string) => setTrimIds((current) => addTrim(current, trimId)), []);
  const remove = useCallback((trimId: string) => setTrimIds((current) => removeTrim(current, trimId)), []);
  const replace = useCallback((next: string[]) => setTrimIds(parseTrimIds(serializeTrimIds(next))), []);
  const clear = useCallback(() => setTrimIds([]), []);

  const value = useMemo<CompareList>(
    () => ({
      trimIds,
      isFull: trimIds.length >= MAX_COMPARE_TRIMS,
      has: (trimId) => trimIds.includes(trimId),
      add,
      remove,
      replace,
      clear,
    }),
    [trimIds, add, remove, replace, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompareList(): CompareList {
  const list = useContext(CompareContext);
  if (!list) throw new Error("useCompareList must be used inside CompareProvider");
  return list;
}
