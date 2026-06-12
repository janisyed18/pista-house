import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { revalidateMenuSurfaces } from "@/lib/menu-revalidation";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  categorySlug: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  visible: z.boolean().default(true),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  weekendOnly: z.boolean().default(false),
});

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to create menu items" }, { status: 503 });
    }

    const body = createMenuItemSchema.parse(await request.json());
    const id = `custom-${slugify(body.name)}-${Date.now()}`;
    const item = await prisma.customMenuItem.create({
      data: {
        id,
        categorySlug: body.categorySlug,
        name: body.name,
        description: body.description,
        priceCents: Math.round(body.price * 100),
        imageUrl: body.imageUrl || null,
        tags: body.tags,
        visible: body.visible,
        available: body.available,
        popular: body.popular,
        weekendOnly: body.weekendOnly,
      },
    });

    await writeAdminAuditLog({
      adminEmail,
      action: "create",
      entityType: "menu_item",
      entityId: item.id,
      after: item,
      request,
    });
    revalidateMenuSurfaces();

    return { item };
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
