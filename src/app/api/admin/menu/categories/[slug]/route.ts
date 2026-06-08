import { NextResponse } from "next/server";
import { z } from "zod";

import { MENU_CATEGORIES } from "@/data/menu";
import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { revalidateMenuSurfaces } from "@/lib/menu-revalidation";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categoryUpdateSchema = z.object({
  name: z.string().min(1),
  visible: z.boolean(),
  sortOrder: z.number().int().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database is required to update menu categories" }, { status: 503 });
    }

    const body = categoryUpdateSchema.parse(await request.json());
    const before = await prisma.menuCategoryOverride.findUnique({ where: { slug: params.slug } });
    const seedCategory = MENU_CATEGORIES.find((category) => category.slug === params.slug);

    if (!before && !seedCategory) {
      return NextResponse.json({ error: "Menu category not found" }, { status: 404 });
    }

    const category = await prisma.menuCategoryOverride.upsert({
      where: { slug: params.slug },
      create: {
        slug: params.slug,
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
      action: "update",
      entityType: "menu_category",
      entityId: category.slug,
      before: before ?? seedCategory,
      after: category,
      request,
    });
    revalidateMenuSurfaces();

    return { category };
  });
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database is required to delete menu categories" }, { status: 503 });
    }

    const before = await prisma.menuCategoryOverride.findUnique({ where: { slug: params.slug } });
    const seedCategory = MENU_CATEGORIES.find((category) => category.slug === params.slug);

    if (!before && !seedCategory) {
      return NextResponse.json({ error: "Menu category not found" }, { status: 404 });
    }

    const category = await prisma.menuCategoryOverride.upsert({
      where: { slug: params.slug },
      create: {
        slug: params.slug,
        name: seedCategory?.name ?? before?.name ?? params.slug,
        visible: false,
        sortOrder: before?.sortOrder ?? null,
      },
      update: {
        visible: false,
      },
    });

    await writeAdminAuditLog({
      adminEmail,
      action: "hide",
      entityType: "menu_category",
      entityId: category.slug,
      before: before ?? seedCategory,
      after: category,
      request,
    });
    revalidateMenuSurfaces();

    return { ok: true };
  });
}
