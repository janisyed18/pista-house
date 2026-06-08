"use client";

import { useMemo, useState } from "react";

import { MenuItemCard, SectionHeading } from "@/components/ui";
import type { MergedMenuCategory } from "@/lib/menu";
import { cn } from "@/lib/utils";

const allTab = { slug: "all", name: "All" };

export function MenuPreview({ menuCategories }: { menuCategories: MergedMenuCategory[] }) {
  const tabs = [allTab, ...menuCategories];
  const [active, setActive] = useState("all");
  const items = useMemo(() => {
    if (active === "all") {
      return menuCategories.flatMap((category) => category.items).slice(0, 12);
    }
    return menuCategories.find((category) => category.slug === active)?.items ?? [];
  }, [active, menuCategories]);

  return (
    <section className="bg-white py-16 md:py-24" id="menu-preview">
      <div className="container">
        <SectionHeading title="Full Menu Preview" eyebrow="Explore">
          Filter through plates, starters, curries, naans, desserts and drinks before ordering.
        </SectionHeading>
        <div className="sticky top-[8.75rem] z-20 -mx-4 mb-8 flex gap-2 overflow-x-auto border-y border-black/8 bg-white/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border md:px-3">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActive(tab.slug)}
              className={cn(
                "shrink-0 rounded px-4 py-2 text-sm font-black transition",
                active === tab.slug ? "bg-burgundy-900 text-white" : "bg-smoke text-charcoal hover:bg-saffron-100",
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
