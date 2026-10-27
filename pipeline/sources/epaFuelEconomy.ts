// Fuel economy, electric range and charge time from EPA fueleconomy.gov.
// Free, but still behind the approval guard so the pipeline has exactly one
// rule about network calls instead of a list of exceptions.

import type { FuelEconomyRecord, FuelEconomySource, ModelYearRequest } from "./sourceRecords";
import { assertCostApproved, SourceNotReadyError } from "./notApproved";

export class EpaFuelEconomySource implements FuelEconomySource {
  readonly name = "EPA fueleconomy.gov";

  async fetchFuelEconomy(_years: ModelYearRequest): Promise<FuelEconomyRecord[]> {
    assertCostApproved(this.name);
    // To implement: EPA publishes a bulk vehicles file, which is one download
    // instead of thousands of per-vehicle calls. Filter it to the requested
    // years and convert rows into FuelEconomyRecords.
    throw new SourceNotReadyError(this.name, "not implemented yet.");
  }
}
