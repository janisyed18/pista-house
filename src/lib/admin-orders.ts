import type { Order, OrderItem } from "@prisma/client";

import { formatCartLineCustomization, formatCents, type CartLine } from "@/lib/order";

export type AdminOrderWithItems = Order & {
  items: OrderItem[];
};

export function serializeAdminOrder(order: AdminOrderWithItems) {
  return {
    id: order.id,
    stripeSessionId: order.stripeSessionId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    pickupTime: order.pickupTime,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt?.toISOString() ?? null,
    notes: order.notes,
    subtotalCents: order.subtotalCents,
    gstCents: order.gstCents,
    totalCents: order.totalCents,
    displaySubtotal: formatCents(order.subtotalCents),
    displayGst: formatCents(order.gstCents),
    displayTotal: formatCents(order.totalCents),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      priceCents: item.priceCents,
      displayPrice: formatCents(item.priceCents),
      quantity: item.quantity,
      spiceLevel: item.spiceLevel,
      notes: item.notes,
      customization: formatCartLineCustomization({
        spiceLevel: item.spiceLevel as CartLine["spiceLevel"],
        notes: item.notes ?? undefined,
      }),
      lineTotalCents: item.priceCents * item.quantity,
      displayLineTotal: formatCents(item.priceCents * item.quantity),
    })),
  };
}

export function demoAdminOrders() {
  const now = new Date();
  return [
    {
      id: "PH-DEMO-1008",
      stripeSessionId: "demo_PH-DEMO-1008",
      customerName: "Walk-in pickup",
      customerEmail: null,
      customerPhone: null,
      pickupTime: "ASAP",
      status: "RECEIVED",
      paymentStatus: "PAID",
      paidAt: now.toISOString(),
      notes: "Demo order shown until DATABASE_URL is configured.",
      subtotalCents: 4700,
      gstCents: 427,
      totalCents: 4700,
      displaySubtotal: "$47.00",
      displayGst: "$4.27",
      displayTotal: "$47.00",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items: [
        {
          id: "demo-item-1",
          menuItemId: "chicken-dum-biryani-full",
          name: "Chicken Dum Biryani Full",
          priceCents: 2500,
          displayPrice: "$25.00",
          quantity: 1,
          spiceLevel: "Medium",
          notes: "Extra raita",
          customization: "Spice: Medium · Note: Extra raita",
          lineTotalCents: 2500,
          displayLineTotal: "$25.00",
        },
        {
          id: "demo-item-2",
          menuItemId: "chicken-65",
          name: "Chicken 65",
          priceCents: 2200,
          displayPrice: "$22.00",
          quantity: 1,
          spiceLevel: "Spicy",
          notes: null,
          customization: "Spice: Spicy",
          lineTotalCents: 2200,
          displayLineTotal: "$22.00",
        },
      ],
    },
  ];
}
