export type AdminOrderStatus =
  | "RECEIVED"
  | "CONFIRMED"
  | "BEING_PREPARED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export type AuditRangeKey = "daily" | "weekly" | "monthly" | "yearly" | "custom";

const orderIdPattern = /\b(PH-[A-Za-z0-9_-]+|c[a-z0-9]{12,})\b/;

const transitions: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  RECEIVED: ["CONFIRMED", "BEING_PREPARED", "CANCELLED"],
  CONFIRMED: ["BEING_PREPARED", "READY_FOR_PICKUP", "CANCELLED"],
  BEING_PREPARED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function parseOrderLookupCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const orderId = url.searchParams.get("order_id") ?? url.searchParams.get("orderId") ?? url.searchParams.get("id");
    if (orderId) {
      return orderId;
    }
  } catch {
    // Non-URL values are handled below.
  }

  const params = new URLSearchParams(trimmed.includes("?") ? trimmed.split("?").at(-1) : trimmed);
  const paramOrderId = params.get("order_id") ?? params.get("orderId") ?? params.get("id");
  if (paramOrderId) {
    return paramOrderId;
  }

  return trimmed.match(orderIdPattern)?.[1] ?? null;
}

export function getNextOrderStatuses(status: AdminOrderStatus) {
  return transitions[status] ?? [];
}

export function canTransitionOrderStatus(from: AdminOrderStatus, to: AdminOrderStatus) {
  return getNextOrderStatuses(from).includes(to);
}

export function getAuditRange(range: AuditRangeKey, now = new Date(), custom?: { from?: string | Date; to?: string | Date }) {
  if (range === "custom") {
    const from = custom?.from ? startOfUtcDay(new Date(custom.from)) : startOfUtcDay(now);
    const to = custom?.to ? addUtcDays(startOfUtcDay(new Date(custom.to)), 1) : addUtcDays(from, 1);
    return { from, to };
  }

  if (range === "daily") {
    const from = startOfUtcDay(now);
    return { from, to: addUtcDays(from, 1) };
  }

  if (range === "weekly") {
    const from = startOfUtcWeek(now);
    return { from, to: addUtcDays(from, 7) };
  }

  if (range === "monthly") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return { from, to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)) };
  }

  const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  return { from, to: new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)) };
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date: Date) {
  const dayStart = startOfUtcDay(date);
  const day = dayStart.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return addUtcDays(dayStart, -daysSinceMonday);
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
