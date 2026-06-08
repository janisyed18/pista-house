import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminReservation } from "@/lib/admin-reservations";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reservationUpdateSchema = z.object({
  guestNotes: z.string().optional().or(z.literal("")),
  internalNotes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  tableId: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update reservations" }, { status: 503 });
    }

    const body = reservationUpdateSchema.parse(await request.json());
    const before = await prisma.booking.findUnique({ where: { id: params.id }, include: { table: true } });
    if (!before) {
      return Response.json({ error: "Reservation not found" }, { status: 404 });
    }

    const reservation = await prisma.booking.update({
      where: { id: params.id },
      data: {
        guestNotes: body.guestNotes || null,
        internalNotes: body.internalNotes || null,
        tags: body.tags,
        tableId: body.tableId ?? null,
      },
      include: { table: true },
    });

    await writeAdminAuditLog({ adminEmail, action: "update", entityType: "reservation", entityId: reservation.id, before, after: reservation, request });
    return { reservation: serializeAdminReservation(reservation) };
  });
}
