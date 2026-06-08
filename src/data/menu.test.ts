import { describe, expect, it } from "vitest";

import { FEATURED_ITEM_IDS, MENU_CATEGORIES } from "@/data/menu";

describe("MENU_CATEGORIES", () => {
  it("matches the current public Pista House Wentworthville menu structure", () => {
    expect(MENU_CATEGORIES.map((category) => category.slug)).toEqual([
      "starters",
      "curries",
      "desserts",
      "naans",
      "drinks",
      "extras",
      "takeaway",
      "plates",
    ]);

    const items = MENU_CATEGORIES.flatMap((category) => category.items);
    expect(items.find((item) => item.name === "Chicken Dum Biryani Full")).toMatchObject({
      price: 25,
      popular: true,
      dietaryTags: ["H", "S"],
    });
    expect(items.find((item) => item.name === "Nawabi Plate Serve Two")).toMatchObject({
      price: 55,
      popular: true,
    });
    expect(items.find((item) => item.name === "Garlic Naan")).toMatchObject({
      price: 8,
      dietaryTags: ["V"],
    });
    expect(items.find((item) => item.name === "Weekend Special Haleem")).toMatchObject({
      price: 25,
      weekendOnly: true,
      popular: true,
    });
    expect(FEATURED_ITEM_IDS).toEqual(["chicken-dum-biryani-full", "chicken-65", "nawabi-plate-serve-two"]);
    expect(items.every((item) => item.imageUrl.includes("upload.wikimedia.org") || item.imageUrl.includes("images.unsplash.com"))).toBe(true);
  });
});
