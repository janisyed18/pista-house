import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { sendOrderConfirmation } from "@/lib/email";
import { flattenMenu, getMergedMenu } from "@/lib/menu";
import { calculateOrderTotals, menuItemToCartLine, SPICE_LEVELS } from "@/lib/order";
import { getPersistedOrderingPauseStatus } from "@/lib/ordering-pause";
import { hasDatabase, prisma } from "@/lib/prisma";
import { buildStripeCheckoutSessionParams } from "@/lib/stripe-checkout";

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
      menuItemId: z.string().optional(),
      quantity: z.number().int().positive(),
      spiceLevel: z.enum(SPICE_LEVELS).optional(),
      notes: z.string().max(160).optional(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const orderingPause = await getPersistedOrderingPauseStatus();

  if (orderingPause.paused) {
    return NextResponse.json({ error: orderingPause.message }, { status: 503 });
  }

  const orderId = `PH-${Date.now()}`;
  const currentMenu = flattenMenu(await getMergedMenu());
  const serverLines = [];

  for (const line of body.lines) {
    const menuItemId = line.menuItemId ?? line.id;
    const item = currentMenu.find((menuItem) => menuItem.id === menuItemId);
    if (!item) {
      return NextResponse.json({ error: `Menu item not found: ${menuItemId}` }, { status: 400 });
    }
    if (!item.available) {
      return NextResponse.json({ error: `${item.name} is currently sold out. Please remove it from your cart and choose another item.` }, { status: 409 });
    }
    serverLines.push(menuItemToCartLine(item, line.quantity, {
      spiceLevel: line.spiceLevel,
      notes: line.notes,
    }));
  }
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
            spiceLevel: line.spiceLevel,
            notes: line.notes,
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
  const session = await stripe.checkout.sessions.create(buildStripeCheckoutSessionParams({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    orderId,
    pickupTime: body.pickupTime,
    lines: serverLines,
    customerEmail,
  }));

  if (hasDatabase()) {
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });
  }

  return NextResponse.json({ url: session.url, orderId, totals });
}
