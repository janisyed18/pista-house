import { NextResponse } from "next/server";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { generateReservationSlots } from "@/lib/reservations";
import { hasDatabase, prisma } from "@/lib/prisma";
import { filterAvailableReservationSlots } from "@/lib/table-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const partySize = Number(url.searchParams.get("partySize") ?? "2");
  const slots = generateReservationSlots(date, RESTAURANT_CONFIG.hours);

  if (!hasDatabase()) {
    return NextResponse.json({ slots, capacityManaged: false });
  }

  const [tables, bookings] = await Promise.all([
    prisma.diningTable.findMany({ where: { active: true } }),
    prisma.booking.findMany({
      where: {
        date: new Date(`${date}T00:00:00`),
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
      select: { date: true, time: true, status: true, tableId: true },
    }),
  ]);

  return NextResponse.json({
    slots: filterAvailableReservationSlots({ slots, tables, bookings, date, partySize }),
    capacityManaged: tables.length > 0,
  });
}
