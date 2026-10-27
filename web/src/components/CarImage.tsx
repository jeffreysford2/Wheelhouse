// The model photo, or a drawn silhouette while the image approach is still
// undecided (see the plan's open questions on image rights).

import { PLACEHOLDER_IMAGE_URL, type BodyStyle } from "../../../shared/carTypes";
import "./CarImage.css";

type Props = { imageUrl: string; alt: string; bodyStyle?: BodyStyle };

export function CarImage({ imageUrl, alt, bodyStyle }: Props) {
  if (imageUrl === PLACEHOLDER_IMAGE_URL || imageUrl === "") {
    return (
      <div className="car-image car-image-placeholder" role="img" aria-label={`${alt} (photo coming soon)`}>
        <CarSilhouette shape={silhouetteFor(bodyStyle)} />
      </div>
    );
  }
  return <img className="car-image" src={imageUrl} alt={alt} loading="lazy" />;
}

// Three outlines are enough to tell a pickup from an SUV from a car at a
// glance; a sedan outline on every card made a truck look like a Camry.
type Shape = "car" | "tall" | "pickup";

function silhouetteFor(bodyStyle: BodyStyle | undefined): Shape {
  if (bodyStyle === "suv" || bodyStyle === "minivan") return "tall";
  if (bodyStyle === "truck") return "pickup";
  return "car";
}

// Each outline is a 200x80 body path plus the x position of its two wheels.
const SHAPES: Record<Shape, { body: string; wheels: [number, number] }> = {
  car: {
    body: "M14 58c0-8 4-13 13-15l26-6 22-16c4-3 9-5 15-5h36c7 0 12 2 17 7l15 15 18 4c6 1 10 6 10 12v4c0 3-2 5-5 5H19c-3 0-5-2-5-5z",
    wheels: [52, 150],
  },
  tall: {
    body: "M14 58c0-7 3-11 10-13l20-5 17-21c3-4 7-6 12-6h74c6 0 10 2 13 6l13 19 14 3c6 1 9 5 9 11v7c0 3-2 5-5 5H19c-3 0-5-2-5-5z",
    wheels: [52, 152],
  },
  pickup: {
    body: "M10 58c0-6 3-10 9-11l24-4 15-22c2-3 6-5 10-5h34c4 0 6 2 6 6v24h77c3 0 5 2 5 5v12c0 3-2 5-5 5H15c-3 0-5-2-5-5z",
    wheels: [48, 156],
  },
};

/** Drawn with currentColor so it suits both themes without a second asset. */
function CarSilhouette({ shape }: { shape: Shape }) {
  const { body, wheels } = SHAPES[shape];
  return (
    <svg viewBox="0 0 200 80" aria-hidden="true">
      <path d={body} fill="currentColor" opacity="0.18" />
      {wheels.map((cx) => (
        <circle key={cx} cx={cx} cy="62" r="11" fill="currentColor" opacity="0.45" />
      ))}
    </svg>
  );
}
