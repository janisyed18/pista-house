import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { revalidateMenuSurfaces } from "@/lib/menu-revalidation";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categorySchema = z.object({
  slug: z.string().min(1).transform(slugify),
  name: z.string().min(1),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().nullable().optional(),
});

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to create menu categories" }, { status: 503 });
    }

    const body = categorySchema.parse(await request.json());
    const category = await prisma.menuCategoryOverride.upsert({
      where: { slug: body.slug },
      create: {
        slug: body.slug,
        name: body.name,
        visible: body.visible,
        sortOrder: body.sortOrder ?? null,
      },
      update: {
        name: body.name,
        visible: body.visible,
        sortOrder: body.sortOrder ?? null,
      },
    });

    await writeAdminAuditLog({
      adminEmail,
      action: "upsert",
      entityType: "menu_category",
      entityId: category.slug,
      after: category,
      request,
    });
    revalidateMenuSurfaces();

    return { category };
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
