import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Allow fetching the document so crawlers can read its noindex directive.
  // This is crawl permission, not authorization to index the RC.
  return { rules: { userAgent: "*", allow: "/" } };
}
