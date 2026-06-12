import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <section className="bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-xl rounded border border-black/8 bg-white p-6 text-center shadow-lift">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Admin only</p>
            <h1 className="font-display text-5xl font-bold text-ink">Protected Dashboard</h1>
            <p className="mt-4 text-sm leading-6 text-charcoal/68">
              Sign in with the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD` credentials to manage orders, bookings, menu and config.
            </p>
            <Link href="/admin/login?callbackUrl=/admin" className="mt-6 inline-flex rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-black/8 pb-5">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-saffron-700">Admin Dashboard</p>
            <h1 className="font-display text-4xl font-bold leading-none text-ink md:text-5xl">Restaurant Operations</h1>
          </div>
          <div className="grid gap-3 sm:justify-items-end">
            <p className="max-w-xl text-sm font-bold leading-6 text-charcoal/62 sm:text-right">
              Manage orders, reservations, QR pickup, tables, promotions, catering and audit reporting from one workspace.
            </p>
            <Link href="/admin/kitchen" className="inline-flex min-h-11 items-center justify-center rounded bg-burgundy-900 px-4 text-sm font-black text-white">
              Open Kitchen Display
            </Link>
          </div>
        </div>
        <AdminDashboard />
      </div>
    </section>
  );
}
