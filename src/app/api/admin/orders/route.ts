import { withAdmin } from "@/lib/admin-api";
import { demoAdminOrders, serializeAdminOrder } from "@/lib/admin-orders";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      return { orders: demoAdminOrders(), demo: true };
    }

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { orders: orders.map(serializeAdminOrder), demo: false };
  });
}
