"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { RestaurantJsonLd } from "@/components/seo/RestaurantJsonLd";
import { isAdminRoute } from "@/lib/admin-routes";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  if (isAdmin) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <AnnouncementBanner />
      <main id="main-content">{children}</main>
      <Footer />
      <RestaurantJsonLd />
    </>
  );
}
