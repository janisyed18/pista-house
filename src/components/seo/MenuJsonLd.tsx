import type { MergedMenuCategory } from "@/lib/menu";

export function MenuJsonLd({ menuCategories }: { menuCategories: MergedMenuCategory[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Pista House Wentworthville Menu",
    hasMenuSection: menuCategories.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        offers: {
          "@type": "Offer",
          price: item.price.toFixed(2),
          priceCurrency: "AUD",
        },
      })),
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
