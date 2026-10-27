// The model page: header with the starting price, then every trim with its
// specs and an "Add to compare" button.
//
// A column only appears when at least one trim has a figure for it, the same
// rule the filters follow, so a model with no towing data has no column of
// dashes.

import { Link, useParams } from "react-router-dom";
import { CarImage } from "../components/CarImage";
import { PowertrainLabel } from "../components/PowertrainIcon";
import { CompareButton } from "../compare/CompareButton";
import { MAX_COMPARE_TRIMS } from "../compare/compareList";
import { BODY_STYLE_LABELS, formatPrice } from "../data/format";
import { startingPrice } from "../data/filters";
import { loadModel, ModelNotFoundError } from "../data/loadData";
import { buildSpecRows, TRIM_SPECS } from "../data/trimSpecs";
import { useAsync } from "../data/useAsync";
import "./ModelDetailPage.css";

// Body style and safety rating are the same for every trim, so the header shows them once.
const TRIM_TABLE_SPECS = TRIM_SPECS.filter((spec) => !spec.isModelWide);

export function ModelDetailPage() {
  const { modelId = "" } = useParams();
  const file = useAsync(() => loadModel(modelId), [modelId]);

  if (file.status === "loading") return <p className="page muted">Loading…</p>;
  if (file.status === "error") {
    const isMissing = file.error instanceof ModelNotFoundError;
    return (
      <div className="page" role="alert">
        <h1>{isMissing ? "We couldn't find that car" : "We couldn't load this car"}</h1>
        {!isMissing && <p className="muted">Check your connection and reload the page.</p>}
        <p>
          <Link to="/">Back to all cars</Link>
        </p>
      </div>
    );
  }

  const { model } = file.data;
  const fullName = `${model.year} ${model.make} ${model.name}`;
  const trimsByPrice = [...model.trims].sort((a, b) => a.msrp - b.msrp);

  // One row per trim and one column per spec. buildSpecRows gives one row
  // per spec, and drops specs no trim has, so columns come from its labels.
  const specColumns = buildSpecRows(
    trimsByPrice.map((trim) => ({ trim, model })),
    TRIM_TABLE_SPECS,
  );
  const showSource = model.trims.some((trim) => trim.priceSourceUrl !== undefined);

  return (
    <article className="page model-detail">
      <Link to="/" className="muted">
        ← All cars
      </Link>
      <header className="model-detail-header">
        <CarImage imageUrl={model.imageUrl} alt={fullName} />
        <div className="model-detail-summary">
          <p className="muted">
            {model.year} {model.make}
          </p>
          <h1>{model.name}</h1>
          <p className="model-detail-price">
            From <span className="figures">{formatPrice(startingPrice(model))}</span>
          </p>
          <ul className="model-detail-facts">
            <li>{BODY_STYLE_LABELS[model.bodyStyle]}</li>
            <li>
              {model.trims.length} {model.trims.length === 1 ? "trim" : "trims"}
            </li>
            {model.safetyRating !== undefined && <li>NHTSA overall safety rating: {model.safetyRating} of 5 stars</li>}
          </ul>
        </div>
      </header>

      <div className="trim-section-heading">
        <h2>Trims</h2>
        <p className="muted">Add up to {MAX_COMPARE_TRIMS} trims, from any cars, to compare them side by side.</p>
      </div>
      <div className="trim-table-wrapper">
        <table className="trim-table">
          <caption className="visually-hidden">Trims of the {fullName}</caption>
          <thead>
            <tr>
              <th scope="col">Trim</th>
              <th scope="col">MSRP</th>
              {specColumns.map((column) => (
                <th key={column.id} scope="col">
                  {column.label}
                </th>
              ))}
              {showSource && <th scope="col">Price source</th>}
            </tr>
          </thead>
          <tbody>
            {trimsByPrice.map((trim, row) => (
              <tr key={trim.id}>
                <th scope="row" className="trim-table-name">
                  <div className="trim-table-name-inner">
                    <span>{trim.name}</span>
                    <CompareButton trimId={trim.id} trimLabel={`${model.name} ${trim.name}`} />
                  </div>
                </th>
                <td className="figures">{formatPrice(trim.msrp)}</td>
                {specColumns.map((column) => (
                  <td key={column.id}>
                    {column.id === "powertrain" ? <PowertrainLabel powertrain={trim.powertrain} /> : (column.values[row] ?? "—")}
                  </td>
                ))}
                {showSource && (
                  <td>
                    {trim.priceSourceUrl ? (
                      <a href={trim.priceSourceUrl} target="_blank" rel="noreferrer">
                        {sourceLabel(trim.priceSourceUrl)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted trim-table-note">MSRP is before the destination fee.</p>
    </article>
  );
}

/** Show the site's name ("kbb.com") rather than a long URL in the table. */
function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}
