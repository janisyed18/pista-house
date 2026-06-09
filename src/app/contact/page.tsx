import type { Metadata } from "next";
import { Mail, MapPin, Phone, Train } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Pista House Wentworthville for reservations, catering, feedback and restaurant enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT_CONFIG.address)}&output=embed`;

  return (
    <section className="bg-background py-12 md:py-18">
      <div className="container">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Contact</p>
          <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Talk to Pista House</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal/72">Bookings, catering, group dining and feedback all come through this page.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            <a href={RESTAURANT_CONFIG.googleMapsLink} target="_blank" rel="noreferrer" className="rounded border border-black/8 bg-white p-5 font-bold text-charcoal/78">
              <MapPin aria-hidden className="mb-3 h-5 w-5 text-burgundy-700" />
              {RESTAURANT_CONFIG.address}
            </a>
            <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} className="rounded border border-black/8 bg-white p-5 font-bold text-charcoal/78">
              <Phone aria-hidden className="mb-3 h-5 w-5 text-burgundy-700" />
              {RESTAURANT_CONFIG.phone}
            </a>
            <a href={`mailto:${RESTAURANT_CONFIG.email}`} className="rounded border border-black/8 bg-white p-5 font-bold text-charcoal/78">
              <Mail aria-hidden className="mb-3 h-5 w-5 text-burgundy-700" />
              {RESTAURANT_CONFIG.email}
            </a>
            <div className="rounded border border-black/8 bg-white p-5 font-bold text-charcoal/78">
              <Train aria-hidden className="mb-3 h-5 w-5 text-burgundy-700" />
              Parking nearby. 2 min walk from Wentworthville Station.
            </div>
            <a href="/catering" className="rounded bg-saffron-300 p-5 text-center text-sm font-black text-burgundy-900">
              Catering enquiry
            </a>
          </div>
          <ContactForm />
        </div>
        <div className="mt-10 overflow-hidden rounded border border-black/8 bg-white shadow-sm">
          <iframe title="Pista House map" src={mapSrc} loading="lazy" className="h-[380px] w-full border-0" />
        </div>
      </div>
    </section>
  );
}
