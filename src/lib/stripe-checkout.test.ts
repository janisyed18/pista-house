import { describe, expect, it } from "vitest";

import { buildStripeCheckoutSessionParams } from "@/lib/stripe-checkout";

describe("buildStripeCheckoutSessionParams", () => {
  it("enables Stripe promotion code entry at checkout", () => {
    const params = buildStripeCheckoutSessionParams({
      siteUrl: "https://pistahouse.com.au",
      orderId: "PH-1042",
      pickupTime: "ASAP",
      customerEmail: "guest@example.com",
      lines: [
        {
          id: "chicken-dum-biryani-full",
          menuItemId: "chicken-dum-biryani-full",
          name: "Chicken Dum Biryani Full",
          price: 25,
          quantity: 2,
          spiceLevel: "Spicy",
          notes: "Extra raita",
        },
      ],
    });

    expect(params.allow_promotion_codes).toBe(true);
    expect(params.mode).toBe("payment");
    expect(params.line_items?.[0]?.quantity).toBe(2);
    expect(params.line_items?.[0]?.price_data?.product_data?.name).toContain("Spice: Spicy");
  });
});
