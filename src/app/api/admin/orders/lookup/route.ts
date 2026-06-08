import { withAdmin } from "@/lib/admin-api";
import { demoAdminOrders, serializeAdminOrder } from "@/lib/admin-orders";
import { parseOrderLookupCode } from "@/lib/order-admin";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withAdmin(async () => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code") ?? "";
    const id = parseOrderLookupCode(code);

    if (!id) {
      return Response.json({ error: "Enter or scan a valid order code" }, { status: 400 });
    }

    if (!hasDatabase()) {
      const order = demoAdminOrders().find((item) => item.id === id || id.toLowerCase().includes("demo"));
      return order ? { order, demo: true } : Response.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return { order: serializeAdminOrder(order), demo: false };
  });
}
