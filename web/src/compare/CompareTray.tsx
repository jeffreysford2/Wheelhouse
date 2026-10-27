// The bar along the bottom of every page that lists the trims picked so far.
// It stays put while the visitor browses, so they can collect trims from
// several model pages and then open the comparison.

import { Link, useLocation } from "react-router-dom";
import { useIndexData } from "../data/useIndexData";
import { compareUrl, MAX_COMPARE_TRIMS } from "./compareList";
import { useCompareList } from "./CompareContext";
import "./CompareTray.css";

export function CompareTray() {
  const { trimIds, remove, clear } = useCompareList();
  const index = useIndexData();
  const { pathname } = useLocation();

  // The compare page shows the picks itself.
  if (trimIds.length === 0 || pathname === "/compare") return null;

  // Short labels from the index, which every page has already loaded.
  const labels = new Map<string, string>();
  if (index.status === "ready") {
    for (const model of index.data.models) {
      for (const trim of model.trims) labels.set(trim.id, `${model.name} ${trim.name}`);
    }
  }

  return (
    <>
      {/* Keeps the footer from hiding behind the fixed bar. */}
      <div className="compare-tray-spacer" aria-hidden="true" />
      <aside className="compare-tray" aria-label="Trims to compare">
        <div className="compare-tray-inner">
          <p className="compare-tray-count">
            <strong>Compare</strong>{" "}
            <span className="muted">
              {trimIds.length} of {MAX_COMPARE_TRIMS}
            </span>
          </p>
          <ul className="compare-tray-list">
            {trimIds.map((trimId) => {
              const label = labels.get(trimId) ?? "…";
              return (
                <li key={trimId} className="compare-tray-chip">
                  <span>{label}</span>
                  <button type="button" onClick={() => remove(trimId)} aria-label={`Remove ${label} from compare`}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="compare-tray-actions">
            <button type="button" className="button compare-tray-clear" onClick={clear}>
              Clear
            </button>
            <Link to={compareUrl(trimIds)} className="button button-primary">
              Compare{trimIds.length < 2 ? "" : ` ${trimIds.length}`}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
