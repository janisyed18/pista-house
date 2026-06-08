import { describe, expect, it } from "vitest";

import { filterAvailableReservationSlots, findAvailableTable } from "@/lib/table-management";

const tables = [
  { id: "t2", name: "Table 2", capacity: 2, active: true },
  { id: "t4", name: "Table 4", capacity: 4, active: true },
  { id: "t6", name: "Table 6", capacity: 6, active: true },
];

describe("table management", () => {
  it("assigns the smallest active table that can fit the party", () => {
    expect(findAvailableTable({ tables, bookings: [], date: "2026-06-10", time: "19:00", partySize: 3 })?.id).toBe("t4");
  });

  it("blocks slots when all suitable tables are already held", () => {
    const available = filterAvailableReservationSlots({
      slots: ["18:45", "19:00", "19:15"],
      tables,
      bookings: [
        { date: "2026-06-10", time: "19:00", status: "REQUESTED", tableId: "t4" },
        { date: "2026-06-10", time: "19:00", status: "CONFIRMED", tableId: "t6" },
      ],
      date: "2026-06-10",
      partySize: 4,
    });

    expect(available).toEqual(["18:45", "19:15"]);
  });

  it("ignores cancelled bookings and inactive tables", () => {
    const availableTable = findAvailableTable({
      tables: [{ id: "inactive", name: "Inactive", capacity: 8, active: false }, ...tables],
      bookings: [{ date: "2026-06-10", time: "19:00", status: "CANCELLED", tableId: "t4" }],
      date: "2026-06-10",
      time: "19:00",
      partySize: 4,
    });

    expect(availableTable?.id).toBe("t4");
  });
});
