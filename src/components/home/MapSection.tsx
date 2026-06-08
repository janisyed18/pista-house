import { MapPin, Train } from "lucide-react";

import { SectionHeading } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function MapSection() {
  const mapSrc = process.env.GOOGLE_MAPS_EMBED_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(RESTAURANT_CONFIG.address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT_CONFIG.address)}&output=embed`;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container">
        <SectionHeading title="Find Us in Wentworthville" eyebrow="Location">
          Shop 1/69 Dunmore St, two minutes from the station and close to street parking.
        </SectionHeading>
        <div className="overflow-hidden rounded border border-black/8 bg-smoke shadow-sm">
          <iframe
            title="Pista House Wentworthville location map"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full border-0"
          />
          <div className="grid gap-4 p-5 md:grid-cols-3">
            <p className="flex gap-3 text-sm font-bold text-charcoal/76">
              <MapPin aria-hidden className="h-5 w-5 text-burgundy-700" />
              {RESTAURANT_CONFIG.address}
            </p>
            <p className="text-sm font-bold text-charcoal/76">Parking: street parking nearby on Dunmore St and surrounding streets.</p>
            <p className="flex gap-3 text-sm font-bold text-charcoal/76">
              <Train aria-hidden className="h-5 w-5 text-burgundy-700" />
              2 min walk from Wentworthville Station.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
