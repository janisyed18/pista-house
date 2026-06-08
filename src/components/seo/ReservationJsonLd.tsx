import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function ReservationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ReserveAction",
    target: `${RESTAURANT_CONFIG.website}/reserve`,
    result: {
      "@type": "FoodEstablishmentReservation",
      name: "Pista House table reservation",
      reservationFor: {
        "@type": "Restaurant",
        name: `${RESTAURANT_CONFIG.name} ${RESTAURANT_CONFIG.suburb}`,
        address: RESTAURANT_CONFIG.address,
      },
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
