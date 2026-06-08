import type { Metadata } from "next";

import { ReservationForm } from "@/components/reserve/ReservationForm";
import { ReservationJsonLd } from "@/components/seo/ReservationJsonLd";

export const metadata: Metadata = {
  title: "Reserve a Table",
  description: "Book a table at Pista House Wentworthville for lunch, dinner, family gatherings and special occasions.",
  alternates: { canonical: "/reserve" },
};

export default function ReservePage() {
  return (
    <section className="bg-background py-12 md:py-18">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Reservations</p>
          <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Save Your Table</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal/72">
            Lunch and dinner slots are calculated from the restaurant hours in the owner config file.
          </p>
          <div className="mt-6 rounded border border-saffron-300 bg-white p-5 text-sm leading-6 text-charcoal/72">
            Lunch: 12:00 PM - 3:00 PM. Dinner: 5:30 PM - 9:30 PM. For groups larger than 14, call the restaurant.
          </div>
        </div>
        <ReservationForm />
      </div>
      <ReservationJsonLd />
    </section>
  );
}
