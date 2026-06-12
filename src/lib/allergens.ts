import type { MenuItem } from "@/data/menu";

export type AllergenStatus = "contains" | "mayContain" | "ask" | "notDeclared";

export type AllergenKey =
  | "wheatGluten"
  | "milk"
  | "egg"
  | "peanut"
  | "sesame"
  | "soy"
  | "treeNuts"
  | "crustacean"
  | "fish"
  | "mollusc"
  | "lupin"
  | "sulphites";

export type AllergenProfile = {
  itemId: string;
  allergens: Record<AllergenKey, AllergenStatus>;
  note: string;
};

export type AllergenRow = AllergenProfile & {
  itemName: string;
  categoryName: string;
};

export const ALLERGEN_COLUMNS: Array<{ key: AllergenKey; label: string; requiredName: string }> = [
  { key: "wheatGluten", label: "Wheat / gluten", requiredName: "wheat, gluten" },
  { key: "milk", label: "Milk", requiredName: "milk" },
  { key: "egg", label: "Egg", requiredName: "egg" },
  { key: "peanut", label: "Peanut", requiredName: "peanut" },
  { key: "sesame", label: "Sesame", requiredName: "sesame" },
  { key: "soy", label: "Soy", requiredName: "soy" },
  { key: "treeNuts", label: "Tree nuts", requiredName: "almond, cashew, pistachio and other tree nuts" },
  { key: "crustacean", label: "Crustacean", requiredName: "crustacean" },
  { key: "fish", label: "Fish", requiredName: "fish" },
  { key: "mollusc", label: "Mollusc", requiredName: "mollusc" },
  { key: "lupin", label: "Lupin", requiredName: "lupin" },
  { key: "sulphites", label: "Sulphites", requiredName: "sulphites" },
];

export const ALLERGEN_STATUS_LABELS: Record<AllergenStatus, string> = {
  contains: "Contains",
  mayContain: "May contain",
  ask: "Ask staff",
  notDeclared: "Not declared",
};

const emptyAllergens = makeAllergens();

const sharedKitchenNote = "Prepared in a shared kitchen. Confirm allergies with staff before ordering.";
const askStaffNote = "Ask staff before ordering. This item needs current kitchen confirmation.";

const profileOverrides: Record<string, Partial<Record<AllergenKey, AllergenStatus>> & { note?: string }> = {
  "chicken-65": { wheatGluten: "mayContain", milk: "mayContain", note: sharedKitchenNote },
  "chilli-chicken": { wheatGluten: "mayContain", soy: "contains", note: sharedKitchenNote },
  "chicken-manchuria": { wheatGluten: "mayContain", soy: "contains", note: sharedKitchenNote },
  "chilli-paneer": { wheatGluten: "mayContain", milk: "contains", soy: "contains", note: sharedKitchenNote },
  "paneer-65": { wheatGluten: "mayContain", milk: "contains", note: sharedKitchenNote },
  "gobi-65": { wheatGluten: "mayContain", note: sharedKitchenNote },
  "mirchi-ka-salan": { peanut: "contains", sesame: "contains", treeNuts: "mayContain", note: "Traditional salan commonly uses peanut and sesame." },
  "mirchi-ka-salan-small": { peanut: "contains", sesame: "contains", treeNuts: "mayContain", note: "Traditional salan commonly uses peanut and sesame." },
  "double-ka-meetha": { wheatGluten: "contains", milk: "contains", treeNuts: "mayContain", note: sharedKitchenNote },
  "gulab-jamun": { wheatGluten: "contains", milk: "contains", note: sharedKitchenNote },
  "qurbani-ka-meetha": { milk: "mayContain", treeNuts: "mayContain", note: sharedKitchenNote },
  "garlic-naan": { wheatGluten: "contains", milk: "contains", note: "Naan contains wheat and may be finished with dairy." },
  "plain-naan": { wheatGluten: "contains", milk: "mayContain", note: "Naan contains wheat. Confirm dairy-free needs with staff." },
  "butter-naan": { wheatGluten: "contains", milk: "contains", note: "Naan contains wheat and butter." },
  "mango-lassi": { milk: "contains", note: "Yoghurt-based drink." },
  "tea-large": { milk: "contains", note: "Milk tea. Ask staff about dairy-free options." },
  "raita-small": { milk: "contains", note: "Yoghurt side." },
  "chicken-veg-egg-noodles": { wheatGluten: "contains", egg: "ask", soy: "contains", note: "Choice item may include egg. Confirm selected protein and sauce." },
  "chicken-veg-egg-fried-rice": { egg: "ask", soy: "contains", note: "Choice item may include egg. Confirm selected protein and sauce." },
  "weekend-special-haleem": { wheatGluten: "contains", milk: "mayContain", note: "Haleem contains wheat and may be finished with ghee." },
  "tandoori-chicken-full": { milk: "contains", note: "Yoghurt marinade." },
};

const biryaniIds = [
  "half-bucket-mutton",
  "half-bucket-chicken",
  "bucket-biryani-half-vegetarian",
  "family-pack-chicken",
  "family-pack-mutton",
  "family-pack-veg",
  "chicken-dum-biryani-full",
  "nawabi-plate-serve-two",
  "mutton-dum-biryani-full",
  "chicken-65-biryani-full",
  "chicken-biryani-plate",
  "mutton-biryani-plate",
  "vegetable-dum-biryani-full",
  "vegetable-biryani-plate",
];

for (const id of biryaniIds) {
  profileOverrides[id] = {
    ...(profileOverrides[id] ?? {}),
    milk: profileOverrides[id]?.milk ?? "mayContain",
    peanut: profileOverrides[id]?.peanut ?? "mayContain",
    sesame: profileOverrides[id]?.sesame ?? "mayContain",
    note: "Biryani may be served with yoghurt raita and peanut-sesame salan. Ask staff if you need accompaniments removed.",
  };
}

const curryIds = ["talawa-gosh", "chicken-masala", "mutton-masala", "dum-ka-murag", "paya-plate"];

for (const id of curryIds) {
  profileOverrides[id] = {
    milk: "mayContain",
    treeNuts: "mayContain",
    note: "Curry recipes may use dairy, nuts or nut pastes depending on the batch. Confirm with staff.",
  };
}

export function getAllergenProfile(itemId: string): AllergenProfile {
  const override = profileOverrides[itemId];

  if (!override) {
    return {
      itemId,
      allergens: makeAllergens("ask"),
      note: askStaffNote,
    };
  }

  const { note, ...allergenOverrides } = override;

  return {
    itemId,
    allergens: { ...emptyAllergens, ...allergenOverrides },
    note: note ?? sharedKitchenNote,
  };
}

export function getAllergenRows(items: Array<MenuItem & { categoryName: string }>): AllergenRow[] {
  return items.map((item) => ({
    ...getAllergenProfile(item.id),
    itemName: item.name,
    categoryName: item.categoryName,
  }));
}

function makeAllergens(defaultStatus: AllergenStatus = "notDeclared"): Record<AllergenKey, AllergenStatus> {
  return ALLERGEN_COLUMNS.reduce(
    (allergens, column) => ({
      ...allergens,
      [column.key]: defaultStatus,
    }),
    {} as Record<AllergenKey, AllergenStatus>,
  );
}
