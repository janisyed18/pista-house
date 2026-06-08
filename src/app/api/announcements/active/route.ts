import { NextResponse } from "next/server";

import { demoAdminAnnouncements, serializeAdminAnnouncement } from "@/lib/admin-announcements";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("path") ?? "/";
  const now = new Date();

  if (!hasDatabase()) {
    return NextResponse.json({ announcements: demoAdminAnnouncements().filter((item) => item.active) });
  }

  const announcements = await prisma.announcement.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
      ...(pathname.startsWith("/menu")
        ? { showOnMenu: true }
        : pathname.startsWith("/order")
          ? { showOnOrder: true }
          : { showOnHome: true }),
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  return NextResponse.json({ announcements: announcements.map(serializeAdminAnnouncement) });
}
