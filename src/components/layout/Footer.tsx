import Link from "next/link";
import { ArrowUp, Camera, Mail, MapPin, Phone, Share2 } from "lucide-react";

import { PistaHouseLogo } from "@/components/brand/PistaHouseLogo";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { formatTime } from "@/lib/hours";

const footerLinks = [
  ["Menu", "/menu"],
  ["Order Online", "/order"],
  ["Reserve", "/reserve"],
  ["Catering", "/catering"],
  ["Allergen Matrix", "/allergens"],
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Privacy Policy", "/privacy"],
  ["Accessibility", "/accessibility"],
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <PistaHouseLogo className="mb-4" showSuburb={false} tone="dark" imageClassName="h-11 w-40" />
          <p className="max-w-sm text-sm leading-6 text-white/70">{RESTAURANT_CONFIG.tagline}</p>
          <div className="mt-6 flex gap-3">
            <a
              href={RESTAURANT_CONFIG.social.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Pista House on Facebook"
              className="grid h-10 w-10 place-items-center rounded border border-white/15 text-white/80 transition hover:border-saffron-300 hover:text-saffron-300"
            >
              <Share2 aria-hidden className="h-4 w-4" />
            </a>
            <a
              href={RESTAURANT_CONFIG.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Pista House on Instagram"
              className="grid h-10 w-10 place-items-center rounded border border-white/15 text-white/80 transition hover:border-saffron-300 hover:text-saffron-300"
            >
              <Camera aria-hidden className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-saffron-300">Visit</h2>
          <address className="not-italic text-sm leading-6 text-white/72">
            <a href={RESTAURANT_CONFIG.googleMapsLink} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-saffron-300">
              <MapPin aria-hidden className="mt-1 h-4 w-4 shrink-0" />
              {RESTAURANT_CONFIG.address}
            </a>
          </address>
          <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} className="mt-4 flex gap-2 text-sm text-white/72 hover:text-saffron-300">
            <Phone aria-hidden className="h-4 w-4" />
            {RESTAURANT_CONFIG.phone}
          </a>
          <a href={`mailto:${RESTAURANT_CONFIG.email}`} className="mt-3 flex gap-2 text-sm text-white/72 hover:text-saffron-300">
            <Mail aria-hidden className="h-4 w-4" />
            {RESTAURANT_CONFIG.email}
          </a>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-saffron-300">Hours</h2>
          <dl className="grid gap-2 text-sm text-white/72">
            {Object.entries(RESTAURANT_CONFIG.hours).map(([day, hours]) => (
              <div key={day} className="flex justify-between gap-4">
                <dt className="capitalize">{day}</dt>
                <dd>
                  {formatTime(hours.open)} - {formatTime(hours.close)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-saffron-300">Links</h2>
          <nav className="grid gap-2 text-sm" aria-label="Footer navigation">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="text-white/72 transition hover:text-saffron-300">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>ABN available on request. Copyright {new Date().getFullYear()} Pista House Wentworthville.</p>
          <a href="#main-content" className="inline-flex items-center gap-2 text-saffron-300">
            Back to top <ArrowUp aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
