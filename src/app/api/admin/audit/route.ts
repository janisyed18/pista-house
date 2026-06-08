import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { getAuditRange, type AuditRangeKey } from "@/lib/order-admin";
import { formatCents } from "@/lib/order";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const auditQuerySchema = z.object({
  range: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]).default("daily"),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: Request) {
  return withAdmin(async () => {
    const url = new URL(request.url);
    const query = auditQuerySchema.parse({
      range: url.searchParams.get("range") ?? "daily",
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    const { from, to } = getAuditRange(query.range as AuditRangeKey, new Date(), { from: query.from, to: query.to });

    if (!hasDatabase()) {
      return {
        demo: true,
        range: query.range,
        from: from.toISOString(),
        to: to.toISOString(),
        metrics: demoMetrics(),
      };
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lt: to },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const grossCents = orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.totalCents, 0);
    const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
    const statusCounts = countBy(orders.map((order) => order.status));
    const paymentStatusCounts = countBy(orders.map((order) => order.paymentStatus));
    const topItems = new Map<string, { name: string; quantity: number; grossCents: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = topItems.get(item.menuItemId) ?? { name: item.name, quantity: 0, grossCents: 0 };
        current.quantity += item.quantity;
        current.grossCents += item.quantity * item.priceCents;
        topItems.set(item.menuItemId, current);
      });
    });

    return {
      demo: false,
      range: query.range,
      from: from.toISOString(),
      to: to.toISOString(),
      metrics: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        cancelledOrders: statusCounts.CANCELLED ?? 0,
        grossCents,
        gstCents: Math.round(grossCents / 11),
        averageOrderCents: paidOrders.length ? Math.round(grossCents / paidOrders.length) : 0,
        displayGross: formatCents(grossCents),
        displayGst: formatCents(Math.round(grossCents / 11)),
        displayAverageOrder: formatCents(paidOrders.length ? Math.round(grossCents / paidOrders.length) : 0),
        statusCounts,
        paymentStatusCounts,
        topItems: Array.from(topItems.values())
          .sort((a, b) => b.quantity - a.quantity || b.grossCents - a.grossCents)
          .slice(0, 10)
          .map((item) => ({ ...item, displayGross: formatCents(item.grossCents) })),
      },
    };
  });
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function demoMetrics() {
  return {
    totalOrders: 1,
    paidOrders: 1,
    cancelledOrders: 0,
    grossCents: 4700,
    gstCents: 427,
    averageOrderCents: 4700,
    displayGross: "$47.00",
    displayGst: "$4.27",
    displayAverageOrder: "$47.00",
    statusCounts: { RECEIVED: 1 },
    paymentStatusCounts: { PAID: 1 },
    topItems: [
      { name: "Chicken Dum Biryani Full", quantity: 1, grossCents: 2500, displayGross: "$25.00" },
      { name: "Chicken 65", quantity: 1, grossCents: 2200, displayGross: "$22.00" },
    ],
  };
}
