import { describe, expect, it } from "vitest";
import type { Model, Trim } from "../../../shared/carTypes";
import { buildSpecRows, rowDiffers, TRIM_SPECS } from "./trimSpecs";

const gasTrim: Trim = { id: "g", name: "LX", msrp: 30_000, powertrain: "gas", drivetrain: "FWD", seats: 5, mpgCombined: 30, towingLbs: 1500 };
const awdTrim: Trim = { ...gasTrim, id: "a", name: "EX", drivetrain: "AWD", towingLbs: 3500 };
const electricTrim: Trim = {
  id: "e",
  name: "Long Range",
  msrp: 48_000,
  powertrain: "electric",
  drivetrain: "AWD",
  seats: 5,
  mpgCombined: 117,
  electricRangeMiles: 310,
  fastChargeKw: 250,
};
const suv: Model = { id: "m", make: "Test", name: "SUV", year: 2026, bodyStyle: "suv", imageUrl: "", trims: [] };

const labels = (rows: { label: string }[]) => rows.map((row) => row.label);

describe("spec rows", () => {
  it("leaves out specs that no trim has a figure for", () => {
    const rows = buildSpecRows([
      { trim: gasTrim, model: suv },
      { trim: awdTrim, model: suv },
    ]);
    expect(labels(rows)).toEqual(["Body style", "Powertrain", "Drivetrain", "Seats", "Fuel economy", "Towing"]);
  });

  it("keeps a spec when only one trim has it, showing the others as missing", () => {
    const rows = buildSpecRows([
      { trim: gasTrim, model: suv },
      { trim: electricTrim, model: suv },
    ]);
    const range = rows.find((row) => row.label === "Electric range");
    expect(range?.values).toEqual([undefined, "310 mi"]);
  });

  it("formats figures with units and thousands separators", () => {
    const [towing] = buildSpecRows([{ trim: awdTrim, model: suv }], TRIM_SPECS.filter((spec) => spec.label === "Towing"));
    expect(towing?.values).toEqual(["3,500 lbs"]);
  });

  it("marks rows where the trims differ", () => {
    const rows = buildSpecRows([
      { trim: gasTrim, model: suv },
      { trim: awdTrim, model: suv },
    ]);
    const differing = rows.filter(rowDiffers).map((row) => row.label);
    expect(differing).toEqual(["Drivetrain", "Towing"]);
  });

  it("counts a missing figure as different from a real one", () => {
    expect(rowDiffers({ id: "range", label: "Range", values: [undefined, "310 mi"] })).toBe(true);
  });
});
