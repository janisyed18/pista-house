import type { AdminOrderStatus } from "@/lib/order-admin";

export type KitchenLane = "new" | "preparing" | "ready";
export type KitchenUrgency = "normal" | "warning" | "late";

export type KitchenOrder = {
  id: string;
  status: AdminOrderStatus;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  pickupTime: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  displayTotal: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    customization: string;
    displayLineTotal: string;
  }>;
};

export type KitchenBoardOrder = KitchenOrder & {
  ageMinutes: number;
  urgency: KitchenUrgency;
};

export const kitchenLaneLabels: Record<KitchenLane, string> = {
  new: "New tickets",
  preparing: "Preparing",
  ready: "Ready for pickup",
};

export function getKitchenOrderLane(status: AdminOrderStatus): KitchenLane | null {
  if (status === "RECEIVED" || status === "CONFIRMED") {
    return "new";
  }

  if (status === "BEING_PREPARED") {
    return "preparing";
  }

  if (status === "READY_FOR_PICKUP") {
    return "ready";
  }

  return null;
}

export function getKitchenOrderAction(status: AdminOrderStatus): { status: AdminOrderStatus; label: string } | null {
  if (status === "RECEIVED" || status === "CONFIRMED") {
    return { status: "BEING_PREPARED", label: "Start prep" };
  }

  if (status === "BEING_PREPARED") {
    return { status: "READY_FOR_PICKUP", label: "Mark ready" };
  }

  if (status === "READY_FOR_PICKUP") {
    return { status: "COMPLETED", label: "Complete" };
  }

  return null;
}

export function getKitchenOrderUrgency(createdAt: string, now = new Date()): KitchenUrgency {
  const age = getAgeMinutes(createdAt, now);

  if (age >= 20) {
    return "late";
  }

  if (age >= 10) {
    return "warning";
  }

  return "normal";
}

export function buildKitchenColumns(orders: KitchenOrder[], now = new Date()) {
  const columns: Record<KitchenLane, { label: string; orders: KitchenBoardOrder[] }> = {
    new: { label: kitchenLaneLabels.new, orders: [] },
    preparing: { label: kitchenLaneLabels.preparing, orders: [] },
    ready: { label: kitchenLaneLabels.ready, orders: [] },
  };

  for (const order of orders) {
    const lane = getKitchenOrderLane(order.status);

    if (!lane) {
      continue;
    }

    columns[lane].orders.push({
      ...order,
      ageMinutes: getAgeMinutes(order.createdAt, now),
      urgency: getKitchenOrderUrgency(order.createdAt, now),
    });
  }

  for (const column of Object.values(columns)) {
    column.orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return columns;
}

function getAgeMinutes(createdAt: string, now = new Date()) {
  const diff = now.getTime() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}
