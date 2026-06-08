import { NextResponse } from "next/server";

import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const demoStages = ["RECEIVED", "CONFIRMED", "BEING_PREPARED", "READY_FOR_PICKUP"];

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (hasDatabase()) {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (order) {
      return NextResponse.json({ id: order.id, status: order.status });
    }
  }

  const index = Math.floor(Date.now() / 10_000) % demoStages.length;
  return NextResponse.json({ id: params.id, status: demoStages[index] });
}
