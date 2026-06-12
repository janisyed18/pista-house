import type Stripe from "stripe";

import { formatCartLineCustomization, type CartLine } from "@/lib/order";

type BuildStripeCheckoutSessionParamsInput = {
  siteUrl: string;
  orderId: string;
  pickupTime: string;
  customerEmail?: string;
  lines: CartLine[];
};

export function buildStripeCheckoutSessionParams({
  siteUrl,
  orderId,
  pickupTime,
  customerEmail,
  lines,
}: BuildStripeCheckoutSessionParamsInput): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    allow_promotion_codes: true,
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${siteUrl}/order`,
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(line.price * 100),
        product_data: {
          name: [line.name, formatCartLineCustomization(line)].filter(Boolean).join(" - "),
        },
      },
    })),
    customer_email: customerEmail,
    metadata: {
      orderId,
      pickupTime,
    },
  };
}
