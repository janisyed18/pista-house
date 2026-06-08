"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList, MapPin, Phone, ShoppingBag, Utensils } from "lucide-react";

import { ButtonLink } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection({ hasHeroVideo }: { hasHeroVideo: boolean }) {
  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        {hasHeroVideo ? (
          <video
            className="h-full w-full object-cover"
            src={RESTAURANT_CONFIG.heroVideo}
            poster={RESTAURANT_CONFIG.heroImage}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
        ) : (
          <Image
            src={RESTAURANT_CONFIG.heroImage}
            alt="Hyderabadi dum biryani being unveiled"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-burgundy-900/42 to-black/20" />
      </div>

      <div className="container relative flex min-h-[calc(100svh-5rem)] items-end pb-16 pt-20 md:pb-20">
        <motion.div
          className="max-w-4xl"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 inline-flex rounded border border-saffron-300/60 bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-saffron-100 backdrop-blur"
          >
            Hyderabadi Cuisine · Halal Certified · Wentworthville NSW
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-display text-7xl font-bold leading-[0.88] text-white md:text-9xl">
            Pista House
          </motion.h1>
          <motion.h2 variants={fadeUp} className="mt-5 max-w-2xl text-3xl font-black leading-tight text-saffron-100 md:text-5xl">
            Sydney&apos;s Finest Dum Biryani
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
            Authentic Hyderabadi dum biryani, family curries, halal favourites and click-and-collect dining in the heart of Wentworthville.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <ButtonLink href={RESTAURANT_CONFIG.orderingLink} icon={ShoppingBag} external>
              Order Online
            </ButtonLink>
            <ButtonLink href="/reserve" icon={CalendarDays} variant="outline">
              Reserve
            </ButtonLink>
            <ButtonLink href="/menu" icon={Utensils} variant="outline">
              View Menu
            </ButtonLink>
            <ButtonLink href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} icon={Phone} variant="outline">
              Call Now
            </ButtonLink>
            <ButtonLink href="/order" icon={ClipboardList} variant="outline">
              Collect & Pay
            </ButtonLink>
          </motion.div>
          <motion.a
            variants={fadeUp}
            href={RESTAURANT_CONFIG.googleMapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/76 transition hover:text-saffron-300"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            {RESTAURANT_CONFIG.address}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
