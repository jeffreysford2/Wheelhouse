// Shared guard for every source that would make a network call.
//
// Project rule: nothing calls a data API until Jeff has approved the
// estimated cost. The adapters below are deliberately unimplemented, and
// even once they are written they must call this first, so a stray
// `npm run pipeline` cannot spend money by accident.

export const COST_APPROVAL_ENV_VAR = "WHEELHOUSE_COST_APPROVED";

export class SourceNotReadyError extends Error {
  constructor(sourceName: string, reason: string) {
    super(`${sourceName}: ${reason}`);
    this.name = "SourceNotReadyError";
  }
}

export function assertCostApproved(sourceName: string): void {
  if (process.env[COST_APPROVAL_ENV_VAR] !== "yes") {
    throw new SourceNotReadyError(
      sourceName,
      `refusing to call the API. Set ${COST_APPROVAL_ENV_VAR}=yes only after the cost estimate has been approved.`,
    );
  }
}
