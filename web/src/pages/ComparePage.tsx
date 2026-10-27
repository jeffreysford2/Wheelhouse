// Side-by-side comparison of up to six trims, from any mix of models.
//
// The picks live in the compare tray (see CompareContext). The page also
// writes them into its URL (?trims=a,b) so a comparison can be bookmarked or
// shared, and a shared link replaces the visitor's picks when opened.

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CarImage } from "../components/CarImage";
import { PowertrainLabel } from "../components/PowertrainIcon";
import { parseTrimIds, serializeTrimIds } from "../compare/compareList";
import { useCompareList } from "../compare/CompareContext";
import { useCompareTrims } from "../compare/useCompareTrims";
import { formatPrice } from "../data/format";
import { buildSpecRows, rowDiffers, type TrimWithModel } from "../data/trimSpecs";
import "./ComparePage.css";

export function ComparePage() {
  const { trimIds } = useCompareList();
  useTrimsInUrl();
  const picked = useCompareTrims(trimIds);

  // While a change reloads, keep showing the trims already on screen (minus
  // any just removed) instead of flashing "Loading".
  const shownColumns = useRef<TrimWithModel[]>([]);
  if (picked.status === "ready") shownColumns.current = picked.data;

  if (trimIds.length === 0) {
    return (
      <div className="page compare-page">
        <h1>Compare</h1>
        <p className="muted">
          Nothing to compare yet. Open any car and press <strong>+ Compare</strong> next to a trim. You can pick up to six,
          from different cars.
        </p>
        <p>
          <Link to="/" className="button button-primary">
            Browse cars
          </Link>
        </p>
      </div>
    );
  }
  if (picked.status === "error") {
    return (
      <div className="page" role="alert">
        <h1>We couldn't load these trims</h1>
        <p className="muted">Check your connection and reload the page.</p>
      </div>
    );
  }
  if (picked.status === "loading") {
    const stillPicked = shownColumns.current.filter(({ trim }) => trimIds.includes(trim.id));
    if (stillPicked.length === 0) return <p className="page muted">Loading trims…</p>;
    return <CompareTable columns={stillPicked} />;
  }
  return <CompareTable columns={picked.data} />;
}

/**
 * Keeps ?trims= and the tray in step: a link that arrives with trims fills
 * the tray once, and from then on the URL follows the tray.
 */
function useTrimsInUrl() {
  const { trimIds, replace } = useCompareList();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAdoptedLink = useRef(false);

  useEffect(() => {
    if (!hasAdoptedLink.current) {
      hasAdoptedLink.current = true;
      const fromLink = parseTrimIds(searchParams.get("trims"));
      if (fromLink.length > 0 && serializeTrimIds(fromLink) !== serializeTrimIds(trimIds)) {
        replace(fromLink);
        return;
      }
    }
    const wanted = serializeTrimIds(trimIds);
    if ((searchParams.get("trims") ?? "") !== wanted) {
      setSearchParams(wanted ? { trims: wanted } : {}, { replace: true });
    }
  }, [trimIds, searchParams, setSearchParams, replace]);
}

function CompareTable({ columns }: { columns: TrimWithModel[] }) {
  const { remove, clear } = useCompareList();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const allRows = buildSpecRows(columns);
  const canFilter = columns.length > 1;
  const rows = onlyDifferences && canFilter ? allRows.filter(rowDiffers) : allRows;

  return (
    <div className="page compare-page">
      <div className="compare-toolbar">
        <h1>
          Compare <span className="muted compare-count">{columns.length} trims</span>
        </h1>
        <label className={`compare-toggle${canFilter ? "" : " is-disabled"}`}>
          <input
            type="checkbox"
            checked={onlyDifferences && canFilter}
            disabled={!canFilter}
            onChange={(event) => setOnlyDifferences(event.target.checked)}
          />
          Only show differences
        </label>
        <div className="compare-toolbar-actions">
          <Link to="/" className="button">
            + Add a trim
          </Link>
          <button type="button" className="button" onClick={clear}>
            Clear all
          </button>
        </div>
      </div>

      <div className="compare-scroller" tabIndex={0} aria-label="Comparison table, scrolls sideways">
        <table className="compare-table">
          <caption className="visually-hidden">Specs of the trims you picked, side by side</caption>
          <thead>
            <tr>
              <td className="compare-corner" />
              {columns.map(({ model, trim }) => {
                const label = `${model.year} ${model.make} ${model.name} ${trim.name}`;
                return (
                  <th key={trim.id} scope="col" className="compare-trim-header">
                    <button type="button" className="compare-remove" onClick={() => remove(trim.id)} aria-label={`Remove ${label}`}>
                      ×
                    </button>
                    <CarImage imageUrl={model.imageUrl} alt={`${model.year} ${model.make} ${model.name}`} />
                    <span className="compare-model-name">
                      <span className="muted">
                        {model.year} {model.make}
                      </span>{" "}
                      <Link to={`/cars/${model.id}`}>{model.name}</Link>
                    </span>
                    <span className="compare-trim-name">{trim.name}</span>
                    <span className="compare-price figures">{formatPrice(trim.msrp)}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const differs = canFilter && rowDiffers(row);
              return (
                <tr key={row.id} className={differs ? "is-different" : undefined}>
                  <th scope="row">{row.label}</th>
                  {columns.map(({ trim }, column) => (
                    <td key={trim.id}>
                      {row.id === "powertrain" ? (
                        <PowertrainLabel powertrain={trim.powertrain} />
                      ) : (
                        (row.values[column] ?? <span className="muted" aria-label="No data">—</span>)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <th scope="row">Specs</th>
                <td colSpan={columns.length} className="muted">
                  These trims match on every spec we have, apart from price.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="muted compare-note">MSRP is before the destination fee. Specs marked in orange differ between trims.</p>
    </div>
  );
}
