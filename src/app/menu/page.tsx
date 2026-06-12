import type { Metadata } from "next";
import Link from "next/link";

import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { MenuJsonLd } from "@/components/seo/MenuJsonLd";
import { getMergedMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Full Menu",
  description: "Explore plates, starters, curries, naans, desserts and drinks at Pista House Wentworthville.",
  alternates: { canonical: "/menu" },
};

export const revalidate = 60;

export default async function MenuPage() {
  const menuCategories = await getMergedMenu();

  return (
    <section className="bg-background py-12 md:py-18">
      <div className="container">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Full Menu</p>
          <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Hyderabadi Classics, Ready to Order</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal/72">
            Menu prices and availability subject to change. Images are illustrative only.
          </p>
          <Link href="/allergens" className="mt-5 inline-flex rounded border border-burgundy-900/15 bg-white px-4 py-3 text-sm font-black text-burgundy-700 shadow-sm transition hover:border-burgundy-700">
            View allergen matrix
          </Link>
        </div>
        <MenuExplorer menuCategories={menuCategories} />
      </div>
      <MenuJsonLd menuCategories={menuCategories} />
    </section>
  );
}
