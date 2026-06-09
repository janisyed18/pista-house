import type { Metadata } from "next";
import { CheckCircle2, Clock, Phone, Truck, UtensilsCrossed } from "lucide-react";

import { CateringForm } from "@/components/catering/CateringForm";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

export const metadata: Metadata = {
  title: "Indian Catering Wentworthville",
  description: "Request Pista House Wentworthville catering for biryani, curries, starters, desserts, corporate events, weddings and family functions.",
  alternates: { canonical: "/catering" },
};

const cateringHighlights = [
  { icon: UtensilsCrossed, title: "Hyderabadi Menus", text: "Biryani trays, starters, curries, naans, desserts and vegetarian packages." },
  { icon: Truck, title: "Pickup or Delivery", text: "Tell us the suburb, timing and serving needs so we can quote accurately." },
  { icon: CheckCircle2, title: "Admin Follow-Up", text: "Every request lands in the restaurant catering dashboard for quote tracking." },
];

const steps = [
  "Share your event details",
  "Team reviews menu and timing",
  "Quote and deposit options sent",
  "Food prepared fresh for pickup or delivery",
];

export default function CateringPage() {
  return (
    <section className="bg-background py-12 md:py-18">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Catering</p>
            <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Indian Catering for Sydney Events</h1>
            <p className="mt-5 text-lg leading-8 text-charcoal/72">
              Request catering for weddings, family functions, corporate lunches, religious events and large pickup orders from Pista House Wentworthville.
            </p>
            <div className="mt-7 grid gap-3">
              {cateringHighlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded border border-black/8 bg-white p-4">
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-saffron-100 text-burgundy-800">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-black text-ink">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-charcoal/65">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded border border-burgundy-900/10 bg-burgundy-900 p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron-300">Need urgent catering?</p>
              <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-2 text-2xl font-black">
                <Phone aria-hidden className="h-5 w-5" />
                {RESTAURANT_CONFIG.phone}
              </a>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/72">
                <Clock aria-hidden className="h-4 w-4" />
                Same-week requests depend on kitchen capacity.
              </p>
            </div>
          </div>

          <CateringForm />
        </div>

        <div className="mt-12 rounded border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-ink">How Catering Requests Work</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step} className="rounded bg-smoke p-4">
                <span className="grid h-8 w-8 place-items-center rounded bg-burgundy-900 text-xs font-black text-white">{index + 1}</span>
                <p className="mt-3 text-sm font-black text-charcoal">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
