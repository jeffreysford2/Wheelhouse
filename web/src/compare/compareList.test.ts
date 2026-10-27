import { describe, expect, it } from "vitest";
import { addTrim, compareUrl, MAX_COMPARE_TRIMS, parseTrimIds, removeTrim } from "./compareList";

describe("compare list", () => {
  it("adds trims in the order they were picked", () => {
    expect(addTrim(addTrim([], "a"), "b")).toEqual(["a", "b"]);
  });

  it("never lists a trim twice", () => {
    expect(addTrim(["a"], "a")).toEqual(["a"]);
  });

  it("stops at six trims", () => {
    const full = ["a", "b", "c", "d", "e", "f"];
    expect(full).toHaveLength(MAX_COMPARE_TRIMS);
    expect(addTrim(full, "g")).toEqual(full);
  });

  it("removes a trim", () => {
    expect(removeTrim(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("reads a shared link, dropping blanks, repeats and anything past six", () => {
    expect(parseTrimIds("a,,b, a ,c,d,e,f,g")).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(parseTrimIds(null)).toEqual([]);
    expect(parseTrimIds("")).toEqual([]);
  });

  it("builds the compare page link", () => {
    expect(compareUrl([])).toBe("/compare");
    expect(compareUrl(["a", "b"])).toBe("/compare?trims=a,b");
  });
});
