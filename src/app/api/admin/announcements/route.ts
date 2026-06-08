import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { demoAdminAnnouncements, serializeAdminAnnouncement } from "@/lib/admin-announcements";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const announcementSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  kind: z.string().default("info"),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  showOnHome: z.boolean().default(true),
  showOnMenu: z.boolean().default(true),
  showOnOrder: z.boolean().default(true),
});

export async function GET() {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      return { announcements: demoAdminAnnouncements(), demo: true };
    }

    const announcements = await prisma.announcement.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
    return { announcements: announcements.map(serializeAdminAnnouncement), demo: false };
  });
}

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to save announcements" }, { status: 503 });
    }

    const body = announcementSchema.parse(await request.json());
    const announcement = await prisma.announcement.create({ data: toAnnouncementData(body) });
    await writeAdminAuditLog({ adminEmail, action: "create", entityType: "announcement", entityId: announcement.id, after: announcement, request });
    return { announcement: serializeAdminAnnouncement(announcement) };
  });
}

function toAnnouncementData(body: z.infer<typeof announcementSchema>) {
  return {
    title: body.title,
    message: body.message,
    kind: body.kind,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    active: body.active,
    showOnHome: body.showOnHome,
    showOnMenu: body.showOnMenu,
    showOnOrder: body.showOnOrder,
  };
}
