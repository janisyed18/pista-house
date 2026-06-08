import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { sendOrderConfirmation } from "@/lib/email";
import { flattenMenu, getMergedMenu } from "@/lib/menu";
import { calculateOrderTotals, menuItemToCartLine } from "@/lib/order";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  pickupTime: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const orderId = `PH-${Date.now()}`;
  const currentMenu = flattenMenu(await getMergedMenu());
  const serverLines = body.lines.map((line) => {
    const item = currentMenu.find((menuItem) => menuItem.id === line.id);
    if (!item) {
      throw new Error(`Menu item not found: ${line.id}`);
    }
    return menuItemToCartLine(item, line.quantity);
  });
  const totals = calculateOrderTotals(serverLines);
  const customerEmail = body.customerEmail || undefined;

  if (hasDatabase()) {
    await prisma.order.create({
      data: {
        id: orderId,
        pickupTime: body.pickupTime,
        customerName: body.customerName,
        customerEmail,
        customerPhone: body.customerPhone,
        notes: body.notes,
        subtotalCents: totals.subtotalCents,
        gstCents: totals.gstCents,
        totalCents: totals.totalCents,
        paymentStatus: process.env.STRIPE_SECRET_KEY ? "PENDING" : "PAID",
        paidAt: process.env.STRIPE_SECRET_KEY ? undefined : new Date(),
        status: process.env.STRIPE_SECRET_KEY ? "RECEIVED" : "CONFIRMED",
        items: {
          create: serverLines.map((line) => ({
            menuItemId: line.id,
            name: line.name,
            quantity: line.quantity,
            priceCents: Math.round(line.price * 100),
          })),
        },
      },
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    await sendOrderConfirmation({ to: customerEmail, orderId, lines: serverLines });
    return NextResponse.json({
      url: `/order/success?session_id=demo_${orderId}&order_id=${orderId}`,
      orderId,
      totals,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/order`,
    line_items: serverLines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(line.price * 100),
        product_data: {
          name: line.name,
        },
      },
    })),
    customer_email: customerEmail,
    metadata: {
      orderId,
      pickupTime: body.pickupTime,
    },
  });

  if (hasDatabase()) {
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });
  }

  return NextResponse.json({ url: session.url, orderId, totals });
}
