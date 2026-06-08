import { withAdmin } from "@/lib/admin-api";
import { demoAdminReservations, serializeAdminReservation } from "@/lib/admin-reservations";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      return { reservations: demoAdminReservations(), demo: true };
    }

    const reservations = await prisma.booking.findMany({
      include: { table: true },
      orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "desc" }],
      take: 200,
    });

    return { reservations: reservations.map(serializeAdminReservation), demo: false };
  });
}
