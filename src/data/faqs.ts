export type RestaurantFaq = {
  question: string;
  answer: string;
};

export const RESTAURANT_FAQS: RestaurantFaq[] = [
  {
    question: "Is Pista House Wentworthville halal?",
    answer:
      "Pista House Wentworthville is publicly listed as a fully halal Hyderabadi restaurant. Guests who need specific supplier or zabihah details should confirm with the team before ordering.",
  },
  {
    question: "Can I order click and collect online?",
    answer:
      "Yes. Use the Collect & Pay order page to select dishes, choose a pickup time and pay online. The restaurant can then update your order status for pickup.",
  },
  {
    question: "Do you take table reservations?",
    answer:
      "Yes. Guests can request a table through the reservation page. The restaurant reviews booking requests and can confirm or follow up with the guest.",
  },
  {
    question: "Do you offer catering for events?",
    answer:
      "Yes. The catering request form collects event date, guest count, budget, menu notes and contact details so the team can prepare a quote.",
  },
  {
    question: "Where is Pista House Wentworthville located?",
    answer:
      "The restaurant is at Shop 1/69 Dunmore St, Wentworthville NSW 2145, Australia, a short walk from Wentworthville Station.",
  },
  {
    question: "How should guests with allergies order?",
    answer:
      "Guests with allergies should review the allergen matrix and confirm with staff before ordering because food is prepared in a shared kitchen and recipes or suppliers can change.",
  },
];
