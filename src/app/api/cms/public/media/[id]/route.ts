import type { NextRequest } from "next/server";
import { getCmsConfig } from "@/lib/cms/auth-server";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const forwarded = ["content-type", "content-length", "content-range", "accept-ranges"];
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

async function handle(request: NextRequest, context: RouteContext<"/api/cms/public/media/[id]">) {
  const { id } = await context.params;
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  if (!uuid.test(id) || request.nextUrl.searchParams.size) return new Response(null, { status: 404, headers });
  try {
    const { apiOrigin } = getCmsConfig();
    const range = request.headers.get("Range");
    const upstream = await fetch(new URL(`/api/v1/media/public/${id}`, apiOrigin), {
      method: request.method, headers: range ? { Range: range } : {}, redirect: "error", cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60_000)]),
    });
    if (upstream.status === 404 || upstream.status === 416) {
      await upstream.body?.cancel();
      const contentRange = upstream.headers.get("Content-Range");
      if (upstream.status === 416 && contentRange) headers.set("Content-Range", contentRange);
      return new Response(null, { status: upstream.status, headers });
    }
    if (![200, 206].includes(upstream.status) || !allowed.has(upstream.headers.get("content-type") ?? "")) {
      await upstream.body?.cancel();
      return new Response(null, { status: 503, headers });
    }
    for (const name of forwarded) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}

export const GET = handle;
export const HEAD = handle;
