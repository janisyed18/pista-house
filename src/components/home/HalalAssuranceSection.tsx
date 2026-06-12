import { ArrowUpRight, BadgeCheck, MessageCircleQuestion, ShieldCheck, Utensils } from "lucide-react";

import { ButtonLink } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { HALAL_ASSURANCE } from "@/data/halal-assurance";

const assuranceIcons = [Utensils, ShieldCheck, MessageCircleQuestion];

export function HalalAssuranceSection() {
  return (
    <section className="bg-ink py-16 text-white md:py-20" aria-labelledby="halal-assurance-heading">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-saffron-300">Halal assurance</p>
            <h2 id="halal-assurance-heading" className="mt-3 font-display text-4xl font-bold leading-none text-white md:text-6xl">
              {HALAL_ASSURANCE.heading}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">{HALAL_ASSURANCE.summary}</p>

            <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded border border-leaf/45 bg-leaf/18 px-4 py-3 text-sm font-black text-white">
              <span className="grid h-9 w-9 place-items-center rounded bg-leaf text-white">
                <BadgeCheck aria-hidden className="h-5 w-5" />
              </span>
              <span>{HALAL_ASSURANCE.badgeLabel}</span>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">{HALAL_ASSURANCE.certificateStatus}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              {HALAL_ASSURANCE.evidence.map((item) => (
                <ButtonLink key={item.href} href={item.href} icon={ArrowUpRight} variant="outline" external>
                  {item.label}
                </ButtonLink>
              ))}
              <ButtonLink href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} variant="primary">
                Ask the team
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {HALAL_ASSURANCE.assurances.map((item, index) => {
              const Icon = assuranceIcons[index] ?? ShieldCheck;

              return (
                <article key={item.title} className="rounded border border-white/12 bg-white/[0.07] p-5 backdrop-blur">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded bg-saffron-300 text-burgundy-900">
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black leading-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
