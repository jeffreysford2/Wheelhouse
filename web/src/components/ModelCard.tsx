import { Link } from "react-router-dom";
import type { ModelMatch } from "../data/filters";
import { BODY_STYLE_LABELS, formatEfficiency, formatPrice } from "../data/format";
import { CarImage } from "./CarImage";
import { PowertrainLabel } from "./PowertrainIcon";
import "./ModelCard.css";

type Props = { match: ModelMatch };

export function ModelCard({ match }: Props) {
  const { model, featuredTrim, featuredIsBaseTrim, matchingTrims } = match;
  const fullName = `${model.year} ${model.make} ${model.name}`;

  // Describe the trims the visitor can actually buy under their filters.
  const powertrains = [...new Set(matchingTrims.map((trim) => trim.powertrain))];
  const seatCounts = matchingTrims.map((trim) => trim.seats);
  const minSeats = Math.min(...seatCounts);
  const maxSeats = Math.max(...seatCounts);
  const efficiency = formatEfficiency(featuredTrim.mpgCombined, featuredTrim.powertrain);

  return (
    <Link to={`/cars/${model.id}`} className="model-card">
      <CarImage imageUrl={model.imageUrl} alt={fullName} />
      <div className="model-card-body">
        <p className="model-card-make">
          {model.year} {model.make}
        </p>
        <h2 className="model-card-name">{model.name}</h2>

        <p className="model-card-price">
          {featuredIsBaseTrim ? (
            <>
              From <span className="figures">{formatPrice(featuredTrim.msrp)}</span>
            </>
          ) : (
            <>
              Available on the {featuredTrim.name} trim, <span className="figures">{formatPrice(featuredTrim.msrp)}</span>
            </>
          )}
        </p>

        <ul className="model-card-specs">
          <li>{BODY_STYLE_LABELS[model.bodyStyle]}</li>
          <li>
            {powertrains.map((powertrain, index) => (
              <span key={powertrain}>
                {index > 0 && " or "}
                <PowertrainLabel powertrain={powertrain} />
              </span>
            ))}
          </li>
          <li>{minSeats === maxSeats ? `${minSeats} seats` : `${minSeats} to ${maxSeats} seats`}</li>
          {efficiency && <li>{efficiency}</li>}
          {featuredTrim.electricRangeMiles !== undefined && <li>{featuredTrim.electricRangeMiles} mi electric</li>}
        </ul>
      </div>
    </Link>
  );
}
