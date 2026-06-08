"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DietaryBadge, MenuItemCard } from "@/components/ui";
import type { DietaryTag } from "@/data/menu";
import type { MergedMenuCategory } from "@/lib/menu";
import { cn } from "@/lib/utils";

const filters: Array<{ label: string; tag: DietaryTag }> = [
  { label: "Halal", tag: "H" },
  { label: "Vegetarian", tag: "V" },
  { label: "Gluten-Free", tag: "GF" },
  { label: "Spicy", tag: "S" },
];

export function MenuExplorer({ menuCategories }: { menuCategories: MergedMenuCategory[] }) {
  const initialCategory = menuCategories.some((item) => item.slug === "plates") ? "plates" : (menuCategories[0]?.slug ?? "all");
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<DietaryTag[]>([]);

  const filtered = useMemo(() => {
    const base = category === "all" ? menuCategories : menuCategories.filter((item) => item.slug === category);
    return base.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase());
        const matchesTags = activeTags.length === 0 || activeTags.every((tag) => item.dietaryTags.includes(tag));
        return matchesQuery && matchesTags;
      }),
    }));
  }, [activeTags, category, menuCategories, query]);

  function toggleTag(tag: DietaryTag) {
    setActiveTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-28 grid gap-2" aria-label="Menu categories">
          {[{ slug: "all", name: "All dishes" }, ...menuCategories].map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setCategory(item.slug)}
              className={cn(
                "rounded border px-4 py-3 text-left text-sm font-black transition",
                category === item.slug ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/8 bg-white text-charcoal hover:border-saffron-300",
              )}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-20 z-20 -mx-4 mb-6 min-w-0 border-y border-black/8 bg-background/95 px-4 py-4 backdrop-blur lg:static lg:mx-0 lg:rounded lg:border">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-3 lg:hidden">
            {[{ slug: "all", name: "All" }, ...menuCategories].map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={cn("shrink-0 rounded px-4 py-2 text-sm font-black", category === item.slug ? "bg-burgundy-900 text-white" : "bg-white text-charcoal")}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search menu</span>
              <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search biryani, curry, naan..."
                className="h-12 w-full rounded border border-black/10 bg-white pl-10 pr-4 text-sm font-semibold"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.tag}
                  type="button"
                  onClick={() => toggleTag(filter.tag)}
                  className={cn(
                    "rounded border px-3 py-2 text-xs font-black",
                    activeTags.includes(filter.tag) ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/10 bg-white text-charcoal",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-10">
          {filtered.map((group) =>
            group.items.length ? (
              <section key={group.slug} id={group.slug} className="scroll-mt-32">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-ink">{group.name}</h2>
                    {group.slug === "plates" ? (
                      <p className="mt-2 text-sm font-bold text-burgundy-700">Signature plates · Dum pukht biryanis</p>
                    ) : null}
                  </div>
                  <div className="hidden gap-1 md:flex">
                    {(["V", "H", "S", "GF"] as DietaryTag[]).map((tag) => (
                      <DietaryBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
