import type { ReviewsResult } from "@/lib/reviews";

type HeroReviewInput = Pick<ReviewsResult, "rating" | "totalReviews" | "source">;

export function formatHeroReviewSummary(reviewSummary: HeroReviewInput) {
  const ratingLabel = reviewSummary.rating.toFixed(1);
  const countLabel = `${reviewSummary.totalReviews.toLocaleString()}+`;
  const sourceLabel = reviewSummary.source === "google" ? "Google reviews" : "guest reviews";

  return {
    ratingLabel,
    countLabel,
    sourceLabel,
    ariaLabel: `Rated ${ratingLabel} out of 5 from ${countLabel} ${sourceLabel}`,
  };
}
