// A first version of the model page: header and a plain trim table.
// Phase 3 adds the summary, charging section and "Add to compare".

import { Link, useParams } from "react-router-dom";
import { CarImage } from "../components/CarImage";
import { PowertrainLabel } from "../components/PowertrainIcon";
import { formatEfficiency, formatNumber, formatPrice } from "../data/format";
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

  return (
    <article className="page model-detail">
      <Link to="/" className="muted">
        ← All cars
      </Link>
      <header className="model-detail-header">
        <CarImage imageUrl={model.imageUrl} alt={fullName} bodyStyle={model.bodyStyle} />
        <div>
          <p className="muted">
            {model.year} {model.make}
          </p>
          <h1>{model.name}</h1>
          <p className="model-detail-price">
            From <span className="figures">{formatPrice(startingPrice(model))}</span>
          </p>
          {model.safetyRating !== undefined && (
            <p className="model-detail-safety">
              <span className="model-detail-stars" aria-hidden="true">
                {"★".repeat(model.safetyRating)}
                <span className="model-detail-stars-empty">{"★".repeat(5 - model.safetyRating)}</span>
              </span>
              {model.safetyRating}-star overall safety rating from NHTSA
            </p>
          )}
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
              <th scope="col">Powertrain</th>
              <th scope="col">Drivetrain</th>
              <th scope="col">Seats</th>
              <th scope="col">Fuel economy</th>
              <th scope="col">Electric range</th>
              <th scope="col">Towing</th>
            </tr>
          </thead>
          <tbody>
            {trimsByPrice.map((trim) => (
              <tr key={trim.id}>
                <th scope="row">{trim.name}</th>
                <td className="figures">{formatPrice(trim.msrp)}</td>
                <td>
                  <PowertrainLabel powertrain={trim.powertrain} />
                </td>
                <td>{trim.drivetrain}</td>
                <td>{trim.seats}</td>
                <td>{formatEfficiency(trim.mpgCombined, trim.powertrain) ?? "—"}</td>
                <td>{trim.electricRangeMiles !== undefined ? `${trim.electricRangeMiles} mi` : "—"}</td>
                <td>{trim.towingLbs !== undefined ? `${formatNumber(trim.towingLbs)} lbs` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
