import { useTheme } from "../theme/useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button type="button" className="button" onClick={toggle} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}>
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
