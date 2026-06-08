"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MapPin, Menu, Phone, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { PistaHouseLogo } from "@/components/brand/PistaHouseLogo";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/reserve", label: "Reserve" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-burgundy-900/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center" aria-label="Pista House home">
          <PistaHouseLogo priority tone="dark" imageClassName="transition duration-200 group-hover:scale-[1.03]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded px-3 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white",
                pathname === link.href && "bg-white/12 text-saffron-100",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded border border-saffron-300/50 px-4 text-sm font-bold text-saffron-100 transition hover:bg-saffron-300 hover:text-burgundy-900"
          >
            <Phone aria-hidden className="h-4 w-4" />
            Call
          </a>
          <Link
            href="/order"
            className="inline-flex h-11 items-center gap-2 rounded bg-saffron-300 px-4 text-sm font-black text-burgundy-900 transition hover:bg-white"
          >
            <ShoppingBag aria-hidden className="h-4 w-4" />
            Collect & Pay
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-grid h-11 w-11 place-items-center rounded border border-white/20 lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-burgundy-900 lg:hidden">
          <nav className="container grid gap-1 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded px-3 py-3 text-base font-semibold",
                  pathname === link.href ? "bg-white/12 text-saffron-100" : "text-white/86",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link href="/reserve" className="inline-flex items-center justify-center gap-2 rounded bg-white/10 px-3 py-3 font-bold">
                <CalendarDays aria-hidden className="h-4 w-4" />
                Reserve
              </Link>
              <a
                href={RESTAURANT_CONFIG.googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded bg-white/10 px-3 py-3 font-bold"
              >
                <MapPin aria-hidden className="h-4 w-4" />
                Map
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
