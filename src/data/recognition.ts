export type RecognitionItem = {
  label: string;
  title: string;
  description: string;
  href: string;
};

export const RECOGNITION_ITEMS: RecognitionItem[] = [
  {
    label: "Dining guide listing",
    title: "Australian Good Food Guide",
    description: "Listed in AGFG's Wentworthville restaurant directory.",
    href: "https://www.agfg.com.au/restaurant/pista-house-west-69735",
  },
  {
    label: "Traveller review page",
    title: "Tripadvisor",
    description: "Public review profile for the Wentworthville restaurant.",
    href: "https://www.tripadvisor.com/Restaurant_Review-g1129804-d25527740-Reviews-Pista_House-Wentworthville_Holroyd_Greater_Sydney_New_South_Wales.html",
  },
  {
    label: "Halal dining guide",
    title: "HalalHQ",
    description: "Listed as a fully halal Hyderabadi dining option.",
    href: "https://halalhq.io/au/nsw/wentworthville/restaurants/pista-house",
  },
];
