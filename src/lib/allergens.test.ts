import { describe, expect, it } from "vitest";

import { ALL_MENU_ITEMS } from "@/data/menu";
import { getAllergenProfile, getAllergenRows } from "@/lib/allergens";

describe("allergen profiles", () => {
  it("generates one allergen row for every seeded menu item", () => {
    const rows = getAllergenRows(ALL_MENU_ITEMS);

    expect(rows).toHaveLength(ALL_MENU_ITEMS.length);
    expect(rows.every((row) => row.itemName && row.categoryName)).toBe(true);
  });

  it("flags required allergens for high-risk dishes", () => {
    expect(getAllergenProfile("mirchi-ka-salan").allergens.peanut).toBe("contains");
    expect(getAllergenProfile("mirchi-ka-salan").allergens.sesame).toBe("contains");
    expect(getAllergenProfile("garlic-naan").allergens.wheatGluten).toBe("contains");
    expect(getAllergenProfile("mango-lassi").allergens.milk).toBe("contains");
    expect(getAllergenProfile("weekend-special-haleem").allergens.wheatGluten).toBe("contains");
  });

  it("marks unknown admin-created items as ask staff", () => {
    const profile = getAllergenProfile("custom-owner-special");

    expect(Object.values(profile.allergens).every((status) => status === "ask")).toBe(true);
    expect(profile.note).toContain("Ask staff");
  });
});
