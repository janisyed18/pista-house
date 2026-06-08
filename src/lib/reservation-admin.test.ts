import { describe, expect, it } from "vitest";

import { canTransitionBookingStatus, getNextBookingStatuses } from "@/lib/reservation-admin";

describe("reservation admin transitions", () => {
  it("requires admin approval for requested reservations", () => {
    expect(getNextBookingStatuses("REQUESTED")).toEqual(["CONFIRMED", "CANCELLED"]);
  });

  it("prevents cancelled reservations from being confirmed later", () => {
    expect(getNextBookingStatuses("CANCELLED")).toEqual([]);
    expect(canTransitionBookingStatus("CANCELLED", "CONFIRMED")).toBe(false);
  });
});
