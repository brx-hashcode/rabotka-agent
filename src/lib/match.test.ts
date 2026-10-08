import { describe, expect, it } from "vitest";

import { matchBand } from "./match";

describe("matchBand", () => {
  it("shows nothing without fit evidence", () => {
    expect(matchBand(null)).toBeNull();
    expect(matchBand(undefined)).toBeNull();
  });

  it("labels the bands, boundaries in the higher one", () => {
    expect(matchBand(0.75)).toEqual({ label: "Très compatible", percent: 75, tone: "high" });
    expect(matchBand(0.5)?.label).toBe("Compatible");
    expect(matchBand(0.26)).toEqual({ label: "Peu compatible", percent: 26, tone: "low" });
  });
});
