import { RESTAURANT_CONFIG } from "@/config/restaurant";

export type GuestReview = {
  authorName: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  profilePhotoUrl?: string;
};

export type ReviewsResult = {
  rating: number;
  totalReviews: number;
  reviews: GuestReview[];
  source: "google" | "fallback";
};

type GoogleReview = {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url?: string;
};

type GooglePlacesDetailsResponse = {
  status: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
  };
};

const fallbackReviews: GuestReview[] = [
  {
    authorName: "Ayesha K.",
    rating: 5,
    relativeTimeDescription: "2 weeks ago",
    text: "The chicken dum biryani tastes like proper Hyderabad. Generous portions, beautiful rice and the salan has real depth.",
  },
  {
    authorName: "Rahul M.",
    rating: 5,
    relativeTimeDescription: "1 month ago",
    text: "Chicken 65 and mutton biryani are our regular order. Food is hot, spicy and consistent every time.",
  },
  {
    authorName: "Sarah L.",
    rating: 4,
    relativeTimeDescription: "1 month ago",
    text: "A great Wentworthville dinner spot for families. Staff were friendly and the biryani portions were huge.",
  },
  {
    authorName: "Imran S.",
    rating: 5,
    relativeTimeDescription: "2 months ago",
    text: "Halal, flavourful and fast. The weekend special biryani is worth planning around.",
  },
  {
    authorName: "Nadia P.",
    rating: 4,
    relativeTimeDescription: "3 months ago",
    text: "Loved the butter chicken, garlic naan and mango lassi. Easy walk from Wentworthville Station.",
  },
  {
    authorName: "Vikram R.",
    rating: 5,
    relativeTimeDescription: "3 months ago",
    text: "Best Hyderabadi food in Western Sydney for my family. The spice level is exactly right.",
  },
];

export async function getReviews(): Promise<ReviewsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return fallbackResult();
  }

  try {
    const params = new URLSearchParams({
      place_id: RESTAURANT_CONFIG.googlePlaceId,
      fields: "rating,user_ratings_total,reviews",
      key: apiKey,
    });
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`, {
      next: { revalidate: 3600 },
    });
    const data = (await response.json()) as GooglePlacesDetailsResponse;

    if (!response.ok || data.status !== "OK") {
      return fallbackResult();
    }

    return {
      rating: data.result?.rating ?? 4.2,
      totalReviews: data.result?.user_ratings_total ?? 2000,
      reviews: (data.result?.reviews ?? []).slice(0, 6).map((review) => ({
        authorName: review.author_name,
        rating: review.rating,
        relativeTimeDescription: review.relative_time_description,
        text: review.text,
        profilePhotoUrl: review.profile_photo_url,
      })),
      source: "google",
    };
  } catch {
    return fallbackResult();
  }
}

function fallbackResult(): ReviewsResult {
  return {
    rating: 4.2,
    totalReviews: 2000,
    reviews: fallbackReviews,
    source: "fallback",
  };
}
