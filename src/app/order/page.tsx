import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderClient } from "@/components/order/OrderClient";
import { getMergedMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Click & Collect Order",
  description: "Order Pista House Wentworthville online for pickup and pay through Stripe Checkout.",
  alternates: { canonical: "/order" },
};

export const revalidate = 60;

export default async function OrderPage() {
  const menuCategories = await getMergedMenu();

  return (
    <section className="bg-background py-12 md:py-18">
      <div className="mx-auto w-full max-w-[1500px] px-4">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Click & Collect</p>
          <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Build Your Pickup Order</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal/72">Select dishes, choose ASAP or a scheduled pickup time, then pay online.</p>
        </div>
        <Suspense fallback={<div className="rounded border border-black/8 bg-white p-6 text-sm font-bold">Loading order form...</div>}>
          <OrderClient menuCategories={menuCategories} />
        </Suspense>
      </div>
    </section>
  );
}
