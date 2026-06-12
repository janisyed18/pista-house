import { describe, expect, it } from "vitest";

import { HALAL_ASSURANCE } from "@/data/halal-assurance";

describe("HALAL_ASSURANCE", () => {
  it("backs halal claims with public evidence links", () => {
    expect(HALAL_ASSURANCE.evidence.length).toBeGreaterThanOrEqual(2);

    for (const item of HALAL_ASSURANCE.evidence) {
      expect(item.href).toMatch(/^https:\/\//);
      expect(item.source).toBeTruthy();
    }
  });

  it("does not claim formal certification without a certificate URL", () => {
    const combinedCopy = [
      HALAL_ASSURANCE.badgeLabel,
      HALAL_ASSURANCE.heading,
      HALAL_ASSURANCE.summary,
      HALAL_ASSURANCE.certificateStatus,
      ...HALAL_ASSURANCE.assurances.map((item) => `${item.title} ${item.description}`),
    ].join(" ");

    expect(HALAL_ASSURANCE.certificateUrl).toBeNull();
    expect(combinedCopy).not.toMatch(/certified halal|halal certified|certificate on file/i);
  });
});
