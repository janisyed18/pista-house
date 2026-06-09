import { ALL_MENU_ITEMS, type MenuItem } from "@/data/menu";
import { formatCurrency } from "@/lib/hours";

export const SPICE_LEVELS = ["Mild", "Medium", "Spicy", "Extra Spicy"] as const;

export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  spiceLevel?: SpiceLevel;
  notes?: string;
};

export type OrderTotals = {
  subtotalCents: number;
  gstCents: number;
  totalCents: number;
  displaySubtotal: string;
  displayGst: string;
  displayTotal: string;
};

export function calculateOrderTotals(lines: CartLine[]): OrderTotals {
  const subtotalCents = lines.reduce((total, line) => {
    return total + Math.round(line.price * 100) * line.quantity;
  }, 0);
  const gstCents = Math.round(subtotalCents / 11);

  return {
    subtotalCents,
    gstCents,
    totalCents: subtotalCents,
    displaySubtotal: formatCents(subtotalCents),
    displayGst: formatCents(gstCents),
    displayTotal: formatCents(subtotalCents),
  };
}

export function menuItemToCartLine(
  item: MenuItem,
  quantity = 1,
  customization: { spiceLevel?: SpiceLevel; notes?: string } = {},
): CartLine {
  const normalizedNotes = normalizeLineNotes(customization.notes);

  return {
    id: getCartLineId(item.id, customization.spiceLevel, normalizedNotes),
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    quantity,
    spiceLevel: customization.spiceLevel,
    notes: normalizedNotes || undefined,
  };
}

export function getCartLineId(menuItemId: string, spiceLevel?: SpiceLevel, notes = "") {
  const normalizedNotes = normalizeLineNotes(notes);
  const suffix = [spiceLevel, normalizedNotes].filter(Boolean).join("|").toLowerCase();
  return suffix ? `${menuItemId}__${encodeURIComponent(suffix)}` : menuItemId;
}

export function normalizeLineNotes(notes?: string) {
  return notes?.replace(/\s+/g, " ").trim() ?? "";
}

export function formatCartLineCustomization(line: Pick<CartLine, "spiceLevel" | "notes">) {
  return [
    line.spiceLevel ? `Spice: ${line.spiceLevel}` : null,
    line.notes ? `Note: ${line.notes}` : null,
  ].filter(Boolean).join(" · ");
}

export function formatCents(cents: number) {
  return formatCurrency(cents / 100);
}

export function getDefaultCartLines() {
  return ALL_MENU_ITEMS.filter((item) =>
    ["chicken-dum-biryani-full", "chicken-65"].includes(item.id),
  ).map((item) => menuItemToCartLine(item));
}
