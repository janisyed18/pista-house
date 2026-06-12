import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES } from "@/data/menu";
import { menuItemToCartLine } from "@/lib/order";
import { flattenMenu } from "@/lib/menu";
import { getCartUpsellSuggestions } from "@/lib/order-upsells";

const menuItems = flattenMenu(MENU_CATEGORIES.map((category) => ({
  ...category,
  sortOrder: 0,
  visible: true,
  source: "seed" as const,
  items: category.items.map((item, index) => ({
    ...item,
    categorySlug: category.slug,
    visible: true,
    available: true,
    source: "seed" as const,
    sortOrder: index,
  })),
})));

describe("getCartUpsellSuggestions", () => {
  it("suggests raita and dessert for biryani orders", () => {
    const biryani = menuItems.find((item) => item.id === "chicken-dum-biryani-full");
    if (!biryani) throw new Error("Missing test biryani item");

    const suggestions = getCartUpsellSuggestions([menuItemToCartLine(biryani)], menuItems);

    expect(suggestions.map((item) => item.id)).toEqual(expect.arrayContaining(["raita-small", "gulab-jamun"]));
  });

  it("does not suggest items already in the cart", () => {
    const biryani = menuItems.find((item) => item.id === "chicken-dum-biryani-full");
    const raita = menuItems.find((item) => item.id === "raita-small");
    if (!biryani || !raita) throw new Error("Missing test menu items");

    const suggestions = getCartUpsellSuggestions([menuItemToCartLine(biryani), menuItemToCartLine(raita)], menuItems);

    expect(suggestions.map((item) => item.id)).not.toContain("raita-small");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("does not suggest unavailable pairings", () => {
    const biryani = menuItems.find((item) => item.id === "chicken-dum-biryani-full");
    if (!biryani) throw new Error("Missing test biryani item");

    const menuWithUnavailableRaita = menuItems.map((item) => (item.id === "raita-small" ? { ...item, available: false } : item));
    const suggestions = getCartUpsellSuggestions([menuItemToCartLine(biryani)], menuWithUnavailableRaita);

    expect(suggestions.map((item) => item.id)).not.toContain("raita-small");
  });
});
