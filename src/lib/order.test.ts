import { describe, expect, it } from "vitest";

import { calculateOrderTotals, formatCartLineCustomization, menuItemToCartLine } from "@/lib/order";

describe("calculateOrderTotals", () => {
  it("calculates subtotal, GST, and total in cents", () => {
    const totals = calculateOrderTotals([
      { id: "chicken-dum-biryani-full", menuItemId: "chicken-dum-biryani-full", name: "Chicken Dum Biryani Full", price: 25, quantity: 2 },
      { id: "plain-naan", menuItemId: "plain-naan", name: "Plain Naan", price: 6, quantity: 3 },
    ]);

    expect(totals.subtotalCents).toBe(6800);
    expect(totals.gstCents).toBe(618);
    expect(totals.totalCents).toBe(6800);
    expect(totals.displayTotal).toBe("$68.00");
  });
});

describe("menuItemToCartLine", () => {
  it("keeps customized versions of the same menu item as separate cart lines", () => {
    const menuItem = {
      id: "chicken-65",
      name: "Chicken 65",
      price: 22,
      description: "Crispy chicken.",
      dietaryTags: ["H", "S"] as const,
      popular: true,
      imageUrl: "/images/chicken-65.jpg",
    };

    const medium = menuItemToCartLine(menuItem, 2, {
      spiceLevel: "Medium",
      notes: "No onions",
    });
    const extraSpicy = menuItemToCartLine(menuItem, 1, {
      spiceLevel: "Extra Spicy",
      notes: "No onions",
    });

    expect(medium.menuItemId).toBe("chicken-65");
    expect(medium.id).not.toBe(extraSpicy.id);
    expect(medium.quantity).toBe(2);
    expect(formatCartLineCustomization(medium)).toBe("Spice: Medium · Note: No onions");
    expect(formatCartLineCustomization(extraSpicy)).toBe("Spice: Extra Spicy · Note: No onions");
  });
});
