import type { MetadataRoute } from "next";

import { RESTAURANT_CONFIG } from "@/config/restaurant";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${RESTAURANT_CONFIG.website}/sitemap.xml`,
  };
}
