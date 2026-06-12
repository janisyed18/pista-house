import { MENU_CATEGORIES, type DietaryTag, type MenuCategory, type MenuItem } from "@/data/menu";
import { hasDatabase, prisma } from "@/lib/prisma";

const dietaryTags: DietaryTag[] = ["V", "VG", "H", "S", "GF"];

export type MenuItemSource = "seed" | "custom";

export type MergedMenuItem = MenuItem & {
  category: string;
  categoryName: string;
  source: MenuItemSource;
  visible: boolean;
  available: boolean;
  sortOrder?: number | null;
};

export type MergedMenuCategory = Omit<MenuCategory, "slug" | "items"> & {
  slug: string;
  visible: boolean;
  sortOrder?: number | null;
  items: MergedMenuItem[];
};

export type MenuItemOverrideInput = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  description: string;
  tags: string[];
  categorySlug?: string | null;
  popular: boolean;
  weekendOnly: boolean;
  sortOrder?: number | null;
  visible: boolean;
  available: boolean;
};

export type CustomMenuItemInput = MenuItemOverrideInput & {
  categorySlug: string;
};

export type MenuCategoryOverrideInput = {
  slug: string;
  name: string;
  visible: boolean;
  sortOrder?: number | null;
};

export type MergeMenuDataInput = {
  seedCategories: MenuCategory[];
  itemOverrides: MenuItemOverrideInput[];
  customItems: CustomMenuItemInput[];
  categoryOverrides: MenuCategoryOverrideInput[];
  includeHidden?: boolean;
};

export async function getMergedMenu({ includeHidden = false }: { includeHidden?: boolean } = {}) {
  if (!hasDatabase()) {
    return mergeMenuData({
      seedCategories: MENU_CATEGORIES,
      itemOverrides: [],
      customItems: [],
      categoryOverrides: [],
      includeHidden,
    });
  }

  const [itemOverrides, customItems, categoryOverrides] = await Promise.all([
    prisma.menuItemOverride.findMany(),
    prisma.customMenuItem.findMany(),
    prisma.menuCategoryOverride.findMany(),
  ]);

  return mergeMenuData({
    seedCategories: MENU_CATEGORIES,
    itemOverrides,
    customItems,
    categoryOverrides,
    includeHidden,
  });
}

export function flattenMenu(categories: MergedMenuCategory[]) {
  return categories.flatMap((category) => category.items);
}

export function mergeMenuData({
  seedCategories,
  itemOverrides,
  customItems,
  categoryOverrides,
  includeHidden = false,
}: MergeMenuDataInput): MergedMenuCategory[] {
  const categoryMeta = new Map<string, { name: string; visible: boolean; sortOrder: number | null; feature?: "signature" }>();
  seedCategories.forEach((category, index) => {
    categoryMeta.set(category.slug, {
      name: category.name,
      visible: true,
      sortOrder: index,
      feature: category.feature,
    });
  });

  categoryOverrides.forEach((override) => {
    const current = categoryMeta.get(override.slug);
    categoryMeta.set(override.slug, {
      name: override.name,
      visible: override.visible,
      sortOrder: override.sortOrder ?? current?.sortOrder ?? categoryMeta.size,
      feature: current?.feature,
    });
  });

  customItems.forEach((item) => {
    if (!categoryMeta.has(item.categorySlug)) {
      categoryMeta.set(item.categorySlug, {
        name: titleFromSlug(item.categorySlug),
        visible: true,
        sortOrder: categoryMeta.size,
      });
    }
  });

  const overridesById = new Map(itemOverrides.map((override) => [override.id, override]));
  const itemsByCategory = new Map<string, MergedMenuItem[]>();

  seedCategories.forEach((category) => {
    category.items.forEach((seedItem, index) => {
      const override = overridesById.get(seedItem.id);
      const visible = override?.visible ?? true;
      const available = override?.available ?? true;
      if (!includeHidden && !visible) {
        return;
      }

      const categorySlug = override?.categorySlug ?? category.slug;
      const meta = categoryMeta.get(categorySlug) ?? {
        name: titleFromSlug(categorySlug),
        visible: true,
        sortOrder: categoryMeta.size,
      };
      if (!includeHidden && !meta.visible) {
        return;
      }

      const item: MergedMenuItem = {
        ...seedItem,
        name: override?.name ?? seedItem.name,
        description: override?.description ?? seedItem.description,
        price: centsToAud(override?.priceCents) ?? seedItem.price,
        imageUrl: override?.imageUrl || seedItem.imageUrl,
        dietaryTags: override ? normalizeTags(override.tags) : seedItem.dietaryTags,
        popular: override?.popular ?? seedItem.popular,
        weekendOnly: override?.weekendOnly ?? seedItem.weekendOnly,
        category: categorySlug,
        categoryName: meta.name,
        source: "seed",
        visible,
        available,
        sortOrder: override?.sortOrder ?? index,
      };
      pushItem(itemsByCategory, categorySlug, item);
    });
  });

  customItems.forEach((customItem, index) => {
    if (!includeHidden && !customItem.visible) {
      return;
    }
    const meta = categoryMeta.get(customItem.categorySlug) ?? {
      name: titleFromSlug(customItem.categorySlug),
      visible: true,
      sortOrder: categoryMeta.size,
    };
    if (!includeHidden && !meta.visible) {
      return;
    }

    pushItem(itemsByCategory, customItem.categorySlug, {
      id: customItem.id,
      name: customItem.name,
      description: customItem.description,
      price: customItem.priceCents / 100,
      dietaryTags: normalizeTags(customItem.tags),
      popular: customItem.popular,
      imageUrl: customItem.imageUrl ?? "",
      weekendOnly: customItem.weekendOnly,
      category: customItem.categorySlug,
      categoryName: meta.name,
      source: "custom",
      visible: customItem.visible,
      available: customItem.available,
      sortOrder: customItem.sortOrder ?? index,
    });
  });

  return Array.from(categoryMeta.entries())
    .map(([slug, meta]) => ({
      slug,
      name: meta.name,
      feature: meta.feature,
      visible: meta.visible,
      sortOrder: meta.sortOrder,
      items: sortItems(itemsByCategory.get(slug) ?? []),
    }))
    .filter((category) => (includeHidden || category.visible) && (includeHidden || category.items.length > 0))
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.name.localeCompare(b.name));
}

export function normalizeTags(tags: string[]): DietaryTag[] {
  return tags.filter((tag): tag is DietaryTag => dietaryTags.includes(tag as DietaryTag));
}

function pushItem(itemsByCategory: Map<string, MergedMenuItem[]>, categorySlug: string, item: MergedMenuItem) {
  const items = itemsByCategory.get(categorySlug) ?? [];
  items.push(item);
  itemsByCategory.set(categorySlug, items);
}

function sortItems(items: MergedMenuItem[]) {
  return [...items].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.name.localeCompare(b.name));
}

function centsToAud(cents: number | undefined) {
  return typeof cents === "number" ? cents / 100 : undefined;
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
