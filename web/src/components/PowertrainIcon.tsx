// Small inline icons that mark the cleaner powertrains at a glance: a leaf
// for hybrids, a plug for plug-in hybrids, and a lightning bolt for electric
// cars. Gas cars get no icon so the marked ones stand out.

import type { Powertrain } from "../../../shared/carTypes";
import { POWERTRAIN_LABELS } from "../data/format";
import "./PowertrainIcon.css";

// 24x24 stroke paths in the same style (rounded, 2px), drawn with currentColor
// so each icon takes its color from CSS.
const ICON_PATHS: Partial<Record<Powertrain, string[]>> = {
  hybrid: ["M5 19c0-8 5-14 15-14 0 10-6 15-14 15", "M5 19c3-4 6-7 10-9"],
  "plug-in hybrid": ["M9 3v5", "M15 3v5", "M6 8h12v3a6 6 0 0 1-12 0z", "M12 17v4"],
  electric: ["M13 2 4 14h7l-1 8 9-12h-7z"],
};

type IconProps = { powertrain: Powertrain };

/** The icon alone. Decorative: the label next to it carries the meaning. */
export function PowertrainIcon({ powertrain }: IconProps) {
  const paths = ICON_PATHS[powertrain];
  if (!paths) return null;
  return (
    <svg
      className={`powertrain-icon powertrain-icon--${powertrain.replace(/ /g, "-")}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Icon plus the powertrain's name, for anywhere a powertrain is shown as text. */
export function PowertrainLabel({ powertrain }: IconProps) {
  return (
    <span className="powertrain-label">
      <PowertrainIcon powertrain={powertrain} />
      {POWERTRAIN_LABELS[powertrain]}
    </span>
  );
}
