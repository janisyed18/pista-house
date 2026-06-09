import { NextResponse } from "next/server";
import Stripe from "stripe";

import { sendOrderConfirmation } from "@/lib/email";
import type { CartLine } from "@/lib/order";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ received: true, skipped: "Stripe is not configured" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await request.text();
  let event: Stripe.Event;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } else if (process.env.NODE_ENV !== "production") {
    event = JSON.parse(rawBody) as Stripe.Event;
  } else {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is required" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && hasDatabase()) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          status: "CONFIRMED",
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email ?? session.customer_email ?? undefined,
          customerName: session.customer_details?.name ?? undefined,
        },
        include: { items: true },
      });

      await sendOrderConfirmation({
        to: order.customerEmail ?? undefined,
        orderId: order.id,
        lines: order.items.map((item) => ({
          id: item.menuItemId,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.priceCents / 100,
          quantity: item.quantity,
          spiceLevel: item.spiceLevel as CartLine["spiceLevel"],
          notes: item.notes ?? undefined,
        })),
      });
    }
  }

  return NextResponse.json({ received: true });
}
