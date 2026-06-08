import { NextResponse } from "next/server";
import { z } from "zod";

import { sendReservationEmails } from "@/lib/email";
import { hasDatabase, prisma } from "@/lib/prisma";
import { findAvailableTable } from "@/lib/table-management";

export const runtime = "nodejs";

const schema = z.object({
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().positive(),
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  occasion: z.string().optional(),
  guestNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  smsOptIn: z.boolean().optional(),
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  let booking: { id: string };
  try {
    booking = hasDatabase() ? await createDatabaseBooking(payload) : { id: `booking_${Date.now()}`, ...payload };
  } catch (error) {
    if (error instanceof ReservationCapacityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  await sendReservationEmails({
    id: booking.id,
    name: payload.name,
    email: payload.email,
    date: payload.date,
    time: payload.time,
    partySize: payload.partySize,
  });

  return NextResponse.json({ id: booking.id, status: "REQUESTED" });
}

async function createDatabaseBooking(payload: z.infer<typeof schema>) {
  const [tables, bookings] = await Promise.all([
    prisma.diningTable.findMany({ where: { active: true } }),
    prisma.booking.findMany({
      where: {
        date: new Date(`${payload.date}T00:00:00`),
        time: payload.time,
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
      select: { date: true, time: true, status: true, tableId: true },
    }),
  ]);
  const table = findAvailableTable({ tables, bookings, date: payload.date, time: payload.time, partySize: payload.partySize });

  if (tables.length > 0 && !table) {
    throw new ReservationCapacityError("Selected time is fully booked");
  }

  return prisma.booking.create({
    data: {
      date: new Date(`${payload.date}T00:00:00`),
      time: payload.time,
      partySize: payload.partySize,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      occasion: payload.occasion,
      guestNotes: payload.guestNotes,
      tags: payload.tags ?? [],
      tableId: table?.id,
      smsOptIn: payload.smsOptIn ?? false,
    },
  });
}

class ReservationCapacityError extends Error {}
