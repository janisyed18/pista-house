import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminTable } from "@/lib/admin-tables";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tableUpdateSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  section: z.string().optional().or(z.literal("")),
  x: z.number().int(),
  y: z.number().int(),
  active: z.boolean(),
  sortOrder: z.number().int().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update tables" }, { status: 503 });
    }

    const body = tableUpdateSchema.parse(await request.json());
    const before = await prisma.diningTable.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Table not found" }, { status: 404 });
    }

    const table = await prisma.diningTable.update({
      where: { id: params.id },
      data: {
        name: body.name,
        capacity: body.capacity,
        section: body.section || null,
        x: body.x,
        y: body.y,
        active: body.active,
        sortOrder: body.sortOrder ?? null,
      },
    });

    await writeAdminAuditLog({ adminEmail, action: "update", entityType: "table", entityId: table.id, before, after: table, request });
    return { table: serializeAdminTable(table) };
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to archive tables" }, { status: 503 });
    }

    const before = await prisma.diningTable.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Table not found" }, { status: 404 });
    }

    const table = await prisma.diningTable.update({ where: { id: params.id }, data: { active: false } });
    await writeAdminAuditLog({ adminEmail, action: "archive", entityType: "table", entityId: table.id, before, after: table, request });
    return { table: serializeAdminTable(table) };
  });
}
