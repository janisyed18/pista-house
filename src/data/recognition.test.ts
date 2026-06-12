import { describe, expect, it } from "vitest";

import { RECOGNITION_ITEMS } from "@/data/recognition";

describe("RECOGNITION_ITEMS", () => {
  it("uses verified external sources for every recognition card", () => {
    expect(RECOGNITION_ITEMS.length).toBeGreaterThanOrEqual(3);

    for (const item of RECOGNITION_ITEMS) {
      expect(item.href).toMatch(/^https:\/\//);
      expect(item.label).not.toMatch(/award|winner|hat/i);
    }
  });

  it("does not claim press coverage or awards without source-backed wording", () => {
    const combinedCopy = RECOGNITION_ITEMS.map((item) => `${item.label} ${item.title} ${item.description}`).join(" ");

    expect(combinedCopy).not.toMatch(/as featured in/i);
    expect(combinedCopy).not.toMatch(/award[- ]winning/i);
  });
});
