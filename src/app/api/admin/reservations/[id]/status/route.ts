import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminReservation } from "@/lib/admin-reservations";
import { sendReservationStatusEmail } from "@/lib/email";
import { canTransitionBookingStatus, type AdminBookingStatus } from "@/lib/reservation-admin";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    const body = statusSchema.parse(await request.json());

    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update reservations" }, { status: 503 });
    }

    const before = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (before.status !== body.status && !canTransitionBookingStatus(before.status as AdminBookingStatus, body.status)) {
      return Response.json({ error: `Cannot move reservation from ${before.status} to ${body.status}` }, { status: 409 });
    }

    const reservation = await prisma.booking.update({
      where: { id: params.id },
      data: { status: body.status },
      include: { table: true },
    });

    await writeAdminAuditLog({
      adminEmail,
      action: "status_update",
      entityType: "reservation",
      entityId: reservation.id,
      before,
      after: reservation,
      request,
    });

    await sendReservationStatusEmail({
      to: reservation.email,
      id: reservation.id,
      name: reservation.name,
      date: reservation.date.toISOString().slice(0, 10),
      time: reservation.time,
      partySize: reservation.partySize,
      status: body.status,
    });

    return { reservation: serializeAdminReservation(reservation) };
  });
}
