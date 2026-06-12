import Image from "next/image";
import { Star } from "lucide-react";

import { SectionHeading } from "@/components/ui";
import { getReviews } from "@/lib/reviews";
import type { ReviewsResult } from "@/lib/reviews";

export async function ReviewsSection({ reviews: initialReviews }: { reviews?: ReviewsResult }) {
  const reviews = initialReviews ?? (await getReviews());

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading title="What Our Guests Say" eyebrow="Google reviews">
            Real guest feedback, refreshed hourly when Google Places credentials are configured.
          </SectionHeading>
          <div className="rounded border border-saffron-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-3xl font-black text-burgundy-900">
              <Star aria-hidden className="h-7 w-7 fill-saffron-300 text-saffron-300" />
              {reviews.rating.toFixed(1)}
            </div>
            <p className="mt-1 text-sm font-bold text-charcoal/68">{reviews.totalReviews.toLocaleString()}+ Google Reviews</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.reviews.map((review) => (
            <article key={`${review.authorName}-${review.relativeTimeDescription}`} className="rounded border border-black/8 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                {review.profilePhotoUrl ? (
                  <Image src={review.profilePhotoUrl} alt="" width={40} height={40} className="rounded-full" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-burgundy-900 text-sm font-black text-saffron-300">
                    {review.authorName.slice(0, 1)}
                  </span>
                )}
                <div>
                  <h3 className="font-black text-ink">{review.authorName}</h3>
                  <p className="text-xs text-charcoal/55">{review.relativeTimeDescription}</p>
                </div>
              </div>
              <div className="mb-3 flex text-saffron-500" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} aria-hidden className={index < review.rating ? "h-4 w-4 fill-current" : "h-4 w-4 text-black/15"} />
                ))}
              </div>
              <details>
                <summary className="cursor-pointer list-none text-sm leading-6 text-charcoal/76">
                  <span className="line-clamp-3">{review.text}</span>
                  <span className="mt-2 inline-block text-xs font-black uppercase tracking-[0.18em] text-burgundy-700">Read more</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-charcoal/76">{review.text}</p>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
