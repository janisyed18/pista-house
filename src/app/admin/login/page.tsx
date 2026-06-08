import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="bg-background py-16">
      <div className="container">
        <Suspense fallback={<div className="mx-auto max-w-md rounded border border-black/8 bg-white p-6 text-sm font-black">Loading sign in...</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
