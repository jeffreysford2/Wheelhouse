// A first version of the model page: header and a plain trim table.
// Phase 3 adds the summary, charging section and "Add to compare".
//
// A column only appears when at least one trim has a figure for it, the same
// rule the filters follow, so a model with no towing data has no column of
// dashes.

import { Link, useParams } from "react-router-dom";
import type { Trim } from "../../../shared/carTypes";
import { CarImage } from "../components/CarImage";
import { formatEfficiency, formatNumber, formatPrice, POWERTRAIN_LABELS } from "../data/format";
import { startingPrice } from "../data/filters";
import { loadModel, ModelNotFoundError } from "../data/loadData";
import { useAsync } from "../data/useAsync";
import "./ModelDetailPage.css";

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
  const anyTrimHas = (field: keyof Trim) => model.trims.some((trim) => trim[field] !== undefined);
  const show = {
    destination: anyTrimHas("destinationFee"),
    seats: anyTrimHas("seats"),
    efficiency: anyTrimHas("mpgCombined"),
    range: anyTrimHas("electricRangeMiles"),
    towing: anyTrimHas("towingLbs"),
    source: anyTrimHas("priceSourceUrl"),
  };

  return (
    <article className="page model-detail">
      <Link to="/" className="muted">
        ← All cars
      </Link>
      <header className="model-detail-header">
        <CarImage imageUrl={model.imageUrl} alt={fullName} />
        <div>
          <p className="muted">
            {model.year} {model.make}
          </p>
          <h1>{model.name}</h1>
          <p className="model-detail-price">
            From <span className="figures">{formatPrice(startingPrice(model))}</span>
          </p>
          {model.safetyRating !== undefined && <p>NHTSA overall safety rating: {model.safetyRating} of 5 stars</p>}
        </div>
      </header>

      <h2>Trims</h2>
      <div className="trim-table-wrapper">
        <table className="trim-table">
          <caption className="visually-hidden">Trims of the {fullName}</caption>
          <thead>
            <tr>
              <th scope="col">Trim</th>
              <th scope="col">MSRP</th>
              {show.destination && <th scope="col">Destination fee</th>}
              <th scope="col">Powertrain</th>
              <th scope="col">Drivetrain</th>
              {show.seats && <th scope="col">Seats</th>}
              {show.efficiency && <th scope="col">Fuel economy</th>}
              {show.range && <th scope="col">Electric range</th>}
              {show.towing && <th scope="col">Towing</th>}
              {show.source && <th scope="col">Price source</th>}
            </tr>
          </thead>
          <tbody>
            {trimsByPrice.map((trim) => (
              <tr key={trim.id}>
                <th scope="row">{trim.name}</th>
                <td className="figures">{formatPrice(trim.msrp)}</td>
                {show.destination && (
                  <td className="figures">{trim.destinationFee !== undefined ? formatPrice(trim.destinationFee) : "—"}</td>
                )}
                <td>{POWERTRAIN_LABELS[trim.powertrain]}</td>
                <td>{trim.drivetrain}</td>
                {show.seats && <td>{trim.seats ?? "—"}</td>}
                {show.efficiency && <td>{formatEfficiency(trim.mpgCombined, trim.powertrain) ?? "—"}</td>}
                {show.range && <td>{trim.electricRangeMiles !== undefined ? `${trim.electricRangeMiles} mi` : "—"}</td>}
                {show.towing && <td>{trim.towingLbs !== undefined ? `${formatNumber(trim.towingLbs)} lbs` : "—"}</td>}
                {show.source && (
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
