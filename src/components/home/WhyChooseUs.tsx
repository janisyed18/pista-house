import { SectionHeading } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";

export function WhyChooseUs() {
  return (
    <section className="spice-texture py-16 text-white md:py-24">
      <div className="container">
        <SectionHeading title="Why Western Sydney Loves Pista House" align="center" tone="dark">
          <span>A family-friendly table, halal confidence and the spice craft of Hyderabad.</span>
        </SectionHeading>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {RESTAURANT_CONFIG.whyChooseUs.map((item) => (
            <article key={item.title} className="rounded border border-white/12 bg-white/8 p-4 text-center backdrop-blur">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded bg-saffron-300 text-2xl">
                <span aria-hidden>{item.icon}</span>
              </div>
              <h3 className="text-sm font-black text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/66">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
