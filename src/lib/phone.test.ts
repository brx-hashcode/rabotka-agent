import { describe, expect, it } from "vitest";

import { toInternational } from "./phone";

describe("toInternational", () => {
  it("keeps a number typed with its country code", () => {
    expect(toInternational("+242 06 123 45 67", "CD")).toBe("+242061234567");
    expect(toInternational("00242-06-123-45-67", null)).toBe("+242061234567");
  });

  it("gives a local Congo number its code, keeping the leading 0", () => {
    expect(toInternational("06 123 45 67", "CG")).toBe("+242061234567");
    expect(toInternational("061234567", null)).toBe("+242061234567");
  });

  it("drops the trunk 0 elsewhere", () => {
    expect(toInternational("0812 345 678", "CD")).toBe("+243812345678");
  });

  it("falls back to Congo for a country it does not know", () => {
    expect(toInternational("061234567", "ZZ")).toBe("+242061234567");
  });
});
