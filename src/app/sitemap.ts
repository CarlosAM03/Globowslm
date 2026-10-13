import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // No current preview origin is asserted as a permanent commercial domain.
  return canonicalOrigin ? [{ url: canonicalOrigin, changeFrequency: "monthly", priority: 1 }] : [];
}
