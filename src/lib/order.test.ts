import { describe, expect, it } from "vitest";

import { calculateOrderTotals } from "@/lib/order";

describe("calculateOrderTotals", () => {
  it("calculates subtotal, GST, and total in cents", () => {
    const totals = calculateOrderTotals([
      { id: "chicken-dum-biryani-full", name: "Chicken Dum Biryani Full", price: 25, quantity: 2 },
      { id: "plain-naan", name: "Plain Naan", price: 6, quantity: 3 },
    ]);

    expect(totals.subtotalCents).toBe(6800);
    expect(totals.gstCents).toBe(618);
    expect(totals.totalCents).toBe(6800);
    expect(totals.displayTotal).toBe("$68.00");
  });
});
