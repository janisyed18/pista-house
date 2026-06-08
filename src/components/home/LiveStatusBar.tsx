"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { getRestaurantStatus } from "@/lib/hours";

export function LiveStatusBar() {
  const [status, setStatus] = useState(() => getRestaurantStatus(RESTAURANT_CONFIG.hours));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatus(getRestaurantStatus(RESTAURANT_CONFIG.hours));
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="sticky top-20 z-30 border-y border-saffron-300/30 bg-ink text-white shadow-lg">
      <div className="container flex snap-x gap-4 overflow-x-auto py-3 text-sm font-bold md:items-center md:justify-between md:overflow-visible">
        <div className="flex shrink-0 items-center gap-2">
          <span className={status.isOpen ? "text-emerald-400" : "text-red-400"} aria-hidden>
            {status.isOpen ? "●" : "●"}
          </span>
          <span>{status.isOpen ? "OPEN" : "CLOSED"}</span>
          <span className="text-white/45">/</span>
          <span className="text-saffron-100">{status.countdownLabel}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-white/72">
          <Clock aria-hidden className="h-4 w-4 text-saffron-300" />
          {status.todayLabel}
        </div>
        <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} className="flex shrink-0 items-center gap-2 text-white/72 hover:text-saffron-300">
          <Phone aria-hidden className="h-4 w-4 text-saffron-300" />
          {RESTAURANT_CONFIG.phone}
        </a>
        <a href={RESTAURANT_CONFIG.googleMapsLink} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2 text-white/72 hover:text-saffron-300">
          <MapPin aria-hidden className="h-4 w-4 text-saffron-300" />
          69 Dunmore St
        </a>
      </div>
    </section>
  );
}
