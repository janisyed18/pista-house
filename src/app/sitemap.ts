import type { MetadataRoute } from "next";

import { RESTAURANT_CONFIG } from "@/config/restaurant";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/menu", "/order", "/reserve", "/about", "/contact", "/privacy", "/accessibility"].map((path) => ({
    url: `${RESTAURANT_CONFIG.website}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
