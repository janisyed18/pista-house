import { describe, expect, it } from "vitest";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { getRestaurantStatus } from "@/lib/hours";

describe("getRestaurantStatus", () => {
  it("reports open with a closing countdown during trading hours", () => {
    const status = getRestaurantStatus(
      RESTAURANT_CONFIG.hours,
      new Date("2026-06-01T06:30:00.000Z"),
      "Australia/Sydney",
    );

    expect(status.isOpen).toBe(true);
    expect(status.todayLabel).toBe("Today: 12:00 PM - 10:00 PM");
    expect(status.countdownLabel).toBe("Closes in 5h 30m");
  });

  it("reports closed with next opening countdown before service starts", () => {
    const status = getRestaurantStatus(
      RESTAURANT_CONFIG.hours,
      new Date("2026-06-01T00:15:00.000Z"),
      "Australia/Sydney",
    );

    expect(status.isOpen).toBe(false);
    expect(status.countdownLabel).toBe("Opens in 1h 45m");
  });
});
