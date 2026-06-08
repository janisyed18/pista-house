import { ALL_MENU_ITEMS, type MenuItem } from "@/data/menu";
import { formatCurrency } from "@/lib/hours";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

export function menuItemToCartLine(item: MenuItem, quantity = 1): CartLine {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity,
  };
}

export function formatCents(cents: number) {
  return formatCurrency(cents / 100);
}

export function getDefaultCartLines() {
  return ALL_MENU_ITEMS.filter((item) =>
    ["chicken-dum-biryani-full", "chicken-65"].includes(item.id),
  ).map((item) => menuItemToCartLine(item));
}
