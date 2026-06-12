export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TradingHours = {
  open: string;
  close: string;
};

export type RestaurantConfig = {
  name: string;
  tagline: string;
  suburb: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  googleMapsLink: string;
  googlePlaceId: string;
  orderingLink: string;
  reservationLink: string;
  clickAndCollectLink: string;
  qrCodeValue: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  hours: Record<DayKey, TradingHours>;
  cuisine: string;
  priceRange: string;
  heroVideo: string;
  heroImage: string;
  establishedYear: number;
  whyChooseUs: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
};

export const RESTAURANT_CONFIG = {
  name: "Pista House",
  tagline: "Sydney's Finest Hyderabadi Dum Biryani & Authentic Indian Cuisine",
  suburb: "Wentworthville",
  address: "Shop 1/69 Dunmore St, Wentworthville NSW 2145, Australia",
  phone: "+61 2 9680 9558",
  email: "info@pistahouse.com.au",
  website: "https://pistahouse.com.au",
  googleMapsLink: "https://maps.google.com/?q=Pista+House+Wentworthville",
  googlePlaceId: "ChIJAQDweL6iEmsRYu2hoAbrbR4",
  orderingLink: "https://www.doordash.com/store/pista-house-wentworthville-1027199/",
  reservationLink: "/reserve",
  clickAndCollectLink: "/order",
  qrCodeValue: "https://pistahouse.com.au/order",
  social: {
    facebook: "https://www.facebook.com/pistahousewest/",
    instagram: "https://instagram.com/pistahouse_wentworthville",
    tiktok: "",
  },
  hours: {
    monday: { open: "12:00", close: "22:00" },
    tuesday: { open: "12:00", close: "22:00" },
    wednesday: { open: "12:00", close: "22:00" },
    thursday: { open: "12:00", close: "22:00" },
    friday: { open: "12:00", close: "23:00" },
    saturday: { open: "11:00", close: "23:30" },
    sunday: { open: "11:00", close: "23:00" },
  },
  cuisine: "Hyderabadi · Indian · Halal",
  priceRange: "$$",
  heroVideo: "/videos/biryani-hero.mp4",
  heroImage: "/images/hero-biryani.png",
  establishedYear: 2018,
  whyChooseUs: [
    {
      icon: "🫙",
      title: "Authentic Recipes",
      desc: "Family recipes passed down three generations from Hyderabad",
    },
    {
      icon: "🌿",
      title: "Fresh Ingredients",
      desc: "Locally sourced produce, hand-ground spices, never frozen",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Friendly",
      desc: "Welcoming atmosphere for groups, families & special occasions",
    },
    {
      icon: "🕌",
      title: "100% Halal",
      desc: "Source-backed halal menu. Serving Sydney's Muslim community with pride",
    },
    {
      icon: "⚡",
      title: "Fast Delivery",
      desc: "Hot food in 30 min via DoorDash, UberEats & direct order",
    },
    {
      icon: "🏆",
      title: "Community Favourite",
      desc: "Western Sydney's much-loved biryani destination since 2018",
    },
  ],
} satisfies RestaurantConfig;
