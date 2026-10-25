// The model photo, or a drawn silhouette while the image approach is still
// undecided (see the plan's open questions on image rights).

import { PLACEHOLDER_IMAGE_URL } from "../../../shared/carTypes";
import "./CarImage.css";

type Props = { imageUrl: string; alt: string };

export function CarImage({ imageUrl, alt }: Props) {
  if (imageUrl === PLACEHOLDER_IMAGE_URL || imageUrl === "") {
    return (
      <div className="car-image car-image-placeholder" role="img" aria-label={`${alt} (photo coming soon)`}>
        <CarSilhouette />
      </div>
    );
  }
  return <img className="car-image" src={imageUrl} alt={alt} loading="lazy" />;
}

/** Drawn with currentColor so it suits both themes without a second asset. */
function CarSilhouette() {
  return (
    <svg viewBox="0 0 200 80" aria-hidden="true">
      <path
        d="M14 58c0-8 4-13 13-15l26-6 22-16c4-3 9-5 15-5h36c7 0 12 2 17 7l15 15 18 4c6 1 10 6 10 12v4c0 3-2 5-5 5H19c-3 0-5-2-5-5z"
        fill="currentColor"
        opacity="0.18"
      />
      <circle cx="52" cy="62" r="11" fill="currentColor" opacity="0.45" />
      <circle cx="150" cy="62" r="11" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
