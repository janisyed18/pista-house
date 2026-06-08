import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function RestaurantJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: `${RESTAURANT_CONFIG.name} ${RESTAURANT_CONFIG.suburb}`,
    image: `${RESTAURANT_CONFIG.website}${RESTAURANT_CONFIG.heroImage}`,
    url: RESTAURANT_CONFIG.website,
    telephone: RESTAURANT_CONFIG.phone,
    email: RESTAURANT_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop 1/69 Dunmore St",
      addressLocality: "Wentworthville",
      addressRegion: "NSW",
      postalCode: "2145",
      addressCountry: "AU",
    },
    servesCuisine: ["Hyderabadi", "Indian", "Halal"],
    priceRange: RESTAURANT_CONFIG.priceRange,
    acceptsReservations: true,
    hasMenu: `${RESTAURANT_CONFIG.website}/menu`,
    sameAs: [RESTAURANT_CONFIG.social.facebook, RESTAURANT_CONFIG.social.instagram].filter(Boolean),
    openingHoursSpecification: Object.entries(RESTAURANT_CONFIG.hours).map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours.open,
      closes: hours.close,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
