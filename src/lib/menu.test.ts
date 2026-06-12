import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES } from "@/data/menu";
import { flattenMenu, mergeMenuData } from "@/lib/menu";

describe("mergeMenuData", () => {
  it("applies seed item overrides and hides invisible items publicly", () => {
    const merged = mergeMenuData({
      seedCategories: MENU_CATEGORIES,
      itemOverrides: [
        {
          id: "chicken-dum-biryani-full",
          name: "Chicken Dum Biryani Full - Updated",
          description: "Updated description from admin.",
          priceCents: 2999,
          imageUrl: "https://example.com/biryani.jpg",
          tags: ["H"],
          categorySlug: "plates",
          visible: true,
          available: false,
          popular: true,
          weekendOnly: false,
          sortOrder: 1,
        },
        {
          id: "nawabi-plate-serve-two",
          name: "Hidden Nawabi",
          description: "Hidden from public menu.",
          priceCents: 5500,
          imageUrl: null,
          tags: ["H", "S"],
          categorySlug: "plates",
          visible: false,
          available: true,
          popular: true,
          weekendOnly: false,
          sortOrder: 2,
        },
      ],
      customItems: [],
      categoryOverrides: [],
      includeHidden: false,
    });

    const items = flattenMenu(merged);
    expect(items.find((item) => item.id === "chicken-dum-biryani-full")).toMatchObject({
      name: "Chicken Dum Biryani Full - Updated",
      price: 29.99,
      description: "Updated description from admin.",
      dietaryTags: ["H"],
      imageUrl: "https://example.com/biryani.jpg",
      available: false,
    });
    expect(items.find((item) => item.id === "nawabi-plate-serve-two")).toBeUndefined();
  });

  it("adds custom items and keeps hidden items available for admin", () => {
    const merged = mergeMenuData({
      seedCategories: MENU_CATEGORIES,
      itemOverrides: [],
      categoryOverrides: [{ slug: "specials", name: "Specials", visible: true, sortOrder: 0 }],
      customItems: [
        {
          id: "custom-family-dessert",
          categorySlug: "specials",
          name: "Family Dessert Box",
          description: "Admin-created dessert special.",
          priceCents: 1800,
          imageUrl: "https://example.com/dessert.jpg",
          tags: ["V"],
          visible: false,
          available: false,
          popular: false,
          weekendOnly: true,
          sortOrder: 0,
        },
      ],
      includeHidden: true,
    });

    const specials = merged.find((category) => category.slug === "specials");
    expect(specials).toMatchObject({ name: "Specials" });
    expect(specials?.items[0]).toMatchObject({
      id: "custom-family-dessert",
      price: 18,
      visible: false,
      available: false,
      source: "custom",
      weekendOnly: true,
    });
  });

  it("defaults seed items to available when no override exists", () => {
    const merged = mergeMenuData({
      seedCategories: MENU_CATEGORIES,
      itemOverrides: [],
      customItems: [],
      categoryOverrides: [],
      includeHidden: false,
    });

    expect(flattenMenu(merged).find((item) => item.id === "chicken-65")).toMatchObject({
      available: true,
    });
  });
});
