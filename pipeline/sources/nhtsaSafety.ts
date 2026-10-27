// Government 5-star overall safety ratings from the NHTSA public API.
// Free, but behind the same approval guard as every other source.

import type { ModelYearRequest, SafetyRecord, SafetySource } from "./sourceRecords";
import { assertCostApproved, SourceNotReadyError } from "./notApproved";

export class NhtsaSafetySource implements SafetySource {
  readonly name = "NHTSA safety ratings";

  async fetchSafetyRatings(_years: ModelYearRequest): Promise<SafetyRecord[]> {
    assertCostApproved(this.name);
    // To implement: NHTSA's ratings API is keyed by year, make and model, so
    // call it once per catalog model rather than crawling every make.
    throw new SourceNotReadyError(this.name, "not implemented yet.");
  }
}
