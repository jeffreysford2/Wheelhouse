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

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * The visitor's theme choice. "system" removes the override so CSS follows
 * prefers-color-scheme; the inline script in index.html applies a saved
 * choice before first paint, and this hook keeps it in sync afterwards.
 */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readSavedChoice);

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
  const toggle = useCallback(() => {
    setChoice((current) => {
      const showingDark = current === "dark" || (current === "system" && systemPrefersDark());
      return showingDark ? "light" : "dark";
    });
  }, []);

  const isDark = choice === "dark" || (choice === "system" && typeof window !== "undefined" && systemPrefersDark());

  return { choice, isDark, toggle, setChoice };
}
