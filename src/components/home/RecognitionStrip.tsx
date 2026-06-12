import { ArrowUpRight, BadgeCheck, Newspaper, ShieldCheck } from "lucide-react";

import { RECOGNITION_ITEMS } from "@/data/recognition";

const icons = [Newspaper, BadgeCheck, ShieldCheck];

export function RecognitionStrip() {
  return (
    <section className="border-y border-black/8 bg-white py-8" aria-labelledby="recognition-heading">
      <div className="container">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-saffron-700">Recognition</p>
            <h2 id="recognition-heading" className="mt-2 font-display text-3xl font-bold leading-none text-ink md:text-4xl">
              Listed Across Local Dining Guides
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {RECOGNITION_ITEMS.map((item, index) => {
              const Icon = icons[index] ?? BadgeCheck;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-36 flex-col justify-between rounded border border-black/8 bg-background p-4 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-lift"
                >
                  <span className="mb-5 flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded bg-burgundy-900 text-saffron-300">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 text-charcoal/35 transition group-hover:text-burgundy-700" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/48">{item.label}</span>
                    <span className="mt-1 block text-lg font-black leading-tight text-ink">{item.title}</span>
                    <span className="mt-2 block text-sm leading-5 text-charcoal/65">{item.description}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
