import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminAnnouncement } from "@/lib/admin-announcements";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const announcementUpdateSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  kind: z.string().default("info"),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  active: z.boolean(),
  showOnHome: z.boolean(),
  showOnMenu: z.boolean(),
  showOnOrder: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update announcements" }, { status: 503 });
    }

    const body = announcementUpdateSchema.parse(await request.json());
    const before = await prisma.announcement.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Announcement not found" }, { status: 404 });
    }

    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        title: body.title,
        message: body.message,
        kind: body.kind,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        active: body.active,
        showOnHome: body.showOnHome,
        showOnMenu: body.showOnMenu,
        showOnOrder: body.showOnOrder,
      },
    });

    await writeAdminAuditLog({ adminEmail, action: "update", entityType: "announcement", entityId: announcement.id, before, after: announcement, request });
    return { announcement: serializeAdminAnnouncement(announcement) };
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to archive announcements" }, { status: 503 });
    }

    const before = await prisma.announcement.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Announcement not found" }, { status: 404 });
    }

    const announcement = await prisma.announcement.update({ where: { id: params.id }, data: { active: false } });
    await writeAdminAuditLog({ adminEmail, action: "archive", entityType: "announcement", entityId: announcement.id, before, after: announcement, request });
    return { announcement: serializeAdminAnnouncement(announcement) };
  });
}
