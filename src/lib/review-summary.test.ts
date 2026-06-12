import { describe, expect, it } from "vitest";

import { formatHeroReviewSummary } from "@/lib/review-summary";

describe("formatHeroReviewSummary", () => {
  it("formats Google rating and review count for the hero proof widget", () => {
    expect(formatHeroReviewSummary({ rating: 4.82, totalReviews: 642, source: "google" })).toEqual({
      ratingLabel: "4.8",
      countLabel: "642+",
      sourceLabel: "Google reviews",
      ariaLabel: "Rated 4.8 out of 5 from 642+ Google reviews",
    });
  });

  it("keeps large review counts readable", () => {
    expect(formatHeroReviewSummary({ rating: 4.2, totalReviews: 2000, source: "fallback" })).toMatchObject({
      ratingLabel: "4.2",
      countLabel: "2,000+",
      sourceLabel: "guest reviews",
    });
  });
});
