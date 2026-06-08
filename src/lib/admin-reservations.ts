import type { Booking, DiningTable } from "@prisma/client";

export type AdminReservation = ReturnType<typeof serializeAdminReservation>;

export function serializeAdminReservation(booking: Booking & { table?: DiningTable | null }) {
  return {
    id: booking.id,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    date: booking.date.toISOString().slice(0, 10),
    time: booking.time,
    partySize: booking.partySize,
    occasion: booking.occasion,
    smsOptIn: booking.smsOptIn,
    status: booking.status,
    guestNotes: booking.guestNotes,
    internalNotes: booking.internalNotes,
    tags: booking.tags,
    tableId: booking.tableId,
    tableName: booking.table?.name ?? null,
    tableCapacity: booking.table?.capacity ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function demoAdminReservations() {
  const now = new Date().toISOString();
  return [
    {
      id: "BK-DEMO-204",
      name: "Nadia Patel",
      phone: "+61 400 000 000",
      email: "guest@example.com",
      date: new Date().toISOString().slice(0, 10),
      time: "19:00",
      partySize: 4,
      occasion: "Dinner",
      smsOptIn: false,
      status: "REQUESTED" as const,
      guestNotes: "Prefers quiet table. Birthday dinner.",
      internalNotes: "VIP guest. Offer booth if available.",
      tags: ["VIP", "Birthday", "Quiet table"],
      tableId: "demo-t4-a",
      tableName: "T4 Family",
      tableCapacity: 4,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
