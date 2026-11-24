import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
    const adminHeaders = [
      { ...csp, value: csp.value.replace("form-action 'none'", "form-action 'self'") },
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
