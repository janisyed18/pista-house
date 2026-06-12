import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { SectionHeading } from "@/components/ui";
import { RESTAURANT_FAQS } from "@/data/faqs";

export function FaqSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading title="Questions Before You Visit" eyebrow="Restaurant FAQ">
              Fast answers about halal dining, click and collect, bookings, catering, location and allergies.
            </SectionHeading>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded bg-burgundy-900 px-4 py-3 text-sm font-black text-white transition hover:bg-burgundy-700">
              <HelpCircle aria-hidden className="h-4 w-4" />
              Ask another question
            </Link>
          </div>

          <div className="grid gap-3">
            {RESTAURANT_FAQS.map((faq, index) => (
              <details key={faq.question} className="group rounded border border-black/8 bg-white p-5 shadow-sm" open={index === 0}>
                <summary className="cursor-pointer list-none text-lg font-black leading-tight text-ink">
                  <span className="flex items-start justify-between gap-4">
                    {faq.question}
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded bg-saffron-100 text-sm text-burgundy-900 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-6 text-charcoal/68">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
