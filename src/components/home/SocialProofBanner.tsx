import Link from "next/link";
import { Camera } from "lucide-react";

import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function SocialProofBanner() {
  const posts = Array.from({ length: 6 }, (_, index) => index + 1);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Social proof</p>
            <h2 className="font-display text-4xl font-bold leading-none text-ink md:text-6xl">From Our Kitchen Feed</h2>
          </div>
          <a
            href={RESTAURANT_CONFIG.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white transition hover:bg-burgundy-700"
          >
            <Camera aria-hidden className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {posts.map((post) => (
            <Link
              key={post}
              href={RESTAURANT_CONFIG.social.instagram}
              target="_blank"
              className="aspect-square rounded border border-black/8 bg-[url('/images/hero-biryani.png')] bg-cover bg-center shadow-sm"
              aria-label={`Instagram post ${post}`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-charcoal/60">
          Connect Instagram Basic Display or an Elfsight widget to replace this curated feed with live posts.
        </p>
      </div>
    </section>
  );
}
