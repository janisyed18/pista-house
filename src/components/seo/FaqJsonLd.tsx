import type { RestaurantFaq } from "@/data/faqs";
import { buildFaqJsonLd, serializeJsonLd } from "@/lib/structured-data";

export function FaqJsonLd({ faqs }: { faqs: RestaurantFaq[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faqs)) }} />;
}
