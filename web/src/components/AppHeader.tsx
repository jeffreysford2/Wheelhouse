import { Link } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import "./AppHeader.css";

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-logo" aria-label="Wheelhouse, all cars">
          <LogoMark />
          <span>Wheelhouse</span>
        </Link>
        <SearchBox />
        <ThemeToggle />
      </div>
    </header>
  );
}

/** A simple steering-wheel mark, drawn in the accent color. */
function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="2.5" fill="var(--color-accent)" />
      <path d="M3 11h6.5M14.5 11H21M12 14.5V21" stroke="var(--color-accent)" strokeWidth="2.5" />
    </svg>
  );
}
