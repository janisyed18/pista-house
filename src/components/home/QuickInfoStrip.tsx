import { Clock, MapPin, Phone, ShoppingBag } from "lucide-react";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { formatTime } from "@/lib/hours";

const tiles = [
  {
    label: "Phone",
    value: RESTAURANT_CONFIG.phone,
    href: `tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`,
    icon: Phone,
  },
  {
    label: "Address",
    value: "Shop 1/69 Dunmore St",
    href: RESTAURANT_CONFIG.googleMapsLink,
    icon: MapPin,
  },
  {
    label: "Hours",
    value: `${formatTime(RESTAURANT_CONFIG.hours.monday.open)} daily`,
    href: "/contact",
    icon: Clock,
  },
  {
    label: "Order Online",
    value: "Delivery & pickup",
    href: RESTAURANT_CONFIG.orderingLink,
    icon: ShoppingBag,
  },
];

export function QuickInfoStrip() {
  return (
    <section className="border-b border-black/8 bg-white">
      <div className="container flex snap-x gap-4 overflow-x-auto py-6 md:grid md:grid-cols-4 md:overflow-visible">
        {tiles.map((tile) => (
          <a
            key={tile.label}
            href={tile.href}
            target={tile.href.startsWith("http") ? "_blank" : undefined}
            rel={tile.href.startsWith("http") ? "noreferrer" : undefined}
            className="flex min-w-[220px] snap-start items-center gap-4 rounded border border-black/8 bg-smoke/60 p-4 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:bg-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded bg-burgundy-900 text-saffron-300">
              <tile.icon aria-hidden className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.2em] text-burgundy-700">{tile.label}</span>
              <span className="mt-1 block text-sm font-bold text-ink">{tile.value}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
