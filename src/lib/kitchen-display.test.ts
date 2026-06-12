import { describe, expect, it } from "vitest";

import { buildKitchenColumns, getKitchenOrderAction, getKitchenOrderLane, getKitchenOrderUrgency } from "@/lib/kitchen-display";

const now = new Date("2026-06-12T10:30:00.000Z");

function order(status: "RECEIVED" | "CONFIRMED" | "BEING_PREPARED" | "READY_FOR_PICKUP" | "COMPLETED", createdAt: string) {
  return {
    id: `${status}-${createdAt}`,
    status,
    createdAt,
    customerName: null,
    customerPhone: null,
    pickupTime: "ASAP",
    paymentStatus: "PAID" as const,
    displayTotal: "$20.00",
    items: [],
  };
}

describe("kitchen display helpers", () => {
  it("maps active order statuses to kitchen lanes", () => {
    expect(getKitchenOrderLane("RECEIVED")).toBe("new");
    expect(getKitchenOrderLane("CONFIRMED")).toBe("new");
    expect(getKitchenOrderLane("BEING_PREPARED")).toBe("preparing");
    expect(getKitchenOrderLane("READY_FOR_PICKUP")).toBe("ready");
    expect(getKitchenOrderLane("COMPLETED")).toBeNull();
  });

  it("builds oldest-first kitchen columns and excludes completed orders", () => {
    const columns = buildKitchenColumns(
      [
        order("RECEIVED", "2026-06-12T10:20:00.000Z"),
        order("BEING_PREPARED", "2026-06-12T10:00:00.000Z"),
        order("RECEIVED", "2026-06-12T09:55:00.000Z"),
        order("READY_FOR_PICKUP", "2026-06-12T10:10:00.000Z"),
        order("COMPLETED", "2026-06-12T09:00:00.000Z"),
      ],
      now,
    );

    expect(columns.new.orders.map((item) => item.createdAt)).toEqual(["2026-06-12T09:55:00.000Z", "2026-06-12T10:20:00.000Z"]);
    expect(columns.preparing.orders).toHaveLength(1);
    expect(columns.ready.orders).toHaveLength(1);
    expect(columns.new.orders[0]?.ageMinutes).toBe(35);
  });

  it("marks urgency from ticket age", () => {
    expect(getKitchenOrderUrgency("2026-06-12T10:25:00.000Z", now)).toBe("normal");
    expect(getKitchenOrderUrgency("2026-06-12T10:16:00.000Z", now)).toBe("warning");
    expect(getKitchenOrderUrgency("2026-06-12T10:05:00.000Z", now)).toBe("late");
  });

  it("selects the fastest next kitchen action", () => {
    expect(getKitchenOrderAction("RECEIVED")).toEqual({ status: "BEING_PREPARED", label: "Start prep" });
    expect(getKitchenOrderAction("CONFIRMED")).toEqual({ status: "BEING_PREPARED", label: "Start prep" });
    expect(getKitchenOrderAction("BEING_PREPARED")).toEqual({ status: "READY_FOR_PICKUP", label: "Mark ready" });
    expect(getKitchenOrderAction("READY_FOR_PICKUP")).toEqual({ status: "COMPLETED", label: "Complete" });
    expect(getKitchenOrderAction("COMPLETED")).toBeNull();
  });
});
