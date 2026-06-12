import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminOrder } from "@/lib/admin-orders";
import { canTransitionOrderStatus, type AdminOrderStatus } from "@/lib/order-admin";
import { hasDatabase, prisma } from "@/lib/prisma";
import { sendOrderReadySms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(["RECEIVED", "CONFIRMED", "BEING_PREPARED", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    const body = statusSchema.parse(await request.json());

    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update order status" }, { status: 503 });
    }

    const before = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!before) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (before.status !== body.status && !canTransitionOrderStatus(before.status as AdminOrderStatus, body.status)) {
      return Response.json({ error: `Cannot move order from ${before.status} to ${body.status}` }, { status: 409 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: body.status },
      include: { items: true },
    });

    await writeAdminAuditLog({
      adminEmail,
      action: "status_update",
      entityType: "order",
      entityId: order.id,
      before,
      after: order,
      request,
    });

    const sms =
      before.status !== "READY_FOR_PICKUP" && order.status === "READY_FOR_PICKUP"
        ? await sendOrderReadySms({
            phone: order.customerPhone,
            orderId: order.id,
            pickupTime: order.pickupTime,
          })
        : undefined;

    return { order: serializeAdminOrder(order), sms };
  });
}
