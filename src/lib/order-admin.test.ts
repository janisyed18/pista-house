import { describe, expect, it } from "vitest";

import { getAuditRange, getNextOrderStatuses, parseOrderLookupCode } from "@/lib/order-admin";

describe("parseOrderLookupCode", () => {
  it("extracts order ids from plain ids, URLs, and query strings", () => {
    expect(parseOrderLookupCode("PH-1024")).toBe("PH-1024");
    expect(parseOrderLookupCode("https://pistahouse.com.au/order/success?order_id=PH-2048")).toBe("PH-2048");
    expect(parseOrderLookupCode("session_id=demo_PH-777&order_id=PH-777")).toBe("PH-777");
  });

  it("returns null for empty or unparseable values", () => {
    expect(parseOrderLookupCode("")).toBeNull();
    expect(parseOrderLookupCode("not an order")).toBeNull();
  });
});

describe("getAuditRange", () => {
  it("builds daily, weekly, monthly, and yearly ranges", () => {
    const now = new Date("2026-06-08T15:30:00.000Z");

    expect(getAuditRange("daily", now)).toMatchObject({
      from: new Date("2026-06-08T00:00:00.000Z"),
      to: new Date("2026-06-09T00:00:00.000Z"),
    });
    expect(getAuditRange("weekly", now).from.getUTCDay()).toBe(1);
    expect(getAuditRange("monthly", now).from.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(getAuditRange("yearly", now).from.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("getNextOrderStatuses", () => {
  it("allows forward operational transitions and cancellation", () => {
    expect(getNextOrderStatuses("RECEIVED")).toEqual(["CONFIRMED", "BEING_PREPARED", "CANCELLED"]);
    expect(getNextOrderStatuses("READY_FOR_PICKUP")).toEqual(["COMPLETED", "CANCELLED"]);
    expect(getNextOrderStatuses("COMPLETED")).toEqual([]);
  });
});
