export type DietaryTag = "V" | "VG" | "H" | "S" | "GF";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  dietaryTags: DietaryTag[];
  popular: boolean;
  imageUrl: string;
  weekendOnly?: boolean;
};

export type MenuCategorySlug =
  | "starters"
  | "curries"
  | "desserts"
  | "naans"
  | "drinks"
  | "extras"
  | "takeaway"
  | "plates";

export type MenuCategory = {
  slug: MenuCategorySlug;
  name: string;
  feature?: "signature";
  items: MenuItem[];
};

const IMAGE = {
  chickenBiryani:
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
  muttonBiryani:
    "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=80",
  vegetableBiryani:
    "https://images.unsplash.com/photo-1697155406055-2db32d47ca07?auto=format&fit=crop&w=900&q=80",
  chicken65:
    "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?auto=format&fit=crop&w=900&q=80",
  paneer65: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=900&q=80",
  curry: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
  mirchiSalan:
    "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?auto=format&fit=crop&w=900&q=80",
  naan: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
  doubleKaMeetha: "https://images.unsplash.com/photo-1569954432565-ba73dcd5b9f2?auto=format&fit=crop&w=900&q=80",
  gulabJamun:
    "https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?auto=format&fit=crop&w=900&q=80",
  mangoLassi: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80",
  chai: "https://images.unsplash.com/photo-1583836632332-53825ce55a03?auto=format&fit=crop&w=900&q=80",
  noodles: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
  friedRice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  tandoori: "https://images.unsplash.com/photo-1563310761-f8d8ed164063?auto=format&fit=crop&w=900&q=80",
  softDrink: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80",
};

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    slug: "starters",
    name: "Starters",
    items: [
      {
        id: "chicken-65",
        name: "Chicken 65",
        price: 22,
        description: "Crispy double-fried chicken in a fiery red chilli marinade.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.chicken65,
      },
      {
        id: "chilli-chicken",
        name: "Chilli Chicken",
        price: 22,
        description: "Indo-Chinese chicken tossed with chilli, peppers and spring onion.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.chicken65,
      },
      {
        id: "chicken-manchuria",
        name: "Chicken Manchuria",
        price: 22,
        description: "Chicken Manchuria tossed in a savoury Indo-Chinese sauce.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.chicken65,
      },
      {
        id: "chilli-paneer",
        name: "Chilli Paneer",
        price: 20,
        description: "Paneer cubes tossed with chilli, capsicum and Indo-Chinese sauce.",
        dietaryTags: ["V", "S"],
        popular: false,
        imageUrl: IMAGE.paneer65,
      },
      {
        id: "paneer-65",
        name: "Paneer 65",
        price: 20,
        description: "Paneer cubes fried with curry leaves, chilli and house spice blend.",
        dietaryTags: ["V", "S"],
        popular: false,
        imageUrl: IMAGE.paneer65,
      },
      {
        id: "gobi-65",
        name: "Gobi 65",
        price: 20,
        description: "Crisp cauliflower bites tossed with curry leaves and red chilli.",
        dietaryTags: ["V", "S"],
        popular: false,
        imageUrl: IMAGE.paneer65,
      },
    ],
  },
  {
    slug: "curries",
    name: "Curries",
    items: [
      {
        id: "talawa-gosh",
        name: "Talawa Gosh",
        price: 26,
        description: "Hyderabadi-style pan-fried mutton with chilli and house spices.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.curry,
      },
      {
        id: "chicken-masala",
        name: "Chicken Masala",
        price: 22,
        description: "Chicken simmered in a rich onion-tomato masala gravy.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.curry,
      },
      {
        id: "mutton-masala",
        name: "Mutton Masala",
        price: 22,
        description: "Tender mutton cooked with warming masala and slow gravy.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.curry,
      },
      {
        id: "dum-ka-murag",
        name: "Dum Ka Murag",
        price: 22,
        description: "Dum-style chicken curry with aromatic spices and rich gravy.",
        dietaryTags: ["H"],
        popular: false,
        imageUrl: IMAGE.curry,
      },
      {
        id: "mirchi-ka-salan",
        name: "Mirchi Ka Salan",
        price: 24,
        description: "Hyderabadi chilli and peanut-sesame curry, a biryani classic.",
        dietaryTags: ["V", "S"],
        popular: false,
        imageUrl: IMAGE.mirchiSalan,
      },
    ],
  },
  {
    slug: "desserts",
    name: "Desserts",
    items: [
      {
        id: "double-ka-meetha",
        name: "Double Ka Meetha",
        price: 11,
        description: "Classic Hyderabadi bread pudding with cardamom and rose.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.doubleKaMeetha,
      },
      {
        id: "gulab-jamun",
        name: "Gulab Jamun",
        price: 9,
        description: "Soft milk dumplings soaked in warm cardamom syrup.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.gulabJamun,
      },
      {
        id: "qurbani-ka-meetha",
        name: "Qurbani Ka Meetha",
        price: 11,
        description: "Hyderabadi apricot dessert finished rich and sweet.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.gulabJamun,
      },
    ],
  },
  {
    slug: "naans",
    name: "Naans",
    items: [
      {
        id: "garlic-naan",
        name: "Garlic Naan",
        price: 8,
        description: "Tandoor naan topped with garlic, coriander and butter.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.naan,
      },
      {
        id: "plain-naan",
        name: "Plain Naan",
        price: 6,
        description: "Soft tandoor-baked naan, ideal for curries and salan.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.naan,
      },
      {
        id: "butter-naan",
        name: "Butter Naan",
        price: 7,
        description: "Fresh naan finished with a glossy butter brush.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.naan,
      },
    ],
  },
  {
    slug: "drinks",
    name: "Drinks",
    items: [
      {
        id: "mango-lassi",
        name: "Mango Lassi",
        price: 9,
        description: "Chilled mango yoghurt lassi, creamy and sweet.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.mangoLassi,
      },
      {
        id: "tea-large",
        name: "Tea Large",
        price: 6,
        description: "Large hot tea brewed with milk and warming spices.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.chai,
      },
      {
        id: "soft-drinks-cans",
        name: "Soft Drinks Cans",
        price: 4.5,
        description: "Chilled canned soft drinks.",
        dietaryTags: [],
        popular: false,
        imageUrl: IMAGE.softDrink,
      },
    ],
  },
  {
    slug: "extras",
    name: "Extra's Small",
    items: [
      {
        id: "raita-small",
        name: "Raita",
        price: 2,
        description: "Cooling yoghurt side served in a small portion.",
        dietaryTags: ["V", "GF"],
        popular: false,
        imageUrl: IMAGE.mirchiSalan,
      },
      {
        id: "mirchi-ka-salan-small",
        name: "Mirchi Ka Salan",
        price: 2,
        description: "Small serve of Hyderabadi chilli salan for biryani.",
        dietaryTags: ["V", "S"],
        popular: false,
        imageUrl: IMAGE.mirchiSalan,
      },
    ],
  },
  {
    slug: "takeaway",
    name: "Take Away Only",
    items: [
      {
        id: "half-bucket-mutton",
        name: "Half Bucket Mutton",
        price: 120,
        description: "Large takeaway mutton biryani bucket for sharing.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.muttonBiryani,
      },
      {
        id: "half-bucket-chicken",
        name: "Half Bucket Chicken",
        price: 120,
        description: "Large takeaway chicken biryani bucket for sharing.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.chickenBiryani,
      },
      {
        id: "bucket-biryani-half-vegetarian",
        name: "Bucket Biryani Half Vegetarian",
        price: 100,
        description: "Large vegetarian biryani bucket for takeaway groups.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.vegetableBiryani,
      },
      {
        id: "family-pack-chicken",
        name: "Family Pack Chicken",
        price: 65,
        description: "Chicken biryani family pack for group pickup orders.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.chickenBiryani,
      },
      {
        id: "family-pack-mutton",
        name: "Family Pack Mutton",
        price: 65,
        description: "Mutton biryani family pack for group pickup orders.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.muttonBiryani,
      },
      {
        id: "family-pack-veg",
        name: "Family Pack Veg",
        price: 60,
        description: "Vegetable biryani family pack for group pickup orders.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.vegetableBiryani,
      },
    ],
  },
  {
    slug: "plates",
    name: "Plates",
    feature: "signature",
    items: [
      {
        id: "chicken-dum-biryani-full",
        name: "Chicken Dum Biryani Full",
        price: 25,
        description: "Slow-cooked chicken pieces layered with fragrant basmati, saffron and fried onions.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.chickenBiryani,
      },
      {
        id: "nawabi-plate-serve-two",
        name: "Nawabi Plate Serve Two",
        price: 55,
        description: "Share plate of biryani and sides made for two hungry guests.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.chickenBiryani,
      },
      {
        id: "mutton-dum-biryani-full",
        name: "Mutton Dum Biryani Full",
        price: 25,
        description: "Dum-cooked mutton layered with saffron rice and whole spices.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.muttonBiryani,
      },
      {
        id: "chicken-65-biryani-full",
        name: "Chicken 65 Biryani Full",
        price: 25,
        description: "Biryani full serve topped with spicy Chicken 65 pieces.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.chicken65,
      },
      {
        id: "chicken-veg-egg-noodles",
        name: "Chicken, Veg or Egg Noodles",
        price: 22,
        description: "Indo-Chinese noodles with your choice of chicken, veg or egg.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.noodles,
      },
      {
        id: "chicken-biryani-plate",
        name: "Chicken Biryani Plate",
        price: 20,
        description: "Aromatic chicken biryani plate with raita and salan.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.chickenBiryani,
      },
      {
        id: "mutton-biryani-plate",
        name: "Mutton Biryani Plate",
        price: 20,
        description: "Tender mutton and long-grain basmati in classic Hyderabadi style.",
        dietaryTags: ["H", "S"],
        popular: true,
        imageUrl: IMAGE.muttonBiryani,
      },
      {
        id: "chicken-veg-egg-fried-rice",
        name: "Chicken, Veg or Egg Fried Rice",
        price: 22,
        description: "Indo-Chinese fried rice with your choice of chicken, veg or egg.",
        dietaryTags: ["H"],
        popular: false,
        imageUrl: IMAGE.friedRice,
      },
      {
        id: "chicken-65-plate",
        name: "Chicken 65 Plate",
        price: 20,
        description: "Chicken 65 plate served hot with biryani-style accompaniments.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.chicken65,
      },
      {
        id: "vegetable-dum-biryani-full",
        name: "Vegetable Dum Biryani Full",
        price: 25,
        description: "Seasonal vegetables and basmati sealed together with saffron and herbs.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.vegetableBiryani,
      },
      {
        id: "paya-plate",
        name: "Paya Plate",
        price: 25,
        description: "Slow-cooked paya plate with warming Hyderabadi spices.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.curry,
      },
      {
        id: "vegetable-biryani-plate",
        name: "Vegetable Biryani Plate",
        price: 20,
        description: "Vegetable biryani plate with raita and salan.",
        dietaryTags: ["V"],
        popular: false,
        imageUrl: IMAGE.vegetableBiryani,
      },
      {
        id: "weekend-special-haleem",
        name: "Weekend Special Haleem",
        price: 25,
        description: "Weekend wheat, lentil and meat haleem finished with ghee.",
        dietaryTags: ["H"],
        popular: true,
        weekendOnly: true,
        imageUrl: IMAGE.curry,
      },
      {
        id: "tandoori-chicken-full",
        name: "Tandoori Chicken Full",
        price: 30,
        description: "Full tandoori chicken roasted with yoghurt and spice marinade.",
        dietaryTags: ["H", "S"],
        popular: false,
        imageUrl: IMAGE.tandoori,
      },
    ],
  },
];

export const FEATURED_ITEM_IDS = ["chicken-dum-biryani-full", "chicken-65", "nawabi-plate-serve-two"];

export const ALL_MENU_ITEMS = MENU_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({ ...item, category: category.slug, categoryName: category.name })),
);

export function getMenuItem(id: string) {
  return ALL_MENU_ITEMS.find((item) => item.id === id);
}
