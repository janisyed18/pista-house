"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { StatusTracker } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function ClickCollectSection() {
  return (
    <section className="spice-texture py-16 text-white md:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-300">Click & Collect</p>
          <h2 className="font-display text-5xl font-bold leading-none md:text-7xl">Order Ahead. Skip the Queue.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
            Scan at the table or order from home, pay online via Stripe, track the order, then collect fresh from the counter.
          </p>
          <div className="mt-8 grid gap-3 text-sm font-bold text-white/80">
            {["Scan QR or click link", "Select items & pay via Stripe", "Track your order status live", "Pick up when ready"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded bg-saffron-300 text-xs font-black text-burgundy-900">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <StatusTracker activeIndex={1} />
          </div>
        </div>
        <div className="rounded border border-white/15 bg-white p-6 text-ink shadow-lift">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="rounded border border-black/8 bg-white p-4">
              <QRCodeSVG value={RESTAURANT_CONFIG.qrCodeValue} size={190} includeMargin aria-label="QR code to order online" />
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-burgundy-700">
                <QrCode aria-hidden className="h-4 w-4" />
                Restaurant QR
              </div>
              <h3 className="text-2xl font-black">Scan to start your pickup order</h3>
              <p className="mt-3 text-sm leading-6 text-charcoal/68">
                The same link powers counter QR scans and the online click-and-collect checkout.
              </p>
              <Link href="/order" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white transition hover:bg-burgundy-700">
                <CreditCard aria-hidden className="h-4 w-4" />
                Pay Online
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
