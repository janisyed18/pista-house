import { describe, expect, it } from "vitest";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { RESTAURANT_FAQS } from "@/data/faqs";
import { buildFaqJsonLd, buildRestaurantJsonLd, serializeJsonLd } from "@/lib/structured-data";

describe("structured data builders", () => {
  it("builds Restaurant LocalBusiness data with address, hours and ordering links", () => {
    const jsonLd = buildRestaurantJsonLd(RESTAURANT_CONFIG);

    expect(jsonLd["@type"]).toBe("Restaurant");
    expect(jsonLd["@id"]).toBe("https://pistahouse.com.au/#restaurant");
    expect(jsonLd.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Wentworthville",
      addressRegion: "NSW",
      addressCountry: "AU",
    });
    expect(jsonLd.openingHoursSpecification).toHaveLength(7);
    expect(jsonLd.openingHoursSpecification[0]).toMatchObject({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Monday",
      opens: "12:00",
      closes: "22:00",
    });
    expect(jsonLd.hasMenu).toBe("https://pistahouse.com.au/menu");
    expect(jsonLd.hasMap).toBe(RESTAURANT_CONFIG.googleMapsLink);
    expect(jsonLd.acceptsReservations).toBe(true);
    expect(jsonLd.currenciesAccepted).toBe("AUD");
  });

  it("builds FAQPage data from visible restaurant FAQs", () => {
    const jsonLd = buildFaqJsonLd(RESTAURANT_FAQS);

    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(RESTAURANT_FAQS.length);
    expect(jsonLd.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: RESTAURANT_FAQS[0].question,
      acceptedAnswer: {
        "@type": "Answer",
        text: RESTAURANT_FAQS[0].answer,
      },
    });
  });

  it("serializes JSON-LD safely for inline script tags", () => {
    expect(serializeJsonLd({ text: "<script>alert(1)</script>" })).toBe('{"text":"\\u003cscript>alert(1)\\u003c/script>"}');
  });
});
