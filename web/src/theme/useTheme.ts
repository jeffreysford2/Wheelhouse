import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "wheelhouse-theme";

function readSavedChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    // Storage can be blocked (private windows, strict settings); fall back to the system setting.
    return "system";
  }
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

/** Tracks the OS light/dark setting, so the toggle's icon follows it when the OS switches while the page is open. */
function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => setPrefersDark(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return prefersDark;
}

/**
 * The visitor's theme choice. "system" removes the override so CSS follows
 * prefers-color-scheme; the inline script in index.html applies a saved
 * choice before first paint, and this hook keeps it in sync afterwards.
 */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readSavedChoice);
  const systemIsDark = useSystemPrefersDark();
  const isDark = choice === "dark" || (choice === "system" && systemIsDark);

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;
    try {
      if (choice === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Not saving is fine; the choice still applies for this visit.
    }
  }, [choice]);

  /** Flip to the opposite of whatever is showing now. */
  const toggle = useCallback(() => setChoice(isDark ? "light" : "dark"), [isDark]);

  return { choice, isDark, toggle, setChoice };
}
