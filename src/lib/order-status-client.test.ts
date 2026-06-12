import { describe, expect, it, vi } from "vitest";

import { requestOrderStatus } from "@/lib/order-status-client";

describe("requestOrderStatus", () => {
  it("returns the order status from the API", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "READY_FOR_PICKUP" }),
    });

    await expect(requestOrderStatus("PH-1042", fetcher)).resolves.toBe("READY_FOR_PICKUP");
  });

  it("turns polling fetch failures into a friendly status error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestOrderStatus("PH-1042", fetcher)).rejects.toThrow("Order status is temporarily unavailable.");
  });
});
