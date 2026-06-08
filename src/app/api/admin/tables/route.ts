import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { demoAdminTables, serializeAdminTable } from "@/lib/admin-tables";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  section: z.string().optional().or(z.literal("")),
  x: z.number().int().default(0),
  y: z.number().int().default(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().nullable().optional(),
});

export async function GET() {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      return { tables: demoAdminTables(), demo: true };
    }

    const tables = await prisma.diningTable.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    return { tables: tables.map(serializeAdminTable), demo: false };
  });
}

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to save tables" }, { status: 503 });
    }

    const body = tableSchema.parse(await request.json());
    const table = await prisma.diningTable.create({
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

    await writeAdminAuditLog({ adminEmail, action: "create", entityType: "table", entityId: table.id, after: table, request });
    return { table: serializeAdminTable(table) };
  });
}
