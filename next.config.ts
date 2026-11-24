import type { NextConfig } from "next";
import { parseMediaOrigin } from "./src/lib/cms/media-origin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.GLOBOWS_STANDALONE === "1" && { output: "standalone" as const }),
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    if (process.env.NODE_ENV === "production") headers.push({ key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'" });
    const baseline = [{ source: "/:path*", headers }];
    const csp = headers.find(({ key }) => key === "Content-Security-Policy");
    if (!csp) return baseline;
    let adminPolicy = csp.value.replace("form-action 'none'", "form-action 'self'");
    if (process.env.CMS_MEDIA_ORIGIN) {
      const media = parseMediaOrigin(process.env.CMS_MEDIA_ORIGIN, process.env.APP_ORIGIN ?? "");
      adminPolicy = adminPolicy.replace("img-src 'self' data: blob:", `img-src 'self' data: blob: ${media}`)
        .replace("connect-src 'self'", `connect-src 'self' ${media}`);
      adminPolicy += `; media-src 'self' ${media}`;
    }
    const adminHeaders = [
      { ...csp, value: adminPolicy },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      ...baseline,
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/cms/:path*", headers: adminHeaders },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
