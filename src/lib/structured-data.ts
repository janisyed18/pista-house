import type { RestaurantConfig } from "@/config/restaurant";
import type { RestaurantFaq } from "@/data/faqs";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export function buildRestaurantJsonLd(config: RestaurantConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${config.website}/#restaurant`,
    name: `${config.name} ${config.suburb}`,
    alternateName: config.name,
    description: config.tagline,
    image: [`${config.website}${config.heroImage}`],
    url: config.website,
    telephone: config.phone,
    email: config.email,
    priceRange: config.priceRange,
    servesCuisine: ["Hyderabadi", "Indian", "Halal"],
    acceptsReservations: true,
    hasMenu: `${config.website}/menu`,
    hasMap: config.googleMapsLink,
    currenciesAccepted: "AUD",
    paymentAccepted: ["Cash", "Debit Card", "Credit Card", "Online payment"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop 1/69 Dunmore St",
      addressLocality: "Wentworthville",
      addressRegion: "NSW",
      postalCode: "2145",
      addressCountry: "AU",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Wentworthville",
      },
      {
        "@type": "AdministrativeArea",
        name: "Western Sydney",
      },
    ],
    potentialAction: [
      {
        "@type": "OrderAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${config.website}/order`,
          actionPlatform: [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
          ],
        },
      },
      {
        "@type": "ReserveAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${config.website}/reserve`,
          actionPlatform: [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
          ],
        },
      },
    ],
    sameAs: [config.social.facebook, config.social.instagram].filter(Boolean),
    openingHoursSpecification: Object.entries(config.hours).map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: titleCaseDay(day),
      opens: hours.open,
      closes: hours.close,
    })),
  };
}

export function buildFaqJsonLd(faqs: RestaurantFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serializeJsonLd(jsonLd: unknown) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

function titleCaseDay(day: string) {
  const matchedDay = dayNames.find((dayName) => dayName.toLowerCase() === day.toLowerCase());
  return matchedDay ?? day.charAt(0).toUpperCase() + day.slice(1);
}
