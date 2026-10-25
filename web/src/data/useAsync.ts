import { useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error };

/**
 * Runs a loader and tracks loading, ready and error states. Ignores a
 * response that arrives after the inputs changed, so quickly clicking
 * between model pages never shows the wrong car.
 */
export function useAsync<T>(load: () => Promise<T>, dependencies: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;
    setState({ status: "loading" });
    load().then(
      (data) => isCurrent && setState({ status: "ready", data }),
      (error: unknown) =>
        isCurrent && setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
