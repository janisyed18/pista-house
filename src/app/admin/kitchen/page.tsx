import type { Metadata } from "next";
import Link from "next/link";

import { KitchenDisplay } from "@/components/admin/KitchenDisplay";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kitchen Display",
  robots: { index: false, follow: false },
};

export default async function AdminKitchenPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return (
        <section className="grid min-h-screen place-items-center bg-background px-4 py-16">
          <div className="w-full max-w-xl rounded border border-black/8 bg-white p-6 text-center shadow-lift">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Admin only</p>
            <h1 className="font-display text-5xl font-bold text-ink">Kitchen Display Locked</h1>
            <p className="mt-4 text-sm leading-6 text-charcoal/68">Sign in as the configured admin to view live kitchen orders.</p>
            <Link href="/admin/login?callbackUrl=/admin/kitchen" className="mt-6 inline-flex rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white">
              Sign in
            </Link>
          </div>
        </section>
      );
    }

    throw error;
  }

  return <KitchenDisplay />;
}
