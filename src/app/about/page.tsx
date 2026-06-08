import type { Metadata } from "next";
import Image from "next/image";
import { Award, BadgeCheck, HeartHandshake, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "The Pista House story from Hyderabad biryani craft to Western Sydney family dining.",
  alternates: { canonical: "/about" },
};

const values = [
  ["Authentic", "Hyderabadi recipes, dum cooking and spice layering."],
  ["Fresh", "Produce and naans prepared for service, not display."],
  ["Family", "A table built for celebrations, groups and weeknight dinners."],
  ["Community", "Halal food served with pride in Western Sydney."],
] as const;

const gallery = [
  "/images/hero-biryani.png",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
];

export default function AboutPage() {
  return (
    <section className="bg-background">
      <div className="container py-12 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">About Pista House</p>
            <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Hyderabad Soul, Western Sydney Table</h1>
            <p className="mt-6 text-lg leading-8 text-charcoal/72">
              Pista House brings the warmth of Hyderabad to Wentworthville: dum biryani sealed with saffron, family curries made for sharing, and halal hospitality shaped around the local community.
            </p>
            <p className="mt-4 text-lg leading-8 text-charcoal/72">
              Since 2018, the kitchen has focused on the details that make Hyderabadi food memorable: long-grain rice, patient spice work, fresh naans and a dining room that welcomes families, students, workers and weekend celebrations.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded border border-black/8 bg-smoke shadow-lift">
            <Image src="/images/hero-biryani.png" alt="Pista House biryani handi" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-4">
          {values.map(([title, copy]) => (
            <article key={title} className="rounded border border-black/8 bg-white p-5 shadow-sm">
              <Sparkles aria-hidden className="mb-4 h-5 w-5 text-saffron-700" />
              <h2 className="text-xl font-black text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal/66">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded border border-black/8 bg-white p-6 shadow-sm lg:grid-cols-3">
          <div>
            <BadgeCheck aria-hidden className="mb-4 h-8 w-8 text-leaf" />
            <h2 className="text-2xl font-black">Halal Certified</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/68">100% halal meat sourcing and preparation standards for Sydney&apos;s Muslim community.</p>
          </div>
          <div>
            <Award aria-hidden className="mb-4 h-8 w-8 text-saffron-700" />
            <h2 className="text-2xl font-black">Press & Awards</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/68">A polished section for local media, hospitality awards and community mentions.</p>
          </div>
          <div>
            <HeartHandshake aria-hidden className="mb-4 h-8 w-8 text-burgundy-700" />
            <h2 className="text-2xl font-black">Chef Spotlight</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/68">Owner-editable space for chef portraits, kitchen notes and seasonal specials.</p>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Gallery</p>
            <h2 className="font-display text-5xl font-bold text-ink">Kitchen, Table, Community</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 12 }, (_, index) => gallery[index % gallery.length]).map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-square overflow-hidden rounded border border-black/8 bg-smoke"
                aria-label={`Open gallery image ${index + 1}`}
              >
                <Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
