// The shape of Wheelhouse car data, shared by the pipeline (which writes it)
// and the website (which reads it). Keeping one copy here means a field added
// in the pipeline is a type error in the site until the site handles it.

export type ModelYear = 2025 | 2026;

/**
 * The imageUrl used until the image approach is decided (see the plan's
 * open questions). The site draws a silhouette instead of loading it.
 */
export const PLACEHOLDER_IMAGE_URL = "/images/placeholder-car.svg";

export type BodyStyle =
  | "sedan"
  | "suv"
  | "truck"
  | "minivan"
  | "hatchback"
  | "coupe"
  | "wagon"
  | "convertible";

export type Powertrain = "gas" | "hybrid" | "plug-in hybrid" | "electric";

export type Drivetrain = "FWD" | "RWD" | "AWD" | "4WD";

/** A model, such as the 2026 Toyota Camry. Holds all of its trims. */
export type Model = {
  id: string; // "toyota-camry-2026"
  make: string; // "Toyota"
  name: string; // "Camry"
  year: ModelYear;
  bodyStyle: BodyStyle;
  imageUrl: string;
  safetyRating?: number; // 1 to 5, from NHTSA when available
  trims: Trim[];
};

/** One trim of a model, such as the Camry XSE. */
export type Trim = {
  id: string; // "toyota-camry-2026-xse"
  name: string; // "XSE"
  msrp: number; // US dollars, before destination
  destinationFee?: number; // US dollars, when the source states it
  /** Link to where the price came from, so visitors can check it. */
  priceSourceUrl?: string;
  powertrain: Powertrain;
  drivetrain: Drivetrain;
  seats?: number;
  mpgCombined?: number; // MPG, or MPGe for electric trims
  electricRangeMiles?: number;
  fastChargeKw?: number;
  chargeTimeHours?: number;
  towingLbs?: number;
  cargoCuFt?: number;
};

// ---------------------------------------------------------------------------
// The published files.
//
// index.json is loaded on every first visit, so it carries only what the
// results grid needs to filter, sort and draw a card. Charging details are
// left out because no filter uses them, and so are the destination fee and
// price source link; they arrive with the model file.
// ---------------------------------------------------------------------------

export type IndexTrim = Omit<Trim, "fastChargeKw" | "chargeTimeHours" | "destinationFee" | "priceSourceUrl">;

export type IndexModel = Omit<Model, "trims"> & { trims: IndexTrim[] };

/** Contents of public/data/index.json. */
export type IndexFile = {
  /** ISO date of the pipeline run, shown as "Prices updated on ...". */
  updatedAt: string;
  /** Changes with every run, so browsers can tell a cached file is stale. */
  version: string;
  models: IndexModel[];
};

/** Contents of public/data/models/{id}.json. */
export type ModelFile = {
  updatedAt: string;
  version: string;
  model: Model;
};
