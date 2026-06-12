import { NextResponse } from "next/server";
import { z } from "zod";

import { MENU_CATEGORIES } from "@/data/menu";
import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { revalidateMenuSurfaces } from "@/lib/menu-revalidation";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  categorySlug: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  visible: z.boolean(),
  available: z.boolean(),
  popular: z.boolean(),
  weekendOnly: z.boolean(),
  sortOrder: z.number().int().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database is required to update menu items" }, { status: 503 });
    }

    const body = updateMenuItemSchema.parse(await request.json());
    const customBefore = await prisma.customMenuItem.findUnique({ where: { id: params.id } });

    if (customBefore) {
      const item = await prisma.customMenuItem.update({
        where: { id: params.id },
        data: toMenuWriteData(body),
      });
      await writeAdminAuditLog({ adminEmail, action: "update", entityType: "menu_item", entityId: item.id, before: customBefore, after: item, request });
      revalidateMenuSurfaces();
      return { item, source: "custom" };
    }

    const seed = findSeedItem(params.id);
    if (!seed) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const before = await prisma.menuItemOverride.findUnique({ where: { id: params.id } });
    const item = await prisma.menuItemOverride.upsert({
      where: { id: params.id },
      create: {
        id: params.id,
        ...toMenuWriteData(body),
      },
      update: toMenuWriteData(body),
    });
    await writeAdminAuditLog({ adminEmail, action: "update", entityType: "menu_item", entityId: item.id, before: before ?? seed, after: item, request });
    revalidateMenuSurfaces();
    return { item, source: "seed" };
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database is required to delete menu items" }, { status: 503 });
    }

    const custom = await prisma.customMenuItem.findUnique({ where: { id: params.id } });
    if (custom) {
      await prisma.customMenuItem.delete({ where: { id: params.id } });
      await writeAdminAuditLog({ adminEmail, action: "delete", entityType: "menu_item", entityId: params.id, before: custom, request });
      revalidateMenuSurfaces();
      return { ok: true };
    }

    const seed = findSeedItem(params.id);
    if (!seed) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const categorySlug = seed.category;
    const hidden = await prisma.menuItemOverride.upsert({
      where: { id: params.id },
      create: {
        id: params.id,
        name: seed.name,
        description: seed.description,
        priceCents: Math.round(seed.price * 100),
        imageUrl: seed.imageUrl,
        tags: seed.dietaryTags,
        categorySlug,
        popular: seed.popular,
        weekendOnly: seed.weekendOnly ?? false,
        visible: false,
        available: true,
      },
      update: { visible: false },
    });
    await writeAdminAuditLog({ adminEmail, action: "hide", entityType: "menu_item", entityId: params.id, before: seed, after: hidden, request });
    revalidateMenuSurfaces();
    return { ok: true };
  });
}

function toMenuWriteData(body: z.infer<typeof updateMenuItemSchema>) {
  return {
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
    sortOrder: body.sortOrder ?? null,
  };
}

function findSeedItem(id: string) {
  return MENU_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.slug, categoryName: category.name })),
  ).find((item) => item.id === id);
}
