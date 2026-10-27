import { describe, expect, it } from "vitest";
import { parseCsv, parseCsvRows } from "../sources/csv";

describe("parseCsvRows", () => {
  it("keeps commas and doubled quotes inside quoted fields", () => {
    expect(parseCsvRows('a,"b, c","say ""hi"""\n')).toEqual([["a", "b, c", 'say "hi"']]);
  });

  it("handles Windows line endings, blank lines and a missing final newline", () => {
    expect(parseCsvRows("a,b\r\n\r\nc,d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("keeps empty fields so columns stay aligned", () => {
    expect(parseCsvRows("a,,c\n")).toEqual([["a", "", "c"]]);
  });
});

describe("parseCsv", () => {
  it("keys each row by the header", () => {
    expect(parseCsv("make,model\nToyota,RAV4\n")).toEqual([{ make: "Toyota", model: "RAV4" }]);
  });
});
