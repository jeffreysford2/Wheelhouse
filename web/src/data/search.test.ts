import { describe, expect, it } from "vitest";
import { searchModels } from "./search";
import { allTestModels } from "./testFixtures";

describe("searchModels", () => {
  it("matches brand and model words in any order", () => {
    expect(searchModels(allTestModels, "model tesla").map((model) => model.id)).toEqual(["tesla-model-y-2026"]);
    expect(searchModels(allTestModels, "cr-v")).toHaveLength(1);
  });

  it("returns nothing for an empty query", () => {
    expect(searchModels(allTestModels, "   ")).toEqual([]);
  });
});
