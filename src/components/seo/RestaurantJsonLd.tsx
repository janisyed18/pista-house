import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { buildRestaurantJsonLd, serializeJsonLd } from "@/lib/structured-data";

export function RestaurantJsonLd() {
  const jsonLd = buildRestaurantJsonLd(RESTAURANT_CONFIG);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
