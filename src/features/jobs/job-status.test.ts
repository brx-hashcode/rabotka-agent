import { describe, expect, it } from "vitest";

import { applicationStatus } from "./application-status";
import { jobStatus } from "./job-status";

describe("jobStatus", () => {
  it("names a filled job", () => {
    expect(jobStatus("FILLED").label).toBe("Pourvue");
  });

  it("shows an unknown status as it comes", () => {
    expect(jobStatus("NEW").label).toBe("NEW");
  });
});

describe("applicationStatus", () => {
  it("does not call an automatic rejection a refusal", () => {
    expect(applicationStatus("REJECTED", "AUTO_FILL").label).toBe("Poste pourvu");
  });

  it("keeps the employer's own refusal", () => {
    expect(applicationStatus("REJECTED", "EMPLOYER").label).toBe("Refusée");
  });
});
