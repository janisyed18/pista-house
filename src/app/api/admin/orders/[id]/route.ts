import { withAdmin } from "@/lib/admin-api";
import { demoAdminOrders, serializeAdminOrder } from "@/lib/admin-orders";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      const order = demoAdminOrders().find((item) => item.id === params.id);
      return order ? { order, demo: true } : Response.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return { order: serializeAdminOrder(order), demo: false };
  });
}
