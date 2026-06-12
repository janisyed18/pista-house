import { describe, expect, it, vi } from "vitest";

import { requestCheckoutUrl } from "@/lib/checkout-client";
import type { CartLine } from "@/lib/order";

const lines: CartLine[] = [
  {
    id: "chicken-dum-biryani-full",
    menuItemId: "chicken-dum-biryani-full",
    name: "Chicken Dum Biryani Full",
    price: 25,
    quantity: 1,
  },
];

describe("requestCheckoutUrl", () => {
  it("returns the checkout redirect URL from the API", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "/order/success?order_id=PH-1" }),
    });

    await expect(requestCheckoutUrl({ lines, pickupTime: "ASAP" }, fetcher)).resolves.toBe("/order/success?order_id=PH-1");
  });

  it("turns network failures into a friendly checkout error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestCheckoutUrl({ lines, pickupTime: "ASAP" }, fetcher)).rejects.toThrow("Checkout is temporarily unavailable. Please try again or call the restaurant.");
  });
});
