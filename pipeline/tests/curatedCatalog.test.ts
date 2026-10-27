import { describe, expect, it } from "vitest";
import { mergeSources } from "../match";
import { bodyStyleFromLabel, CuratedCatalogSource, curatedTrimRecords } from "../sources/curatedCatalog";
import { validateModels } from "../validate";

const MODELS_CSV = "rank,make,model,body_type\n1,Toyota,RAV4,Compact SUV\n2,Ford,F-150,Pickup\n";
const TRIMS_HEADER =
  "year,make,model,trim,drive,powertrain,msrp_usd,destination_usd,seats,ev_range_mi,source_url,checked_on,notes\n";

describe("curatedTrimRecords", () => {
  it("converts spreadsheet labels and leaves unknown figures out", () => {
    const [record] = curatedTrimRecords(
      MODELS_CSV,
      `${TRIMS_HEADER}2026,Ford,F-150,XL,RWD,Diesel,37290,,,,https://example.com/f150,2026-10-26,"cheapest cab, short bed"\n`,
    );
    expect(record).toMatchObject({
      year: 2026,
      make: "Ford",
      model: "F-150",
      bodyStyle: "truck",
      powertrain: "gas",
      drivetrain: "RWD",
      msrp: 37_290,
      priceSourceUrl: "https://example.com/f150",
    });
    expect(record?.seats).toBeUndefined();
    expect(record?.destinationFee).toBeUndefined();
  });

  it("stops on a powertrain it doesn't recognize instead of guessing", () => {
    const trims = `${TRIMS_HEADER}2026,Toyota,RAV4,LE,FWD,Steam,31900,1450,5,,https://example.com,2026-10-26,\n`;
    expect(() => curatedTrimRecords(MODELS_CSV, trims)).toThrow(/unknown powertrain "Steam"/);
  });

  it("stops on a trim whose model isn't in the models file", () => {
    const trims = `${TRIMS_HEADER}2026,Honda,CR-V,LX,FWD,Gas,30920,1395,5,,https://example.com,2026-10-26,\n`;
    expect(() => curatedTrimRecords(MODELS_CSV, trims)).toThrow(/missing from models-2026.csv/);
  });

  it("stops on a row with no source link", () => {
    const trims = `${TRIMS_HEADER}2026,Toyota,RAV4,LE,FWD,Gas,31900,1450,5,,,2026-10-26,\n`;
    expect(() => curatedTrimRecords(MODELS_CSV, trims)).toThrow(/missing source_url/);
  });
});

describe("bodyStyleFromLabel", () => {
  it("maps the models file's labels to site body styles", () => {
    expect(bodyStyleFromLabel("Compact SUV (EV)")).toBe("suv");
    expect(bodyStyleFromLabel("Midsize car")).toBe("sedan");
    expect(bodyStyleFromLabel("Minivan")).toBe("minivan");
    expect(bodyStyleFromLabel("Pickup")).toBe("truck");
  });
});

// Guards the committed data itself: an edit to the CSVs that would make the
// pipeline refuse to publish fails here first, in review.
describe("the committed curated files", () => {
  it("merge into models that pass validation", async () => {
    const records = await new CuratedCatalogSource().fetchTrims([2026]);
    const models = mergeSources(records, [], []);
    expect(models.length).toBeGreaterThanOrEqual(40);
    expect(validateModels(models)).toEqual({ ok: true });
    expect(records.every((record) => record.priceSourceUrl?.startsWith("https://"))).toBe(true);
  });
});
