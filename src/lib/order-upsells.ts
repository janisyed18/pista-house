import type { MergedMenuItem } from "@/lib/menu";
import type { CartLine } from "@/lib/order";

const biryaniPairings = ["raita-small", "mirchi-ka-salan-small", "mango-lassi", "gulab-jamun"];
const curryPairings = ["garlic-naan", "butter-naan", "plain-naan", "mango-lassi"];
const savouryPairings = ["gulab-jamun", "mango-lassi", "soft-drinks-cans"];

export function getCartUpsellSuggestions(lines: CartLine[], menuItems: MergedMenuItem[], limit = 4) {
  if (!lines.length) {
    return [];
  }

  const existingMenuItemIds = new Set(lines.map((line) => line.menuItemId ?? line.id));
  const cartText = lines.map((line) => `${line.menuItemId} ${line.name}`.toLowerCase()).join(" ");
  const suggestionIds = new Set<string>();

  if (cartText.includes("biryani") || cartText.includes("bucket") || cartText.includes("nawabi")) {
    biryaniPairings.forEach((id) => suggestionIds.add(id));
  }

  if (cartText.includes("masala") || cartText.includes("curry") || cartText.includes("salan") || cartText.includes("murag")) {
    curryPairings.forEach((id) => suggestionIds.add(id));
  }

  if (cartText.includes("chicken") || cartText.includes("mutton") || cartText.includes("paneer") || cartText.includes("biryani")) {
    savouryPairings.forEach((id) => suggestionIds.add(id));
  }

  return Array.from(suggestionIds)
    .filter((id) => !existingMenuItemIds.has(id))
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item): item is MergedMenuItem => Boolean(item))
    .filter((item) => item.available)
    .slice(0, limit);
}
