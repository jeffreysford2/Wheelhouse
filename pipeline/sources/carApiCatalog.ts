// Vehicle catalog and MSRP from CarAPI (carapi.app), the first candidate
// from the plan. Phase 0 must confirm it returns per-trim MSRP for 2025 and
// 2026 before this is filled in; if it doesn't, write a different
// CatalogSource and leave the rest of the pipeline alone.

import type { CatalogSource, CatalogTrimRecord, ModelYearRequest } from "./sourceRecords";
import { assertCostApproved, SourceNotReadyError } from "./notApproved";

export class CarApiCatalogSource implements CatalogSource {
  readonly name = "CarAPI catalog";

  async fetchTrims(_years: ModelYearRequest): Promise<CatalogTrimRecord[]> {
    assertCostApproved(this.name);
    // To implement after Phase 0: page through the trims endpoint for each
    // year, then convert each response row into a CatalogTrimRecord.
    throw new SourceNotReadyError(this.name, "not implemented yet (waiting on Phase 0 data validation).");
  }
}
