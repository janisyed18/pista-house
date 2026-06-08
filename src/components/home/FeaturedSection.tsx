import { MenuItemCard, SectionHeading } from "@/components/ui";
import { FEATURED_ITEM_IDS } from "@/data/menu";
import type { MergedMenuItem } from "@/lib/menu";

export function FeaturedSection({ menuItems }: { menuItems: MergedMenuItem[] }) {
  const featured = FEATURED_ITEM_IDS.map((id) => menuItems.find((item) => item.id === id)).filter(Boolean);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <SectionHeading title="Our Signatures" eyebrow="Best sellers">
          Dum biryani, Indo-Hyderabadi starters and weekend specials that regulars come back for.
        </SectionHeading>
        <div className="flex snap-x gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {featured.map((item) => (
            <div key={item!.id} className="min-w-[82vw] snap-start sm:min-w-[420px] lg:min-w-0">
              <MenuItemCard item={item!} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
