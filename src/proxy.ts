import { NextResponse, type NextRequest } from "next/server";
import { validSlug } from "@/lib/cms/blog-slug";
import { getCmsConfig } from "@/lib/cms/cms-config";

const notFoundPage = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Publicación no encontrada | Globows LM</title>
</head>
<body>
  <main>
    <h1>Publicación no encontrada</h1>
    <p>Consulta las publicaciones disponibles en el blog.</p>
    <a href="/blog">Ver publicaciones</a>
  </main>
</body>
</html>`;

function missing(head: boolean) {
  return new NextResponse(head ? null : notFoundPage, { status: 404, headers: {
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff",
  } });
}

export async function proxy(request: NextRequest) {
  const head = request.method === "HEAD";
  // Keep Next's internal RSC/prefetch protocol. Document requests must decide status before streaming.
  if ((!head && request.method !== "GET") || request.headers.get("Rsc") === "1") return NextResponse.next();
  const raw = request.nextUrl.pathname.split("/")[2] ?? "";
  let slug: string;
  try {
    slug = decodeURIComponent(raw);
  } catch {
    return missing(head);
  }
  if (!validSlug(slug) || !process.env.CMS_API_INTERNAL_URL) return missing(head);
  try {
    const { apiOrigin } = getCmsConfig();
    const url = new URL(`/api/v1/public/posts/${slug}`, apiOrigin);
    const result = await fetch(url, { method: "HEAD", redirect: "error", signal: AbortSignal.timeout(3000) });
    if (result.status === 404) return missing(head);
  } catch {
    // An unavailable backend is handled by the page as temporarily unavailable.
  }
  return NextResponse.next();
}

export const config = { matcher: "/blog/:slug" };
